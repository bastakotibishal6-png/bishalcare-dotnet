import { NavLink, useNavigate } from 'react-router-dom';
import { logout, getAdminName } from '../api/auth';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">
        BishalCare Admin
      </h2>

      <p className="sidebar-user">
        {getAdminName()}
      </p>

      <nav>
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            isActive ? 'active' : ''
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            isActive ? 'active' : ''
          }
        >
          Products
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            isActive ? 'active' : ''
          }
        >
          Orders
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            isActive ? 'active' : ''
          }
        >
          Users
        </NavLink>
      </nav>

      <button
        className="logout-btn"
        onClick={handleLogout}
      >
        Log out
      </button>
    </aside>
  );
}