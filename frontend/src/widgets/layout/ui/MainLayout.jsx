import {NavLink, Outlet} from 'react-router-dom';
import {useEffect, useState} from 'react';
import '../../../shared/styles/layout.css';
import AppFooter from './AppFooter';
import {useNavigationLock} from '../../../shared/lib/navigation-lock';
import {useLanguage} from '../../../shared/lib/i18n/LanguageContext';

const ANIM_MS = 180;

function MainLayout({user, onLogout}) {
    const {isLocked, lockReason} = useNavigationLock();
    const {t} = useLanguage();

    // Fullscreen burger menu state with animated close
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMenuClosing, setIsMenuClosing] = useState(false);

    const getLinkClassName = ({isActive}) =>
        isActive ? 'app-nav-link app-nav-link--active' : 'app-nav-link';

    const getNavLinkClass = (modifier) => (props) => {
        const base = getLinkClassName(props);
        const withMod = `${base} ${modifier}`;
        return isLocked ? `${withMod} app-nav-link--disabled` : withMod;
    };

    useEffect(() => {
        document.body.classList.remove('theme-auth');
        document.body.classList.add('theme-app');
        return () => document.body.classList.remove('theme-app');
    }, []);

    // lock scroll when menu is open
    useEffect(() => {
        if (isMenuOpen && !isMenuClosing) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = prev;
            };
        }
    }, [isMenuOpen, isMenuClosing]);

    const handlePreventNavigation = (event) => {
        if (isLocked) {
            event.preventDefault();
            event.stopPropagation();
        }
    };

    const openMenu = () => {
        setIsMenuOpen(true);
        setIsMenuClosing(false);
    };

    const closeMenu = () => {
        if (!isMenuOpen || isMenuClosing) return;
        setIsMenuClosing(true);
        window.setTimeout(() => {
            setIsMenuOpen(false);
            setIsMenuClosing(false);
        }, ANIM_MS);
    };

    const toggleMenu = (event) => {
        if (isLocked) {
            event.preventDefault();
            return;
        }
        if (isMenuOpen && !isMenuClosing) closeMenu();
        else openMenu();
    };

    const handleMenuNavClick = (event) => {
        handlePreventNavigation(event);
        if (!isLocked) closeMenu();
    };

    // close by ESC
    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === 'Escape') closeMenu();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMenuOpen, isMenuClosing]);

    const initials = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

    return (
        <div className="app-root">
            <header className="app-header">
                <div className="app-header__container">
                    <div className="app-header__left">
                        <div className="app-logo">E-Learning</div>
                    </div>

                    <div className="app-header__right">
                    <nav className="app-nav" aria-label="Main navigation">
                            <NavLink
                                to="/home"
                                className={getNavLinkClass('app-nav-link--home')}
                                onClick={handlePreventNavigation}
                                aria-disabled={isLocked}
                            >
                                {t('nav.home')}
                            </NavLink>
                        
                            <NavLink
                                to="/courses"
                                className={getNavLinkClass('app-nav-link--courses')}
                                onClick={handlePreventNavigation}
                                aria-disabled={isLocked}
                            >
                                {t('nav.courses')}
                            </NavLink>

                            <NavLink
                                to="/learning"
                                className={getNavLinkClass('app-nav-link--learning')}
                                onClick={handlePreventNavigation}
                                aria-disabled={isLocked}
                            >
                                {t('nav.learning')}
                            </NavLink>
                        </nav>

                        {/* PROFILE: no dropdown, just a link */}
                        <NavLink
                            to="/profile"
                            className={({isActive}) =>
                                `profile-button profile-button--link${
                                    isActive ? ' profile-button--active' : ''
                                }${isLocked ? ' app-nav-link--disabled' : ''}`
                            }
                            onClick={handlePreventNavigation}
                            aria-disabled={isLocked}
                        >
                            <div className="profile-avatar">{initials}</div>
                            <span className="profile-name">{user?.username || 'User'}</span>
                        </NavLink>

                        {/* BURGER */}
                        <button
                            type="button"
                            className="burger-button"
                            onClick={toggleMenu}
                            aria-label="Open menu"
                            aria-disabled={isLocked}
                        >
                            <span className={'burger-icon' + (isMenuOpen && !isMenuClosing ? ' open' : '')}>
                                <span />
                                <span />
                                <span />
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {/* FULLSCREEN MENU */}
            {(isMenuOpen || isMenuClosing) && (
                <div
                    className={'app-menu' + (isMenuClosing ? ' is-closing' : '')}
                    role="dialog"
                    aria-modal="true"
                    onMouseDown={(e) => {
                        // click on backdrop closes
                        if (e.target === e.currentTarget) closeMenu();
                    }}
                >
                    <div className={'app-menu__panel' + (isMenuClosing ? ' is-closing' : '')} onMouseDown={(e) => e.stopPropagation()}>
                        <div className="app-menu__top">
                            <div className="app-menu__title">{t('nav.menu')}</div>
                            <button type="button" className="app-menu__close" onClick={closeMenu} aria-label="Close menu">
                                ✕
                            </button>
                        </div>

                        <nav className="app-menu__nav" aria-label="Fullscreen navigation">
                            {/* Main */}
                            <NavLink 
                                to="/home" 
                                className={({isActive}) => `app-menu__link${isActive ? ' active' : ''}`}
                                onClick={handleMenuNavClick} 
                                aria-disabled={isLocked}
                            >
                                {t('nav.home')}
                            </NavLink>
                            <NavLink 
                                to="/courses" 
                                className={({isActive}) => `app-menu__link${isActive ? ' active' : ''}`}
                                onClick={handleMenuNavClick} 
                                aria-disabled={isLocked}
                            >
                                {t('nav.courses')}
                            </NavLink>
                            <NavLink 
                                to="/learning" 
                                className={({isActive}) => `app-menu__link${isActive ? ' active' : ''}`}
                                onClick={handleMenuNavClick} 
                                aria-disabled={isLocked}
                            >
                                {t('nav.learning')}
                            </NavLink>
                            <NavLink 
                                to="/shop" 
                                className={({isActive}) => `app-menu__link${isActive ? ' active' : ''}`}
                                onClick={handleMenuNavClick} 
                                aria-disabled={isLocked}
                            >
                                {t('nav.shop')}
                            </NavLink>

                            <div className="app-menu__divider" />

                            {/* Teacher section */}
                            {user?.role === 'teacher' && (
                                <>
                                    <NavLink 
                                        to="/teacher/courses" 
                                        className={({isActive}) => `app-menu__link${isActive ? ' active' : ''}`}
                                        onClick={handleMenuNavClick} 
                                        aria-disabled={isLocked}
                                    >
                                        {t('nav.myCourses')}
                                    </NavLink>
                                    <div className="app-menu__divider" />
                                </>
                            )}

                            {/* Account */}
                            <NavLink 
                                to="/profile" 
                                className={({isActive}) => `app-menu__link${isActive ? ' active' : ''}`}
                                onClick={handleMenuNavClick} 
                                aria-disabled={isLocked}
                            >
                                {t('nav.profile')}
                            </NavLink>
                            <NavLink 
                                to="/settings" 
                                className={({isActive}) => `app-menu__link${isActive ? ' active' : ''}`}
                                onClick={handleMenuNavClick} 
                                aria-disabled={isLocked}
                            >
                                {t('nav.settings')}
                            </NavLink>

                            <button
                                type="button"
                                className="app-menu__link app-menu__link--danger"
                                onClick={(event) => {
                                    if (isLocked) {
                                        event.preventDefault();
                                        return;
                                    }
                                    closeMenu();
                                    onLogout();
                                }}
                                aria-disabled={isLocked}
                            >
                                {t('nav.logout')}
                            </button>
                        </nav>
                    </div>
                </div>
            )}

            <main className="app-main">
                {isLocked && (
                    <div className="app-navigation-lock">
                        <span className="app-navigation-lock__dot" />
                        <span>{lockReason || 'Navigation is temporarily locked.'}</span>
                    </div>
                )}
                <Outlet />
            </main>

            <AppFooter />
        </div>
    );
}

export default MainLayout;
