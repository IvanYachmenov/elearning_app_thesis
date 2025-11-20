import { NavLink, Outlet } from 'react-router-dom';

function MainLayout({ user,onLogout }) {
    const baseLinkStyle = {
        padding: "8px 12px",
        borderRadius: "999px",
        fontSize: "14px",
        textDecoration: "none",
        border: "1px solid transparent",
    };

    const getLinkStyle = ({ isActive }) => {
        return {
            ...baseLinkStyle,
            color: isActive ? "#0f172a" : "#e5e7eb",
            backgroundColor: isActive ? "#38bdf8" : "transparent",
            borderColor: isActive ? "#38bdf8" : "transparent",
        };
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#020617",
                color: "#e5e7eb",
            }}
        >
            {/* navbar TOP */}
            <header
                style={{
                    borderBottom: "1px solid #1e293b",
                    padding: "10px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    backgroundColor: "#020617",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontWeight: 700, fontSize: "18px"}}>E-learning App</span>
                    <nav style={{ display: "flex", gap: "8px" }}>

                        <NavLink to="/home" style={getLinkStyle}>
                            Home
                        </NavLink>

                        <NavLink to="/profile" style={getLinkStyle}>
                            Profile
                        </NavLink>

                        <NavLink to="/courses" style={getLinkStyle}>
                            Courses
                        </NavLink>

                        <NavLink to="/learning" style={getLinkStyle}>
                            Learning
                        </NavLink>

                        <NavLink to="/shop" style={getLinkStyle}>
                            Shop
                        </NavLink>

                        <NavLink to="/settings" style={getLinkStyle}>
                            Settings
                        </NavLink>

                    </nav>
                </div >


                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "14px", color: "#9ca3af" }}>
                        {user.username}
                    </span>
                    <button
                        onClick={onLogout}
                        style={{
                            padding: "6px 10px",
                            borderRadius: "999px",
                            border: "1px solid #475569",
                            backgroundColor: "#0f172a",
                            color: "#e5e7eb",
                            cursor: "pointer",
                        }}
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* main content */}
            <main
                style={{
                    maxWidth: 900,
                    margin: "24px auto",
                    padding: "0 16px 40px",
                    fontFamily: "sans-serif",
                }}
            >
                <Outlet />
            </main>
        </div>
    );
}

export default MainLayout;