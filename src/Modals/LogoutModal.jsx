// components/Modals/LogoutModal.jsx

import React from "react";
import { FiX, FiLogOut } from "react-icons/fi";
import styles from "../css/Modals.module.css";

export default function LogoutModal({ isLogoutModal, setIsLogoutModal }) {
  const handleLogout = () => {
    localStorage.clear();
    setIsLogoutModal(false);
    window.location.href = "/";
  };

  if (!isLogoutModal) {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      onMouseDown={() => setIsLogoutModal(false)}
    >
      <div
        className={`${styles.modal} ${styles.confirmModal}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={styles.logoutIcon}>
          <FiLogOut size={24} />
        </div>

        <button
          type="button"
          className={styles.closeButton}
          onClick={() => setIsLogoutModal(false)}
        >
          <FiX size={20} />
        </button>

        <h2 className={styles.modalTitle}>Log Out?</h2>

        <p className={styles.confirmText}>
          Are you sure you want to log out of your account?
        </p>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => setIsLogoutModal(false)}
          >
            Cancel
          </button>

          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            <FiLogOut size={16} />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
