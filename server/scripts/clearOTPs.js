const mongoose = require('mongoose');
require('dotenv').config();

async function clearOTPs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear all OTPs
    const OTP = mongoose.model('OTP', new mongoose.Schema({}, { strict: false }));
    const result = await OTP.deleteMany({});
    
    console.log(`✅ Cleared ${result.deletedCount} OTP records`);
    console.log('You can now request new OTPs');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error clearing OTPs:', error);
  }
}

clearOTPs();