import { useState } from "react";
import { api, setAuthToken } from "../../../api/client";
import { Link, useNavigate } from "react-router-dom";

function RegisterPage({ onAuth }) {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError(null);

      try {
          // register user
          await api.post("/api/auth/register/", form);

          // login with that data
          const loginResp = await api.post("/api/auth/token/", {
              username: form.username,
              password: form.password,
          });

          const { access, refresh } = loginResp.data;
          localStorage.setItem("access", access);
          localStorage.setItem("refresh", refresh);
          setAuthToken(access);

          const meResp = await api.get("/api/auth/me");

          if(onAuth) {
              onAuth(access, meResp.data);
          }

          navigate("/login"); //

      } catch (err) {
          console.error(err);
          setError("Registration failed. Maybe username or email already taken.");
      }
    };

    return (
        <div className="auth-page">
        <h1 className="auth-title">Sign up</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
        <label className="auth-label">
        Username:
        <input
          className="auth-input"
          name="username"
          value={form.username}
          onChange={handleChange}
          required
        />
        </label>
        </div>

        <div className="auth-field">
        <label className="auth-label">
        Email:
        <input
          className="auth-input"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
        </label>
        </div>

        <div className="auth-field">
        <label className="auth-label">
        Password:
        <input
          className="auth-input"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        </label>
        </div>

        <div className="auth-field">
        <label className="auth-label">
        First name:
        <input
          className="auth-input"
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
        />
        </label>
        </div>

        <div className="auth-field">
        <label className="auth-label">
        Last name:
        <input
          className="auth-input"
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
        />
        </label>
        </div>

        <button type="submit" className="auth-button">
        Create account
        </button>
        </form>

        <p>
        Already have an account?{" "}
        <Link className="auth-link" to="/login">
        Log in
        </Link>
        </p>

        {error && <p className="auth-error">{error}</p>}
        </div>
    );
}

export default RegisterPage;