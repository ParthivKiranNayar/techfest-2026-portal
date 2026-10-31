import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <NavLink to="/" className="brand" onClick={close}>
          TechFest <span>2026</span>
        </NavLink>
        <button className="menu-btn" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          &#9776;
        </button>
        <nav className={open ? 'nav-links open' : 'nav-links'} onClick={close}>
          <NavLink to="/events">Events</NavLink>
          <NavLink to="/gallery">Gallery</NavLink>
          <NavLink to="/feedback">Feedback</NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard">My Events</NavLink>
              <button className="link-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register" className="btn btn-small">
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
