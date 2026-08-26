import React, {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  FiCheck,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";

import {
  useNavigate,
  useOutletContext,
} from "react-router-dom";

import styles from "../css/TenantDashboard.module.css";


const API_URL =
  "http://localhost:5000";


// =====================================================
// TENANT DASHBOARD
// =====================================================

export default function TenantDashboard() {

  const navigate =
    useNavigate();

  const { user } =
    useOutletContext();


  // =====================================================
  // STATE
  // =====================================================

  const [
    dashboardData,
    setDashboardData,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  /*
   * IMPORTANT:
   *
   * null means NO payment is currently being processed.
   *
   * We store the payment ID instead of a simple boolean
   * so that only the clicked payment shows "Processing..."
   */

  const [
    processingPaymentId,
    setProcessingPaymentId,
  ] = useState(null);


  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  const loadDashboard =
    async () => {

      try {

        setLoading(true);

        setError("");


        const token =
          localStorage.getItem(
            "token"
          );


        if (!token) {

          navigate(
            "/",
            {
              replace: true,
            }
          );

          return;

        }


        console.log(
          "LOADING TENANT DASHBOARD..."
        );


        const response =
          await axios.get(
            `${API_URL}/tenant-dashboard-data`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        console.log(
          "TENANT DASHBOARD RESPONSE:",
          response.data
        );


        /*
         * Log the payment records specifically.
         */

        console.log(
          "TENANT PAYMENTS:",
          response.data?.payments
        );


        console.log(
          "TENANT PENDING PAYMENTS:",
          response.data?.pendingPayments
        );


        console.log(
          "TENANT OVERDUE PAYMENTS:",
          response.data?.overduePayments
        );


        /*
         * Check whether payment IDs actually exist.
         */

        if (
          Array.isArray(
            response.data?.payments
          )
        ) {

          response.data.payments.forEach(
            (payment) => {

              console.log(
                "PAYMENT RECORD:",
                {
                  id:
                    payment.id,

                  tenantId:
                    payment.tenantId,

                  amount:
                    payment.amount,

                  dueDate:
                    payment.dueDate,

                  status:
                    payment.status,
                }
              );

            }
          );

        }


        setDashboardData(
          response.data
        );

      } catch (err) {

        console.error(
          "TENANT DASHBOARD ERROR:",
          err
        );


        console.error(
          "SERVER RESPONSE:",
          err.response?.data
        );


        /*
         * UNAUTHORIZED
         */

        if (
          err.response?.status ===
          401
        ) {

          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );


          navigate(
            "/",
            {
              replace: true,
            }
          );

          return;

        }


        /*
         * TENANT NOT FOUND
         */

        if (
          err.response?.status ===
          404
        ) {

          setError(
            err.response?.data?.message ||
            "Your tenant account could not be found."
          );

          return;

        }


        /*
         * FORBIDDEN
         */

        if (
          err.response?.status ===
          403
        ) {

          setError(
            err.response?.data?.message ||
            "You do not have access to the tenant dashboard."
          );

          return;

        }


        /*
         * GENERAL ERROR
         */

        setError(
          err.response?.data?.message ||
          "Failed to load tenant dashboard data."
        );

      } finally {

        setLoading(false);

      }

    };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(
    () => {

      loadDashboard();

    },
    [navigate]
  );


  // =====================================================
  // PAY PAYMENT
  // =====================================================

  const handlePayment =
    async (payment) => {

      console.log(
        "PAY BUTTON CLICKED:",
        payment
      );


      // =================================================
      // PAYMENT ID CHECK
      // =================================================

      if (
        !payment?.id
      ) {

        console.error(
          "Payment is missing an ID:",
          payment
        );


        setError(
          "This payment cannot be processed because the payment ID is missing."
        );


        return;

      }


      // =================================================
      // PREVENT DOUBLE CLICK
      // =================================================

      if (
        processingPaymentId ===
        payment.id
      ) {

        console.log(
          "Payment is already being processed:",
          payment.id
        );


        return;

      }


      try {

        /*
         * ONLY NOW do we set processing state.
         *
         * This is why the button will NOT show
         * "Processing..." when the dashboard first loads.
         */

        setProcessingPaymentId(
          payment.id
        );


        setError("");


        console.log(
          "STARTING PAYMENT:",
          {
            paymentId:
              payment.id,

            amount:
              payment.amount,

            status:
              payment.status,

            dueDate:
              payment.dueDate,
          }
        );


        // =================================================
        // TOKEN
        // =================================================

        const token =
          localStorage.getItem(
            "token"
          );


        if (!token) {

          navigate(
            "/",
            {
              replace: true,
            }
          );


          return;

        }


        // =================================================
        // INITIALIZE PAYSTACK PAYMENT
        // =================================================

        console.log(
          "INITIALIZING PAYSTACK PAYMENT..."
        );


        const response =
          await axios.post(
            `${API_URL}/payments/initialize`,
            {
              paymentId:
                payment.id,
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        console.log(
          "PAYSTACK INITIALIZATION RESPONSE:",
          response.data
        );


        // =================================================
        // GET AUTHORIZATION URL
        // =================================================

        const authorizationUrl =
          response.data
            ?.authorization_url ||
          response.data
            ?.data
            ?.authorization_url;


        if (
          !authorizationUrl
        ) {

          console.error(
            "Paystack authorization URL missing:",
            response.data
          );


          throw new Error(
            "Paystack authorization URL was not returned."
          );

        }


        console.log(
          "REDIRECTING TO PAYSTACK:",
          authorizationUrl
        );


        /*
         * Redirect tenant to Paystack.
         */

        window.location.href =
          authorizationUrl;


        /*
         * We intentionally do not manually set
         * processingPaymentId back to null here.
         *
         * The browser is navigating away to Paystack.
         */

      } catch (err) {

        console.error(
          "PAYMENT INITIALIZATION ERROR:",
          err
        );


        console.error(
          "PAYMENT SERVER RESPONSE:",
          err.response?.data
        );


        setError(
          err.response?.data?.message ||
          err.message ||
          "Unable to initialize payment."
        );


        /*
         * Payment failed to initialize,
         * therefore allow the user to click again.
         */

        setProcessingPaymentId(
          null
        );

      }

    };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div
        className={
          styles.dashboardContainer
        }
      >

        <div
          className={
            styles.loadingContainer
          }
        >

          <div
            className={
              styles.loadingSpinner
            }
          />

          <p>
            Loading your dashboard...
          </p>

        </div>

      </div>

    );

  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {

    return (

      <div
        className={
          styles.dashboardContainer
        }
      >

        <div
          className={
            styles.errorContainer
          }
        >

          <div
            className={
              styles.errorIcon
            }
          >

            <FiAlertCircle
              size={28}
            />

          </div>


          <h2>
            Unable to load dashboard
          </h2>


          <p>
            {error}
          </p>


          <button
            type="button"
            className={
              styles.retryButton
            }
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


  // =====================================================
  // NO DATA
  // =====================================================

  if (!dashboardData) {

    return (

      <div
        className={
          styles.dashboardContainer
        }
      >

        <div
          className={
            styles.emptyState
          }
        >

          <FiAlertCircle
            size={32}
          />


          <h2>
            No dashboard data
          </h2>


          <p>
            There is currently no
            dashboard information
            available.
          </p>

        </div>

      </div>

    );

  }


  // =====================================================
  // DATA
  // =====================================================

  const tenant =
    dashboardData.tenant ||
    {};


  const payments =
    Array.isArray(
      dashboardData.payments
    )
      ? dashboardData.payments
      : [];


  const apiPendingPayments =
    Array.isArray(
      dashboardData.pendingPayments
    )
      ? dashboardData.pendingPayments
      : [];


  const apiOverduePayments =
    Array.isArray(
      dashboardData.overduePayments
    )
      ? dashboardData.overduePayments
      : [];


  const apiRecentPayments =
    Array.isArray(
      dashboardData.recentPayments
    )
      ? dashboardData.recentPayments
      : [];


  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const formatMoney =
    (amount) => {

      const value =
        Number(
          amount || 0
        );


      return `$${value.toLocaleString(
        "en-US",
        {
          minimumFractionDigits:
            0,

          maximumFractionDigits:
            2,
        }
      )}`;

    };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate =
    (date) => {

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
          month:
            "short",

          day:
            "numeric",

          year:
            "numeric",
        }
      );

    };


  // =====================================================
  // PAYMENT STATUS
  // =====================================================

  const getPaymentStatus =
    (payment) => {

      return (
        payment?.status ||
        "pending"
      ).toLowerCase();

    };


  // =====================================================
  // PAID PAYMENTS
  // =====================================================

  const paidPayments =
    payments.filter(
      (payment) =>
        getPaymentStatus(
          payment
        ) === "paid"
    );


  // =====================================================
  // PENDING PAYMENTS
  // =====================================================

  const pendingPayments =
    apiPendingPayments.length >
    0
      ? apiPendingPayments
      : payments.filter(
          (payment) =>
            getPaymentStatus(
              payment
            ) === "pending"
        );


  // =====================================================
  // OVERDUE PAYMENTS
  // =====================================================

  const overduePayments =
    apiOverduePayments.length >
    0
      ? apiOverduePayments
      : payments.filter(
          (payment) =>
            getPaymentStatus(
              payment
            ) === "overdue"
        );


  // =====================================================
  // TOTAL PAID
  // =====================================================

  const totalPaid =
    paidPayments.reduce(
      (
        total,
        payment
      ) => {

        return (
          total +
          Number(
            payment.amount ||
            payment.rent ||
            0
          )
        );

      },
      0
    );


  // =====================================================
  // TOTAL PENDING
  // =====================================================

  const totalPending =
    pendingPayments.reduce(
      (
        total,
        payment
      ) => {

        return (
          total +
          Number(
            payment.amount ||
            payment.rent ||
            0
          )
        );

      },
      0
    );


  // =====================================================
  // TOTAL OVERDUE
  // =====================================================

  const totalOverdue =
    overduePayments.reduce(
      (
        total,
        payment
      ) => {

        return (
          total +
          Number(
            payment.amount ||
            payment.rent ||
            0
          )
        );

      },
      0
    );


  // =====================================================
  // DISPLAY NAME
  // =====================================================

  const displayName =
    tenant.name ||
    user?.name ||
    user?.email ||
    "Tenant";


  // =====================================================
  // APARTMENT
  // =====================================================

  const apartment =
    tenant.apartment ||
    "Apartment";


  // =====================================================
  // PAYMENT DATE
  // =====================================================

  const getPaymentDate =
    (payment) => {

      return (
        payment.date ||
        payment.paymentDate ||
        payment.payment_date ||
        payment.dueDate ||
        payment.due_date
      );

    };


  // =====================================================
  // PAYMENT AMOUNT
  // =====================================================

  const getPaymentAmount =
    (payment) => {

      return (
        payment.amount ||
        payment.rent ||
        0
      );

    };


  // =====================================================
  // PAYMENT DESCRIPTION
  // =====================================================

  const getPaymentDescription =
    (payment) => {

      return (
        payment.description ||
        payment.title ||
        "Rent Payment"
      );

    };


  // =====================================================
  // OVERDUE NOTE
  // =====================================================

  const getOverdueNote =
    (payment) => {

      if (
        payment.note
      ) {

        return payment.note;

      }


      if (
        payment.daysOverdue
      ) {

        return `${payment.daysOverdue} days overdue`;

      }


      if (
        payment.days_overdue
      ) {

        return `${payment.days_overdue} days overdue`;

      }


      /*
       * Your API currently uses daysUntilDue.
       */

      if (
        typeof payment.daysUntilDue ===
        "number" &&
        payment.daysUntilDue < 0
      ) {

        return `${Math.abs(
          payment.daysUntilDue
        )} days overdue`;

      }


      return null;

    };


  // =====================================================
  // BUTTON STATE
  // =====================================================

  const isProcessing =
    (payment) => {

      return (
        processingPaymentId !==
          null &&
        Number(
          processingPaymentId
        ) ===
          Number(
            payment?.id
          )
      );

    };


  // =====================================================
  // DASHBOARD
  // =====================================================

  return (

    <div
      className={
        styles.dashboardContainer
      }
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className={
          styles.header
        }
      >

        <h1
          className={
            styles.title
          }
        >
          Payment History
        </h1>


        <p
          className={
            styles.subtitle
          }
        >
          Welcome back,{" "}
          {displayName}. View your
          rent payments and upcoming
          dues.
        </p>

      </div>


      {/* =================================================
          SUMMARY METRICS
      ================================================= */}

      <div
        className={
          styles.summaryGrid
        }
      >

        {/* TOTAL PAID */}

        <div
          className={
            styles.summaryCard
          }
        >

          <div>

            <p
              className={
                styles.summaryLabel
              }
            >
              Total Paid
            </p>


            <p
              className={
                styles.summaryAmount
              }
            >
              {formatMoney(
                totalPaid
              )}
            </p>

          </div>


          <FiCheck
            size={20}
            className={
              styles.iconSuccess
            }
          />

        </div>


        {/* PENDING */}

        <div
          className={
            styles.summaryCard
          }
        >

          <div>

            <p
              className={
                styles.summaryLabel
              }
            >
              Pending
            </p>


            <p
              className={
                styles.summaryAmount
              }
            >
              {formatMoney(
                totalPending
              )}
            </p>

          </div>


          <FiClock
            size={20}
            className={
              styles.iconPending
            }
          />

        </div>


        {/* OVERDUE */}

        <div
          className={
            styles.summaryCard
          }
        >

          <div>

            <p
              className={
                styles.summaryLabel
              }
            >
              Overdue
            </p>


            <p
              className={
                styles.summaryAmount
              }
            >
              {formatMoney(
                totalOverdue
              )}
            </p>

          </div>


          <FiAlertCircle
            size={20}
            className={
              styles.iconOverdue
            }
          />

        </div>

      </div>


      {/* =================================================
          PAID PAYMENTS
      ================================================= */}

      <div
        className={
          styles.section
        }
      >

        <h2
          className={
            styles.sectionTitle
          }
        >

          <FiCheck
            size={18}
            className={
              styles.iconSuccess
            }
          />

          Paid Payments


          <span
            className={
              styles.countBadge
            }
          >
            ({paidPayments.length})
          </span>

        </h2>


        {paidPayments.length ===
        0 ? (

          <div
            className={
              styles.emptyState
            }
          >

            <p>
              No paid payments yet.
            </p>

          </div>

        ) : (

          <div
            className={
              styles.cardsGrid
            }
          >

            {paidPayments.map(
              (
                item,
                index
              ) => (

                <div
                  key={
                    item.id ||
                    index
                  }
                  className={
                    styles.card
                  }
                >

                  <div
                    className={
                      styles.cardHeader
                    }
                  >

                    <div>

                      <p
                        className={
                          styles.property
                        }
                      >
                        {
                          item.apartment ||
                          item.apt ||
                          apartment
                        }
                      </p>


                      <p
                        className={
                          styles.amount
                        }
                      >
                        {formatMoney(
                          getPaymentAmount(
                            item
                          )
                        )}
                      </p>

                    </div>


                    <div
                      className={
                        styles.badgeSuccess
                      }
                    >

                      <FiCheck
                        size={12}
                      />

                    </div>

                  </div>


                  <p
                    className={
                      styles.date
                    }
                  >
                    {formatDate(
                      getPaymentDate(
                        item
                      )
                    )}
                  </p>

                </div>

              )
            )}

          </div>

        )}

      </div>


      {/* =================================================
          PENDING PAYMENTS
      ================================================= */}

      <div
        className={
          styles.section
        }
      >

        <h2
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
            ({pendingPayments.length})
          </span>

        </h2>


        {pendingPayments.length ===
        0 ? (

          <div
            className={
              styles.emptyState
            }
          >

            <p>
              No pending payments.
            </p>

          </div>

        ) : (

          <div
            className={
              styles.cardsGrid
            }
          >

            {pendingPayments.map(
              (
                item,
                index
              ) => {

                const processing =
                  isProcessing(
                    item
                  );


                return (

                  <div
                    key={
                      item.id ||
                      index
                    }
                    className={
                      styles.card
                    }
                  >

                    <div
                      className={
                        styles.cardHeader
                      }
                    >

                      <div>

                        <p
                          className={
                            styles.property
                          }
                        >
                          {
                            item.apartment ||
                            item.apt ||
                            apartment
                          }
                        </p>


                        <p
                          className={
                            styles.amount
                          }
                        >
                          {formatMoney(
                            getPaymentAmount(
                              item
                            )
                          )}
                        </p>

                      </div>


                      <div
                        className={
                          styles.badgePending
                        }
                      >

                        <FiClock
                          size={12}
                        />

                      </div>

                    </div>


                    <p
                      className={
                        styles.date
                      }
                    >
                      {formatDate(
                        getPaymentDate(
                          item
                        )
                      )}
                    </p>


                    <button
                      type="button"
                      className={
                        styles.payButton
                      }
                      disabled={
                        processing
                      }
                      onClick={() =>
                        handlePayment(
                          item
                        )
                      }
                    >

                      {processing
                        ? "Processing..."
                        : "Pay Now"}

                    </button>

                  </div>

                );

              }
            )}

          </div>

        )}

      </div>


      {/* =================================================
          OVERDUE PAYMENTS
      ================================================= */}

      <div
        className={
          styles.section
        }
      >

        <h2
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
            ({overduePayments.length})
          </span>

        </h2>


        {overduePayments.length ===
        0 ? (

          <div
            className={
              styles.emptyState
            }
          >

            <p>
              No overdue payments.
            </p>

          </div>

        ) : (

          <div
            className={
              styles.cardsGrid
            }
          >

            {overduePayments.map(
              (
                item,
                index
              ) => {

                const overdueNote =
                  getOverdueNote(
                    item
                  );


                const processing =
                  isProcessing(
                    item
                  );


                return (

                  <div
                    key={
                      item.id ||
                      index
                    }
                    className={
                      styles.card
                    }
                  >

                    <div
                      className={
                        styles.cardHeader
                      }
                    >

                      <div>

                        <p
                          className={
                            styles.property
                          }
                        >
                          {
                            item.apartment ||
                            item.apt ||
                            apartment
                          }
                        </p>


                        <p
                          className={
                            styles.amount
                          }
                        >
                          {formatMoney(
                            getPaymentAmount(
                              item
                            )
                          )}
                        </p>

                      </div>


                      <div
                        className={
                          styles.badgeOverdue
                        }
                      >

                        <FiAlertCircle
                          size={12}
                        />

                      </div>

                    </div>


                    <p
                      className={
                        styles.date
                      }
                    >
                      {formatDate(
                        getPaymentDate(
                          item
                        )
                      )}
                    </p>


                    {overdueNote && (

                      <p
                        className={
                          styles.overdueText
                        }
                      >
                        {overdueNote}
                      </p>

                    )}


                    <button
                      type="button"
                      className={
                        styles.payImmediateButton
                      }
                      disabled={
                        processing
                      }
                      onClick={() =>
                        handlePayment(
                          item
                        )
                      }
                    >

                      {processing
                        ? "Processing..."
                        : "Pay Immediately"}

                    </button>

                  </div>

                );

              }
            )}

          </div>

        )}

      </div>

    </div>

  );

}