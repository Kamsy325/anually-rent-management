import React from "react";
import {
  FiGrid,
  FiUsers,
  FiUser,
  FiCreditCard,
  FiLogOut,
} from "react-icons/fi";
import { NavLink } from "react-router-dom";
import styles from "../css/Layout.module.css";

const Sidebar = ({ user, onPaymentClick, onLogoutClick }) => {
  const isLandlord = user?.role === "landlord";

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.sidebarNav}>
        {/* DASHBOARD */}
        <NavLink
          to="/app"
          end
          className={({ isActive }) =>
            `${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ""}`
          }
        >
          <FiGrid size={18} />
          <span>Dashboard</span>
        </NavLink>

        {/* TENANTS (Landlords Only) */}
        {isLandlord && (
          <NavLink
            to="/app/tenants"
            className={({ isActive }) =>
              `${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ""}`
            }
          >
            <FiUsers size={18} />
            <span>Tenants</span>
          </NavLink>
        )}

        {/* PROFILE */}
        <NavLink
          to="/app/profile"
          className={({ isActive }) =>
            `${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ""}`
          }
        >
          <FiUser size={18} />
          <span>Profile</span>
        </NavLink>

        {/* PAYMENT / PAYOUT (Landlords Only) */}
        {isLandlord && (
          <button
            type="button"
            className={styles.sidebarItem}
            onClick={onPaymentClick}
          >
            <FiCreditCard size={18} />
            <span>Payment</span>
          </button>
        )}
      </nav>

      {/* LOGOUT */}
      <div className={styles.sidebarFooter}>
        <button
          type="button"
          className={`${styles.sidebarItem} ${styles.logoutItem}`}
          onClick={onLogoutClick}
        >
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
