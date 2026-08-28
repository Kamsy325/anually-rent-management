import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiCheck, FiClock, FiAlertCircle } from "react-icons/fi";
import { useNavigate, useOutletContext } from "react-router-dom";
import styles from "../css/TenantDashboard.module.css";

const API_URL = "http://localhost:5000";

export default function TenantDashboard() {
  const navigate = useNavigate();
  const { user } = useOutletContext();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingPaymentId, setProcessingPaymentId] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/", { replace: true });
        return;
      }

      const response = await axios.get(`${API_URL}/tenant-dashboard-data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDashboardData(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/", { replace: true });
        return;
      }

      setError(
        err.response?.data?.message || "Failed to load tenant dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [navigate]);

  const handlePayment = async (payment) => {
    if (!payment?.id) {
      setError("This payment cannot be processed because the payment ID is missing.");
      return;
    }

    if (processingPaymentId === payment.id) {
      return;
    }

    try {
      setProcessingPaymentId(payment.id);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/", { replace: true });
        return;
      }

      const response = await axios.post(
        `${API_URL}/payments/initialize`,
        { paymentId: payment.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const authorizationUrl =
        response.data?.authorization_url || response.data?.data?.authorization_url;

      if (!authorizationUrl) {
        throw new Error("Paystack authorization URL was not returned.");
      }

      window.location.href = authorizationUrl;
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Unable to initialize payment."
      );
      setProcessingPaymentId(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>
            <FiAlertCircle size={28} />
          </div>
          <h2>Unable to load dashboard</h2>
          <p>{error}</p>
          <button
            type="button"
            className={styles.retryButton}
            onClick={() => {
              setError("");
              loadDashboard();
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.emptyState}>
          <FiAlertCircle size={32} />
          <h2>No dashboard data</h2>
          <p>There is currently no dashboard information available.</p>
        </div>
      </div>
    );
  }

  const tenant = dashboardData.tenant || {};
  const payments = Array.isArray(dashboardData.payments) ? dashboardData.payments : [];
  const apiPendingPayments = Array.isArray(dashboardData.pendingPayments)
    ? dashboardData.pendingPayments
    : [];
  const apiOverduePayments = Array.isArray(dashboardData.overduePayments)
    ? dashboardData.overduePayments
    : [];

  const formatMoney = (amount) => {
    const value = Number(amount || 0);
    return `$${value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) return "Not available";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPaymentStatus = (payment) => {
    return (payment?.status || "pending").toLowerCase();
  };

  const paidPayments = payments.filter(
    (payment) => getPaymentStatus(payment) === "paid"
  );

  // Filter pending payments: Ensure future payments (daysUntilDue > 0) are NOT rendered in Pending
  const pendingPayments =
    apiPendingPayments.length > 0
      ? apiPendingPayments
      : payments.filter((payment) => {
          const status = getPaymentStatus(payment);
          const days = payment.daysUntilDue;
          return status === "pending" && (days === null || days <= 0);
        });

  const overduePayments =
    apiOverduePayments.length > 0
      ? apiOverduePayments
      : payments.filter(
          (payment) => getPaymentStatus(payment) === "overdue"
        );

  const totalPaid = paidPayments.reduce(
    (total, payment) => total + Number(payment.amount || payment.rent || 0),
    0
  );

  const totalPending = pendingPayments.reduce(
    (total, payment) => total + Number(payment.amount || payment.rent || 0),
    0
  );

  const totalOverdue = overduePayments.reduce(
    (total, payment) => total + Number(payment.amount || payment.rent || 0),
    0
  );

  const displayName = tenant.name || user?.name || user?.email || "Tenant";
  const apartment = tenant.apartment || "Apartment";

  const getPaymentDate = (payment) => {
    return (
      payment.date ||
      payment.paymentDate ||
      payment.payment_date ||
      payment.dueDate ||
      payment.due_date
    );
  };

  const getPaymentAmount = (payment) => {
    return payment.amount || payment.rent || 0;
  };

  const getOverdueNote = (payment) => {
    if (payment.note) return payment.note;
    if (payment.daysOverdue) return `${payment.daysOverdue} days overdue`;
    if (payment.days_overdue) return `${payment.days_overdue} days overdue`;
    if (typeof payment.daysUntilDue === "number" && payment.daysUntilDue < 0) {
      return `${Math.abs(payment.daysUntilDue)} days overdue`;
    }
    return null;
  };

  const isProcessing = (payment) => {
    return (
      processingPaymentId !== null &&
      Number(processingPaymentId) === Number(payment?.id)
    );
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* HEADER */}
      <div className={styles.header}>
        <h1 className={styles.title}>Payment History</h1>
        <p className={styles.subtitle}>
          Welcome back, {displayName}. View your rent payments and upcoming dues.
        </p>
      </div>

      {/* SUMMARY METRICS */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div>
            <p className={styles.summaryLabel}>Total Paid</p>
            <p className={styles.summaryAmount}>{formatMoney(totalPaid)}</p>
          </div>
          <FiCheck size={20} className={styles.iconSuccess} />
        </div>

        <div className={styles.summaryCard}>
          <div>
            <p className={styles.summaryLabel}>Pending</p>
            <p className={styles.summaryAmount}>{formatMoney(totalPending)}</p>
          </div>
          <FiClock size={20} className={styles.iconPending} />
        </div>

        <div className={styles.summaryCard}>
          <div>
            <p className={styles.summaryLabel}>Overdue</p>
            <p className={styles.summaryAmount}>{formatMoney(totalOverdue)}</p>
          </div>
          <FiAlertCircle size={20} className={styles.iconOverdue} />
        </div>
      </div>

      {/* PAID PAYMENTS */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <FiCheck size={18} className={styles.iconSuccess} />
          Paid Payments
          <span className={styles.countBadge}>({paidPayments.length})</span>
        </h2>

        {paidPayments.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No paid payments yet.</p>
          </div>
        ) : (
          <div className={styles.cardsGrid}>
            {paidPayments.map((item, index) => (
              <div key={item.id || index} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <p className={styles.property}>
                      {item.apartment || item.apt || apartment}
                    </p>
                    <p className={styles.amount}>
                      {formatMoney(getPaymentAmount(item))}
                    </p>
                  </div>
                  <div className={styles.badgeSuccess}>
                    <FiCheck size={12} />
                  </div>
                </div>
                <p className={styles.date}>{formatDate(getPaymentDate(item))}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PENDING PAYMENTS */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <FiClock size={18} className={styles.iconPending} />
          Pending Payments
          <span className={styles.countBadge}>({pendingPayments.length})</span>
        </h2>

        {pendingPayments.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No pending payments.</p>
          </div>
        ) : (
          <div className={styles.cardsGrid}>
            {pendingPayments.map((item, index) => {
              const processing = isProcessing(item);

              return (
                <div key={item.id || index} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div>
                      <p className={styles.property}>
                        {item.apartment || item.apt || apartment}
                      </p>
                      <p className={styles.amount}>
                        {formatMoney(getPaymentAmount(item))}
                      </p>
                    </div>
                    <div className={styles.badgePending}>
                      <FiClock size={12} />
                    </div>
                  </div>
                  <p className={styles.date}>{formatDate(getPaymentDate(item))}</p>
                  <button
                    type="button"
                    className={styles.payButton}
                    disabled={processing}
                    onClick={() => handlePayment(item)}
                  >
                    {processing ? "Processing..." : "Pay Now"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* OVERDUE PAYMENTS */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <FiAlertCircle size={18} className={styles.iconOverdue} />
          Overdue Payments
          <span className={styles.countBadge}>({overduePayments.length})</span>
        </h2>

        {overduePayments.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No overdue payments.</p>
          </div>
        ) : (
          <div className={styles.cardsGrid}>
            {overduePayments.map((item, index) => {
              const overdueNote = getOverdueNote(item);
              const processing = isProcessing(item);

              return (
                <div key={item.id || index} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div>
                      <p className={styles.property}>
                        {item.apartment || item.apt || apartment}
                      </p>
                      <p className={styles.amount}>
                        {formatMoney(getPaymentAmount(item))}
                      </p>
                    </div>
                    <div className={styles.badgeOverdue}>
                      <FiAlertCircle size={12} />
                    </div>
                  </div>
                  <p className={styles.date}>{formatDate(getPaymentDate(item))}</p>
                  {overdueNote && (
                    <p className={styles.overdueText}>{overdueNote}</p>
                  )}
                  <button
                    type="button"
                    className={styles.payImmediateButton}
                    disabled={processing}
                    onClick={() => handlePayment(item)}
                  >
                    {processing ? "Processing..." : "Pay Immediately"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}