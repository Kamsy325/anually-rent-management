import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function PaymentCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState(
    "Verifying your payment..."
  );

  useEffect(() => {
    let cancelled = false;

    async function verifyPayment() {
      try {
        // Paystack returns the transaction reference
        // in the URL.
        const reference =
          searchParams.get("reference");

        console.log(
          "PAYMENT CALLBACK REFERENCE:",
          reference
        );

        if (!reference) {
          console.error(
            "PAYMENT CALLBACK ERROR: No reference found"
          );

          if (!cancelled) {
            setStatus("error");
            setMessage(
              "No payment reference was found."
            );
          }

          return;
        }

        // -------------------------------------------------
        // GET AUTH TOKEN
        // -------------------------------------------------

        const token =
          localStorage.getItem("token");

        if (!token) {
          console.error(
            "PAYMENT CALLBACK ERROR: No authentication token"
          );

          if (!cancelled) {
            setStatus("error");
            setMessage(
              "Your session has expired. Please log in again."
            );
          }

          return;
        }

        console.log(
          "VERIFYING PAYMENT WITH SERVER..."
        );

        // -------------------------------------------------
        // VERIFY PAYMENT
        //
        // Your backend route is:
        //
        // GET /payments/verify/:reference
        //
        // because paymentRoute.js uses:
        //
        // router.get("/verify/:reference")
        //
        // and server.js uses:
        //
        // app.use(paymentRoutes)
        // -------------------------------------------------

        const response =
          await axios.get(
            `http://localhost:5000/payments/verify/${encodeURIComponent(
              reference
            )}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        console.log(
          "PAYMENT VERIFICATION RESPONSE:",
          response.data
        );

        if (cancelled) {
          return;
        }

        if (
          response.data?.success === true
        ) {
          setStatus("success");
          setMessage(
            "Payment successful! Redirecting to your dashboard..."
          );

          // Give the user a moment to see
          // the successful payment message.
          setTimeout(() => {
            navigate(
              "/app",
              {
                replace: true,
              }
            );
          }, 1500);

          return;
        }

        setStatus("error");
        setMessage(
          response.data?.message ||
            "Payment verification failed."
        );

      } catch (error) {
        console.error(
          "PAYMENT CALLBACK ERROR:",
          error
        );

        console.error(
          "PAYMENT CALLBACK SERVER RESPONSE:",
          error.response?.data
        );

        if (cancelled) {
          return;
        }

        setStatus("error");

        setMessage(
          error.response?.data?.message ||
            "We could not verify your payment."
        );
      }
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [navigate, searchParams]);


  // =====================================================
  // VERIFYING
  // =====================================================

  if (status === "verifying") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "450px",
            textAlign: "center",
          }}
        >
          <h1>
            Verifying Payment
          </h1>

          <p>
            Please wait while we confirm
            your payment with Paystack.
          </p>
        </div>
      </div>
    );
  }


  // =====================================================
  // SUCCESS
  // =====================================================

  if (status === "success") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "450px",
            textAlign: "center",
          }}
        >
          <h1>
            Payment Successful
          </h1>

          <p>
            {message}
          </p>
        </div>
      </div>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          textAlign: "center",
        }}
      >
        <h1>
          Payment Verification Failed
        </h1>

        <p>
          {message}
        </p>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/tenant-dashboard",
              {
                replace: true,
              }
            )
          }
          style={{
            marginTop: "20px",
            padding: "12px 20px",
            cursor: "pointer",
          }}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}