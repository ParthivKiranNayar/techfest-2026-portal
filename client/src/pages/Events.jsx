import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const dateFormat = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export default function Events() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [joined, setJoined] = useState(new Set());
  const [filter, setFilter] = useState('All');
  const [status, setStatus] = useState({ loading: true, error: '', message: '' });

  useEffect(() => {
    api
      .events()
      .then((data) => setEvents(data))
      .catch((err) => setStatus((s) => ({ ...s, error: err.message })))
      .finally(() => setStatus((s) => ({ ...s, loading: false })));
  }, []);

  useEffect(() => {
    if (!user) return setJoined(new Set());
    api
      .myEvents()
      .then((mine) => setJoined(new Set(mine.map((e) => e.id))))
      .catch(() => {});
  }, [user]);

  const join = async (event) => {
    if (!user) return navigate('/login', { state: { from: '/events' } });
    try {
      const updated = await api.joinEvent(event.id);
      setEvents((list) => list.map((e) => (e.id === updated.id ? updated : e)));
      setJoined((set) => new Set(set).add(updated.id));
      setStatus((s) => ({ ...s, error: '', message: `You're registered for ${updated.title}!` }));
    } catch (err) {
      setStatus((s) => ({ ...s, message: '', error: err.message }));
    }
  };

  const categories = ['All', ...new Set(events.map((e) => e.category))];
  const visible = filter === 'All' ? events : events.filter((e) => e.category === filter);

  return (
    <section>
      <h1>Events</h1>
      <div className="chips" role="group" aria-label="Filter by category">
        {categories.map((c) => (
          <button key={c} className={c === filter ? 'chip active' : 'chip'} onClick={() => setFilter(c)}>
            {c}
          </button>
        ))}
      </div>

      {status.message && <p className="alert success">{status.message}</p>}
      {status.error && <p className="alert error">{status.error}</p>}
      {status.loading && <p className="muted">Loading events...</p>}

      <div className="grid">
        {visible.map((e) => {
          const full = e.registered >= e.capacity;
          const isJoined = joined.has(e.id);
          return (
            <article key={e.id} className="card">
              <span className={`badge badge-${e.category.toLowerCase()}`}>{e.category}</span>
              <h2>{e.title}</h2>
              <p>{e.description}</p>
              <ul className="meta">
                <li>{dateFormat.format(new Date(e.date))}</li>
                <li>{e.venue}</li>
                <li>{e.fee ? `₹${e.fee}` : 'Free'}</li>
                <li>
                  {e.registered}/{e.capacity} registered
                </li>
              </ul>
              <button className="btn" disabled={full || isJoined} onClick={() => join(e)}>
                {isJoined ? 'Registered ✓' : full ? 'Full' : 'Register'}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
