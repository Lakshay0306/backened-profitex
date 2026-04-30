require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('Connecting to:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully!');
    console.log('Database name:', mongoose.connection.name);
    
    // Try to create a dummy collection/doc
    const TestSchema = new mongoose.Schema({ name: String });
    const Test = mongoose.model('Test', TestSchema);
    await Test.create({ name: 'Connection Test ' + new Date().toISOString() });
    console.log('Test document created successfully!');
    
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
};

testConnection();
