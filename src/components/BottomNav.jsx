import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiGrid,
  FiUsers,
  FiPlus,
  FiCreditCard,
  FiUser,
} from "react-icons/fi";
import styles from "../css/BottomNav.module.css";

export default function BottomNav({ user, setIsAddTenantModal, onPaymentClick }) {
  if (!user) return null;

  const role = String(user.role || "").toLowerCase();

  return (
    <nav className={styles.bottomNav}>
      <div className={styles.navContainer}>
        {role === "landlord" ? (
          <>
            <NavLink
              to="/app"
              end
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              <FiGrid className={styles.navIcon} />
              <span className={styles.navLabel}>Dashboard</span>
            </NavLink>

            <NavLink
              to="/app/tenants"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              <FiUsers className={styles.navIcon} />
              <span className={styles.navLabel}>Tenants</span>
            </NavLink>

            <div className={styles.centerFabWrapper}>
              <button
                type="button"
                className={styles.fabButton}
                onClick={setIsAddTenantModal}
                aria-label="Add Tenant"
              >
                <FiPlus className={styles.fabIcon} />
              </button>
            </div>

            <button
              type="button"
              className={styles.navItem}
              onClick={onPaymentClick}
            >
              <FiCreditCard className={styles.navIcon} />
              <span className={styles.navLabel}>Payments</span>
            </button>

            <NavLink
              to="/app/profile"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              <FiUser className={styles.navIcon} />
              <span className={styles.navLabel}>Profile</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/app"
              end
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              <FiGrid className={styles.navIcon} />
              <span className={styles.navLabel}>Dashboard</span>
            </NavLink>

            <NavLink
              to="/app/profile"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              <FiUser className={styles.navIcon} />
              <span className={styles.navLabel}>Profile</span>
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
