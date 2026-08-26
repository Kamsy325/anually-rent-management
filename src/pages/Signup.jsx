import React, { useState } from 'react';
import {
  FiBarChart2,
  FiEyeOff,
  FiEye,
  FiShield,
  FiUsers,
  FiBell
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import styles from '../css/Auth.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  // These MUST be at the top level of the component.
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess(false);

    const first_name = document.getElementById('first_name').value.trim();
    const last_name = document.getElementById('last_name').value.trim();
    const email = document.getElementById('email').value.trim();
    const userPassword = document.getElementById('password').value;

    // Basic frontend validation
    if (!first_name || !last_name || !email || !userPassword) {
      setError('Please fill in all fields.');
      return;
    }

    const userObj = {
      first_name,
      last_name,
      email,
      password: userPassword
    };

    try {
      setLoading(true);

      const response = await axios.post(
        'http://localhost:5000/signup',
        userObj
      );

      if (response.status === 200 || response.status === 201) {
      const { token, user } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        alert(token)
      
        setSuccess(true);
      
        navigate('/app');
      } 
    } catch (err) {
      console.error('Signup error:', err);

      setError(
        err.response?.data?.message ||
        'Something went wrong, please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.exportWrapper}>
      <div className={styles.authScreen}>

        {/* LEFT / SIGN UP */}
        <div className={styles.formPanel}>

          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <FiBarChart2 size={20} strokeWidth={2.4} />
            </div>

            <span className={styles.logoText}>
              Annually
            </span>
          </div>

          <form
            className={styles.formContainer}
            onSubmit={handleSubmit}
          >

            <div>
              <h1 className={styles.formTitle}>
                Create your account
              </h1>

              <p className={styles.formSubtitle}>
                Manage your properties smarter, starting today.
              </p>
            </div>

            <button
              type="button"
              className={styles.googleButton}
            >
              <FcGoogle size={18} />
              <span>
                Continue with Google
              </span>
            </button>

            <div className={styles.divider}>
              <div className={styles.dividerLine}></div>

              <span>
                or sign up with email
              </span>

              <div className={styles.dividerLine}></div>
            </div>

            <div className={styles.fields}>

              {/* NAME */}
              <div className={styles.nameRow}>

                <div className={styles.field}>
                  <label htmlFor="first_name">
                    First name
                  </label>

                  <input
                    id="first_name"
                    type="text"
                    className={styles.input}
                    placeholder="Jane"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="last_name">
                    Last name
                  </label>

                  <input
                    id="last_name"
                    type="text"
                    className={styles.input}
                    placeholder="Smith"
                  />
                </div>

              </div>

              {/* EMAIL */}
              <div className={styles.field}>
                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  placeholder="jane@example.com"
                />
              </div>

              {/* PASSWORD */}
              <div className={styles.field}>
                <label htmlFor="password">
                  Password
                </label>

                <div
                  className={`${styles.input} ${styles.passwordInput}`}
                >
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      background: 'transparent'
                    }}
                  />

                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? (
                      <FiEye size={16} />
                    ) : (
                      <FiEyeOff size={16} />
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* ERROR */}
            {error && (
              <p
                style={{
                  color: '#dc2626',
                  fontSize: '14px',
                  marginTop: '4px'
                }}
              >
                {error}
              </p>
            )}

            {/* SUCCESS */}
            {success && (
              <p
                style={{
                  color: '#16a34a',
                  fontSize: '14px',
                  marginTop: '4px'
                }}
              >
                Account created successfully.
              </p>
            )}

            <button
              type="submit"
              className={styles.primaryButton}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <p className={styles.signInText}>
              Already have an account?{' '}

              <button
                type="button"
                className={styles.primaryLink}
                onClick={() => navigate('/')}
                style={{
                  border: 'none',
                  background: 'none',
                  padding: 0,
                  cursor: 'pointer'
                }}
              >
                Sign in
              </button>
            </p>

          </form>

          <p className={styles.terms}>
            By signing in, you agree to our{' '}

            <a
              href="#"
              className={styles.termsLink}
            >
              Terms of Use
            </a>{' '}

            and{' '}

            <a
              href="#"
              className={styles.termsLink}
            >
              Privacy Policy
            </a>
          </p>

        </div>

        {/* RIGHT / INFORMATION PANEL */}
        <AuthInfoPanel />

      </div>
    </div>
  );
}


/* RIGHT SIDE */
function AuthInfoPanel() {
  return (
    <div className={styles.infoPanel}>

      <div className={styles.topCircle}></div>
      <div className={styles.bottomCircle}></div>

      <div className={styles.infoTop}>

        <div className={styles.trustedBadge}>
          <FiShield size={14} />

          <span>
            Trusted by 3,000+ landlords
          </span>
        </div>

        <h2 className={styles.infoTitle}>
          Everything you need to manage your rentals
        </h2>

        <p className={styles.infoDescription}>
          Track rent payments, manage tenants, and stay on top of your property portfolio — all in one place.
        </p>

      </div>

      <div className={styles.features}>

        <Feature
          icon={<FiBarChart2 size={18} />}
          title="Revenue Overview"
          description="Real-time income & expense tracking"
        />

        <Feature
          icon={<FiUsers size={18} />}
          title="Tenant Management"
          description="Profiles, leases & communication"
        />

        <Feature
          icon={<FiBell size={18} />}
          title="Payment Reminders"
          description="Automated alerts & notifications"
        />

      </div>

      <div className={styles.testimonial}>

        <p className={styles.quote}>
          "Annually cut my admin time in half. Rent tracking is effortless now."
        </p>

        <div className={styles.person}>

          <div className={styles.avatar}>
            MK
          </div>

          <div>
            <p className={styles.personName}>
              Marcus K.
            </p>

            <p className={styles.personRole}>
              Landlord, 12 units
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}


function Feature({
  icon,
  title,
  description
}) {
  return (
    <div className={styles.feature}>

      <div className={styles.featureIcon}>
        {icon}
      </div>

      <div>
        <p className={styles.featureTitle}>
          {title}
        </p>

        <p className={styles.featureDescription}>
          {description}
        </p>
      </div>

    </div>
  );
}