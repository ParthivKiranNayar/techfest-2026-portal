const request = require('supertest');
const { useTestDatabase, registerAndGetCookie, student, ORIGIN } = require('./setup');
const app = require('../src/app');
const User = require('../src/models/User');

useTestDatabase();

describe('auth', () => {
  test('register creates a user with a hashed password', async () => {
    const res = await request(app).post('/api/auth/register').set('Origin', ORIGIN).send(student);

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ name: student.name, email: student.email });
    expect(res.body.user.password).toBeUndefined();

    const saved = await User.findOne({ email: student.email }).select('+password');
    expect(saved.password).not.toBe(student.password);
    expect(saved.password).toMatch(/^\$2[aby]\$/);
  });

  test('session cookie is httpOnly and SameSite=Strict', async () => {
    const [cookie] = await registerAndGetCookie(request, app);

    expect(cookie).toMatch(/^token=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Strict/i);
  });

  test('duplicate email is rejected', async () => {
    await registerAndGetCookie(request, app);
    const res = await request(app).post('/api/auth/register').set('Origin', ORIGIN).send(student);
    expect(res.status).toBe(409);
  });

  test('weak password and bad email fail validation', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Origin', ORIGIN)
      .send({ name: 'X', email: 'not-an-email', password: 'short' });

    expect(res.status).toBe(400);
    const fields = res.body.errors.map((e) => e.field);
    expect(fields).toEqual(expect.arrayContaining(['name', 'email', 'password']));
  });

  test('login works with the right password and fails with a wrong one', async () => {
    await registerAndGetCookie(request, app);

    const ok = await request(app)
      .post('/api/auth/login')
      .set('Origin', ORIGIN)
      .send({ email: student.email, password: student.password });
    expect(ok.status).toBe(200);
    expect(ok.headers['set-cookie'][0]).toMatch(/^token=/);

    const bad = await request(app)
      .post('/api/auth/login')
      .set('Origin', ORIGIN)
      .send({ email: student.email, password: 'WrongPass123' });
    expect(bad.status).toBe(401);
  });

  test('/me needs a valid session', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    expect((await request(app).get('/api/auth/me').set('Cookie', 'token=forged.jwt.value')).status).toBe(401);

    const cookie = await registerAndGetCookie(request, app);
    const res = await request(app).get('/api/auth/me').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(student.email);
  });
});
