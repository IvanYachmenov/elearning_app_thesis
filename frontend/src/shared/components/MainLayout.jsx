import { NavLink, Outlet } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import '../../styles/layout.css';
import AppFooter from "./AppFooter";
import menuIcon from "../../assets/icons/menu.png";
import closeIcon from "../../assets/icons/close.png";



function MainLayout({ user, onLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getLinkClassName = ({ isActive }) =>
    isActive ? 'app-nav-link app-nav-link--active' : 'app-nav-link';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const getInitials = (username) =>
    username ? username.charAt(0).toUpperCase() : 'U';

  const handleNavLinkClick = () => {
    setIsMobileNavOpen(false);
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header__container">
          <div className="app-header__left">
            <div className="app-logo">E-Learning</div>

            <button
              className="app-mobile-toggle"
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
            >
              <img
                src={isMobileNavOpen ? closeIcon : menuIcon}
                alt={isMobileNavOpen ? "Close navigation" : "Open navigation"}
                className="app-mobile-toggle__icon"
              />
            </button>

            <nav
              className={
                'app-nav' + (isMobileNavOpen ? ' app-nav--mobile' : '')
              }
            >
              <NavLink
                to="/home"
                className={getLinkClassName}
                onClick={handleNavLinkClick}
              >
                Home
              </NavLink>

              <NavLink
                to="/courses"
                className={getLinkClassName}
                onClick={handleNavLinkClick}
              >
                Courses
              </NavLink>

              <NavLink
                to="/learning"
                className={getLinkClassName}
                onClick={handleNavLinkClick}
              >
                Learning
              </NavLink>

              <NavLink
                to="/shop"
                className={getLinkClassName}
                onClick={handleNavLinkClick}
              >
                Shop
              </NavLink>

              <NavLink
                to="/settings"
                className={getLinkClassName}
                onClick={handleNavLinkClick}
              >
                Settings
              </NavLink>
            </nav>
          </div>

          <div className="app-header__right" ref={dropdownRef}>
            <button
              className="profile-button"
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              <div className="profile-avatar">
                {getInitials(user.username)}
              </div>
              <span>{user.username}</span>
              <svg
                className={
                  'profile-chevron' + (isDropdownOpen ? ' open' : '')
                }
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="profile-dropdown">
                <NavLink
                  to="/profile"
                  className="profile-dropdown__item"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Profile
                </NavLink>

                <button
                  type="button"
                  className="profile-dropdown__item profile-dropdown__item--danger"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onLogout();
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <AppFooter />
    </div>
  );
}

export default MainLayout;
