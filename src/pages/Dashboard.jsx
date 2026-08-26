import React, {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiChevronRight,
  FiDollarSign,
  FiUsers,
  FiAlertTriangle,
} from "react-icons/fi";

import styles from "../css/Dashboard.module.css";


// ==================================================
// API
// ==================================================

const API_URL =
  "http://localhost:5000";


// ==================================================
// MONEY
// ==================================================

function formatMoney(amount) {
  const value = Number(amount || 0);

  return `$${value.toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  )}`;
}


// ==================================================
// DATE
// ==================================================

function formatDate(date) {
  if (!date) {
    return "Not available";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return date;
  }

  return parsedDate.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}


// ==================================================
// GET TENANT KEY
//
// This makes the dashboard robust even if the backend
// sends tenantId as a number or string.
// ==================================================

function getTenantKey(payment) {
  if (
    payment?.tenantId !== undefined &&
    payment?.tenantId !== null
  ) {
    return String(payment.tenantId);
  }

  if (
    payment?.tenant_id !== undefined &&
    payment?.tenant_id !== null
  ) {
    return String(payment.tenant_id);
  }

  if (payment?.tenant) {
    return String(payment.tenant)
      .trim()
      .toLowerCase();
  }

  return null;
}


// ==================================================
// GET PAYMENT DATE
// ==================================================

function getPaymentDate(payment) {
  return (
    payment?.dueDate ||
    payment?.due_date ||
    null
  );
}


// ==================================================
// DEDUPLICATE PAYMENTS BY TENANT
//
// IMPORTANT:
//
// The database can contain multiple future payment
// obligations for the same tenant.
//
// The landlord dashboard should NOT display all of
// those future obligations as "Pending Payments".
//
// This function keeps ONLY ONE payment per tenant.
//
// For pending payments, that payment is the earliest
// pending payment.
//
// For overdue payments, that payment is the oldest
// overdue payment.
// ==================================================

function getOnePaymentPerTenant(
  payments = []
) {
  const tenantPayments =
    new Map();

  for (const payment of payments) {
    const tenantKey =
      getTenantKey(payment);

    /*
     * If there is no tenant ID/name, keep the
     * payment rather than silently losing it.
     */
    if (!tenantKey) {
      const fallbackKey =
        `payment-${payment?.id || Math.random()}`;

      tenantPayments.set(
        fallbackKey,
        payment
      );

      continue;
    }

    const existing =
      tenantPayments.get(
        tenantKey
      );

    if (!existing) {
      tenantPayments.set(
        tenantKey,
        payment
      );

      continue;
    }

    const existingDate =
      new Date(
        getPaymentDate(existing) ||
          "9999-12-31"
      ).getTime();

    const currentDate =
      new Date(
        getPaymentDate(payment) ||
          "9999-12-31"
      ).getTime();

    /*
     * Keep the earliest payment.
     */
    if (
      currentDate <
      existingDate
    ) {
      tenantPayments.set(
        tenantKey,
        payment
      );
    }
  }

  return Array.from(
    tenantPayments.values()
  );
}


// ==================================================
// PAYMENT STATUS BADGE
// ==================================================

function PaymentStatusBadge({
  status,
}) {
  const normalizedStatus =
    String(
      status || "pending"
    ).toLowerCase();

  const statusConfig = {
    paid: {
      className:
        styles.statusPaid,
      icon: (
        <FiCheckCircle />
      ),
      label: "Paid",
    },

    pending: {
      className:
        styles.statusPending,
      icon: <FiClock />,
      label: "Pending",
    },

    overdue: {
      className:
        styles.statusOverdue,
      icon: (
        <FiAlertCircle />
      ),
      label: "Overdue",
    },

    upcoming: {
      className:
        styles.statusPending,
      icon: <FiClock />,
      label: "Upcoming",
    },
  };

  const config =
    statusConfig[
      normalizedStatus
    ] ||
    statusConfig.pending;

  return (
    <div
      className={`
        ${styles.statusBadge}
        ${config.className}
      `}
    >
      <span
        className={
          styles.statusIcon
        }
      >
        {config.icon}
      </span>

      <span
        className={
          styles.capitalize
        }
      >
        {config.label}
      </span>
    </div>
  );
}


// ==================================================
// ANALYTICS CARD
// ==================================================

