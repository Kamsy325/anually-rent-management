import React, { useState } from "react";
import axios from "axios";
import { FiX, FiRefreshCw, FiCalendar } from "react-icons/fi";
import styles from "../css/SubscriptionModal.module.css";

const API_URL = "https://anually-rent-management-backend.iamkamsy325.workers.dev";

const RENEW_PRICES = {
  free: 0,
  pro: 9000,
  premium: 17000,
  business: 34000,
};

const RenewPlanModal = ({ isOpen, onClose, currentPlan = "pro", expiryDate }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const price = RENEW_PRICES[currentPlan] || 5000;

  const handleRenew = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/subscription/initialize`,
        { planType: currentPlan },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to initiate renewal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.titleArea}>
            <h2>Renew Subscription</h2>
            <p className={styles.modalSubtext}>
              Keep your properties active and collect rent payments seamlessly.
            </p>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            <FiX size={20} />
          </button>
        </div>

        <div className={styles.renewBox}>
          <h3>{currentPlan.toUpperCase()} Plan</h3>

          <div className={styles.priceWrapper}>
            <span className={styles.price}>₦{price.toLocaleString()}</span>
            <span className={styles.priceSub}>per month</span>
          </div>

          <p className={styles.modalSubtext} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <FiCalendar size={14} />
            Period Expiry:{" "}
            <strong>{expiryDate ? new Date(expiryDate).toLocaleDateString() : "Expired"}</strong>
          </p>

          <div className={styles.cardFooter} style={{ marginTop: "24px" }}>
            <button
              type="button"
              disabled={loading}
              onClick={handleRenew}
              className={styles.selectBtn}
            >
              {loading ? (
                "Redirecting..."
              ) : (
                <>
                  <FiRefreshCw size={16} />
                  Renew Now (₦{price.toLocaleString()})
                </>
              )}
            </button>
            <p className={styles.guaranteeText}>Secure checkout via Paystack</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenewPlanModal;