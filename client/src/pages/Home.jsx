import { Link } from 'react-router-dom';

const stats = [
  { value: '30+', label: 'Events' },
  { value: '3', label: 'Days' },
  { value: '5000+', label: 'Participants' },
  { value: '₹2L', label: 'Prize pool' },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">10 – 12 December 2026</p>
        <h1>TechFest 2026</h1>
        <p className="tagline">Three days of hackathons, robots and live music.</p>
        <div className="hero-actions">
          <Link to="/events" className="btn">
            Browse events
          </Link>
          <Link to="/register" className="btn btn-outline">
            Create account
          </Link>
        </div>
      </section>

      <section className="stats">
        {stats.map((s) => (
          <div key={s.label} className="stat">
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </section>
    </>
  );
}
