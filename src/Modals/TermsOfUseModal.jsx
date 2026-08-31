import React from "react";
import { FiX } from "react-icons/fi";
import styles from "../css/Layout.module.css";

const TermsOfUseModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContainer}
        style={{ maxWidth: "650px", maxHeight: "80vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2>Terms of Use</h2>
          <button type="button" onClick={onClose} className={styles.closePopupButton}>
            <FiX size={18} />
          </button>
        </div>

        <div className={styles.modalBody} style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
          <p><strong>Last Updated: August 2026</strong></p>

          <h3>1. Acceptance of Terms</h3>
          <p>
            By creating an account or accessing our services, you agree to be bound by these Terms of Use and all applicable laws and regulations.
          </p>

          <h3>2. Account Responsibility</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>

          <h3>3. One-Time Payment & Plan Access</h3>
          <p>
            All plan purchases are processed as one-time payments for a fixed access period. Plans are non-recurring and will not automatically charge your account upon expiration.
          </p>

          <h3>4. No Refund & No Proration Policy</h3>
          <p>
            All payments are strictly final and non-refundable. We do not issue refunds, partial credits, or prorated adjustments for unused time, plan changes, or early account closure.
          </p>

          <h3>5. Acceptable Use</h3>
          <p>
            You agree not to use the service for any illegal or unauthorized purpose, nor violate any laws in your jurisdiction while using the platform.
          </p>

          <h3>6. Limitation of Liability</h3>
          <p>
            The service is provided on an "AS IS" and "AS AVAILABLE" basis. We shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the platform.
          </p>

          <div className={styles.modalActions} style={{ marginTop: "24px" }}>
            <button type="button" className={styles.submitButton} onClick={onClose}>
              I Understand & Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUseModal;