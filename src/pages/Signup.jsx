import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import {
  FiBarChart2,
  FiEyeOff,
  FiEye,
  FiShield,
  FiUsers,
  FiBell,
  FiMail,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../css/Auth.module.css";
import PrivacyPolicyModal from "../Modals/PrivacyPolicyModal";
import TermsOfUseModal from "../Modals/TermsOfUseModal";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmailAddress, setSentEmailAddress] = useState("");
  const [isPrivacyModal, setIsPrivacyModal] = useState(false);
  const [isTermsModal, setIsTermsModal] = useState(false);

  const navigate = useNavigate();

  // ==================================================
  // GOOGLE SIGNUP HANDLER (Google accounts bypass email verification)
  // ==================================================
  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.post("http://localhost:5000/google", {
        access_token: tokenResponse.access_token,
      });

      const { token, role, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ ...user, role }));

      localStorage.setItem("isNewUser", "true");

      navigate("/app");
    } catch (err) {
      console.error("GOOGLE SIGNUP ERROR:", err);
      setError(
        err.response?.data?.message || "Google Sign-Up failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError("Google Sign-Up was cancelled or failed."),
  });

  // ==================================================
  // STANDARD SIGNUP HANDLER
  // ==================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const first_name = document.getElementById("first_name").value.trim();
    const last_name = document.getElementById("last_name").value.trim();
    const email = document.getElementById("email").value.trim();
    const userPassword = document.getElementById("password").value;

    if (!first_name || !last_name || !email || !userPassword) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post("http://localhost:5000/signup", {
        first_name,
        last_name,
        email,
        password: userPassword,
      });

      if (response.status === 200 || response.status === 201) {
        setSentEmailAddress(email);
        setEmailSent(true);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err.response?.data?.message ||
          "Something went wrong, please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.exportWrapper}>
      <div className={styles.authScreen}>
        {/* LEFT / SIGN UP PANEL */}
        <div className={styles.formPanel}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <FiBarChart2 size={20} strokeWidth={2.4} />
            </div>
            <span className={styles.logoText}>Annually</span>
          </div>

          {emailSent ? (
            /* EMAIL SENT CONFIRMATION STATE */
            <div className={styles.formContainer} style={{ textAlign: "center" }}>
              <div
                style={{
                  background: "#eff6ff",
                  color: "#2563eb",
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px auto",
                }}
              >
                <FiMail size={28} />
              </div>
              <h1 className={styles.formTitle}>Check your email</h1>
              <p className={styles.formSubtitle} style={{ marginTop: "8px" }}>
                We sent a confirmation link to <strong>{sentEmailAddress}</strong>.
                Click it to activate your account.
              </p>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => navigate("/")}
                style={{ marginTop: "24px" }}
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            /* REGULAR FORM STATE */
            <form className={styles.formContainer} onSubmit={handleSubmit}>
              <div>
                <h1 className={styles.formTitle}>Create your account</h1>
                <p className={styles.formSubtitle}>
                  Manage your properties smarter, starting today.
                </p>
              </div>

              {/* GOOGLE BUTTON */}
              <button
                type="button"
                className={styles.googleButton}
                onClick={() => googleLogin()}
                disabled={loading}
              >
                <FcGoogle size={18} />
                <span>Continue with Google</span>
              </button>

              <div className={styles.divider}>
                <div className={styles.dividerLine}></div>
                <span>or sign up with email</span>
                <div className={styles.dividerLine}></div>
              </div>

              <div className={styles.fields}>
                <div className={styles.nameRow}>
                  <div className={styles.field}>
                    <label htmlFor="first_name">First name</label>
                    <input
                      id="first_name"
                      type="text"
                      className={styles.input}
                      placeholder="Jane"
                      disabled={loading}
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="last_name">Last name</label>
                    <input
                      id="last_name"
                      type="text"
                      className={styles.input}
                      placeholder="Smith"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="email">Email address</label>
                  <input
                    id="email"
                    type="email"
                    className={styles.input}
                    placeholder="jane@example.com"
                    disabled={loading}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="password">Password</label>
                  <div className={`${styles.input} ${styles.passwordInput}`}>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={loading}
                      style={{
                        border: "none",
                        outline: "none",
                        width: "100%",
                        background: "transparent",
                      }}
                    />

                    <button
                      type="button"
                      className={styles.eyeButton}
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <p style={{ color: "#dc2626", fontSize: "14px", marginTop: "4px" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                className={styles.primaryButton}
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
              </button>

              <p className={styles.signInText}>
                Already have an account?{" "}
                <button
                  type="button"
                  className={styles.primaryLink}
                  onClick={() => navigate("/")}
                  style={{
                    border: "none",
                    background: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* TERMS FOOTER LINK IN SIGNUP */}
          <p className={styles.terms}>
            By signing up, you agree to our{" "}
            <button
              type="button"
              className={styles.termsLink}
              onClick={() => setIsTermsModal(true)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Terms of Use
            </button>{" "}
            and{" "}
            <button
              type="button"
              className={styles.termsLink}
              onClick={() => setIsPrivacyModal(true)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Privacy Policy
            </button>
          </p>

          {/* MODALS RENDERED AT BOTTOM OF SIGNUP */}
          <PrivacyPolicyModal
            isOpen={isPrivacyModal}
            onClose={() => setIsPrivacyModal(false)}
          />
          <TermsOfUseModal
            isOpen={isTermsModal}
            onClose={() => setIsTermsModal(false)}
          />
        </div>

        <AuthInfoPanel />
      </div>
    </div>
  );
}

function AuthInfoPanel() {
  return (
    <div className={styles.infoPanel}>
      <div className={styles.topCircle}></div>
      <div className={styles.bottomCircle}></div>

      <div className={styles.infoTop}>
        <div className={styles.trustedBadge}>
          <FiShield size={14} />
          <span>Trusted by 3,000+ landlords</span>
        </div>

        <h2 className={styles.infoTitle}>
          Everything you need to manage your rentals
        </h2>

        <p className={styles.infoDescription}>
          Track rent payments, manage tenants, and stay on top of your property
          portfolio — all in one place.
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
          <div className={styles.avatar}>MK</div>
          <div>
            <p className={styles.personName}>Marcus K.</p>
            <p className={styles.personRole}>Landlord, 12 units</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, description }) {
  return (
    <div className={styles.feature}>
      <div className={styles.featureIcon}>{icon}</div>
      <div>
        <p className={styles.featureTitle}>{title}</p>
        <p className={styles.featureDescription}>{description}</p>
      </div>
    </div>
  );
}