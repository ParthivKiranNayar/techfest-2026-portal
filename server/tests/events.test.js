const request = require('supertest');
const { useTestDatabase, registerAndGetCookie, ORIGIN } = require('./setup');
const app = require('../src/app');
const Event = require('../src/models/Event');
const { events } = require('../src/seed');

useTestDatabase();

describe('events', () => {
  let eventId;

  beforeEach(async () => {
    const [first] = await Event.insertMany(events);
    eventId = first.id;
  });

  test('anyone can list events, sorted by date', async () => {
    const res = await request(app).get('/api/events');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(7);
    const dates = res.body.map((e) => new Date(e.date).getTime());
    expect(dates).toEqual([...dates].sort((a, b) => a - b));
  });

  test('registering needs a login', async () => {
    const res = await request(app).post(`/api/events/${eventId}/register`).set('Origin', ORIGIN);
    expect(res.status).toBe(401);
  });

  test('logged-in student can register once', async () => {
    const cookie = await registerAndGetCookie(request, app);
    const join = () => request(app).post(`/api/events/${eventId}/register`).set('Origin', ORIGIN).set('Cookie', cookie);

    const first = await join();
    expect(first.status).toBe(201);
    expect(first.body.registered).toBe(1);
    expect(first.body.joined).toBe(true);

    expect((await join()).status).toBe(409);

    const mine = await request(app).get('/api/events/mine').set('Cookie', cookie);
    expect(mine.body.map((e) => e.id)).toEqual([eventId]);
  });

  test('invalid event id is rejected', async () => {
    const cookie = await registerAndGetCookie(request, app);
    const res = await request(app).post('/api/events/not-an-id/register').set('Origin', ORIGIN).set('Cookie', cookie);
    expect(res.status).toBe(400);
  });
});

describe('feedback', () => {
  test('rating must be 1 to 5', async () => {
    const cookie = await registerAndGetCookie(request, app);
    const res = await request(app)
      .post('/api/feedback')
      .set('Origin', ORIGIN)
      .set('Cookie', cookie)
      .send({ message: 'Great fest', rating: 9 });
    expect(res.status).toBe(400);
  });
});
