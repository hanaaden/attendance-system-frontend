import {
  useState,
} from 'react';

import {
  useAuth,
} from '../context/AuthContext';
import {
  getUsers,
  updateUserStatus,
} from '../api/api';

export default function Login() {

  const {
    loginUser,
  } = useAuth();

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');


  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setError('');
    setLoading(true);

    try {

      await loginUser(
        email,
        password
      );

    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : 'Login failed.'
      );

    } finally {

      setLoading(false);
    }
  }


  return (
    <main className="login-page">

      <section className="login-card">

        <div className="login-header">

          <span className="brand">
            ATTENDANCE
          </span>

          <h1>
            Attendance Management System
          </h1>

          <p>
            Sign in to access your dashboard.
          </p>

        </div>


        <form
          onSubmit={handleSubmit}
          className="form"
        >

          <div className="field">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
              required
              disabled={loading}
            />

          </div>


          <div className="field">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              required
              disabled={loading}
            />

          </div>


          {error && (
            <div className="error-message">
              {error}
            </div>
          )}


          <button
            type="submit"
            className="primary-button full"
            disabled={loading}
          >
            {loading
              ? 'Signing in...'
              : 'Sign in'}
          </button>

        </form>

      </section>

    </main>
  );
}