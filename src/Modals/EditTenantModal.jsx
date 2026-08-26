import React, { useEffect, useState } from "react";

import {
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiHome,
  FiDollarSign,
} from "react-icons/fi";

import axios from "axios";

import styles from "../css/Modals.module.css";


export default function EditTenantModal({
  tenant,
  isOpen,
  setIsOpen,
  onTenantUpdated,
}) {

  const [formData, setFormData] = useState({
    name: "",
    apartment: "",
    email: "",
    phone: "",
    rent: "",
    leaseEnds: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  // =====================================================
  // LOAD TENANT INTO FORM
  // =====================================================

  useEffect(() => {

    if (!tenant) {
      return;
    }

    setFormData({
      name: tenant.name || "",
      apartment: tenant.apartment || "",
      email: tenant.email || "",
      phone: tenant.phone || "",
      rent: tenant.rent ?? "",
      leaseEnds:
        tenant.leaseEnds ||
        tenant.lease_ends ||
        "",
    });

    setError("");

  }, [tenant]);


  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  // =====================================================
  // CLOSE
  // =====================================================

  const handleClose = () => {

    if (loading) {
      return;
    }

    setError("");

    setIsOpen(false);

  };


  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");


    if (!tenant?.id) {

      setError("No tenant selected.");

      return;

    }


    const token =
      localStorage.getItem("token");


    if (!token) {

      setError(
        "You are not logged in."
      );

      return;

    }


    try {

      setLoading(true);


      console.log(
        "UPDATING TENANT:",
        tenant.id
      );

      console.log(
        "FORM DATA:",
        formData
      );


      const response =
        await axios.put(
          `http://localhost:5000/tenants/${tenant.id}`,
          formData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
          }
        );


      console.log(
        "UPDATE RESPONSE:",
        response.data
      );


      if (response.data.tenant) {

        if (onTenantUpdated) {

          onTenantUpdated(
            response.data.tenant
          );

        }

      }


      setIsOpen(false);


    } catch (error) {

      console.error(
        "EDIT TENANT ERROR:",
        error
      );


      console.error(
        "EDIT TENANT RESPONSE:",
        error.response?.data
      );


      setError(
        error.response?.data?.message ||
        "Failed to update tenant."
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // DON'T RENDER
  // =====================================================

  if (!isOpen || !tenant) {

    return null;

  }


  // =====================================================
  // MODAL
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

        <div
          className={styles.modalHeader}
        >

          <div>

            <h2
              className={styles.modalTitle}
            >
              Edit Tenant
            </h2>

            <p
              className={
                styles.modalDescription
              }
            >
              Update tenant information
            </p>

          </div>


          <button
            type="button"
            className={
              styles.closeButton
            }
            onClick={handleClose}
            disabled={loading}
          >

            <FiX size={20} />

          </button>

        </div>


        {error && (

          <p
            style={{
              color: "#dc2626",
              fontSize: "14px",
              marginBottom: "12px",
            }}
          >
            {error}
          </p>

        )}


        <form onSubmit={handleSubmit}>

          <div
            className={styles.formGrid}
          >

            {/* NAME */}

            <div
              className={styles.formGroup}
            >

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
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

              </div>

            </div>


            {/* APARTMENT */}

            <div
              className={styles.formGroup}
            >

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
                  value={formData.apartment}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

              </div>

            </div>


            {/* EMAIL */}

            <div
              className={styles.formGroup}
            >

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
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

              </div>

            </div>


            {/* PHONE */}

            <div
              className={styles.formGroup}
            >

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
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

              </div>

            </div>


            {/* RENT */}

            <div
              className={styles.formGroup}
            >

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
                  value={formData.rent}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

              </div>

            </div>


            {/* LEASE ENDS */}

            <div
              className={styles.formGroup}
            >

              <label>
                Lease Ends
              </label>

              <input
                name="leaseEnds"
                type="date"
                value={formData.leaseEnds}
                onChange={handleChange}
                required
                disabled={loading}
              />

            </div>

          </div>


          <div
            className={styles.modalFooter}
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
                : "Save Changes"}

            </button>

          </div>

        </form>

      </div>

    </div>

  );

}