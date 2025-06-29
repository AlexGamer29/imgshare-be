// queues/imageQueueManager.js
const RabbitMQService = require('./rabbitmq');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class ImageQueueManager {
  constructor() {
    this.rabbitmq = RabbitMQService;
    this.isInitialized = false;
    
    // Processing configuration
    this.config = {
      uploadPath: './uploads',
      processedPath: './uploads/processed',
      thumbnailPath: './uploads/thumbnails',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      supportedFormats: ['jpeg', 'jpg', 'png', 'webp', 'tiff'],
      thumbnailSizes: [
        { name: 'small', width: 150, height: 150 },
        { name: 'medium', width: 300, height: 300 },
        { name: 'large', width: 600, height: 600 }
      ]
    };

    // Ensure directories exist
    this.initializeDirectories();
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      await this.rabbitmq.connect();
      this.isInitialized = true;
      console.log('Image Queue Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Image Queue Manager:', error);
      throw error;
    }
  }

  async initializeDirectories() {
    const directories = [
      this.config.uploadPath,
      this.config.processedPath,
      this.config.thumbnailPath
    ];

    for (const dir of directories) {
      await fs.ensureDir(dir);
    }
  }

  // Add image processing job to queue
  async addImageProcessingJob(imageData, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const jobData = {
      id: uuidv4(),
      imageData,
      options: {
        resize: options.resize || { width: 1920, height: 1080 },
        quality: options.quality || 80,
        format: options.format || 'jpeg',
        generateThumbnails: options.generateThumbnails !== false,
        ...options
      },
      userId: options.userId,
      originalName: options.originalName,
      createdAt: new Date().toISOString()
    };

    try {
      await this.rabbitmq.publishMessage(
        'images',
        'process.resize',
        jobData,
        {
          priority: options.priority || 5,
          expiration: options.expiration || '3600000' // 1 hour
        }
      );

      console.log(`Image processing job ${jobData.id} added to queue`);
      return { jobId: jobData.id, status: 'queued' };

    } catch (error) {
      console.error('Failed to add image processing job:', error);
      throw error;
    }
  }

  // Add thumbnail generation job
  async addThumbnailJob(imageData, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const jobData = {
      id: uuidv4(),
      imageData,
      sizes: options.sizes || this.config.thumbnailSizes,
      quality: options.quality || 75,
      userId: options.userId,
      originalImageId: options.originalImageId,
      createdAt: new Date().toISOString()
    };

    try {
      await this.rabbitmq.publishMessage(
        'images',
        'thumbnail.generate',
        jobData,
        {
          priority: options.priority || 3
        }
      );

      console.log(`Thumbnail job ${jobData.id} added to queue`);
      return { jobId: jobData.id, status: 'queued' };

    } catch (error) {
      console.error('Failed to add thumbnail job:', error);
      throw error;
    }
  }

  // Start image processing worker
  async startImageProcessingWorker(concurrency = 5) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log(`Starting image processing worker with concurrency: ${concurrency}`);

    // Set channel prefetch for concurrency control
    await this.rabbitmq.channel.prefetch(concurrency);

    await this.rabbitmq.consumeMessages(
      'image-processing',
      this.processImageHandler.bind(this)
    );
  }

  // Start thumbnail worker
  async startThumbnailWorker(concurrency = 3) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log(`Starting thumbnail worker with concurrency: ${concurrency}`);

    await this.rabbitmq.channel.prefetch(concurrency);

    await this.rabbitmq.consumeMessages(
      'image-thumbnails',
      this.processThumbnailHandler.bind(this)
    );
  }

  // Image processing handler
  async processImageHandler(jobData, message) {
    const startTime = Date.now();
    console.log(`Processing image job ${jobData.id}`);

    try {
      // Validate job data
      if (!jobData.imageData || !jobData.imageData.buffer) {
        throw new Error('Invalid image data: missing buffer');
      }

      const { imageData, options } = jobData;
      const imageBuffer = Buffer.from(imageData.buffer);

      // Get image info
      const imageInfo = await sharp(imageBuffer).metadata();
      console.log(`Image info: ${imageInfo.width}x${imageInfo.height}, format: ${imageInfo.format}`);

      // Validate image format
      if (!this.config.supportedFormats.includes(imageInfo.format)) {
        throw new Error(`Unsupported image format: ${imageInfo.format}`);
      }

      // Process the image
      let processedImage = sharp(imageBuffer);

      // Apply resize if specified
      if (options.resize && (options.resize.width || options.resize.height)) {
        processedImage = processedImage.resize(
          options.resize.width,
          options.resize.height,
          {
            fit: 'inside',
            withoutEnlargement: true
          }
        );
      }

      // Apply format and quality
      switch (options.format.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
          processedImage = processedImage.jpeg({ quality: options.quality });
          break;
        case 'png':
          processedImage = processedImage.png({ quality: options.quality });
          break;
        case 'webp':
          processedImage = processedImage.webp({ quality: options.quality });
          break;
      }

      // Save processed image
      const fileName = `${jobData.id}.${options.format}`;
      const filePath = path.join(this.config.processedPath, fileName);
      
      await processedImage.toFile(filePath);

      // Get processed image stats
      const stats = await fs.stat(filePath);
      const processedInfo = await sharp(filePath).metadata();

      const result = {
        jobId: jobData.id,
        originalName: jobData.originalName,
        fileName,
        filePath,
        fileSize: stats.size,
        dimensions: {
          width: processedInfo.width,
          height: processedInfo.height
        },
        format: processedInfo.format,
        processingTime: Date.now() - startTime,
        processedAt: new Date().toISOString()
      };

      // Generate thumbnails if requested
      if (options.generateThumbnails) {
        await this.addThumbnailJob({
          buffer: await fs.readFile(filePath)
        }, {
          originalImageId: jobData.id,
          userId: jobData.userId,
          sizes: options.thumbnailSizes || this.config.thumbnailSizes
        });
      }

      console.log(`Image processing completed for job ${jobData.id} in ${result.processingTime}ms`);
      return result;

    } catch (error) {
      console.error(`Image processing failed for job ${jobData.id}:`, error);
      throw error;
    }
  }

  // Thumbnail processing handler
  async processThumbnailHandler(jobData, message) {
    const startTime = Date.now();
    console.log(`Processing thumbnail job ${jobData.id}`);

    try {
      const { imageData, sizes, quality } = jobData;
      const imageBuffer = Buffer.from(imageData.buffer);
      const thumbnails = [];

      for (const size of sizes) {
        const thumbnailFileName = `${jobData.id}_${size.name}.jpeg`;
        const thumbnailPath = path.join(this.config.thumbnailPath, thumbnailFileName);

        await sharp(imageBuffer)
          .resize(size.width, size.height, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality })
          .toFile(thumbnailPath);

        const stats = await fs.stat(thumbnailPath);

        thumbnails.push({
          name: size.name,
          fileName: thumbnailFileName,
          filePath: thumbnailPath,
          fileSize: stats.size,
          dimensions: {
            width: size.width,
            height: size.height
          }
        });
      }

      const result = {
        jobId: jobData.id,
        originalImageId: jobData.originalImageId,
        thumbnails,
        processingTime: Date.now() - startTime,
        processedAt: new Date().toISOString()
      };

      console.log(`Thumbnail processing completed for job ${jobData.id} in ${result.processingTime}ms`);
      return result;

    } catch (error) {
      console.error(`Thumbnail processing failed for job ${jobData.id}:`, error);
      throw error;
    }
  }

  // Queue monitoring methods
  async getQueueStats() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const stats = {
      imageProcessing: await this.rabbitmq.getQueueInfo('image-processing'),
      thumbnails: await this.rabbitmq.getQueueInfo('image-thumbnails'),
      failed: await this.rabbitmq.getQueueInfo('image-failed')
    };

    return stats;
  }

  async purgeQueues() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    await this.rabbitmq.purgeQueue('image-processing');
    await this.rabbitmq.purgeQueue('image-thumbnails');
    await this.rabbitmq.purgeQueue('image-failed');

    console.log('All queues purged');
  }

  async healthCheck() {
    const rabbitMQHealth = await this.rabbitmq.healthCheck();
    const queueStats = this.isInitialized ? await this.getQueueStats() : null;

    return {
      rabbitmq: rabbitMQHealth,
      queues: queueStats,
      initialized: this.isInitialized,
      timestamp: new Date().toISOString()
    };
  }

  async shutdown() {
    console.log('Shutting down Image Queue Manager...');
    
    if (this.rabbitmq) {
      await this.rabbitmq.close();
    }
    
    console.log('Image Queue Manager shutdown complete');
  }
}

module.exports = new ImageQueueManager();