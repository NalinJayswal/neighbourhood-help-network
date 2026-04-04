/**
 * Database Seeder — Nalin Jayswal
 * Run with: npm run seed
 * Creates admin + test user + sample help requests
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB...');

    // Drop collections directly to avoid any pre-save hook issues
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const names = collections.map(c => c.name);
    if (names.includes('users')) await db.collection('users').deleteMany({});
    if (names.includes('helprequests')) await db.collection('helprequests').deleteMany({});
    console.log('🗑️  Cleared existing data.');

    // Hash passwords MANUALLY here — bypasses the pre-save hook completely
    // This avoids any risk of double-hashing
    const adminHash = await bcrypt.hash('admin123', 10);
    const userHash = await bcrypt.hash('password123', 10);

    // Insert directly into the collection (no Mongoose model = no pre-save hook)
    const usersCol = db.collection('users');
    const nalinResult = await usersCol.insertOne({
      name: 'Nalin Jayswal',
      email: 'nalin@network.com',
      password: adminHash,
      address: 'Brisbane, QLD',
      university: 'QUT',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const janeResult = await usersCol.insertOne({
      name: 'Jane Neighbour',
      email: 'jane@network.com',
      password: userHash,
      address: 'Paddington, QLD',
      university: '',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Admin account created: nalin@network.com / admin123');
    console.log('✅ Test user created:  jane@network.com / password123');

    // Insert sample help requests
    const reqCol = db.collection('helprequests');
    await reqCol.insertMany([
      {
        title: 'Need help carrying groceries from Woolworths',
        description: 'I have a knee injury and struggle with heavy bags. Would really appreciate help on Saturday morning.',
        category: 'Groceries',
        location: 'Paddington, QLD',
        dateNeeded: new Date('2026-05-10'),
        isUrgent: false,
        status: 'Open',
        createdBy: janeResult.insertedId,
        volunteer: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Dog walker needed urgently this week',
        description: 'My usual dog walker is sick. Need someone to walk my labrador for 30 mins each day.',
        category: 'Pet Care',
        location: 'Fortitude Valley, QLD',
        dateNeeded: new Date('2026-04-08'),
        isUrgent: true,
        status: 'Open',
        createdBy: janeResult.insertedId,
        volunteer: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Lift to Royal Brisbane Hospital appointment',
        description: "Can't drive after a minor procedure. Need a lift to RBWH and back around 2pm Wednesday.",
        category: 'Transport',
        location: 'Herston, QLD',
        dateNeeded: new Date('2026-04-09'),
        isUrgent: false,
        status: 'Open',
        createdBy: nalinResult.insertedId,
        volunteer: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Help setting up new laptop',
        description: "New laptop arrived and confused by Windows 11. Need someone tech-savvy to help get set up.",
        category: 'Tech Help',
        location: 'New Farm, QLD',
        dateNeeded: new Date('2026-04-15'),
        isUrgent: false,
        status: 'Open',
        createdBy: janeResult.insertedId,
        volunteer: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Garden cleanup before house inspection',
        description: 'Need help mowing lawn and trimming hedges. Happy to return the favour!',
        category: 'Garden',
        location: 'Woolloongabba, QLD',
        dateNeeded: new Date('2026-04-20'),
        isUrgent: false,
        status: 'Open',
        createdBy: nalinResult.insertedId,
        volunteer: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    console.log('✅ Sample help requests created.');

    await mongoose.disconnect();
    console.log('\n🎉 Seeding complete! Log in at http://localhost:3000');
    console.log('   Admin → nalin@network.com / admin123');
    console.log('   User  → jane@network.com / password123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();
