import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom"; //
import axios from "axios"; //
import { FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi"; //
import styles from "../css/Auth.module.css"; //

export default function VerifyEmail() {
  const [searchParams] = useSearchParams(); //
  const token = searchParams.get("token"); //
  const navigate = useNavigate(); //

  const [status, setStatus] = useState("verifying"); //
  const [errorMessage, setErrorMessage] = useState(""); //

  // Ref flag to block strict mode duplicate execution
  const verificationFired = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error"); //
      setErrorMessage("No verification token provided."); //
      return;
    }

    if (verificationFired.current) return;
    verificationFired.current = true;

    const verifyToken = async () => {
      try {
        const response = await axios.get(
          `https://anually-rent-management-backend.iamkamsy325.workers.dev/verify-email?token=${token}` //
        );

        const { token: jwtToken, role, user } = response.data; //

        // Store user and token in localStorage
        localStorage.setItem("token", jwtToken); //
        localStorage.setItem("user", JSON.stringify({ ...user, role })); //

        localStorage.setItem("isNewUser", "true"); //

        setStatus("success"); //

        // Redirect to application dashboard after 2 seconds
        setTimeout(() => {
          navigate("/app", { replace: true }); //
        }, 2000);
      } catch (err) {
        console.error("VERIFICATION ERROR:", err); //
        setStatus("error"); //
        setErrorMessage(
          err.response?.data?.message || "Verification failed or token expired." //
        );
      }
    };

    verifyToken();
  }, [token, navigate]);

  return (
    <div className={styles.exportWrapper}>
      <div
        className={styles.authScreen}
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <div className={styles.formPanel} style={{ maxWidth: "480px", width: "100%" }}>
          <div className={styles.formContainer} style={{ textAlign: "center" }}>
            {status === "verifying" && (
              <>
                <FiLoader
                  size={48}
                  style={{
                    color: "#2563eb",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 16px auto",
                  }}
                />
                <h1 className={styles.formTitle}>Verifying your email...</h1>
                <p className={styles.formSubtitle}>
                  Please wait while we activate your account.
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <FiCheckCircle
                  size={48}
                  style={{ color: "#16a34a", margin: "0 auto 16px auto" }}
                />
                <h1 className={styles.formTitle}>Account Activated!</h1>
                <p className={styles.formSubtitle}>
                  Your email has been verified. Redirecting you to your dashboard...
                </p>
              </>
            )}

            {status === "error" && (
              <>
                <FiXCircle
                  size={48}
                  style={{ color: "#dc2626", margin: "0 auto 16px auto" }}
                />
                <h1 className={styles.formTitle}>Verification Failed</h1>
                <p className={styles.formSubtitle} style={{ color: "#dc2626" }}>
                  {errorMessage}
                </p>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => navigate("/")}
                  style={{ marginTop: "24px" }}
                >
                  Back to Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}