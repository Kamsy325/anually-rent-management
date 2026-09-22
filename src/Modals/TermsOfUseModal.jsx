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

          <h3>3. Transparent Fee Structure (No Subscriptions & Unlimited Tenants)</h3>
          <p>
            The platform does not charge recurring subscription plans, upfront tier payments, or tenant listing limits. Landlords can add and manage unlimited tenants. The sole platform fee is a flat 3% fee on all rent transactions processed through the service.
          </p>

          <h3>4. Payment Processing (Paystack) Fees Borne by Landlord</h3>
          <p>
            Both the flat 3% platform fee and all third-party payment processing fees (Paystack platform charges) are paid by the landlord and deducted automatically from the rent payout. Tenants pay only the exact rent amount specified with no additional platform transaction fees.
          </p>

          <h3>5. Payouts & Disbursements</h3>
          <p>
            Net rent proceeds (gross rent minus the 3% platform fee and applicable Paystack transaction fees) are settled directly to the landlord's connected bank account via Paystack. All processed disbursements are final.
          </p>

          <h3>6. Acceptable Use</h3>
          <p>
            You agree not to use the service for any illegal or unauthorized purpose, nor violate any laws in your jurisdiction while using the platform.
          </p>

          <h3>7. Limitation of Liability</h3>
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