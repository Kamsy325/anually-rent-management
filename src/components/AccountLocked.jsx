// AccountLocked.jsx
import React from "react";
import { FiLock } from "react-icons/fi";
import styles from "../css/AccountLocked.module.css";

export default function AccountLocked({ message }) {
  return (
    <div className={styles.lockedContainer}>
      <div className={styles.lockedCard}>
        <div className={styles.iconWrapper}>
          <FiLock size={36} />
        </div>
        <h1>Your Account Is Locked</h1>
        <p>
          {message ||
            "Your account is currently locked. Please contact your property manager for assistance."}
        </p>
      </div>
    </div>
  );
}