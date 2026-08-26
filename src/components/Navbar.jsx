import React, { useEffect, useRef, useState } from "react";
import {
  FiPlus,
  FiBell,
  FiEdit2,
  FiFileText,
  FiShield,
  FiLogOut,
  FiX,
} from "react-icons/fi";
import styles from "../css/Layout.module.css";

const Navbar = ({ setIsAddTenantModal, user }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = () => {
    setShowNotifications((prev) => !prev);
    setShowProfileMenu(false);
  };

  const handleProfileClick = () => {
    setShowProfileMenu((prev) => !prev);
    setShowNotifications(false);
  };

  const handleEditProfile = () => {
    setShowProfileMenu(false);

    // Put your edit-profile modal state here later
    console.log("Edit profile clicked");
  };

  const handleTerms = () => {
    setShowProfileMenu(false);

    console.log("Terms of Use clicked");
  };

  const handlePrivacy = () => {
    setShowProfileMenu(false);

    console.log("Privacy Policy clicked");
  };

  const handleLogout = () => {
    setShowProfileMenu(false);

    // Put your logout modal state here later
    console.log("Logout clicked");
  };

  return (
    <nav className={styles.navbar}>
      {/* BRAND */}
      <div className={styles.navbarBrand}>
        <div className={styles.navbarLogo}>
          <span
            className={`${styles.logoBar} ${styles.logoBar1}`}
          />
          <span
            className={`${styles.logoBar} ${styles.logoBar2}`}
          />
          <span
            className={`${styles.logoBar} ${styles.logoBar3}`}
          />
        </div>

        <span className={styles.navbarTitle}>
          Annually
        </span>
      </div>

      {/* ACTIONS */}
      <div className={styles.navbarActions}>
        {/* ADD TENANT */}
        <button
          type="button"
          className={styles.addTenantBtn}
          onClick={() => setIsAddTenantModal(true)}
        >
          <FiPlus size={14} />
          <span>Add Tenant</span>
        </button>

        {/* NOTIFICATIONS */}
        <div
          className={styles.navbarPopupWrapper}
          ref={notificationRef}
        >
          <button
            type="button"
            className={styles.notificationBtn}
            aria-label="Notifications"
            onClick={handleNotificationClick}
          >
            <FiBell size={18} />

            <span className={styles.notificationDot} />
          </button>

          {showNotifications && (
            <div className={styles.notificationPanel}>
              <div className={styles.notificationHeader}>
                <div>
                  <h3>Notifications</h3>
                  <p>You have 3 new notifications</p>
                </div>

                <button
                  type="button"
                  className={styles.closePopupButton}
                  onClick={() => setShowNotifications(false)}
                >
                  <FiX size={16} />
                </button>
              </div>

              <div className={styles.notificationList}>
                <div className={styles.notificationItem}>
                  <div
                    className={`${styles.notificationIcon} ${styles.notificationIconBlue}`}
                  >
                    <FiBell size={16} />
                  </div>

                  <div className={styles.notificationContent}>
                    <p>New payment received</p>
                    <span>
                      John Smith paid $1,200 in rent.
                    </span>
                    <small>5 minutes ago</small>
                  </div>
                </div>

                <div className={styles.notificationItem}>
                  <div
                    className={`${styles.notificationIcon} ${styles.notificationIconOrange}`}
                  >
                    <FiBell size={16} />
                  </div>

                  <div className={styles.notificationContent}>
                    <p>Payment due soon</p>
                    <span>
                      Sarah Johnson's payment is due in 2 days.
                    </span>
                    <small>1 hour ago</small>
                  </div>
                </div>

                <div className={styles.notificationItem}>
                  <div
                    className={`${styles.notificationIcon} ${styles.notificationIconRed}`}
                  >
                    <FiBell size={16} />
                  </div>

                  <div className={styles.notificationContent}>
                    <p>Overdue payment</p>
                    <span>
                      Michael Brown's rent payment is overdue.
                    </span>
                    <small>3 hours ago</small>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={styles.viewNotificationsButton}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>

        {/* PROFILE */}
        <div
          className={styles.navbarPopupWrapper}
          ref={profileRef}
        >
          <button
            type="button"
            className={styles.profileAvatar}
            aria-label="Profile menu"
            onClick={handleProfileClick}
          >
            M
          </button>

          {showProfileMenu && (
            <div className={styles.profileMenu}>
              {/* PROFILE HEADER */}
              <div className={styles.profileMenuHeader}>
                <div className={styles.profileMenuAvatar}>
                  M
                </div>

                <div>
                  <p className={styles.profileMenuName}>
                    Alex Morgan
                  </p>

                  <span className={styles.profileMenuEmail}>
                    alex.morgan@email.com
                  </span>
                </div>
              </div>

              <div className={styles.profileMenuDivider} />

              {/* EDIT PROFILE */}
              <button
                type="button"
                className={styles.profileMenuItem}
                onClick={handleEditProfile}
              >
                <FiEdit2 size={17} />
                <span>Edit profile</span>
              </button>

              {/* TERMS */}
              <button
                type="button"
                className={styles.profileMenuItem}
                onClick={handleTerms}
              >
                <FiFileText size={17} />
                <span>Terms of Use</span>
              </button>

              {/* PRIVACY */}
              <button
                type="button"
                className={styles.profileMenuItem}
                onClick={handlePrivacy}
              >
                <FiShield size={17} />
                <span>Privacy Policy</span>
              </button>

              <div className={styles.profileMenuDivider} />

              {/* LOGOUT */}
              <button
                type="button"
                className={`${styles.profileMenuItem} ${styles.logoutMenuItem}`}
                onClick={handleLogout}
              >
                <FiLogOut size={17} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;