function AnalyticsCard({
  title,
  value,
  change,
  changeType,
  icon,
}) {
  return (
    <div
      className={
        styles.analyticsCard
      }
    >
      <div
        className={
          styles.analyticsHeader
        }
      >
        <span
          className={
            styles.mutedText
          }
        >
          {title}
        </span>

        <div
          className={
            styles.analyticsIcon
          }
        >
          {icon}
        </div>
      </div>

      <div
        className={
          styles.analyticsValues
        }
      >
        <p
          className={
            styles.analyticsValue
          }
        >
          {value}
        </p>

        {change && (
          <p
            className={`
              ${styles.analyticsChange}
              ${
                changeType ===
                "positive"
                  ? styles.changePositive
                  : styles.changeNegative
              }
            `}
          >
            {change}
          </p>
        )}
      </div>
    </div>
  );
}


// ==================================================
// PAYMENT ROW
// ==================================================

function PaymentRow({
  payment,
  showPayButton = false,
  immediate = false,
}) {
  const status =
    String(
      payment?.status ||
        "pending"
    ).toLowerCase();

  return (
    <div
      className={
        styles.paymentRow
      }
    >
      <div
        className={
          styles.paymentInfo
        }
      >
        <p
          className={
            styles.tenantName
          }
        >
          {payment.tenant ||
            "Unknown tenant"}
        </p>

        <p
          className={
            styles.paymentMeta
          }
        >
          <span>
            {payment.apartment ||
              "No apartment"}
          </span>

          <span>•</span>

          <span>
            {payment.dueDateText ||
              formatDate(
                payment.dueDate
              )}
          </span>
        </p>
      </div>

      <div
        className={
          styles.paymentAmount
        }
      >
        {formatMoney(
          payment.amount
        )}
      </div>

      <PaymentStatusBadge
        status={status}
      />

      {showPayButton && (
        <button
          type="button"
          className={
            immediate
              ? styles.payImmediateButton
              : styles.payButton
          }
          onClick={() => {
            console.log(
              "PAYMENT BUTTON CLICKED:",
              payment
            );
          }}
        >
          {immediate
            ? "Pay Immediately"
            : "Pay Now"}
        </button>
      )}
    </div>
  );
}


// ==================================================
// RECENT PAYMENTS
// ==================================================

