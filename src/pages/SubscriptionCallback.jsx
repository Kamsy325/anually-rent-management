// SubscriptionCallback.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";

export default function SubscriptionCallback() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying"); // 'verifying' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      setErrorMessage("No transaction reference found in URL.");
      return;
    }

    const verifySubscription = async () => {
      try {
        const token = localStorage.getItem("token");

        // Send reference to backend to verify payment with Paystack
        await axios.get(
        `http://localhost:5000/subscription/verify/${reference}`,
        {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );

        setStatus("success");

        // Redirect user back to dashboard or subscription settings after 2s
        setTimeout(() => {
          navigate("/app", { replace: true });
        }, 2000);
      } catch (err) {
        console.error("SUBSCRIPTION VERIFICATION ERROR:", err);
        setStatus("error");
        setErrorMessage(
          err.response?.data?.message || "Failed to verify subscription payment."
        );
      }
    };

    verifySubscription();
  }, [reference, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "32px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          textAlign: "center",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        {status === "verifying" && (
          <>
            <FiLoader
              size={44}
              style={{
                color: "#2563eb",
                animation: "spin 1s linear infinite",
                marginBottom: "16px",
              }}
            />
            <h2>Verifying Subscription...</h2>
            <p style={{ color: "#6b7280", marginTop: "8px" }}>
              Please wait while we confirm your payment with Paystack.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <FiCheckCircle
              size={48}
              style={{ color: "#16a34a", marginBottom: "16px" }}
            />
            <h2>Subscription Active!</h2>
            <p style={{ color: "#6b7280", marginTop: "8px" }}>
              Your payment was verified. Redirecting you to your dashboard...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <FiXCircle
              size={48}
              style={{ color: "#dc2626", marginBottom: "16px" }}
            />
            <h2>Verification Failed</h2>
            <p style={{ color: "#dc2626", marginTop: "8px" }}>
              {errorMessage}
            </p>
            <button
              onClick={() => navigate("/app")}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                backgroundColor: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Return to App
            </button>
          </>
        )}
      </div>
    </div>
  );
}