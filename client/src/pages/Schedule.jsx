import { useEffect, useState } from 'react';
import { api } from '../api.js';

const dayFormat = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
const timeFormat = new Intl.DateTimeFormat('en-IN', { timeStyle: 'short' });

export default function Schedule() {
  const [days, setDays] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .events()
      .then((events) => {
        const grouped = new Map();
        for (const e of events) {
          const day = dayFormat.format(new Date(e.date));
          if (!grouped.has(day)) grouped.set(day, []);
          grouped.get(day).push(e);
        }
        setDays([...grouped]);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <section className="narrow">
      <h1>Schedule</h1>
      {error && <p className="alert error">{error}</p>}
      {days.map(([day, events]) => (
        <div key={day} className="schedule-day">
          <h2>{day}</h2>
          <ul>
            {events.map((e) => (
              <li key={e.id}>
                <time dateTime={e.date}>{timeFormat.format(new Date(e.date))}</time>
                <span>
                  <strong>{e.title}</strong> &middot; {e.venue}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
