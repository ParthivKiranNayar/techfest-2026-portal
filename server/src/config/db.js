const mongoose = require('mongoose');

async function connectDB() {
  let uri = process.env.MONGO_URI;

  if (!uri) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGO_URI must be set in production');
    }
    // Local development without MongoDB installed: start a throwaway in-memory instance
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('techfest');
    console.log('MONGO_URI not set - using in-memory MongoDB (data is lost on restart)');
  }

  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}

module.exports = connectDB;
