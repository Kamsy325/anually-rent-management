import React from "react";

import {
  FiEdit2,
  FiMapPin,
} from "react-icons/fi";

import {
  useOutletContext
} from "react-router-dom";

import styles from "../css/Profile.module.css";


export default function Profile() {

  const {
    user,
    setIsEditProfileModal
  } = useOutletContext();


  return (

    <div className={styles.profilePage}>

      <div className={styles.profileContainer}>

        {/* =================================
            HEADER
        ================================== */}

        <div className={styles.pageHeader}>

          <h1 className={styles.pageTitle}>
            Profile
          </h1>

          <p className={styles.pageDescription}>
            Manage your account settings and preferences
          </p>

        </div>


        {/* =================================
            PROFILE CARD
        ================================== */}

        <section className={styles.profileCard}>

          {/* HEADER */}

          <div className={styles.cardHeader}>

            <div>

              <h2 className={styles.cardTitle}>
                Profile Information
              </h2>

              <p className={styles.cardDescription}>
                Your personal and business details
              </p>

            </div>


            <button
              type="button"
              className={styles.editButton}
              onClick={() =>
                setIsEditProfileModal(true)
              }
            >

              <FiEdit2
                size={16}
                strokeWidth={2.5}
              />

              <span>
                Edit
              </span>

            </button>

          </div>


          {/* =================================
              PROFILE IDENTITY
          ================================== */}

          <div className={styles.profileIdentity}>

            <div className={styles.avatar}>

              {user?.firstName
                ?.charAt(0)
                ?.toUpperCase()}

            </div>


            <div className={styles.identityDetails}>

              <p className={styles.profileName}>

                {user?.firstName}{" "}
                {user?.lastName}

              </p>


              <p className={styles.companyName}>

                {user?.company_name ||
                  "No company added"}

              </p>


              <p className={styles.location}>

                <FiMapPin
                  size={14}
                  strokeWidth={2.5}
                />

                <span>

                  {user?.address ||
                    "No location added"}

                </span>

              </p>

            </div>

          </div>


          {/* =================================
              DETAILS
          ================================== */}

          <div className={styles.detailsGrid}>

            {/* NAME */}

            <div className={styles.detailItem}>

              <label className={styles.detailLabel}>
                Full Name
              </label>

              <p className={styles.detailValue}>

                {user?.firstName}{" "}
                {user?.lastName}

              </p>

            </div>


            {/* EMAIL */}

            <div className={styles.detailItem}>

              <label className={styles.detailLabel}>
                Email
              </label>

              <p className={styles.detailValue}>

                {user?.email}

              </p>

            </div>


            {/* PHONE */}

            <div className={styles.detailItem}>

              <label className={styles.detailLabel}>
                Phone
              </label>

              <p className={styles.detailValue}>

                {user?.phone_no ||
                  "Not provided"}

              </p>

            </div>


            {/* COMPANY */}

            <div className={styles.detailItem}>

              <label className={styles.detailLabel}>
                Company
              </label>

              <p className={styles.detailValue}>

                {user?.company_name ||
                  "Not provided"}

              </p>

            </div>


            {/* LEASE INTERVAL */}

            <div className={styles.detailItem}>

              <label className={styles.detailLabel}>
                Rent Interval
              </label>

              <p className={styles.detailValue}>

                {user?.lease_interval ===
                "annually"
                  ? "Annually"
                  : "Monthly"}

              </p>

            </div>

          </div>


          {/* =================================
              BIO
          ================================== */}

          <div className={styles.bioSection}>

            <label className={styles.detailLabel}>
              Bio
            </label>

            <p className={styles.bioText}>

              {user?.bio ||
                "No bio added"}

            </p>

          </div>

        </section>

      </div>

    </div>

  );

}