import React, { useState } from "react";
import axios from "axios";
import { FiX, FiCheck } from "react-icons/fi";
import styles from "../css/SubscriptionModal.module.css";

const API_URL = "http://localhost:5000";

const PLAN_TIERS = [
  {
    key: "pro",
    name: "Pro",
    price: 9000,
    tagline: "Everything you need to get started:",
    features: [
      { bold: "Up to 8", text: "tenant slots" },
      { bold: "3%", text: "transaction fee per payment" },
      { bold: "Automated", text: "Paystack rent collection" },
      { bold: "Instant", text: "tenant dashboard access" },
      { bold: "Email", text: "payment notifications" },
    ],
    cta: "Select Pro",
    subnote: "Comes with instant setup",
  },
  {
    key: "premium",
    name: "Premium",
    price: 17000,
    tagline: "Everything in the Pro plan plus:",
    features: [
      { bold: "Up to 15", text: "tenant slots" },
      { bold: "1%", text: "reduced transaction fee" },
      { bold: "Priority", text: "payout processing" },
      { bold: "Advanced", text: "tenant payment analytics" },
      { bold: "Automated", text: "lease renewal reminders" },
    ],
    cta: "Select Premium",
    subnote: "Comes with priority support",
  },
  {
    key: "business",
    name: "Business",
    price: 34000,
    tagline: "Everything in Premium plus:",
    features: [
      { bold: "Unlimited", text: "tenant capacity" },
      { bold: "0%", text: "platform transaction fees" },
      { bold: "Dedicated", text: "account manager" },
      { bold: "Custom", text: "lease agreements & terms" },
      { bold: "Full audit", text: "logs & financial exports" },
    ],
    cta: "Select Business",
    subnote: "Always ready for scale",
  },
];

const ChoosePlanModal = ({ isOpen, onClose, currentPlan = "free" }) => {
  const [loadingPlan, setLoadingPlan] = useState(null);

  if (!isOpen) return null;

  const handleSelectPlan = async (planKey) => {
    if (planKey === currentPlan) return;

    setLoadingPlan(planKey);
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
      alert(err.response?.data?.message || "Failed to initialize subscription plan.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={`${styles.modalContainer} ${styles.largeModal}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div className={styles.titleArea}>
            <h2>Upgrade Subscription</h2>
            <p className={styles.modalSubtext}>
              Choose the plan that best fits your property management needs.
            </p>
          </div>

          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className={styles.planGrid}>
          {PLAN_TIERS.map((tier) => {
            const isCurrent = currentPlan.toLowerCase() === tier.key.toLowerCase();

            return (
              <div key={tier.key} className={styles.planCard}>
                <div>
                  <h3 className={styles.planName}>{tier.name}</h3>

                  <div className={styles.priceWrapper}>
                    <span className={styles.price}>₦{tier.price.toLocaleString()}</span>
                    <span className={styles.priceSub}>per month</span>
                  </div>

                  <p className={styles.featureTitle}>{tier.tagline}</p>

                  <ul className={styles.featureList}>
                    {tier.features.map((feat, idx) => (
                      <li key={idx}>
                        <FiCheck className={styles.featureIcon} size={18} />
                        <span>
                          <strong>{feat.bold}</strong> {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.cardFooter}>
                  <button
                    type="button"
                    disabled={isCurrent || loadingPlan === tier.key}
                    onClick={() => handleSelectPlan(tier.key)}
                    className={styles.selectBtn}
                  >
                    {loadingPlan === tier.key
                      ? "Redirecting..."
                      : isCurrent
                      ? "Current Plan"
                      : tier.cta}
                  </button>
                  <p className={styles.guaranteeText}>{tier.subnote}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChoosePlanModal;