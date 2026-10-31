const request = require('supertest');
const { useTestDatabase, registerAndGetCookie, student, ORIGIN } = require('./setup');
const app = require('../src/app');
const Feedback = require('../src/models/Feedback');

useTestDatabase();

describe('NoSQL injection', () => {
  beforeEach(() => registerAndGetCookie(request, app));

  test.each([
    ['password operator', { email: student.email, password: { $ne: null } }],
    ['email operator', { email: { $gt: '' }, password: student.password }],
    ['regex operator', { email: { $regex: '.*' }, password: { $regex: '.*' } }],
  ])('login bypass with %s is rejected', async (_name, payload) => {
    const res = await request(app).post('/api/auth/login').set('Origin', ORIGIN).send(payload);
    expect(res.status).toBe(400);
    expect(res.headers['set-cookie']).toBeUndefined();
  });
});

describe('XSS', () => {
  test('script in feedback is stored as plain text and served as JSON', async () => {
    const cookie = await registerAndGetCookie(request, app);
    const payload = "<script>alert('hi')</script>";

    const res = await request(app)
      .post('/api/feedback')
      .set('Origin', ORIGIN)
      .set('Cookie', cookie)
      .send({ message: payload, rating: 5 });
    expect(res.status).toBe(201);

    const list = await request(app).get('/api/feedback');
    expect(list.headers['content-type']).toMatch(/application\/json/);
    expect(list.body[0].message).toBe(payload);
    expect(await Feedback.countDocuments()).toBe(1);
  });
});

describe('CSRF', () => {
  test('state-changing request from another origin is blocked', async () => {
    const cookie = await registerAndGetCookie(request, app);
    const res = await request(app)
      .post('/api/feedback')
      .set('Origin', 'https://evil.example')
      .set('Cookie', cookie)
      .send({ message: 'forged request', rating: 1 });

    expect(res.status).toBe(403);
    expect(await Feedback.countDocuments()).toBe(0);
  });
});

describe('security headers', () => {
  test('helmet headers are present and X-Powered-By is hidden', async () => {
    const res = await request(app).get('/api/health');

    expect(res.headers['content-security-policy']).toContain("default-src 'none'");
    expect(res.headers['strict-transport-security']).toBeDefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  test('oversized body is refused', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Origin', ORIGIN)
      .send({ email: student.email, password: 'x'.repeat(20 * 1024) });
    expect(res.status).toBe(413);
  });
});
