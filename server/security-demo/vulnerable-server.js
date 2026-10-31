/*
 * DELIBERATELY VULNERABLE copy of the TechFest login + feedback flow.
 * Used only to demonstrate the attacks for Experiment 5. Never deploy this file.
 *
 *   npm run demo:vulnerable   ->   http://localhost:4001
 *
 * Vulnerabilities on purpose:
 *   1. NoSQL injection  - req.body goes straight into the Mongo query, so {"$ne": null} matches any password
 *   2. Stored XSS       - feedback is pasted into the HTML page without escaping
 *   3. Weak cookie      - session cookie has no httpOnly / secure / sameSite, so scripts can read it
 *   4. No security headers (no Helmet, no Content-Security-Policy)
 */
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const PORT = 4001;

const User = mongoose.model('DemoUser', new mongoose.Schema({ name: String, email: String, password: String }));
const Feedback = mongoose.model('DemoFeedback', new mongoose.Schema({ name: String, message: String }));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/login', async (req, res) => {
  // VULNERABLE: untrusted objects reach the query and the password is compared in the database in plain text
  const user = await User.findOne({ email: req.body.email, password: req.body.password });
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });
  res.cookie('token', `session-for-${user._id}`); // VULNERABLE: readable from document.cookie
  res.json({ message: `Welcome ${user.name}! You are logged in as ${user.email}` });
});

app.post('/feedback', async (req, res) => {
  await Feedback.create({ name: req.body.name || 'Anonymous', message: req.body.message });
  res.redirect('/');
});

app.get('/', async (req, res) => {
  const items = await Feedback.find().sort({ _id: -1 });
  // VULNERABLE: user text is concatenated into HTML, so <script> tags run for every visitor
  const list = items.map((f) => `<li><b>${f.name}</b>: ${f.message}</li>`).join('');

  res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>TechFest (vulnerable demo)</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 760px; margin: 2rem auto; padding: 0 16px; color: #1c1b29; }
    .warn { background: #fee2e2; color: #991b1b; padding: .75rem 1rem; border-radius: 8px; }
    section { border: 1px solid #ddd; border-radius: 10px; padding: 1rem 1.25rem; margin: 1rem 0; }
    textarea, input { width: 100%; font: inherit; padding: .5rem; box-sizing: border-box; margin: .25rem 0 .75rem; }
    button { font: inherit; padding: .5rem 1rem; background: #4f46e5; color: #fff; border: 0; border-radius: 6px; cursor: pointer; }
    pre { background: #f4f4f8; padding: .75rem; border-radius: 6px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>TechFest 2026 &mdash; vulnerable demo</h1>
  <p class="warn">This copy has security protections removed on purpose. Run it only on your own machine.</p>

  <section>
    <h2>1. Login (NoSQL injection)</h2>
    <p>The request body below is sent as JSON to <code>/api/login</code>. The password is a Mongo operator, not a string.</p>
    <textarea id="body" rows="5">{
  "email": "admin@techfest.in",
  "password": { "$ne": null }
}</textarea>
    <button id="send">Send login request</button>
    <pre id="result">Response will appear here</pre>
  </section>

  <section>
    <h2>2. Feedback (stored XSS)</h2>
    <form method="post" action="/feedback">
      <input name="name" placeholder="Your name" value="Attacker" />
      <textarea name="message" rows="3">&lt;script&gt;alert('hi')&lt;/script&gt;</textarea>
      <button>Post feedback</button>
    </form>
    <p>Try also: <code>&lt;script&gt;alert(document.cookie)&lt;/script&gt;</code> after logging in, which shows the session cookie can be stolen.</p>
    <ul>${list}</ul>
  </section>

  <script>
    document.getElementById('send').onclick = async () => {
      const out = document.getElementById('result');
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: document.getElementById('body').value,
        });
        out.textContent = res.status + ' ' + JSON.stringify(await res.json(), null, 2) + '\\n\\ndocument.cookie = ' + document.cookie;
      } catch (err) {
        out.textContent = 'Error: ' + err.message;
      }
    };
  </script>
</body>
</html>`);
});

(async () => {
  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri('techfest-vulnerable'));
  await User.create({ name: 'Fest Admin', email: 'admin@techfest.in', password: 'S3cret-Admin-Pass' });
  app.listen(PORT, () => {
    console.log(`Vulnerable demo running on http://localhost:${PORT}`);
    console.log('Seeded user admin@techfest.in (password unknown to the attacker)');
  });
})();
