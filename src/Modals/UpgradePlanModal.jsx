import React, { useState } from "react";
import axios from "axios";
import { FiX, FiArrowRight } from "react-icons/fi";
import styles from "../css/SubscriptionModal.module.css";

const API_URL = "http://localhost:5000";

const UPGRADE_TIERS = [
  { key: "pro", name: "Pro", price: 9000, tenants: "Up to 8 tenants", fee: "3% fee" },
  { key: "premium", name: "Premium", price: 17000, tenants: "Up to 15 tenants", fee: "1% fee" },
  { key: "business", name: "Business", price: 34000, tenants: "Unlimited tenants", fee: "0% fee" },
];

const UpgradePlanModal = ({ isOpen, onClose, currentPlan = "free" }) => {
  const [loading, setLoading] = useState(null);

  if (!isOpen) return null;

  const planOrder = ["free", "pro", "premium", "business"];
  const higherPlans = UPGRADE_TIERS.filter(
    (tier) => planOrder.indexOf(tier.key) > planOrder.indexOf(currentPlan)
  );

  const handleUpgrade = async (planKey) => {
    setLoading(planKey);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/subscription/initialize`,
        { planType: planKey },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to start upgrade.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.titleArea}>
            <h2>Upgrade Your Plan</h2>
            <p className={styles.modalSubtext}>
              You have reached your limit on <strong>{currentPlan.toUpperCase()}</strong>. Pick an upgrade below:
            </p>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            <FiX size={20} />
          </button>
        </div>

        <div className={styles.upgradeList}>
          {higherPlans.map((tier) => (
            <div key={tier.key} className={styles.upgradeRow}>
              <div>
                <h4>{tier.name} Plan</h4>
                <p>{tier.tenants} • {tier.fee}</p>
              </div>

              <button
                type="button"
                disabled={loading === tier.key}
                onClick={() => handleUpgrade(tier.key)}
                className={styles.selectBtn}
                style={{ width: "auto", padding: "12px 20px" }}
              >
                {loading === tier.key ? (
                  "Redirecting..."
                ) : (
                  <>
                    ₦{tier.price.toLocaleString()}
                    <FiArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpgradePlanModal;