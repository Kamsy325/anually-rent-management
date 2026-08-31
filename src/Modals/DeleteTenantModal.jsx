import React, { useState } from "react";
import { FiX, FiTrash2 } from "react-icons/fi";
import styles from "../css/Modals.module.css";

export default function DeleteTenantModal({
  tenant,
  isOpen,
  onClose,
  onConfirm,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    if (loading) return;
    setError("");
    onClose();
  };

  const handleDelete = async () => {
    if (!tenant?.id) {
      setError("No tenant selected.");
      return;
    }

    if (!onConfirm) {
      setError("Delete function is not available.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await onConfirm();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete tenant.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !tenant) return null;

  return (
    <div className={styles.overlay} onMouseDown={handleClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Delete Tenant</h2>
            <p className={styles.modalDescription}>
              This action cannot be undone.
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

        <div style={{ padding: "20px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fee2e2",
                color: "#dc2626",
              }}
            >
              <FiTrash2 size={20} />
            </div>

            <div>
              <strong>{tenant.name}</strong>
              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: "14px",
                  color: "#64748b",
                }}
              >
                {tenant.apartment}
              </p>
            </div>
          </div>

          <p>
            Are you sure you want to delete <strong>{tenant.name}</strong>?
          </p>

          {error && (
            <p
              style={{
                color: "#dc2626",
                fontSize: "14px",
                marginTop: "12px",
              }}
            >
              {error}
            </p>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleDelete}
            disabled={loading}
            style={{ background: "#dc2626" }}
          >
            {loading ? "Deleting..." : "Delete Tenant"}
          </button>
        </div>
      </div>
    </div>
  );
}