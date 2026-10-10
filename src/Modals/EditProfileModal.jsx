import React, {
  useEffect,
  useState
} from "react";

import axios from "axios";

import {
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiMapPin,
  FiCalendar
} from "react-icons/fi";

import styles from "../css/Modals.module.css";


export default function EditProfileModal({

  isEditProfileModal,

  setIsEditProfileModal,

  user,

  setUser

}) {


  // =====================================================
  // FORM STATE
  // =====================================================

  const [
    formData,
    setFormData
  ] = useState({

    firstName: "",
    lastName: "",

    email: "",

    phone_no: "",

    company_name: "",

    address: "",

    bio: "",

    lease_interval: "monthly"

  });


  const [
    loading,
    setLoading
  ] = useState(false);


  const [
    error,
    setError
  ] = useState("");


  const [
    success,
    setSuccess
  ] = useState("");


  const [
    isPromptingInterval,
    setIsPromptingInterval
  ] = useState(false);

  // =====================================================
  // CLOSE MODAL HANDLER
  // =====================================================

  const handleClose = () => {
    if (loading) return;
    setIsEditProfileModal(false);
    localStorage.removeItem("isNewUser");
    localStorage.removeItem("promptLeaseInterval");
  };

  // =====================================================
  // LOAD USER INTO FORM
  // =====================================================

  useEffect(() => {
    if (isEditProfileModal) {
      const isPrompt =
        localStorage.getItem("promptLeaseInterval") === "true" ||
        localStorage.getItem("isNewUser") === "true";
      setIsPromptingInterval(Boolean(isPrompt));
    }

    if (
      isEditProfileModal &&
      user
    ) {

      setFormData({

        firstName:
          user.firstName || user.first_name || "",

        lastName:
          user.lastName || user.last_name || "",

        email:
          user.email || "",

        phone_no:
          user.phone_no || user.phoneNo || user.phone || "",

        company_name:
          user.company_name || user.companyName || "",

        address:
          user.address || "",

        bio:
          user.bio || "",

        lease_interval:
          user.lease_interval ||
          "monthly"

      });

      setError("");

      setSuccess("");

    }

  }, [
    isEditProfileModal,
    user
  ]);


  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;


    setFormData(
      (previous) => ({

        ...previous,

        [name]: value

      })
    );

  };


  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    setSuccess("");


    // ===============================
    // VALIDATION
    // ===============================

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim()
    ) {

      setError(
        "First name, last name and email are required."
      );

      return;

    }


    try {

      setLoading(true);


      const token =
        localStorage.getItem("token");


      if (!token) {

        setError(
          "You are not logged in."
        );

        return;

      }


      // ===============================
      // UPDATE PROFILE
      // ===============================

      const response =
        await axios.put(

          "https://anually-rent-management-backend.onrender.com/update-profile",

          formData,

          {
            headers: {

              Authorization:
                `Bearer ${token}`

            }

          }

        );


      // ===============================
      // UPDATE USER IN LAYOUT
      // ===============================

      const responseUser = response.data?.user || {};
      const updatedUser = {
        ...user,
        ...responseUser,
        ...formData,
        role: responseUser.role || user?.role || "landlord",
      };

      setUser(updatedUser);

      // Keep localStorage synchronized
      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      localStorage.removeItem("isNewUser");
      localStorage.removeItem("promptLeaseInterval");

      setSuccess(
        "Profile updated successfully."
      );

      // Close after successful update
      setTimeout(() => {
        setIsEditProfileModal(false);
      }, 700);


    } catch (error) {

      console.error(
        "Update profile error:",
        error
      );


      if (error.response) {

        setError(
          error.response.data?.message ||
          "Unable to update profile."
        );

      } else if (error.request) {

        setError(
          "Unable to connect to the server."
        );

      } else {

        setError(
          "Something went wrong."
        );

      }

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // DON'T RENDER
  // =====================================================

  if (!isEditProfileModal) {

    return null;

  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <div
      className={styles.overlay}
      onMouseDown={handleClose}
    >

      <div
        className={styles.modal}
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >


        {/* =================================
            HEADER
        ================================== */}

        <div className={styles.modalHeader}>

          <div>

            <h2 className={styles.modalTitle}>
              {isPromptingInterval
                ? "Welcome! Set Up Your Rent Interval"
                : "Edit Profile"}
            </h2>

            <p className={styles.modalDescription}>
              {isPromptingInterval
                ? "Please set your rent collection interval (monthly or annually) and confirm your profile."
                : "Update your personal and business information"}
            </p>

          </div>


          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            disabled={loading}
          >

            <FiX size={20} />

          </button>

        </div>


        {/* =================================
            FORM
        ================================== */}

        <form
          onSubmit={handleSubmit}
        >

          {isPromptingInterval && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                background: "#eff6ff",
                border: "1.5px solid #bfdbfe",
                borderRadius: "10px",
                padding: "14px 16px",
                marginBottom: "20px",
              }}
            >
              <FiCalendar
                size={22}
                style={{ color: "#2563eb", marginTop: "2px", flexShrink: 0 }}
              />
              <div>
                <p
                  style={{
                    margin: "0 0 4px 0",
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "#1e40af",
                  }}
                >
                  Action Required: Set Rent / Lease Interval
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#1e3a8a",
                    lineHeight: 1.45,
                  }}
                >
                  Please specify whether your properties follow a <strong>Monthly</strong> or <strong>Annually</strong> lease cycle. This customizes payment schedules, analytics, and due dates across your dashboard.
                </p>
              </div>
            </div>
          )}

          <div className={styles.formGrid}>


            {/* =================================
                FIRST NAME
            ================================== */}

            <div className={styles.formGroup}>

              <label>
                First Name
              </label>

              <div className={styles.inputWrapper}>

                <FiUser />

                <input
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />

              </div>

            </div>


            {/* =================================
                LAST NAME
            ================================== */}

            <div className={styles.formGroup}>

              <label>
                Last Name
              </label>

              <div className={styles.inputWrapper}>

                <FiUser />

                <input
                  name="lastName"
                  type="text"
                  placeholder="Smith"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />

              </div>

            </div>


            {/* =================================
                EMAIL
            ================================== */}

            <div className={styles.formGroup}>

              <label>
                Email
              </label>

              <div className={styles.inputWrapper}>

                <FiMail />

                <input
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />

              </div>

            </div>


            {/* =================================
                PHONE
            ================================== */}

            <div className={styles.formGroup}>

              <label>
                Phone
              </label>

              <div className={styles.inputWrapper}>

                <FiPhone />

                <input
                  name="phone_no"
                  type="tel"
                  placeholder="+234..."
                  value={formData.phone_no}
                  onChange={handleChange}
                  disabled={loading}
                />

              </div>

            </div>


            {/* =================================
                COMPANY
            ================================== */}

            <div className={styles.formGroup}>

              <label>
                Company
              </label>

              <div className={styles.inputWrapper}>

                <FiBriefcase />

                <input
                  name="company_name"
                  type="text"
                  placeholder="Your company"
                  value={formData.company_name}
                  onChange={handleChange}
                  disabled={loading}
                />

              </div>

            </div>


            {/* =================================
                LOCATION
            ================================== */}

            <div className={styles.formGroup}>

              <label>
                Location
              </label>

              <div className={styles.inputWrapper}>

                <FiMapPin />

                <input
                  name="address"
                  type="text"
                  placeholder="Abuja, Nigeria"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={loading}
                />

              </div>

            </div>


            {/* =================================
                LEASE INTERVAL
            ================================== */}

            <div
              className={styles.formGroup}
              style={
                isPromptingInterval
                  ? {
                      background: "#f0f7ff",
                      border: "1.5px solid #3b82f6",
                      borderRadius: "10px",
                      padding: "10px",
                    }
                  : undefined
              }
            >

              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Rent / Lease Interval</span>
                {isPromptingInterval && (
                  <span style={{ color: "#2563eb", fontSize: "11px", fontWeight: "600" }}>
                    Required
                  </span>
                )}
              </label>

              <div className={styles.inputWrapper}>

                <FiCalendar />

                <select
                  name="lease_interval"
                  value={
                    formData.lease_interval
                  }
                  onChange={handleChange}
                  disabled={loading}
                  style={{ fontWeight: "600" }}
                >

                  <option value="monthly">
                    Monthly (Rent due every month)
                  </option>

                  <option value="annually">
                    Annually (Rent due once a year)
                  </option>

                </select>

              </div>

              <span style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", display: "block" }}>
                Controls calculation of rent due dates and payment schedules.
              </span>

            </div>


            {/* =================================
                BIO
            ================================== */}

            <div
              className={
                styles.formGroupFull
              }
            >

              <label>
                Bio
              </label>

              <textarea
                name="bio"
                rows="4"
                placeholder="Tell us a little about yourself..."
                value={formData.bio}
                onChange={handleChange}
                disabled={loading}
              />

            </div>

          </div>


          {/* =================================
              ERROR
          ================================== */}

          {error && (

            <p
              style={{
                color: "#dc2626",
                fontSize: "14px",
                marginTop: "12px"
              }}
            >

              {error}

            </p>

          )}


          {/* =================================
              SUCCESS
          ================================== */}

          {success && (

            <p
              style={{
                color: "#16a34a",
                fontSize: "14px",
                marginTop: "12px"
              }}
            >

              {success}

            </p>

          )}


          {/* =================================
              FOOTER
          ================================== */}

          <div
            className={
              styles.modalFooter
            }
          >

            <button
              type="button"
              className={
                styles.cancelButton
              }
              onClick={handleClose}
              disabled={loading}
            >

              Cancel

            </button>


            <button
              type="submit"
              className={
                styles.primaryButton
              }
              disabled={loading}
            >

              {loading
                ? "Saving..."
                : isPromptingInterval
                ? "Save & Continue"
                : "Save Changes"}

            </button>

          </div>

        </form>

      </div>

    </div>

  );

}