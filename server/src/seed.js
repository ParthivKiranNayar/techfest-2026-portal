const Event = require('./models/Event');

const events = [
  {
    title: 'CodeSprint Hackathon',
    category: 'Technical',
    description: '24-hour team hackathon. Build something useful for your campus and pitch it to the judges.',
    date: new Date('2026-12-10T09:00:00+05:30'),
    venue: 'Main Auditorium',
    capacity: 120,
    fee: 200,
  },
  {
    title: 'Full-Stack MERN Workshop',
    category: 'Workshop',
    description: 'Hands-on session covering React, Express and MongoDB, ending with a cloud deployment.',
    date: new Date('2026-12-10T14:00:00+05:30'),
    venue: 'Lab Block 3',
    capacity: 60,
    fee: 100,
  },
  {
    title: 'Capture the Flag',
    category: 'Technical',
    description: 'Jeopardy-style security CTF: web, crypto, forensics and reversing challenges.',
    date: new Date('2026-12-11T10:00:00+05:30'),
    venue: 'Cyber Lab',
    capacity: 80,
    fee: 150,
  },
  {
    title: 'RoboWars',
    category: 'Technical',
    description: 'Bring your 15 kg combat robot and battle it out in the arena.',
    date: new Date('2026-12-11T15:00:00+05:30'),
    venue: 'Open Air Theatre',
    capacity: 32,
    fee: 500,
  },
  {
    title: 'Valorant Showdown',
    category: 'Gaming',
    description: '5v5 knockout tournament streamed live on the campus big screen.',
    date: new Date('2026-12-12T11:00:00+05:30'),
    venue: 'Gaming Arena',
    capacity: 50,
    fee: 250,
  },
  {
    title: 'Battle of Bands',
    category: 'Cultural',
    description: 'The closing night. College bands compete for the TechFest trophy.',
    date: new Date('2026-12-12T18:00:00+05:30'),
    venue: 'Open Air Theatre',
    capacity: 500,
    fee: 0,
  },
];

async function seedEvents() {
  const count = await Event.countDocuments();
  if (count === 0) {
    await Event.insertMany(events);
    console.log(`Seeded ${events.length} events`);
  }
}

module.exports = { seedEvents, events };
