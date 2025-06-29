const amqp = require('amqplib');
const EventEmitter = require('events');

class RabbitMQService extends EventEmitter {
  constructor(connectionUrl = 'amqp://admin:password@localhost:5672') {
    super();
    this.connectionUrl = connectionUrl;
    this.connection = null;
    this.channel = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 5000;
    
    // Queue configurations
    this.queues = {
      'image-processing': {
        durable: true,
        arguments: {
          'x-message-ttl': 3600000,        // 1 hour TTL
          'x-max-retries': 3,              // Max retry attempts
          'x-dead-letter-exchange': 'dlx.images',
          'x-dead-letter-routing-key': 'failed'
        }
      },
      'image-thumbnails': {
        durable: true,
        arguments: {
          'x-message-ttl': 1800000,        // 30 minutes TTL
          'x-max-retries': 2
        }
      },
      'image-failed': {
        durable: true
      }
    };

    // Exchange configurations
    this.exchanges = {
      'images': {
        type: 'topic',
        durable: true
      },
      'dlx.images': {
        type: 'direct',
        durable: true
      }
    };
  }

  async connect() {
    try {
      console.log('Connecting to RabbitMQ...');
      
      this.connection = await amqp.connect(this.connectionUrl);
      this.channel = await this.connection.createChannel();
      
    //   // Enable publisher confirms
    //   await this.channel.confirmSelect();
      
    //   // Set prefetch count for fair distribution
    //   await this.channel.prefetch(10);
      
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      console.log('Connected to RabbitMQ successfully');
      
      // Setup connection event handlers
      this.setupConnectionHandlers();
      
      // Initialize exchanges and queues
      await this.initializeInfrastructure();
      
      this.emit('connected');
      
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      this.emit('error', error);
      await this.handleReconnection();
    }
  }

  setupConnectionHandlers() {
    this.connection.on('error', async (error) => {
      console.error('RabbitMQ connection error:', error);
      this.isConnected = false;
      this.emit('error', error);
      await this.handleReconnection();
    });

    this.connection.on('close', async () => {
      console.log('RabbitMQ connection closed');
      this.isConnected = false;
      this.emit('disconnected');
      await this.handleReconnection();
    });

    this.channel.on('error', async (error) => {
      console.error('RabbitMQ channel error:', error);
      this.emit('error', error);
    });

    this.channel.on('close', () => {
      console.log('RabbitMQ channel closed');
    });
  }

  async handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectAttempts++;
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(async () => {
      await this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  async initializeInfrastructure() {
    try {
      // Create exchanges
      for (const [exchangeName, config] of Object.entries(this.exchanges)) {
        await this.channel.assertExchange(exchangeName, config.type, {
          durable: config.durable
        });
        console.log(`Exchange '${exchangeName}' created/verified`);
      }

      // Create queues
      for (const [queueName, config] of Object.entries(this.queues)) {
        await this.channel.assertQueue(queueName, config);
        console.log(`Queue '${queueName}' created/verified`);
      }

      // Bind queues to exchanges
      await this.setupQueueBindings();
      
    } catch (error) {
      console.error('Failed to initialize RabbitMQ infrastructure:', error);
      throw error;
    }
  }

  async setupQueueBindings() {
    // Bind image processing queue
    await this.channel.bindQueue('image-processing', 'images', 'process.*');
    
    // Bind thumbnail queue
    await this.channel.bindQueue('image-thumbnails', 'images', 'thumbnail.*');
    
    // Bind failed message queue to dead letter exchange
    await this.channel.bindQueue('image-failed', 'dlx.images', 'failed');
    
    console.log('Queue bindings established');
  }

  async publishMessage(exchange, routingKey, message, options = {}) {
    if (!this.isConnected) {
      throw new Error('RabbitMQ is not connected');
    }

    const messageBuffer = Buffer.from(JSON.stringify({
      ...message,
      id: message.id || require('uuid').v4(),
      timestamp: Date.now(),
      attempts: 0
    }));

    const publishOptions = {
      persistent: true,
      timestamp: Date.now(),
      messageId: message.id,
      ...options
    };

    return new Promise((resolve, reject) => {
      this.channel.publish(
        exchange,
        routingKey,
        messageBuffer,
        publishOptions,
        (err, ok) => {
          if (err) {
            console.error('Failed to publish message:', err);
            reject(err);
          } else {
            console.log(`Message published to ${exchange}:${routingKey}`);
            resolve(ok);
          }
        }
      );
    });
  }

  async consumeMessages(queueName, handler, options = {}) {
    if (!this.isConnected) {
      throw new Error('RabbitMQ is not connected');
    }

    const consumerOptions = {
      noAck: false,
      consumerTag: `consumer-${queueName}-${Date.now()}`,
      ...options
    };

    console.log(`Starting consumer for queue: ${queueName}`);

    await this.channel.consume(queueName, async (message) => {
      if (!message) {
        console.log('Consumer cancelled');
        return;
      }

      try {
        const messageData = JSON.parse(message.content.toString());
        console.log(`Processing message ${messageData.id} from ${queueName}`);
        
        // Call the handler function
        const result = await handler(messageData, message);
        
        // Acknowledge the message if handler succeeded
        this.channel.ack(message);
        
        console.log(`Message ${messageData.id} processed successfully`);
        
        return result;
        
      } catch (error) {
        console.error(`Error processing message from ${queueName}:`, error);
        
        // Handle retry logic
        await this.handleMessageError(message, error);
      }
    }, consumerOptions);
  }

  async handleMessageError(message, error) {
    const messageData = JSON.parse(message.content.toString());
    const attempts = (messageData.attempts || 0) + 1;
    const maxRetries = 3;

    if (attempts < maxRetries) {
      // Retry the message
      console.log(`Retrying message ${messageData.id} (attempt ${attempts}/${maxRetries})`);
      
      // Add delay before retry
      setTimeout(async () => {
        await this.publishMessage('images', 'process.retry', {
          ...messageData,
          attempts,
          lastError: error.message,
          retryTimestamp: Date.now()
        });
      }, 1000 * attempts); // Exponential backoff
      
      this.channel.ack(message);
      
    } else {
      // Max retries reached, send to dead letter queue
      console.log(`Max retries reached for message ${messageData.id}, sending to DLQ`);
      
      await this.publishMessage('dlx.images', 'failed', {
        ...messageData,
        finalError: error.message,
        failedTimestamp: Date.now()
      });
      
      this.channel.ack(message);
    }
  }

  async getQueueInfo(queueName) {
    if (!this.isConnected) {
      throw new Error('RabbitMQ is not connected');
    }

    return await this.channel.checkQueue(queueName);
  }

  async purgeQueue(queueName) {
    if (!this.isConnected) {
      throw new Error('RabbitMQ is not connected');
    }

    return await this.channel.purgeQueue(queueName);
  }

  async close() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    this.isConnected = false;
    console.log('RabbitMQ connection closed');
  }

  // Health check method
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { healthy: false, reason: 'Not connected' };
      }

      // Check if we can create a temporary queue
      const testQueue = `health-check-${Date.now()}`;
      await this.channel.assertQueue(testQueue, { autoDelete: true });
      await this.channel.deleteQueue(testQueue);

      return { healthy: true, timestamp: Date.now() };
    } catch (error) {
      return { healthy: false, reason: error.message };
    }
  }
}

module.exports = new RabbitMQService();