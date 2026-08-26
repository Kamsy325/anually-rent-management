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


  // =====================================================
  // LOAD USER INTO FORM
  // =====================================================

  useEffect(() => {

    if (
      isEditProfileModal &&
      user
    ) {

      setFormData({

        firstName:
          user.firstName || "",

        lastName:
          user.lastName || "",

        email:
          user.email || "",

        phone_no:
          user.phone_no || "",

        company_name:
          user.company_name || "",

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

          "http://localhost:5000/update-profile",

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

      if (response.data.user) {

        setUser(
          response.data.user
        );


        // Keep localStorage synchronized

        localStorage.setItem(
          "user",
          JSON.stringify(
            response.data.user
          )
        );

      }


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
      onMouseDown={() =>
        setIsEditProfileModal(false)
      }
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
              Edit Profile
            </h2>

            <p className={styles.modalDescription}>
              Update your personal and business information
            </p>

          </div>


          <button
            type="button"
            className={styles.closeButton}
            onClick={() =>
              setIsEditProfileModal(false)
            }
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

            <div className={styles.formGroup}>

              <label>
                Rent Interval
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
                >

                  <option value="monthly">
                    Monthly
                  </option>

                  <option value="annually">
                    Annually
                  </option>

                </select>

              </div>

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
              onClick={() =>
                setIsEditProfileModal(false)
              }
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
                : "Save Changes"}

            </button>

          </div>

        </form>

      </div>

    </div>

  );

}