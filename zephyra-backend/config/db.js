const mongoose = require('mongoose');

/**
 * MongoDB Connection
 * Establishes and manages the connection to MongoDB
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/zephyra';
    
    // Connect to MongoDB with improved options
    const conn = await mongoose.connect(mongoURI, {
      // These options are no longer needed in Mongoose 6+, but kept for reference
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useCreateIndex: true,
      // useFindAndModify: false
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
