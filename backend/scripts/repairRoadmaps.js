const mongoose = require('mongoose');
const Roadmap = require('../models/Roadmap');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillkart';

async function repairRoadmaps() {
  await mongoose.connect(MONGODB_URI);
  const roadmaps = await Roadmap.find();
  let updated = 0;
  for (const roadmap of roadmaps) {
    let changed = false;
    if (!roadmap.title) {
      roadmap.title = 'Untitled Roadmap';
      changed = true;
    }
    roadmap.weeks.forEach((week, i) => {
      if (!week.title) {
        roadmap.weeks[i].title = 'Untitled Week';
        changed = true;
      }
    });
    if (changed) {
      await roadmap.save();
      updated++;
      console.log(`Updated roadmap ${roadmap._id}`);
    }
  }
  console.log(`Repair complete. Updated ${updated} roadmaps.`);
  await mongoose.disconnect();
}

repairRoadmaps().catch(err => {
  console.error('Error repairing roadmaps:', err);
  process.exit(1);
}); 