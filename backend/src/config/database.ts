import mongoose from 'mongoose';
import config, { isTest } from './index';

class Database {
  private static instance: Database;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Database already connected');
      return;
    }

    try {
      const uri = isTest() ? config.MONGODB_TEST_URI : config.MONGODB_URI;
      
      const options: mongoose.ConnectOptions = {
        bufferCommands: false,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4, // Use IPv4, skip trying IPv6
      };

      await mongoose.connect(uri, options);
      
      this.isConnected = true;
      console.log(`📦 Database connected successfully to ${uri.split('@')[1] || uri}`);
      
      // Configurar eventos de conexión
      this.setupEventListeners();
      
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('📦 Database disconnected successfully');
    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
    }
  }

  public async clearDatabase(): Promise<void> {
    if (!isTest()) {
      throw new Error('clearDatabase can only be used in test environment');
    }

    const collections = await mongoose.connection.db.collections();
    
    for (const collection of collections) {
      await collection.deleteMany({});
    }
    
    console.log('🧹 Test database cleared');
  }

  public getConnection(): mongoose.Connection {
    return mongoose.connection;
  }

  public isHealthy(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  private setupEventListeners(): void {
    // Conexión establecida
    mongoose.connection.on('connected', () => {
      console.log('📦 Mongoose connected to MongoDB');
    });

    // Error de conexión
    mongoose.connection.on('error', (error) => {
      console.error('❌ Mongoose connection error:', error);
    });

    // Conexión desconectada
    mongoose.connection.on('disconnected', () => {
      console.log('📦 Mongoose disconnected from MongoDB');
      this.isConnected = false;
    });

    // Reconexión
    mongoose.connection.on('reconnected', () => {
      console.log('📦 Mongoose reconnected to MongoDB');
      this.isConnected = true;
    });

    // Manejo del cierre de la aplicación
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }
}

// Configuración adicional de Mongoose
mongoose.set('strictQuery', true);

// Plugin para agregar timestamps automáticamente
mongoose.plugin((schema) => {
  schema.add({
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  });

  schema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
      this.updatedAt = new Date();
    }
    next();
  });

  schema.pre(['updateOne', 'findOneAndUpdate', 'updateMany'], function (next) {
    this.set({ updatedAt: new Date() });
    next();
  });
});

export default Database.getInstance();

// Helper para verificar el estado de la base de datos
export const checkDatabaseHealth = (): {
  status: 'healthy' | 'unhealthy' | 'connecting';
  readyState: number;
  host?: string;
  name?: string;
} => {
  const connection = mongoose.connection;
  const readyState = connection.readyState;
  
  let status: 'healthy' | 'unhealthy' | 'connecting';
  
  switch (readyState) {
    case 1: // connected
      status = 'healthy';
      break;
    case 2: // connecting
      status = 'connecting';
      break;
    default: // disconnected, disconnecting, uninitialized
      status = 'unhealthy';
  }

  return {
    status,
    readyState,
    host: connection.host,
    name: connection.name,
  };
};
