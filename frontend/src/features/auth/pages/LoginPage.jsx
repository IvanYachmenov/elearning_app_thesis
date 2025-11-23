import { useState } from 'react';
import { api, setAuthToken } from "../../../api/client.js";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";

function LoginPage({ onAuth }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [accessToken, setAccessToken] = useState(null);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setProfile(null)

        try {
            const resp = await api.post("/api/auth/token/", {
                username,
                password,
            });

            const { access, refresh } = resp.data;
            setAccessToken(access);

            localStorage.setItem("access", access);
            localStorage.setItem("refresh", refresh);

            setAuthToken(access);

            const meResp = await api.get("/api/auth/me/");
            setProfile(meResp.data);

            if(onAuth) {
                onAuth(access, meResp.data);
            }

            navigate("/home");

        } catch (err) {
            console.error(err);
            setError("Login failed. Invalid username or password.");
        }
    }

    const handleLoadProfile = async () => {
        setError(null);

        try {
            const token = accessToken || localStorage.getItem("access");
            if(!token) {
                setError("No access token. Please log in first!");
                return;
            }

            setAuthToken(token);
            const meResp = await api.get("/api/auth/me/");
            setProfile(meResp.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load profile.");
        }
    }
    return (
        <div className="auth-page">
      <h1 className="auth-title">Login</h1>

      <form className="auth-form" onSubmit={handleLogin}>
        <div className="auth-field">
          <label className="auth-label">
            Username:
            <input
              className="auth-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
        </div>

        <div className="auth-field">
          <label className="auth-label">
            Password:
            <input
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>

        <button type="submit" className="auth-button">
          Login
        </button>
      </form>

      <p>
        Don't have an account?{" "}
        <Link className="auth-link" to="/register">
          Register
        </Link>
      </p>

      {error && <p className="auth-error">{error}</p>}

      {accessToken && (
        <p className="auth-token">
          <strong>Access token:</strong> {accessToken}
        </p>
      )}

      {profile && (
        <div style={{ marginTop: 20 }}>
          <h2>Profile:</h2>
          <pre>{JSON.stringify(profile, null, 2)}</pre>
        </div>
      )}
    </div>
    );
}

export default LoginPage;