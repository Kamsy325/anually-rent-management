import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  FiPlus,
  FiBell,
  FiEdit2,
  FiFileText,
  FiShield,
  FiLogOut,
  FiX,
  FiTrendingUp,
} from "react-icons/fi";
import styles from "../css/Layout.module.css";

const API_URL = "https://anually-rent-management-backend.onrender.com";

const PLAN_LIMITS = {
  free: 5,
  pro: 8,
  premium: 15,
  business: Infinity,
};

const Navbar = ({
  setIsAddTenantModal,
  onOpenUpgradeModal,
  onOpenPayoutModal,
  user,
  onUpdateUser,
  tenants = [],
  subscription = { plan_type: "free" },
  onOpenTermsModal,
  onOpenPrivacyModal,
  onLogoutClick,
  isPayoutConnected = false,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phoneNo: "",
    companyName: "",
    address: "",
    bio: "",
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const isLandlord = user?.role === "landlord";

  const handleAddTenantClick = () => {
    console.log("--- [NAVBAR] Add Tenant Button Clicked ---");
    console.log("[NAVBAR] Props received:", {
      isPayoutConnected,
      user_paystack_subaccount_code: user?.paystack_subaccount_code,
      user_paystack_connected: user?.paystack_connected,
      tenants_count: tenants.length,
      subscription_plan: subscription?.plan_type,
      has_setIsAddTenantModal: typeof setIsAddTenantModal === "function",
      has_onOpenPayoutModal: typeof onOpenPayoutModal === "function",
      has_onOpenUpgradeModal: typeof onOpenUpgradeModal === "function",
    });

    const hasPaystackSubaccount =
      isPayoutConnected ||
      Boolean(user?.paystack_subaccount_code) ||
      Boolean(user?.paystack_connected);

    if (!hasPaystackSubaccount) {
      if (onOpenPayoutModal) {
        onOpenPayoutModal();
      }
      return;
    }

    const currentPlan = (subscription?.plan_type || "free").toLowerCase();
    const maxTenants = PLAN_LIMITS[currentPlan] ?? PLAN_LIMITS.free;

    if (tenants.length >= maxTenants) {
      if (onOpenUpgradeModal) {
        onOpenUpgradeModal();
      }
    } else {
      if (typeof setIsAddTenantModal === "function") {
        setIsAddTenantModal(true);
      }
    }
  };

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || user.first_name || "",
        lastName: user.lastName || user.last_name || "",
        phoneNo: user.phoneNo || user.phone_no || "",
        companyName: user.companyName || user.company_name || "",
        address: user.address || "",
        bio: user.bio || "",
      });
    }
  }, [user, showEditProfileModal]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rawNotifications = res.data.notifications || [];

      // Deduplicate using a composite key (title + message + payer name) 
      // to handle cases where the backend sends duplicate rows with different IDs.
      const uniqueMap = new Map();
      rawNotifications.forEach((n) => {
        const payerName =
          n.sender_name ||
          n.tenant_name ||
          n.payer_name ||
          n.tenant?.name ||
          "";
        
        const compositeKey = `${n.title || ""}-${n.message || ""}-${payerName}`;
        
        if (!uniqueMap.has(compositeKey)) {
          uniqueMap.set(compositeKey, n);
        }
      });

      setNotifications(Array.from(uniqueMap.values()));
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error("[NAVBAR] Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

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

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error("[NAVBAR] Error marking notifications as read:", err);
    }
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API_URL}/user/profile`, profileForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfileMessage("Profile updated successfully!");

      if (onUpdateUser && res.data.user) {
        onUpdateUser(res.data.user);
      }

      setTimeout(() => {
        setShowEditProfileModal(false);
        setProfileMessage("");
      }, 1500);
    } catch (err) {
      console.error("[NAVBAR] Failed to update profile:", err);
      setProfileMessage(
        err.response?.data?.message || "Failed to update profile. Please try again."
      );
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const getUserInitial = () => {
    const name = user?.firstName || user?.first_name || user?.name || "User";
    return name[0]?.toUpperCase() || "U";
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navbarBrand}>
          <div className={styles.navbarLogo}>
            <span className={`${styles.logoBar} ${styles.logoBar1}`} />
            <span className={`${styles.logoBar} ${styles.logoBar2}`} />
            <span className={`${styles.logoBar} ${styles.logoBar3}`} />
          </div>
          <span className={styles.navbarTitle}>Annually</span>
        </div>

        <div className={styles.navbarActions}>
          {isLandlord && (
            <button
              type="button"
              className={styles.addTenantBtn}
              onClick={handleAddTenantClick}
            >
              <FiPlus size={14} />
              <span>Add Tenant</span>
            </button>
          )}

          <div className={styles.navbarPopupWrapper} ref={notificationRef}>
            <button
              type="button"
              className={styles.notificationBtn}
              aria-label="Notifications"
              onClick={handleNotificationClick}
            >
              <FiBell size={18} />
              {unreadCount > 0 && <span className={styles.notificationDot} />}
            </button>

            {showNotifications && (
              <div className={styles.notificationPanel}>
                <div className={styles.notificationHeader}>
                  <div>
                    <h3>Notifications</h3>
                    <p>You have {unreadCount} unread notification(s)</p>
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
                  {notifications.length === 0 ? (
                    <p style={{ padding: "16px", color: "#666" }}>
                      No notifications yet.
                    </p>
                  ) : (
                    notifications.map((n, index) => {
                      const payerName =
                        n.sender_name ||
                        n.tenant_name ||
                        n.payer_name ||
                        n.tenant?.name;

                      return (
                        <div
                          key={n.id || n._id || `notif-${index}`}
                          className={styles.notificationItem}
                        >
                          <div className={styles.notificationContent}>
                            <p className={styles.notificationTitle}>{n.title}</p>
                            
                            {payerName && (
                              <span
                                style={{
                                  fontWeight: 600,
                                  color: "#111827",
                                  display: "block",
                                  marginBottom: "2px",
                                  fontSize: "0.85rem",
                                }}
                              >
                                Paid by: {payerName}
                              </span>
                            )}

                            <span>{n.message}</span>
                            <small>
                              {new Date(n.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </small>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    className={styles.viewNotificationsButton}
                    onClick={markAllRead}
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            )}
          </div>

          <div className={styles.navbarPopupWrapper} ref={profileRef}>
            <button
              type="button"
              className={styles.profileAvatar}
              aria-label="Profile menu"
              onClick={() => {
                setShowProfileMenu((prev) => !prev);
                setShowNotifications(false);
              }}
            >
              {getUserInitial()}
            </button>

            {showProfileMenu && (
              <div className={styles.profileMenu}>
                <div className={styles.profileMenuHeader}>
                  <div className={styles.profileMenuAvatar}>
                    {getUserInitial()}
                  </div>
                  <div>
                    <p className={styles.profileMenuName}>
                      {user?.firstName || user?.first_name || user?.name}{" "}
                      {user?.lastName || user?.last_name}
                    </p>
                    <span className={styles.profileMenuEmail}>
                      {user?.email}
                    </span>
                  </div>
                </div>
                <div className={styles.profileMenuDivider} />

                {isLandlord && (
                  <button
                    type="button"
                    className={styles.profileMenuItem}
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowEditProfileModal(true);
                    }}
                  >
                    <FiEdit2 size={17} />
                    <span>Edit Profile</span>
                  </button>
                )}

                {isLandlord && (
                  <button
                    type="button"
                    className={styles.profileMenuItem}
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onOpenUpgradeModal) onOpenUpgradeModal();
                    }}
                  >
                    <FiTrendingUp size={17} />
                    <span>Subscriptions</span>
                  </button>
                )}

                <button
                  type="button"
                  className={styles.profileMenuItem}
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onOpenTermsModal) onOpenTermsModal();
                  }}
                >
                  <FiFileText size={17} />
                  <span>Terms of Use</span>
                </button>

                <button
                  type="button"
                  className={styles.profileMenuItem}
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onOpenPrivacyModal) onOpenPrivacyModal();
                  }}
                >
                  <FiShield size={17} />
                  <span>Privacy Policy</span>
                </button>

                <div className={styles.profileMenuDivider} />

                <button
                  type="button"
                  className={`${styles.profileMenuItem} ${styles.logoutMenuItem}`}
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onLogoutClick) onLogoutClick();
                  }}
                >
                  <FiLogOut size={17} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showEditProfileModal && isLandlord && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <div className={styles.modalHeader}>
              <h2>Edit Profile</h2>
              <button
                type="button"
                className={styles.closePopupButton}
                onClick={() => setShowEditProfileModal(false)}
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className={styles.modalBody}>
              {profileMessage && (
                <div
                  style={{
                    padding: "10px",
                    borderRadius: "6px",
                    marginBottom: "12px",
                    fontSize: "0.9rem",
                    backgroundColor: profileMessage.includes("success")
                      ? "#dcfce7"
                      : "#fee2e2",
                    color: profileMessage.includes("success")
                      ? "#15803d"
                      : "#b91c1c",
                  }}
                >
                  {profileMessage}
                </div>
              )}

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileForm.firstName}
                    onChange={handleProfileInputChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileForm.lastName}
                    onChange={handleProfileInputChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phoneNo"
                  value={profileForm.phoneNo}
                  onChange={handleProfileInputChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={profileForm.companyName}
                  onChange={handleProfileInputChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={profileForm.address}
                  onChange={handleProfileInputChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Bio / Notes</label>
                <textarea
                  name="bio"
                  rows={3}
                  value={profileForm.bio}
                  onChange={handleProfileInputChange}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowEditProfileModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;