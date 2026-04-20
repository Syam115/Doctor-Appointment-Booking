import { Link, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <header className="site-header">
      <nav className="navbar animate-fade-in">
        <Link to="/" className="brand" aria-label="Medilux home">
          <span className="brand-mark">MediLuxe</span>
          <span className="brand-copy">Private Care Concierge</span>
        </Link>

        <div className="nav-links">
          <NavLink to="/" className="nav-link">Home</NavLink>
          <NavLink to="/doctors" className="nav-link">Find Doctors</NavLink>
          {userInfo ? (
            <>
              <NavLink to={`/dashboard/${userInfo.role}`} className="nav-link">
                Dashboard
              </NavLink>
              <button onClick={() => dispatch(logout())} className="btn btn-secondary" type="button">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">Sign In</NavLink>
              <Link to="/register" className="btn btn-primary">Create account</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
