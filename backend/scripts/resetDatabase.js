const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillkart';

async function resetDatabase() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  for (const coll of collections) {
    await db.dropCollection(coll.name);
    console.log(`Dropped collection: ${coll.name}`);
  }

  await mongoose.disconnect();
  console.log('All collections dropped. Database reset complete.');
}

resetDatabase(); 