// workers/imageWorkers.js
const ImageQueueManager = require('../upload-queue/imageQueueManager');
const cluster = require('cluster');
const os = require('os');

class ImageWorkers {
  constructor(options = {}) {
    this.options = {
      imageProcessingWorkers: options.imageProcessingWorkers || 3,
      thumbnailWorkers: options.thumbnailWorkers || 2,
      concurrencyPerWorker: options.concurrencyPerWorker || 5,
      enableClustering: options.enableClustering !== false,
      ...options
    };
    
    this.workers = new Map();
    this.isShuttingDown = false;
  }

  async start() {
    if (this.options.enableClustering && cluster.isMaster) {
      await this.startClusteredWorkers();
    } else {
      await this.startSingleWorker();
    }
  }

  async startClusteredWorkers() {
    const numCPUs = os.cpus().length;
    const totalWorkers = this.options.imageProcessingWorkers + this.options.thumbnailWorkers;
    const workersToStart = Math.min(totalWorkers, numCPUs);

    console.log(`Starting ${workersToStart} worker processes on ${numCPUs} CPUs`);

    // Fork worker processes
    for (let i = 0; i < workersToStart; i++) {
      this.forkWorker(i);
    }

    // Handle master process events
    this.setupMasterHandlers();
  }

  forkWorker(workerId) {
    const workerType = workerId % 2 === 0 ? 'image-processing' : 'thumbnail';
    
    const worker = cluster.fork({
      WORKER_ID: workerId,
      WORKER_TYPE: workerType,
      CONCURRENCY: this.options.concurrencyPerWorker
    });

    this.workers.set(worker.id, {
      worker,
      workerId,
      type: workerType,
      startTime: Date.now(),
      restartCount: 0
    });

    worker.on('message', (message) => {
      this.handleWorkerMessage(worker.id, message);
    });

    worker.on('exit', (code, signal) => {
      this.handleWorkerExit(worker.id, code, signal);
    });

    console.log(`Worker ${workerId} (${workerType}) started with PID ${worker.process.pid}`);
    return worker;
  }

  setupMasterHandlers() {
    // Graceful shutdown
    process.on('SIGTERM', () => this.gracefulShutdown());
    process.on('SIGINT', () => this.gracefulShutdown());

    // Restart crashed workers
    cluster.on('exit', (worker, code, signal) => {
      if (!this.isShuttingDown) {
        console.log(`Worker ${worker.process.pid} died, restarting...`);
        const workerInfo = this.workers.get(worker.id);
        if (workerInfo) {
          this.forkWorker(workerInfo.workerId);
        }
      }
    });

    // Monitor worker health
    setInterval(() => {
      this.checkWorkerHealth();
    }, 30000); // Check every 30 seconds
  }

  async startSingleWorker() {
    console.log('Starting single worker process');
    
    const queueManager = ImageQueueManager;
    await queueManager.initialize();

    // Start both types of workers in parallel
    const workers = [
      queueManager.startImageProcessingWorker(this.options.concurrencyPerWorker),
      queueManager.startThumbnailWorker(Math.ceil(this.options.concurrencyPerWorker / 2))
    ];

    await Promise.all(workers);
    
    // Setup graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('Received SIGTERM, shutting down gracefully...');
      await queueManager.shutdown();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('Received SIGINT, shutting down gracefully...');
      await queueManager.shutdown();
      process.exit(0);
    });

    console.log('Single worker started successfully');
  }

  handleWorkerMessage(workerId, message) {
    const workerInfo = this.workers.get(workerId);
    
    switch (message.type) {
      case 'health':
        workerInfo.lastHealthCheck = Date.now();
        workerInfo.stats = message.data;
        break;
        
      case 'error':
        console.error(`Worker ${workerId} error:`, message.error);
        break;
        
      case 'job_completed':
        console.log(`Worker ${workerId} completed job:`, message.jobId);
        break;
        
      case 'ready':
        console.log(`Worker ${workerId} is ready`);
        break;
    }
  }

  handleWorkerExit(workerId, code, signal) {
    const workerInfo = this.workers.get(workerId);
    
    if (workerInfo) {
      workerInfo.restartCount++;
      console.log(`Worker ${workerId} exited with code ${code} and signal ${signal}`);
      
      // Remove from workers map
      this.workers.delete(workerId);
      
      // Restart if not shutting down and restart count is reasonable
      if (!this.isShuttingDown && workerInfo.restartCount < 5) {
        setTimeout(() => {
          this.forkWorker(workerInfo.workerId);
        }, 5000); // Wait 5 seconds before restart
      }
    }
  }

  checkWorkerHealth() {
    const now = Date.now();
    const healthCheckTimeout = 60000; // 1 minute

    for (const [workerId, workerInfo] of this.workers) {
      const lastCheck = workerInfo.lastHealthCheck || workerInfo.startTime;
      
      if (now - lastCheck > healthCheckTimeout) {
        console.warn(`Worker ${workerId} hasn't responded to health checks, restarting...`);
        
        workerInfo.worker.kill('SIGTERM');
        
        setTimeout(() => {
          if (workerInfo.worker.isDead()) {
            workerInfo.worker.kill('SIGKILL');
          }
        }, 10000); // Force kill after 10 seconds
      } else {
        // Request health check
        workerInfo.worker.send({ type: 'health_check' });
      }
    }
  }

  async gracefulShutdown() {
    if (this.isShuttingDown) return;
    
    this.isShuttingDown = true;
    console.log('Starting graceful shutdown...');

    // Send shutdown signal to all workers
    for (const [workerId, workerInfo] of this.workers) {
      console.log(`Shutting down worker ${workerId}...`);
      workerInfo.worker.send({ type: 'shutdown' });
    }

    // Wait for workers to shut down gracefully
    const shutdownPromises = Array.from(this.workers.values()).map(workerInfo => {
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.log(`Force killing worker ${workerInfo.workerId}`);
          workerInfo.worker.kill('SIGKILL');
          resolve();
        }, 30000); // 30 second timeout

        workerInfo.worker.on('exit', () => {
          clearTimeout(timeout);
          resolve();
        });
      });
    });

    await Promise.all(shutdownPromises);
    console.log('All workers shut down, exiting master process');
    process.exit(0);
  }

  getWorkerStats() {
    const stats = {
      totalWorkers: this.workers.size,
      workers: Array.from(this.workers.values()).map(workerInfo => ({
        id: workerInfo.workerId,
        type: workerInfo.type,
        pid: workerInfo.worker.process.pid,
        uptime: Date.now() - workerInfo.startTime,
        restartCount: workerInfo.restartCount,
        lastHealthCheck: workerInfo.lastHealthCheck,
        stats: workerInfo.stats
      }))
    };

    return stats;
  }
}

