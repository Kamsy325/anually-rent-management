import React, { useState } from "react";

import {
  FiBarChart2,
  FiEyeOff,
  FiEye,
  FiShield,
  FiUsers,
  FiBell,
} from "react-icons/fi";

import { FcGoogle } from "react-icons/fc";

import { useNavigate } from "react-router-dom";

import axios from "axios";

import styles from "../css/Auth.module.css";


export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  // ==================================================
  // LOGIN
  // ==================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");


    // ==================================================
    // VALIDATION
    // ==================================================

    if (!email.trim() || !password) {

      setError(
        "Email and password are required."
      );

      return;

    }


    try {

      setLoading(true);


      // ==================================================
      // LOGIN REQUEST
      // ==================================================

      const response = await axios.post(
        "http://localhost:5000/login",
        {
          email: email.trim().toLowerCase(),
          password,
        }
      );


      console.log(
        "LOGIN RESPONSE:",
        response.data
      );


      // ==================================================
      // GET TOKEN
      // ==================================================

      const token =
        response.data?.token;


      // ==================================================
      // GET ROLE
      // ==================================================

      const backendRole =
        response.data?.role;


      const role =
        String(
          backendRole || ""
        )
          .trim()
          .toLowerCase();


      // ==================================================
      // GET USER
      // ==================================================

      const backendUser =
        response.data?.user;


      console.log(
        "BACKEND ROLE:",
        backendRole
      );

      console.log(
        "NORMALIZED ROLE:",
        role
      );

      console.log(
        "BACKEND USER:",
        backendUser
      );


      // ==================================================
      // CHECK TOKEN
      // ==================================================

      if (!token) {

        setError(
          "Login succeeded but no authentication token was returned."
        );

        return;

      }


      // ==================================================
      // CHECK USER
      // ==================================================

      if (!backendUser) {

        setError(
          "Login succeeded but no user data was returned."
        );

        return;

      }


      // ==================================================
      // CHECK ROLE
      // ==================================================

      if (
        role !== "landlord" &&
        role !== "tenant"
      ) {

        console.error(
          "INVALID ROLE RECEIVED:",
          backendRole
        );

        setError(
          "Your account type could not be determined."
        );

        return;

      }


      // ==================================================
      // CREATE FRONTEND USER
      //
      // IMPORTANT:
      //
      // The backend may return role separately:
      //
      // {
      //   token,
      //   role,
      //   user
      // }
      //
      // We explicitly put role inside user.
      // ==================================================

      const user = {

        ...backendUser,

        role: role,

      };


      console.log(
        "FINAL USER OBJECT:",
        user
      );


      // ==================================================
      // CLEAR OLD AUTH DATA
      // ==================================================

      localStorage.removeItem("token");

      localStorage.removeItem("user");


      // ==================================================
      // SAVE TOKEN
      // ==================================================

      localStorage.setItem(
        "token",
        token
      );


      // ==================================================
      // SAVE USER
      // ==================================================

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );


      // ==================================================
      // VERIFY STORAGE
      // ==================================================

      console.log(
        "TOKEN SAVED:",
        localStorage.getItem("token")
      );

      console.log(
        "USER SAVED:",
        localStorage.getItem("user")
      );

      console.log(
        "SAVED ROLE:",
        JSON.parse(
          localStorage.getItem("user")
        )?.role
      );


      // ==================================================
      // BOTH USERS GO TO /app
      //
      // App.jsx decides whether to render:
      //
      // Dashboard
      //
      // OR
      //
      // TenantDashboard
      // ==================================================

      navigate(
        "/app",
        {
          replace: true,
        }
      );


    } catch (err) {

      console.error(
        "LOGIN ERROR:",
        err
      );


      // ==================================================
      // SERVER ERROR
      // ==================================================

      if (err.response) {

        console.error(
          "SERVER RESPONSE:",
          err.response.data
        );


        setError(
          err.response.data?.message ||
          "Invalid email or password."
        );

      }


      // ==================================================
      // NO RESPONSE
      // ==================================================

      else if (err.request) {

        setError(
          "Unable to connect to the server. Make sure your backend is running."
        );

      }


      // ==================================================
      // OTHER ERROR
      // ==================================================

      else {

        setError(
          "Something went wrong. Please try again."
        );

      }

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className={styles.exportWrapper}>

      <div className={styles.authScreen}>

        {/* ==================================================
            LOGIN PANEL
        ================================================== */}

        <div className={styles.formPanel}>

          {/* LOGO */}

          <div className={styles.logo}>

            <div className={styles.logoIcon}>

              <FiBarChart2
                size={20}
                strokeWidth={2.4}
              />

            </div>

            <span className={styles.logoText}>
              Annually
            </span>

          </div>


          {/* FORM */}

          <form
            className={styles.formContainer}
            onSubmit={handleSubmit}
          >

            <div>

              <h1 className={styles.formTitle}>
                Welcome back
              </h1>

              <p className={styles.formSubtitle}>
                Sign in to manage your account.
              </p>

            </div>


            {/* GOOGLE */}

            <button
              type="button"
              className={styles.googleButton}
              disabled={loading}
            >

              <FcGoogle size={18} />

              <span>
                Continue with Google
              </span>

            </button>


            {/* DIVIDER */}

            <div className={styles.divider}>

              <div
                className={styles.dividerLine}
              />

              <span>
                or sign in with email
              </span>

              <div
                className={styles.dividerLine}
              />

            </div>


            {/* FIELDS */}

            <div className={styles.fields}>

              {/* EMAIL */}

              <div className={styles.field}>

                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  className={styles.input}
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                  disabled={loading}
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
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    autoComplete="current-password"
                    disabled={loading}
                    style={{
                      border: "none",
                      outline: "none",
                      width: "100%",
                      background:
                        "transparent",
                    }}
                  />

                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() =>
                      setShowPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
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
                role="alert"
                style={{
                  color: "#dc2626",
                  fontSize: "14px",
                  marginTop: "4px",
                }}
              >
                {error}
              </p>

            )}


            {/* LOGIN */}

            <button
              type="submit"
              className={styles.primaryButton}
              disabled={loading}
            >

              {loading
                ? "Signing in..."
                : "Log In"}

            </button>


            {/* SIGN UP */}

            <p className={styles.signInText}>

              Don't have an account?{" "}

              <button
                type="button"
                className={styles.primaryLink}
                onClick={() =>
                  navigate("/signup")
                }
                disabled={loading}
                style={{
                  border: "none",
                  background: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                Sign up
              </button>

            </p>

          </form>


          {/* TERMS */}

          <p className={styles.terms}>

            By signing in, you agree to our{" "}

            <a
              href="#"
              className={styles.termsLink}
              onClick={(e) =>
                e.preventDefault()
              }
            >
              Terms of Use
            </a>{" "}

            and{" "}

            <a
              href="#"
              className={styles.termsLink}
              onClick={(e) =>
                e.preventDefault()
              }
            >
              Privacy Policy
            </a>

          </p>

        </div>


        {/* RIGHT PANEL */}

        <AuthInfoPanel />

      </div>

    </div>

  );

}


