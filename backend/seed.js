require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing users
  await User.deleteMany({});

  const users = [
    { username: 'admin', password: 'admin123', fullName: 'Super Admin', role: 'admin' },
    { username: 'surveyor1', password: 'survey123', fullName: 'Ravi Kumar', role: 'surveyor' },
    { username: 'surveyor2', password: 'survey123', fullName: 'Priya Sharma', role: 'surveyor' },
  ];

  for (const u of users) {
    await User.create(u);
    console.log(`Created: ${u.username} (${u.role})`);
  }

  console.log('\n✅ Seed complete!');
  console.log('Admin login: admin / admin123');
  console.log('Surveyor 1: surveyor1 / survey123');
  console.log('Surveyor 2: surveyor2 / survey123');
  await mongoose.disconnect();
}

seed().catch(console.error);
