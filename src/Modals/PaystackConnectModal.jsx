import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiX,
  FiCreditCard,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import styles from "../css/Modals.module.css";

const API_URL = "https://anually-rent-management-backend.iamkamsy325.workers.dev";

export default function PayoutConnectModal({
  isOpen,
  setIsOpen,
  onConnectedSuccess,
}) {
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [connected, setConnected] = useState(false);
  const [payout, setPayout] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    businessName: "",
    bankCode: "",
    accountNumber: "",
  });

  const getPayoutStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setChecking(true);
      setError("");

      const response = await axios.get(`${API_URL}/paystack/payout`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.connected) {
        setConnected(true);
        setPayout(response.data.payout);
        if (onConnectedSuccess) onConnectedSuccess();
      } else {
        setConnected(false);
        setPayout(null);
      }
    } catch (error) {
      console.error("GET PAYOUT STATUS ERROR:", error);
      setError(
        error.response?.data?.message || "Unable to check payout status."
      );
    } finally {
      setChecking(false);
    }
  };

  const getBanksList = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoadingBanks(true);
      const response = await axios.get(`${API_URL}/paystack/banks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBanks(response.data.banks || []);
    } catch (error) {
      console.error("GET BANKS ERROR:", error);
      setError(error.response?.data?.message || "Unable to load banks.");
    } finally {
      setLoadingBanks(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    setError("");
    setSuccess("");

    getPayoutStatus();
    getBanksList();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.businessName.trim()) {
      setError("Please enter your business or account name.");
      return;
    }

    if (!formData.bankCode) {
      setError("Please select your bank.");
      return;
    }

    const accountNumber = formData.accountNumber.replace(/\s/g, "");

    if (!/^\d{10}$/.test(accountNumber)) {
      setError("Account number must contain 10 digits.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("You are not authenticated.");
      return;
    }

    try {
      setConnecting(true);

      const response = await axios.post(
        `${API_URL}/paystack/payout`,
        {
          businessName: formData.businessName.trim(),
          bankCode: formData.bankCode,
          accountNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setConnected(true);
      setPayout(response.data.payout);
      setSuccess("Your payout account has been connected successfully.");

      if (onConnectedSuccess) {
        onConnectedSuccess();
      }
    } catch (error) {
      console.error("CONNECT PAYOUT ERROR:", error);
      setError(
        error.response?.data?.message || "Failed to connect payout account."
      );
    } finally {
      setConnecting(false);
    }
  };

  const handleClose = () => {
    if (connecting) return;

    setError("");
    setSuccess("");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  if (checking) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div style={{ padding: "40px", textAlign: "center" }}>
            Checking payout connection...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onMouseDown={handleClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Payout Settings</h2>
            <p className={styles.modalDescription}>
              Connect your bank account to receive tenant rent payments.
            </p>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            disabled={connecting}
          >
            <FiX size={20} />
          </button>
        </div>

        {connected && payout ? (
          <div style={{ padding: "24px 0" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <FiCheckCircle size={32} style={{ color: "#16a34a" }} />
              <div>
                <h3 style={{ margin: 0 }}>Payout Connected</h3>
                <p style={{ margin: "4px 0 0", color: "#64748b" }}>
                  Your rent payments can now be sent to this account.
                </p>
              </div>
            </div>

            <div
              style={{
                padding: "16px",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
              }}
            >
              <p>
                <strong>Account Name</strong>
              </p>
              <p>
                {payout.accountName || payout.businessName || "Connected"}
              </p>

              <p>
                <strong>Bank</strong>
              </p>
              <p>{payout.bank || "Bank account"}</p>
            </div>

            {success && (
              <p
                style={{
                  color: "#16a34a",
                  fontSize: "14px",
                  marginTop: "16px",
                }}
              >
                {success}
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#dc2626",
                  fontSize: "14px",
                  marginBottom: "16px",
                }}
              >
                <FiAlertCircle />
                {error}
              </div>
            )}

            <div className={styles.formGroup}>
              <label>Business / Account Name</label>
              <div className={styles.inputWrapper}>
                <FiCreditCard />
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="John Smith Properties"
                  disabled={connecting}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Bank</label>
              <select
                name="bankCode"
                value={formData.bankCode}
                onChange={handleChange}
                disabled={loadingBanks || connecting}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  background: "white",
                }}
              >
                <option value="">
                  {loadingBanks ? "Loading banks..." : "Select your bank"}
                </option>

                {banks.map((bank, index) => (
                  <option
                    key={bank.code || bank.id || bank.slug || `bank-${index}`}
                    value={bank.code}
                  >
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Account Number</label>
              <div className={styles.inputWrapper}>
                <FiCreditCard />
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="0123456789"
                  inputMode="numeric"
                  maxLength={10}
                  disabled={connecting}
                />
              </div>
            </div>

            <p
              style={{
                color: "#64748b",
                fontSize: "13px",
                lineHeight: "1.5",
              }}
            >
              Your bank details are sent securely to Paystack. Your account number
              is not stored in your database. We only store the Paystack payout
              connection.
            </p>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleClose}
                disabled={connecting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={styles.primaryButton}
                disabled={connecting || loadingBanks}
              >
                {connecting ? "Connecting..." : "Connect Payout"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}