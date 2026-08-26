import React, { useState } from "react";

import {
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiHome,
  FiDollarSign,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

import axios from "axios";

import styles from "../css/Modals.module.css";


export default function AddTenantModal({
  isAddTenantModal,
  setIsAddTenantModal,
  onTenantAdded,
}) {

  const [formData, setFormData] = useState({
    name: "",
    apartment: "",
    email: "",
    phone: "",
    rent: "",
    leaseEnds: "",
    password: "",
  });


  const [showPassword, setShowPassword] =
    useState(false);


  const [loading, setLoading] =
    useState(false);


  const [error, setError] =
    useState("");


  // ==========================
  // HANDLE INPUT CHANGES
  // ==========================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));


    // Clear error when user starts typing
    if (error) {
      setError("");
    }

  };


  // ==========================
  // RESET FORM
  // ==========================

  const resetForm = () => {

    setFormData({
      name: "",
      apartment: "",
      email: "",
      phone: "",
      rent: "",
      leaseEnds: "",
      password: "",
    });

    setShowPassword(false);
    setError("");

  };


  // ==========================
  // CLOSE MODAL
  // ==========================

  const handleClose = () => {

    if (loading) {
      return;
    }

    resetForm();

    setIsAddTenantModal(false);

  };


  // ==========================
  // SUBMIT
  // ==========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");


    // ==========================
    // VALIDATION
    // ==========================

    if (
      !formData.name.trim() ||
      !formData.apartment.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.rent ||
      !formData.leaseEnds ||
      !formData.password
    ) {

      setError(
        "Please fill in all required fields."
      );

      return;

    }


    if (formData.password.length < 6) {

      setError(
        "Tenant password must be at least 6 characters."
      );

      return;

    }


    // ==========================
    // GET TOKEN
    // ==========================

    const token =
      localStorage.getItem("token");


    if (!token) {

      setError(
        "You are not authenticated. Please log in again."
      );

      return;

    }


    try {

      setLoading(true);


      // ==========================
      // ADD TENANT
      // ==========================

      const response = await axios.post(
        "http://localhost:5000/tenants",
        {
          name: formData.name.trim(),

          apartment:
            formData.apartment.trim(),

          email:
            formData.email.trim().toLowerCase(),

          phone:
            formData.phone.trim(),

          rent:
            formData.rent,

          leaseEnds:
            formData.leaseEnds,

          password:
            formData.password,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


      console.log(
        "ADD TENANT RESPONSE:",
        response.data
      );


      // ==========================
      // SUCCESS
      // ==========================

      if (response.status === 200 ||
          response.status === 201) {

        // Tell parent to refresh tenants
        if (onTenantAdded) {
          onTenantAdded(
            response.data.tenant
          );
        }


        resetForm();

        setIsAddTenantModal(false);

      }

    } catch (err) {

      console.error(
        "ADD TENANT ERROR:",
        err
      );


      // ==========================
      // SERVER RESPONSE
      // ==========================

      if (err.response) {

        setError(
          err.response.data?.message ||
          "Failed to add tenant."
        );

      }

      // ==========================
      // NO SERVER RESPONSE
      // ==========================

      else if (err.request) {

        setError(
          "Unable to connect to the server. Make sure your backend is running."
        );

      }

      // ==========================
      // OTHER ERROR
      // ==========================

      else {

        setError(
          "Something went wrong. Please try again."
        );

      }

    } finally {

      setLoading(false);

    }

  };


  // ==========================
  // DON'T RENDER
  // ==========================

  if (!isAddTenantModal) {
    return null;
  }


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


        {/* ==========================
            HEADER
        ========================== */}

        <div className={styles.modalHeader}>

          <div>

            <h2 className={styles.modalTitle}>
              Add Tenant
            </h2>

            <p
              className={
                styles.modalDescription
              }
            >
              Add a new tenant to your property
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


        {/* ==========================
            ERROR
        ========================== */}

        {error && (

          <p
            role="alert"
            style={{
              color: "#dc2626",
              fontSize: "14px",
              marginBottom: "16px",
            }}
          >
            {error}
          </p>

        )}


        {/* ==========================
            FORM
        ========================== */}

        <form
          onSubmit={handleSubmit}
        >

          <div className={styles.formGrid}>


            {/* NAME */}

            <div className={styles.formGroup}>

              <label>
                Full Name
              </label>

              <div
                className={
                  styles.inputWrapper
                }
              >

                <FiUser />

                <input
                  name="name"
                  type="text"
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />

              </div>

            </div>


            {/* APARTMENT */}

            <div className={styles.formGroup}>

              <label>
                Apartment
              </label>

              <div
                className={
                  styles.inputWrapper
                }
              >

                <FiHome />

                <input
                  name="apartment"
                  type="text"
                  placeholder="Apt 201"
                  value={
                    formData.apartment
                  }
                  onChange={handleChange}
                  disabled={loading}
                  required
                />

              </div>

            </div>


            {/* EMAIL */}

            <div className={styles.formGroup}>

              <label>
                Email
              </label>

              <div
                className={
                  styles.inputWrapper
                }
              >

                <FiMail />

                <input
                  name="email"
                  type="email"
                  placeholder="john@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />

              </div>

            </div>


            {/* PHONE */}

            <div className={styles.formGroup}>

              <label>
                Phone
              </label>

              <div
                className={
                  styles.inputWrapper
                }
              >

                <FiPhone />

                <input
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />

              </div>

            </div>


            {/* RENT */}

            <div className={styles.formGroup}>

              <label>
                Monthly Rent
              </label>

              <div
                className={
                  styles.inputWrapper
                }
              >

                <FiDollarSign />

                <input
                  name="rent"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="1200"
                  value={formData.rent}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />

              </div>

            </div>


            {/* LEASE END */}

            <div className={styles.formGroup}>

              <label>
                Lease Ends
              </label>

              <input
                name="leaseEnds"
                type="date"
                value={
                  formData.leaseEnds
                }
                onChange={handleChange}
                disabled={loading}
                required
              />

            </div>


            {/* PASSWORD */}

            <div
              className={
                styles.formGroup
              }
            >

              <label>
                Tenant Password
              </label>

              <div
                className={
                  styles.inputWrapper
                }
              >

                <FiLock />

                <input
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create tenant password"
                  value={
                    formData.password
                  }
                  onChange={handleChange}
                  disabled={loading}
                  minLength={6}
                  required
                />


                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  disabled={loading}
                  style={{
                    border: "none",
                    background:
                      "transparent",
                    cursor:
                      "pointer",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    padding: "4px",
                  }}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showPassword ? (

                    <FiEye
                      size={17}
                    />

                  ) : (

                    <FiEyeOff
                      size={17}
                    />

                  )}

                </button>

              </div>

            </div>


          </div>


          {/* ==========================
              FOOTER
          ========================== */}

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
                ? "Adding..."
                : "Add Tenant"}

            </button>

          </div>

        </form>

      </div>

    </div>

  );

}