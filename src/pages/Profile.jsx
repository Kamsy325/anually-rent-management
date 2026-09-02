import React from "react";
import { FiEdit2, FiMapPin, FiHome, FiCalendar, FiUser } from "react-icons/fi";
import { useOutletContext } from "react-router-dom";
import styles from "../css/Profile.module.css";

export default function Profile() {
  const { user, setIsEditProfileModal } = useOutletContext();
  const isLandlord = user?.role === "landlord";

  const formatMoney = (amount) => {
    const value = Number(amount || 0);
    return `₦${value.toLocaleString("en-NG")}`;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Not specified";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return dateValue;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileContainer}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Profile</h1>
          <p className={styles.pageDescription}>
            Manage your account settings and profile details
          </p>
        </div>

        <section className={styles.profileCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Profile Information</h2>
              <p className={styles.cardDescription}>
                {isLandlord
                  ? "Your personal and business details"
                  : "Your tenancy details"}
              </p>
            </div>

            {isLandlord && (
              <button
                type="button"
                className={styles.editButton}
                onClick={() => setIsEditProfileModal(true)}
              >
                <FiEdit2 size={16} strokeWidth={2.5} />
                <span>Edit</span>
              </button>
            )}
          </div>

          <div className={styles.profileIdentity}>
            <div className={styles.avatar}>
              {(user?.firstName || user?.name)?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className={styles.identityDetails}>
              <p className={styles.profileName}>
                {user?.firstName
                  ? `${user.firstName} ${user.lastName || ""}`
                  : user?.name}
              </p>

              {isLandlord ? (
                <>
                  <p className={styles.companyName}>
                    {user?.company_name || user?.companyName || "No company added"}
                  </p>
                  <p className={styles.location}>
                    <FiMapPin size={14} strokeWidth={2.5} />
                    <span>{user?.address || "No location added"}</span>
                  </p>
                </>
              ) : (
                <p className={styles.companyName}>
                  <FiHome size={14} style={{ marginRight: "4px" }} />
                  {user?.apartment || "Apartment assigned"}
                </p>
              )}
            </div>
          </div>

          {/* LANDLORD SPECIFIC INFO */}
          {isLandlord && (
            <>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>Full Name</label>
                  <p className={styles.detailValue}>
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>

                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>Email</label>
                  <p className={styles.detailValue}>{user?.email}</p>
                </div>

                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>Phone</label>
                  <p className={styles.detailValue}>
                    {user?.phone_no || user?.phoneNo || "Not provided"}
                  </p>
                </div>

                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>Company</label>
                  <p className={styles.detailValue}>
                    {user?.company_name || user?.companyName || "Not provided"}
                  </p>
                </div>

                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>Rent Interval</label>
                  <p className={styles.detailValue}>
                    {user?.lease_interval === "annually" ? "Annually" : "Monthly"}
                  </p>
                </div>
              </div>

              <div className={styles.bioSection}>
                <label className={styles.detailLabel}>Bio</label>
                <p className={styles.bioText}>{user?.bio || "No bio added"}</p>
              </div>
            </>
          )}

          {/* TENANT SPECIFIC INFO */}
          {!isLandlord && (
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>Full Name</label>
                <p className={styles.detailValue}>
                  {user?.firstName
                    ? `${user.firstName} ${user.lastName || ""}`
                    : user?.name}
                </p>
              </div>

              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>Email</label>
                <p className={styles.detailValue}>{user?.email}</p>
              </div>

              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>Phone</label>
                <p className={styles.detailValue}>
                  {user?.phone || user?.phone_no || "Not provided"}
                </p>
              </div>

              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>Apartment</label>
                <p className={styles.detailValue}>
                  {user?.apartment || "Not assigned"}
                </p>
              </div>

              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>Rent Amount</label>
                <p className={styles.detailValue}>
                  {formatMoney(user?.rent)}
                </p>
              </div>

              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>Status</label>
                <p className={styles.detailValue}>
                  {user?.status || "Active"}
                </p>
              </div>

              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>Lease Ends</label>
                <p className={styles.detailValue}>
                  {formatDate(user?.leaseEnds || user?.lease_ends)}
                </p>
              </div>

              {user?.landlordName && (
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>Landlord</label>
                  <p className={styles.detailValue}>{user?.landlordName}</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
