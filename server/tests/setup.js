const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';

let mongo;

// Each test file gets its own throwaway database
function useTestDatabase() {
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });

  afterEach(async () => {
    const collections = await mongoose.connection.db.collections();
    await Promise.all(collections.map((c) => c.deleteMany({})));
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });
}

const ORIGIN = 'http://localhost:5173';
const student = { name: 'Asha Rao', email: 'asha@example.com', password: 'Techfest2026', college: 'CET' };

// Registers a user and returns the session cookie
async function registerAndGetCookie(request, app, user = student) {
  const res = await request(app).post('/api/auth/register').set('Origin', ORIGIN).send(user);
  return res.headers['set-cookie'];
}

module.exports = { useTestDatabase, registerAndGetCookie, student, ORIGIN };
