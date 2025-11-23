import { NavLink, Outlet } from 'react-router-dom';
import "./MainLayout.css";

function MainLayout({ user,onLogout }) {
    const getLinkClassName = ({isActive}) => {
        "app-nav-link" + (isActive ? "app-nav-link--active" : "");
    }
    return (
        <div className="app-root">
          {/* navbar TOP */}
          <header className="app-header">
            <div className="app-header-left">
              <span className="app-logo">E-learning App</span>

              <nav className="app-nav">
                <NavLink to="/home" className={getLinkClassName}>
                  Home
                </NavLink>

                <NavLink to="/profile" className={getLinkClassName}>
                  Profile
                </NavLink>

                <NavLink to="/courses" className={getLinkClassName}>
                  Courses
                </NavLink>

                <NavLink to="/learning" className={getLinkClassName}>
                  Learning
                </NavLink>

                <NavLink to="/shop" className={getLinkClassName}>
                  Shop
                </NavLink>

                <NavLink to="/settings" className={getLinkClassName}>
                  Settings
                </NavLink>
              </nav>
            </div>

            <div className="app-header-right">
              <span>{user.username}</span>
              <button className="app-logout-btn" onClick={onLogout}>
                Logout
              </button>
            </div>
          </header>

          {/* main content */}
          <main className="app-main">
            <Outlet />
          </main>
        </div>
  );
}

export default MainLayout;