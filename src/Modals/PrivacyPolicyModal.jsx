import React from "react";
import { FiX } from "react-icons/fi";
import styles from "../css/Layout.module.css";

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContainer}
        style={{ maxWidth: "650px", maxHeight: "80vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2>Privacy Policy</h2>
          <button type="button" onClick={onClose} className={styles.closePopupButton}>
            <FiX size={18} />
          </button>
        </div>

        <div className={styles.modalBody} style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
          <p><strong>Last Updated: August 2026</strong></p>

          <h3>1. Information We Collect</h3>
          <p>
            We collect personal information that you directly provide to us when registering an account, including your name, email address, phone number, and company details.
          </p>

          <h3>2. How We Use Your Information</h3>
          <p>
            Your information is used to provide, maintain, and improve our platform services, process transactions, communicate updates, and deliver landlord-tenant notification features.
          </p>

          <h3>3. Data Sharing and Security</h3>
          <p>
            We do not sell your personal data to third parties. We share data only with third-party providers (such as payment gateways) necessary to deliver our services. We implement industry-standard encryption measures to secure your information.
          </p>

          <h3>4. Your Rights</h3>
          <p>
            You have the right to access, update, or request deletion of your personal data at any time through your profile settings or by contacting support.
          </p>

          <h3>5. Contact Us</h3>
          <p>
            If you have questions regarding this Privacy Policy, please contact us via support.
          </p>

          <div className={styles.modalActions} style={{ marginTop: "24px" }}>
            <button type="button" className={styles.submitButton} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;