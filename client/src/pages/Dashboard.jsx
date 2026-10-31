import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const dateFormat = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export default function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.myEvents().then(setEvents).catch((err) => setError(err.message));
  }, []);

  return (
    <section>
      <h1>Hi, {user.name}</h1>
      <p className="muted">
        {user.email}
        {user.college && ` · ${user.college}`}
      </p>

      <h2>My registrations</h2>
      {error && <p className="alert error">{error}</p>}
      {events && events.length === 0 && (
        <p className="alert">
          You haven't registered for anything yet. <Link to="/events">Browse events</Link>
        </p>
      )}
      <div className="grid">
        {events?.map((e) => (
          <article key={e.id} className="card">
            <span className={`badge badge-${e.category.toLowerCase()}`}>{e.category}</span>
            <h3>{e.title}</h3>
            <ul className="meta">
              <li>{dateFormat.format(new Date(e.date))}</li>
              <li>{e.venue}</li>
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
