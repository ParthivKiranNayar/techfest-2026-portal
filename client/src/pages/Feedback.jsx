import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Feedback() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ message: '', rating: 5 });
  const [error, setError] = useState('');

  useEffect(() => {
    api.feedback().then(setItems).catch((err) => setError(err.message));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const created = await api.sendFeedback({ message: form.message, rating: Number(form.rating) });
      setItems((list) => [created, ...list]);
      setForm({ message: '', rating: 5 });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="narrow">
      <h1>Feedback</h1>

      {user ? (
        <form className="form" onSubmit={submit}>
          <label>
            Your feedback
            <textarea
              rows="4"
              maxLength={500}
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </label>
          <label>
            Rating
            <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {'★'.repeat(n)}
                </option>
              ))}
            </select>
          </label>
          {error && <p className="alert error">{error}</p>}
          <button className="btn">Submit</button>
        </form>
      ) : (
        <p className="alert">
          <Link to="/login">Log in</Link> to leave feedback.
        </p>
      )}

      <ul className="feedback-list">
        {items.map((f) => (
          <li key={f.id} className="card">
            <div className="feedback-head">
              <strong>{f.name}</strong>
              <span aria-label={`${f.rating} out of 5`}>{'★'.repeat(f.rating)}</span>
            </div>
            {/* Rendered as plain text: React escapes it, so <script> shows up as text instead of running */}
            <p>{f.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
