const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lost_found');
    const db = mongoose.connection.db;
    const claims = await db.collection('claims').find({}).toArray();
    const items = await db.collection('items').find({}).toArray();
    console.log(JSON.stringify({ claims: claims.length, items: items.length, sampleClaims: claims.slice(0, 5) }, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
})();