/* ==================================================
   INFORMATION PANEL
================================================== */

function AuthInfoPanel() {

  return (

    <div className={styles.infoPanel}>

      <div className={styles.topCircle} />

      <div className={styles.bottomCircle} />


      <div className={styles.infoTop}>

        <div className={styles.trustedBadge}>

          <FiShield size={14} />

          <span>
            Trusted by 3,000+ landlords
          </span>

        </div>


        <h2 className={styles.infoTitle}>
          Everything you need to manage
          your rentals
        </h2>


        <p className={styles.infoDescription}>
          Track rent payments, manage tenants,
          and stay on top of your property
          portfolio — all in one place.
        </p>

      </div>


      <div className={styles.features}>

        <Feature
          icon={
            <FiBarChart2 size={18} />
          }
          title="Revenue Overview"
          description="Real-time income & expense tracking"
        />

        <Feature
          icon={
            <FiUsers size={18} />
          }
          title="Tenant Management"
          description="Profiles, leases & communication"
        />

        <Feature
          icon={
            <FiBell size={18} />
          }
          title="Payment Reminders"
          description="Automated alerts & notifications"
        />

      </div>


      <div className={styles.testimonial}>

        <p className={styles.quote}>
          "Annually cut my admin time in half.
          Rent tracking is effortless now."
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


/* ==================================================
   FEATURE
================================================== */

function Feature({
  icon,
  title,
  description,
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