const mongoose = require('mongoose');
require('dotenv').config(); // to read .env file

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`mongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`MongoDB not connect: ${error.message}`);
    process.exit(1); // if DB not connect then immediately close the server
  }
};

module.exports = connectDB;