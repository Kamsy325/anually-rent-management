import React from "react";

import {
  FiGrid,
  FiUsers,
  FiUser,
  FiCreditCard,
  FiLogOut,
} from "react-icons/fi";

import { Link } from "react-router-dom";

import styles from "../css/Layout.module.css";


const Sidebar = ({
  onPaymentClick,
  onLogoutClick,
}) => {

  return (

    <aside className={styles.sidebar}>

      <nav className={styles.sidebarNav}>

        {/* =========================
            DASHBOARD
        ========================= */}

        <Link
          to="/app"
          className={styles.sidebarItem}
        >
          <FiGrid size={18} />

          <span>
            Dashboard
          </span>
        </Link>


        {/* =========================
            TENANTS
        ========================= */}

        <Link
          to="/app/tenants"
          className={styles.sidebarItem}
        >
          <FiUsers size={18} />

          <span>
            Tenants
          </span>
        </Link>


        {/* =========================
            PROFILE
        ========================= */}

        <Link
          to="/app/profile"
          className={styles.sidebarItem}
        >
          <FiUser size={18} />

          <span>
            Profile
          </span>
        </Link>


        {/* =========================
            PAYMENT / PAYOUT
        ========================= */}

        <button
          type="button"
          className={styles.sidebarItem}
          onClick={onPaymentClick}
        >
          <FiCreditCard size={18} />

          <span>
            Payment
          </span>
        </button>

      </nav>


      {/* =========================
          LOGOUT
      ========================= */}

      <div className={styles.sidebarFooter}>

        <button
          type="button"
          className={`${styles.sidebarItem} ${styles.logoutItem}`}
          onClick={onLogoutClick}
        >
          <FiLogOut size={18} />

          <span>
            Logout
          </span>
        </button>

      </div>

    </aside>

  );

};


export default Sidebar;