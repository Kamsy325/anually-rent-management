import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiChevronRight,
  FiUsers,
  FiAlertTriangle,
} from "react-icons/fi";
import styles from "../css/Dashboard.module.css";

const API_URL = "https://anually-rent-management-backend.iamkamsy325.workers.dev";

function formatMoney(amount) {
  const value = Number(amount || 0);

  return `₦${value.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date) {
  if (!date) return "Not available";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getTenantKey(payment) {
  if (payment?.tenantId !== undefined && payment?.tenantId !== null) {
    return String(payment.tenantId);
  }
  if (payment?.tenant_id !== undefined && payment?.tenant_id !== null) {
    return String(payment.tenant_id);
  }
  if (payment?.tenant) {
    return String(payment.tenant).trim().toLowerCase();
  }
  return null;
}

function getPaymentDate(payment) {
  return payment?.dueDate || payment?.due_date || null;
}

function getOnePaymentPerTenant(payments = []) {
  const tenantPayments = new Map();

  for (const payment of payments) {
    const tenantKey = getTenantKey(payment);

    if (!tenantKey) {
      const fallbackKey = `payment-${payment?.id || Math.random()}`;
      tenantPayments.set(fallbackKey, payment);
      continue;
    }

    const existing = tenantPayments.get(tenantKey);
    if (!existing) {
      tenantPayments.set(tenantKey, payment);
      continue;
    }

    const existingDate = new Date(
      getPaymentDate(existing) || "9999-12-31"
    ).getTime();

    const currentDate = new Date(
      getPaymentDate(payment) || "9999-12-31"
    ).getTime();

    if (currentDate < existingDate) {
      tenantPayments.set(tenantKey, payment);
    }
  }

  return Array.from(tenantPayments.values());
}

function PaymentStatusBadge({ status }) {
  const normalizedStatus = String(status || "pending").toLowerCase();

  const statusConfig = {
    paid: {
      className: styles.statusPaid,
      icon: <FiCheckCircle />,
      label: "Paid",
    },
    pending: {
      className: styles.statusPending,
      icon: <FiClock />,
      label: "Pending",
    },
    overdue: {
      className: styles.statusOverdue,
      icon: <FiAlertCircle />,
      label: "Overdue",
    },
    upcoming: {
      className: styles.statusPending,
      icon: <FiClock />,
      label: "Upcoming",
    },
  };

  const config = statusConfig[normalizedStatus] || statusConfig.pending;

  return (
    <div className={`${styles.statusBadge} ${config.className}`}>
      <span className={styles.statusIcon}>{config.icon}</span>
      <span className={styles.capitalize}>{config.label}</span>
    </div>
  );
}

function AnalyticsCard({ title, value, change, changeType, icon }) {
  return (
    <div className={styles.analyticsCard}>
      <div className={styles.analyticsHeader}>
        <span className={styles.mutedText}>{title}</span>
        <div className={styles.analyticsIcon}>{icon}</div>
      </div>

      <div className={styles.analyticsValues}>
        <p className={styles.analyticsValue}>{value}</p>
        {change && (
          <p
            className={`${styles.analyticsChange} ${
              changeType === "positive"
                ? styles.changePositive
                : styles.changeNegative
            }`}
          >
            {change}
          </p>
        )}
      </div>
    </div>
  );
}

function RecentPayments({ payments }) {
  const paidPayments = payments
    .filter(
      (payment) =>
        String(payment?.status || "").toLowerCase() === "paid"
    )
    .sort(
      (a, b) =>
        new Date(
          b.paidDate || b.paymentDate || b.date || b.dueDate || 0
        ) -
        new Date(
          a.paidDate || a.paymentDate || a.date || a.dueDate || 0
        )
    )
    .slice(0, 5);

  return (
    <section className={styles.sectionCard}>
      <div>
        <h3 className={styles.sectionTitle}>Recent Payments</h3>
        <p className={styles.sectionDescription}>
          Last 5 payments made by tenants
        </p>
      </div>

      {paidPayments.length === 0 ? (
        <div style={{ padding: "30px 0", textAlign: "center" }}>
          No payments have been made yet.
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.paymentsTable}>
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Apartment</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paidPayments.map((payment, index) => (
                <tr
                  key={
                    payment.id ||
                    `${getTenantKey(payment)}-${getPaymentDate(
                      payment
                    )}-${index}`
                  }
                >
                  <td className={styles.tenantName}>{payment.tenant}</td>
                  <td className={styles.mutedCell}>{payment.apartment}</td>
                  <td className={styles.amountCell}>
                    {formatMoney(payment.amount)}
                  </td>
                  <td className={styles.mutedCell}>
                    {payment.paymentDateText ||
                      payment.paidDateText ||
                      payment.dueDateText ||
                      formatDate(
                        payment.paidDate ||
                          payment.paymentDate ||
                          payment.date ||
                          payment.dueDate
                      )}
                  </td>
                  <td>
                    <PaymentStatusBadge status="paid" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function PendingPayments({ payments }) {
  const pending = getOnePaymentPerTenant(payments).sort(
    (a, b) =>
      new Date(getPaymentDate(a) || 0) - new Date(getPaymentDate(b) || 0)
  );

  return (
    <section className={styles.sectionCard}>
      <div>
        <h3 className={styles.sectionTitle}>
          <FiClock size={18} className={styles.iconPending} />
          Pending Payments
          <span className={styles.countBadge}>({pending.length})</span>
        </h3>
        <p className={styles.sectionDescription}>
          Rent payments that are currently due or awaiting payment
        </p>
      </div>

      {pending.length === 0 ? (
        <div style={{ padding: "30px 0", textAlign: "center" }}>
          No pending payments.
        </div>
      ) : (
        <div className={styles.deadlinesList}>
          {pending.map((payment, index) => (
            <div
              key={
                payment.id ||
                `${getTenantKey(payment)}-${getPaymentDate(
                  payment
                )}-${index}`
              }
              className={styles.deadlineItem}
            >
              <div className={styles.deadlineInfo}>
                <p className={styles.deadlineTenant}>
                  {payment.tenant || "Unknown tenant"}
                </p>
                <p className={styles.deadlineMeta}>
                  <span>{payment.apartment || "No apartment"}</span>
                  <span>•</span>
                  <span>
                    {payment.dueDateText || formatDate(payment.dueDate)}
                  </span>
                </p>
              </div>

              <div className={styles.deadlineRight}>
                <div className={styles.deadlineAmount}>
                  <p>{formatMoney(payment.amount)}</p>
                  <span className={styles.deadlineWarning}>
                    {payment.daysUntilDue === 0
                      ? "Due today"
                      : `${payment.daysUntilDue || 0} days`}
                  </span>
                </div>
                <PaymentStatusBadge status="pending" />
                <FiChevronRight className={styles.chevronIcon} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function OverduePayments({ payments }) {
  const overdue = getOnePaymentPerTenant(payments).sort(
    (a, b) =>
      new Date(getPaymentDate(a) || 0) - new Date(getPaymentDate(b) || 0)
  );

  return (
    <section className={styles.sectionCard}>
      <div>
        <h3 className={styles.sectionTitle}>
          <FiAlertCircle size={18} className={styles.iconOverdue} />
          Overdue Payments
          <span className={styles.countBadge}>({overdue.length})</span>
        </h3>
        <p className={styles.sectionDescription}>
          Rent payments that have passed their due date
        </p>
      </div>

      {overdue.length === 0 ? (
        <div style={{ padding: "30px 0", textAlign: "center" }}>
          No overdue payments.
        </div>
      ) : (
        <div className={styles.deadlinesList}>
          {overdue.map((payment, index) => (
            <div
              key={
                payment.id ||
                `${getTenantKey(payment)}-${getPaymentDate(
                  payment
                )}-${index}`
              }
              className={styles.deadlineItem}
            >
              <div className={styles.deadlineInfo}>
                <p className={styles.deadlineTenant}>
                  {payment.tenant || "Unknown tenant"}
                </p>
                <p className={styles.deadlineMeta}>
                  <span>{payment.apartment || "No apartment"}</span>
                  <span>•</span>
                  <span>
                    {payment.dueDateText || formatDate(payment.dueDate)}
                  </span>
                </p>
              </div>

              <div className={styles.deadlineRight}>
                <div className={styles.deadlineAmount}>
                  <p>{formatMoney(payment.amount)}</p>
                  <span className={styles.deadlineWarning}>
                    {payment.daysUntilDue === 0
                      ? "Due today"
                      : `${Math.abs(payment.daysUntilDue || 0)} days overdue`}
                  </span>
                </div>
                <PaymentStatusBadge status="overdue" />
                <FiChevronRight className={styles.chevronIcon} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function UpcomingDeadlines({ deadlines }) {
  return (
    <section className={styles.sectionCard}>
      <div>
        <h3 className={styles.sectionTitle}>Upcoming Deadlines</h3>
        <p className={styles.sectionDescription}>
          Rent payment due dates for the next 30 days
        </p>
      </div>

      {deadlines.length === 0 ? (
        <div style={{ padding: "30px 0", textAlign: "center" }}>
          No upcoming rent payments.
        </div>
      ) : (
        <div className={styles.deadlinesList}>
          {deadlines.map((deadline, index) => (
            <div
              key={
                deadline.id ||
                `${getTenantKey(deadline)}-${getPaymentDate(
                  deadline
                )}-${index}`
              }
              className={styles.deadlineItem}
            >
              <div className={styles.deadlineInfo}>
                <p className={styles.deadlineTenant}>
                  {deadline.tenant || "Unknown tenant"}
                </p>
                <p className={styles.deadlineMeta}>
                  <span>{deadline.apartment || "No apartment"}</span>
                  <span>•</span>
                  <span>
                    {deadline.dueDateText || formatDate(deadline.dueDate)}
                  </span>
                </p>
              </div>

              <div className={styles.deadlineRight}>
                <div className={styles.deadlineAmount}>
                  <p>{formatMoney(deadline.amount)}</p>
                  <span
                    className={
                      deadline.daysUntilDue <= 7
                        ? styles.deadlineWarning
                        : styles.deadlineSafe
                    }
                  >
                    {deadline.daysUntilDue === 0
                      ? "Due today"
                      : deadline.daysUntilDue === 1
                      ? "1 day"
                      : `${deadline.daysUntilDue} days`}
                  </span>
                </div>
                <FiChevronRight className={styles.chevronIcon} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useOutletContext() || {};

  useEffect(() => {
    if (user && user.role !== "landlord") {
      navigate("/app", { replace: true });
    }
  }, [user, navigate]);

  const [dashboardData, setDashboardData] = useState({
    payments: [],
    upcomingDeadlines: [],
    pendingPayments: [],
    overduePayments: [],
    recentPayments: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("You are not logged in.");
          return;
        }

        const response = await axios.get(`${API_URL}/dashboard-data`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data || {};

        setDashboardData({
          payments: Array.isArray(data.payments) ? data.payments : [],
          upcomingDeadlines: Array.isArray(data.upcomingDeadlines)
            ? data.upcomingDeadlines
            : [],
          pendingPayments: Array.isArray(data.pendingPayments)
            ? data.pendingPayments
            : [],
          overduePayments: Array.isArray(data.overduePayments)
            ? data.overduePayments
            : [],
          recentPayments: Array.isArray(data.recentPayments)
            ? data.recentPayments
            : [],
        });
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (user?.role !== "landlord") return null;

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.dashboardContent}>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.dashboardContent}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const {
    payments,
    upcomingDeadlines,
    pendingPayments,
    overduePayments,
  } = dashboardData;

  const uniquePendingPayments = getOnePaymentPerTenant(pendingPayments);
  const uniqueOverduePayments = getOnePaymentPerTenant(overduePayments);

  const totalRevenue = payments
    .filter(
      (payment) =>
        String(payment?.status || "").toLowerCase() === "paid"
    )
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);

  const pendingAmount = uniquePendingPayments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0
  );

  const overdueAmount = uniqueOverduePayments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0
  );

  const uniqueTenantIds = new Set(
    payments.map((payment) => getTenantKey(payment)).filter(Boolean)
  );

  const activeTenants = uniqueTenantIds.size;

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardContent}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageDescription}>
            Welcome back, here's your property overview
          </p>
        </div>

        <div className={styles.analyticsGrid}>
          <AnalyticsCard
            title="Total Revenue"
            value={formatMoney(totalRevenue)}
            icon={<span style={{ fontWeight: "bold" }}>₦</span>}
          />

          <AnalyticsCard
            title="Active Tenants"
            value={activeTenants}
            icon={<FiUsers />}
          />

          <AnalyticsCard
            title="Pending Payments"
            value={formatMoney(pendingAmount)}
            icon={<FiClock />}
          />

          <AnalyticsCard
            title="Overdue Payments"
            value={formatMoney(overdueAmount)}
            icon={<FiAlertTriangle />}
          />
        </div>

        <PendingPayments payments={pendingPayments} />
        <OverduePayments payments={overduePayments} />
        <RecentPayments payments={payments} />
        <UpcomingDeadlines deadlines={upcomingDeadlines} />
      </div>
    </div>
  );
}
