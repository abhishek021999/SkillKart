const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillkart';

async function fixUserProgress() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const collection = db.collection('userprogresses');

  // Drop the old index if it exists
  try {
    await collection.dropIndex('userId_1_roadmapId_1');
    console.log('Dropped old userId_1_roadmapId_1 index');
  } catch (err) {
    if (err.codeName === 'IndexNotFound') {
      console.log('Index userId_1_roadmapId_1 not found, skipping');
    } else {
      console.error('Error dropping index:', err);
    }
  }

  // Rename userId -> user and roadmapId -> roadmap in all documents
  const updateUser = await collection.updateMany(
    { userId: { $exists: true } },
    [{ $set: { user: '$userId' } }, { $unset: 'userId' }]
  );
  const updateRoadmap = await collection.updateMany(
    { roadmapId: { $exists: true } },
    [{ $set: { roadmap: '$roadmapId' } }, { $unset: 'roadmapId' }]
  );
  console.log(`Updated ${updateUser.modifiedCount} userId fields and ${updateRoadmap.modifiedCount} roadmapId fields.`);

  await mongoose.disconnect();
  console.log('Done.');
}

fixUserProgress(); 