// Worker process implementation (runs in forked processes)
if (cluster.isWorker) {
  const workerType = process.env.WORKER_TYPE;
  const concurrency = parseInt(process.env.CONCURRENCY) || 5;
  
  class WorkerProcess {
    constructor() {
      this.queueManager = new ImageQueueManager();
      this.isShuttingDown = false;
      this.activeJobs = 0;
      this.processedJobs = 0;
      this.startTime = Date.now();
    }

    async start() {
      try {
        await this.queueManager.initialize();
        
        // Start appropriate worker based on type
        if (workerType === 'image-processing') {
          await this.queueManager.startImageProcessingWorker(concurrency);
        } else if (workerType === 'thumbnail') {
          await this.queueManager.startThumbnailWorker(concurrency);
        }

        this.setupMessageHandlers();
        this.startHealthReporting();
        
        // Notify master that worker is ready
        process.send({ type: 'ready', workerId: process.env.WORKER_ID });
        
        console.log(`Worker ${process.env.WORKER_ID} (${workerType}) started with concurrency ${concurrency}`);
        
      } catch (error) {
        console.error('Failed to start worker:', error);
        process.send({ type: 'error', error: error.message });
        process.exit(1);
      }
    }

    setupMessageHandlers() {
      process.on('message', async (message) => {
        switch (message.type) {
          case 'health_check':
            this.sendHealthUpdate();
            break;
            
          case 'shutdown':
            await this.gracefulShutdown();
            break;
        }
      });

      process.on('SIGTERM', () => this.gracefulShutdown());
      process.on('SIGINT', () => this.gracefulShutdown());
    }

    startHealthReporting() {
      setInterval(() => {
        this.sendHealthUpdate();
      }, 30000); // Report health every 30 seconds
    }

    sendHealthUpdate() {
      const stats = {
        uptime: Date.now() - this.startTime,
        processedJobs: this.processedJobs,
        activeJobs: this.activeJobs,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      };

      process.send({
        type: 'health',
        data: stats
      });
    }

    async gracefulShutdown() {
      if (this.isShuttingDown) return;
      
      this.isShuttingDown = true;
      console.log(`Worker ${process.env.WORKER_ID} starting graceful shutdown...`);

      // Wait for active jobs to complete
      const maxWaitTime = 25000; // 25 seconds
      const startTime = Date.now();

      while (this.activeJobs > 0 && (Date.now() - startTime) < maxWaitTime) {
        console.log(`Waiting for ${this.activeJobs} active jobs to complete...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Close RabbitMQ connection
      await this.queueManager.shutdown();
      
      console.log(`Worker ${process.env.WORKER_ID} shutdown complete`);
      process.exit(0);
    }
  }

  // Start the worker process
  const workerProcess = new WorkerProcess();
  workerProcess.start().catch(error => {
    console.error('Worker process failed to start:', error);
    process.exit(1);
  });
}

module.exports = new ImageWorkers();