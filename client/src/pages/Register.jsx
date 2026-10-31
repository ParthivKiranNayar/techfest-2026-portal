import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', college: '', password: '' });
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setBusy(true);
    try {
      await register(form);
      navigate('/events');
    } catch (err) {
      setErrors(err.details ? err.details.map((d) => d.msg) : [err.message]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="narrow">
      <h1>Create account</h1>
      <form className="form" onSubmit={submit}>
        <label>
          Full name
          <input autoComplete="name" required maxLength={60} value={form.name} onChange={update('name')} />
        </label>
        <label>
          Email
          <input type="email" autoComplete="email" required value={form.email} onChange={update('email')} />
        </label>
        <label>
          College
          <input autoComplete="organization" maxLength={100} value={form.college} onChange={update('college')} />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={form.password}
            onChange={update('password')}
          />
          <small className="muted">At least 8 characters, with a letter and a number.</small>
        </label>
        {errors.map((msg) => (
          <p key={msg} className="alert error">
            {msg}
          </p>
        ))}
        <button className="btn" disabled={busy}>
          {busy ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="muted">
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </section>
  );
}