function RecentPayments({
  payments,
}) {
  /*
   * Recent Payments should ONLY contain
   * payments that have actually been paid.
   */

  const paidPayments =
    payments
      .filter(
        (payment) =>
          String(
            payment?.status || ""
          ).toLowerCase() ===
          "paid"
      )
      .sort(
        (a, b) =>
          new Date(
            b.paidDate ||
              b.paymentDate ||
              b.date ||
              b.dueDate ||
              0
          ) -
          new Date(
            a.paidDate ||
              a.paymentDate ||
              a.date ||
              a.dueDate ||
              0
          )
      )
      .slice(0, 5);


  console.log(
    "RECENT PAYMENTS - PAID ONLY:",
    paidPayments
  );


  return (
    <section
      className={
        styles.sectionCard
      }
    >
      <div>
        <h3
          className={
            styles.sectionTitle
          }
        >
          Recent Payments
        </h3>

        <p
          className={
            styles.sectionDescription
          }
        >
          Last 5 payments made by tenants
        </p>
      </div>

      {paidPayments.length === 0 ? (
        <div
          style={{
            padding: "30px 0",
            textAlign: "center",
          }}
        >
          No payments have been made yet.
        </div>
      ) : (
        <div
          className={
            styles.tableWrapper
          }
        >
          <table
            className={
              styles.paymentsTable
            }
          >
            <thead>
              <tr>
                <th>
                  Tenant
                </th>

                <th>
                  Apartment
                </th>

                <th>
                  Amount
                </th>

                <th>
                  Date
                </th>

                <th>
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {paidPayments.map(
                (
                  payment,
                  index
                ) => (
                  <tr
                    key={
                      payment.id ||
                      `${getTenantKey(
                        payment
                      )}-${getPaymentDate(
                        payment
                      )}-${index}`
                    }
                  >
                    <td
                      className={
                        styles.tenantName
                      }
                    >
                      {payment.tenant}
                    </td>

                    <td
                      className={
                        styles.mutedCell
                      }
                    >
                      {payment.apartment}
                    </td>

                    <td
                      className={
                        styles.amountCell
                      }
                    >
                      {formatMoney(
                        payment.amount
                      )}
                    </td>

                    <td
                      className={
                        styles.mutedCell
                      }
                    >
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
                      <PaymentStatusBadge
                        status="paid"
                      />
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}


// ==================================================
// PENDING PAYMENTS
// ==================================================

function PendingPayments({
  payments,
}) {
  /*
   * IMPORTANT FIX
   *
   * The backend may return multiple future payment
   * records for the same tenant.
   *
   * We only display ONE pending payment per tenant.
   */

  const pending =
    getOnePaymentPerTenant(
      payments.filter(
        (payment) =>
          String(
            payment?.status || ""
          ).toLowerCase() ===
          "pending"
      )
    ).sort(
      (a, b) =>
        new Date(
          getPaymentDate(a) || 0
        ) -
        new Date(
          getPaymentDate(b) || 0
        )
    );


  console.log(
    "PENDING PAYMENTS - RAW:",
    payments
  );

  console.log(
    "PENDING PAYMENTS - ONE PER TENANT:",
    pending
  );


  return (
    <section
      className={
        styles.sectionCard
      }
    >
      <div>
        <h3
          className={
            styles.sectionTitle
          }
        >
          <FiClock
            size={18}
            className={
              styles.iconPending
            }
          />

          Pending Payments

          <span
            className={
              styles.countBadge
            }
          >
            ({pending.length})
          </span>
        </h3>

        <p
          className={
            styles.sectionDescription
          }
        >
          Rent payments that are currently due
          or awaiting payment
        </p>
      </div>

      {pending.length === 0 ? (
        <div
          style={{
            padding: "30px 0",
            textAlign: "center",
          }}
        >
          No pending payments.
        </div>
      ) : (
        <div
          className={
            styles.deadlinesList
          }
        >
          {pending.map(
            (
              payment,
              index
            ) => (
              <div
                key={
                  payment.id ||
                  `${getTenantKey(
                    payment
                  )}-${getPaymentDate(
                    payment
                  )}-${index}`
                }
                className={
                  styles.deadlineItem
                }
              >
                <div
                  className={
                    styles.deadlineInfo
                  }
                >
                  <p
                    className={
                      styles.deadlineTenant
                    }
                  >
                    {payment.tenant ||
                      "Unknown tenant"}
                  </p>

                  <p
                    className={
                      styles.deadlineMeta
                    }
                  >
                    <span>
                      {payment.apartment ||
                        "No apartment"}
                    </span>

                    <span>
                      •
                    </span>

                    <span>
                      {payment.dueDateText ||
                        formatDate(
                          payment.dueDate
                        )}
                    </span>
                  </p>
                </div>

                <div
                  className={
                    styles.deadlineRight
                  }
                >
                  <div
                    className={
                      styles.deadlineAmount
                    }
                  >
                    <p>
                      {formatMoney(
                        payment.amount
                      )}
                    </p>

                    <span
                      className={
                        styles.deadlineWarning
                      }
                    >
                      {payment.daysUntilDue ===
                      0
                        ? "Due today"
                        : payment.daysUntilDue <
                          0
                        ? `${Math.abs(
                            payment.daysUntilDue
                          )} days overdue`
                        : `${payment.daysUntilDue} days`}
                    </span>
                  </div>

                  <PaymentStatusBadge
                    status="pending"
                  />

                  <FiChevronRight
                    className={
                      styles.chevronIcon
                    }
                  />
                </div>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}


// ==================================================
// OVERDUE PAYMENTS
// ==================================================

function OverduePayments({
  payments,
}) {
  /*
   * Same protection as pending payments:
   * only ONE overdue payment per tenant.
   */

  const overdue =
    getOnePaymentPerTenant(
      payments.filter(
        (payment) =>
          String(
            payment?.status || ""
          ).toLowerCase() ===
          "overdue"
      )
    ).sort(
      (a, b) =>
        new Date(
          getPaymentDate(a) || 0
        ) -
        new Date(
          getPaymentDate(b) || 0
        )
    );


  console.log(
    "OVERDUE PAYMENTS - RAW:",
    payments
  );

  console.log(
    "OVERDUE PAYMENTS - ONE PER TENANT:",
    overdue
  );


  return (
    <section
      className={
        styles.sectionCard
      }
    >
      <div>
        <h3
          className={
            styles.sectionTitle
          }
        >
          <FiAlertCircle
            size={18}
            className={
              styles.iconOverdue
            }
          />

          Overdue Payments

          <span
            className={
              styles.countBadge
            }
          >
            ({overdue.length})
          </span>
        </h3>

        <p
          className={
            styles.sectionDescription
          }
        >
          Rent payments that have passed their due date
        </p>
      </div>

      {overdue.length === 0 ? (
        <div
          style={{
            padding: "30px 0",
            textAlign: "center",
          }}
        >
          No overdue payments.
        </div>
      ) : (
        <div
          className={
            styles.deadlinesList
          }
        >
          {overdue.map(
            (
              payment,
              index
            ) => (
              <div
                key={
                  payment.id ||
                  `${getTenantKey(
                    payment
                  )}-${getPaymentDate(
                    payment
                  )}-${index}`
                }
                className={
                  styles.deadlineItem
                }
              >
                <div
                  className={
                    styles.deadlineInfo
                  }
                >
                  <p
                    className={
                      styles.deadlineTenant
                    }
                  >
                    {payment.tenant ||
                      "Unknown tenant"}
                  </p>

                  <p
                    className={
                      styles.deadlineMeta
                    }
                  >
                    <span>
                      {payment.apartment ||
                        "No apartment"}
                    </span>

                    <span>
                      •
                    </span>

                    <span>
                      {payment.dueDateText ||
                        formatDate(
                          payment.dueDate
                        )}
                    </span>
                  </p>
                </div>

                <div
                  className={
                    styles.deadlineRight
                  }
                >
                  <div
                    className={
                      styles.deadlineAmount
                    }
                  >
                    <p>
                      {formatMoney(
                        payment.amount
                      )}
                    </p>

                    <span
                      className={
                        styles.deadlineWarning
                      }
                    >
                      {payment.daysUntilDue ===
                      0
                        ? "Due today"
                        : `${Math.abs(
                            payment.daysUntilDue ||
                              0
                          )} days overdue`}
                    </span>
                  </div>

                  <PaymentStatusBadge
                    status="overdue"
                  />

                  <FiChevronRight
                    className={
                      styles.chevronIcon
                    }
                  />
                </div>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}


// ==================================================
// UPCOMING DEADLINES
// ==================================================

function UpcomingDeadlines({
  deadlines,
}) {
  return (
    <section
      className={
        styles.sectionCard
      }
    >
      <div>
        <h3
          className={
            styles.sectionTitle
          }
        >
          Upcoming Deadlines
        </h3>

        <p
          className={
            styles.sectionDescription
          }
        >
          Rent payment due dates for the next 30 days
        </p>
      </div>

      {deadlines.length === 0 ? (
        <div
          style={{
            padding: "30px 0",
            textAlign: "center",
          }}
        >
          No upcoming rent payments.
        </div>
      ) : (
        <div
          className={
            styles.deadlinesList
          }
        >
          {deadlines.map(
            (
              deadline,
              index
            ) => (
              <div
                key={
                  deadline.id ||
                  `${getTenantKey(
                    deadline
                  )}-${getPaymentDate(
                    deadline
                  )}-${index}`
                }
                className={
                  styles.deadlineItem
                }
              >
                <div
                  className={
                    styles.deadlineInfo
                  }
                >
                  <p
                    className={
                      styles.deadlineTenant
                    }
                  >
                    {deadline.tenant ||
                      "Unknown tenant"}
                  </p>

                  <p
                    className={
                      styles.deadlineMeta
                    }
                  >
                    <span>
                      {deadline.apartment ||
                        "No apartment"}
                    </span>

                    <span>
                      •
                    </span>

                    <span>
                      {deadline.dueDateText ||
                        formatDate(
                          deadline.dueDate
                        )}
                    </span>
                  </p>
                </div>

                <div
                  className={
                    styles.deadlineRight
                  }
                >
                  <div
                    className={
                      styles.deadlineAmount
                    }
                  >
                    <p>
                      {formatMoney(
                        deadline.amount
                      )}
                    </p>

                    <span
                      className={
                        deadline.daysUntilDue <=
                        7
                          ? styles.deadlineWarning
                          : styles.deadlineSafe
                      }
                    >
                      {deadline.daysUntilDue ===
                      0
                        ? "Due today"
                        : deadline.daysUntilDue ===
                          1
                        ? "1 day"
                        : `${deadline.daysUntilDue} days`}
                    </span>
                  </div>

                  <FiChevronRight
                    className={
                      styles.chevronIcon
                    }
                  />
                </div>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}


// ==================================================
// DASHBOARD
// ==================================================

export default function Dashboard() {
  const [
    dashboardData,
    setDashboardData,
  ] = useState({
    payments: [],
    upcomingDeadlines: [],
    pendingPayments: [],
    overduePayments: [],
    recentPayments: [],
  });


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  // ==================================================
  // LOAD DASHBOARD
  // ==================================================

  useEffect(() => {
    const loadDashboard =
      async () => {
        try {
          setLoading(true);
          setError("");

          const token =
            localStorage.getItem(
              "token"
            );


          console.log(
            "DASHBOARD: loading..."
          );


          if (!token) {
            setError(
              "You are not logged in."
            );

            return;
          }


          const response =
            await axios.get(
              `${API_URL}/dashboard-data`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );


          console.log(
            "DASHBOARD API RESPONSE:",
            response.data
          );


          const data =
            response.data || {};


          const payments =
            Array.isArray(
              data.payments
            )
              ? data.payments
              : [];


          /*
           * Keep the backend arrays here.
           *
           * PendingPayments and OverduePayments
           * perform the final one-per-tenant
           * protection before displaying them.
           */

          const pendingPayments =
            Array.isArray(
              data.pendingPayments
            )
              ? data.pendingPayments
              : [];


          const overduePayments =
            Array.isArray(
              data.overduePayments
            )
              ? data.overduePayments
              : [];


          const recentPayments =
            Array.isArray(
              data.recentPayments
            )
              ? data.recentPayments
              : [];


          const upcomingDeadlines =
            Array.isArray(
              data.upcomingDeadlines
            )
              ? data.upcomingDeadlines
              : [];


          console.log(
            "DASHBOARD PAYMENTS:",
            payments
          );

          console.log(
            "DASHBOARD RAW PENDING PAYMENTS:",
            pendingPayments
          );

          console.log(
            "DASHBOARD RAW OVERDUE PAYMENTS:",
            overduePayments
          );

          console.log(
            "DASHBOARD RECENT PAYMENTS:",
            recentPayments
          );

          console.log(
            "DASHBOARD UPCOMING DEADLINES:",
            upcomingDeadlines
          );


          setDashboardData({
            payments,
            upcomingDeadlines,
            pendingPayments,
            overduePayments,
            recentPayments,
          });


        } catch (error) {
          console.error(
            "DASHBOARD ERROR:",
            error
          );

          console.error(
            "DASHBOARD SERVER RESPONSE:",
            error.response?.data
          );

          setError(
            error.response?.data?.message ||
              "Failed to load dashboard."
          );


        } finally {
          setLoading(false);
        }
      };


    loadDashboard();

  }, []);


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div
        className={
          styles.dashboard
        }
      >
        <div
          className={
            styles.dashboardContent
          }
        >
          <p>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }


  // ==================================================
  // ERROR
  // ==================================================

  if (error) {
    return (
      <div
        className={
          styles.dashboard
        }
      >
        <div
          className={
            styles.dashboardContent
          }
        >
          <p>
            {error}
          </p>
        </div>
      </div>
    );
  }


  const {
    payments,
    upcomingDeadlines,
    pendingPayments,
    overduePayments,
    recentPayments,
  } = dashboardData;


  // ==================================================
  // CALCULATE UNIQUE PENDING PAYMENTS
  //
  // This is also used for the analytics amount.
  // ==================================================

  const uniquePendingPayments =
    getOnePaymentPerTenant(
      pendingPayments.filter(
        (payment) =>
          String(
            payment?.status || ""
          ).toLowerCase() ===
          "pending"
      )
    );


  // ==================================================
  // CALCULATE UNIQUE OVERDUE PAYMENTS
  // ==================================================

  const uniqueOverduePayments =
    getOnePaymentPerTenant(
      overduePayments.filter(
        (payment) =>
          String(
            payment?.status || ""
          ).toLowerCase() ===
          "overdue"
      )
    );


  // ==================================================
  // CALCULATE REVENUE
  // ==================================================

  const totalRevenue =
    payments
      .filter(
        (payment) =>
          String(
            payment?.status || ""
          ).toLowerCase() ===
          "paid"
      )
      .reduce(
        (
          total,
          payment
        ) =>
          total +
          Number(
            payment.amount || 0
          ),
        0
      );


  // ==================================================
  // CALCULATE PENDING
  // ==================================================

  const pendingAmount =
    uniquePendingPayments.reduce(
      (
        total,
        payment
      ) =>
        total +
        Number(
          payment.amount || 0
        ),
      0
    );


  // ==================================================
  // CALCULATE OVERDUE
  // ==================================================

  const overdueAmount =
    uniqueOverduePayments.reduce(
      (
        total,
        payment
      ) =>
        total +
        Number(
          payment.amount || 0
        ),
      0
    );


  // ==================================================
  // ACTIVE TENANTS
  // ==================================================

  /*
   * Count unique tenants rather than payment rows.
   */

  const uniqueTenantIds =
    new Set(
      payments
        .map(
          (payment) =>
            getTenantKey(payment)
        )
        .filter(Boolean)
    );


  const activeTenants =
    uniqueTenantIds.size;


  // ==================================================
  // FINAL DEBUG LOGS
  // ==================================================

  console.log(
    "========== LANDLORD DASHBOARD =========="
  );

  console.log(
    "All payment records:",
    payments
  );

  console.log(
    "Raw pending records:",
    pendingPayments
  );

  console.log(
    "Unique pending payments:",
    uniquePendingPayments
  );

  console.log(
    "Raw overdue records:",
    overduePayments
  );

  console.log(
    "Unique overdue payments:",
    uniqueOverduePayments
  );

  console.log(
    "Recent payments:",
    recentPayments
  );

  console.log(
    "Upcoming deadlines:",
    upcomingDeadlines
  );

  console.log(
    "Total revenue:",
    totalRevenue
  );

  console.log(
    "Pending amount:",
    pendingAmount
  );

  console.log(
    "Overdue amount:",
    overdueAmount
  );

  console.log(
    "Active tenants:",
    activeTenants
  );

  console.log(
    "========================================"
  );


  // ==================================================
  // PAGE
  // ==================================================

  return (
    <div
      className={
        styles.dashboard
      }
    >
      <div
        className={
          styles.dashboardContent
        }
      >

        {/* ==========================================
            HEADER
        ========================================== */}

        <div>
          <h1
            className={
              styles.pageTitle
            }
          >
            Dashboard
          </h1>

          <p
            className={
              styles.pageDescription
            }
          >
            Welcome back, here's your property overview
          </p>
        </div>


        {/* ==========================================
            ANALYTICS
        ========================================== */}

        <div
          className={
            styles.analyticsGrid
          }
        >

          <AnalyticsCard
            title="Total Revenue"
            value={formatMoney(
              totalRevenue
            )}
            icon={
              <FiDollarSign />
            }
          />


          <AnalyticsCard
            title="Active Tenants"
            value={
              activeTenants
            }
            icon={
              <FiUsers />
            }
          />


          <AnalyticsCard
            title="Pending Payments"
            value={formatMoney(
              pendingAmount
            )}
            icon={
              <FiClock />
            }
          />


          <AnalyticsCard
            title="Overdue Payments"
            value={formatMoney(
              overdueAmount
            )}
            icon={
              <FiAlertTriangle />
            }
          />

        </div>


        {/* ==========================================
            PENDING PAYMENTS

            IMPORTANT:
            PendingPayments itself reduces the list
            to one payment per tenant.
        ========================================== */}

        <PendingPayments
          payments={
            pendingPayments
          }
        />


        {/* ==========================================
            OVERDUE PAYMENTS
        ========================================== */}

        <OverduePayments
          payments={
            overduePayments
          }
        />


        {/* ==========================================
            RECENT PAYMENTS
        ========================================== */}

        <RecentPayments
          payments={
            payments
          }
        />


        {/* ==========================================
            UPCOMING DEADLINES
        ========================================== */}

        <UpcomingDeadlines
          deadlines={
            upcomingDeadlines
          }

        />

      </div>
    </div>
  );
}

