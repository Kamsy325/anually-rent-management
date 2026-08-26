// =====================================================
// PAYMENT CALCULATION UTILITIES
// =====================================================

/**
 * Convert a database date into a valid Date.
 *
 * Expected format:
 * YYYY-MM-DD
 */
export function parseDate(dateValue) {
  if (!dateValue) {
    return null;
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}


// =====================================================
// ADD PAYMENT INTERVAL
// =====================================================

export function addPaymentInterval(
  dateValue,
  interval
) {
  const date = parseDate(dateValue);

  if (!date) {
    return null;
  }

  const result = new Date(date);

  const normalizedInterval =
    String(interval || "monthly")
      .toLowerCase()
      .trim();


  // ---------------------------------------------------
  // MONTHLY
  // ---------------------------------------------------

  if (
    normalizedInterval === "monthly" ||
    normalizedInterval === "month"
  ) {
    result.setDate(
      result.getDate() + 30
    );

    return result;
  }


  // ---------------------------------------------------
  // ANNUAL
  // ---------------------------------------------------

  if (
    normalizedInterval === "annual" ||
    normalizedInterval === "annually" ||
    normalizedInterval === "yearly" ||
    normalizedInterval === "year"
  ) {
    result.setFullYear(
      result.getFullYear() + 1
    );

    return result;
  }


  // ---------------------------------------------------
  // DEFAULT
  // ---------------------------------------------------

  result.setDate(
    result.getDate() + 30
  );

  return result;
}


// =====================================================
// FORMAT DATE
// Example:
// June 3rd, 2026
// =====================================================

export function formatDate(
  dateValue
) {
  const date = parseDate(dateValue);

  if (!date) {
    return "Invalid date";
  }

  const day =
    date.getDate();

  let suffix = "th";

  if (
    day % 100 >= 11 &&
    day % 100 <= 13
  ) {
    suffix = "th";
  } else if (day % 10 === 1) {
    suffix = "st";
  } else if (day % 10 === 2) {
    suffix = "nd";
  } else if (day % 10 === 3) {
    suffix = "rd";
  }

  const month =
    date.toLocaleString(
      "en-US",
      {
        month: "long",
      }
    );

  const year =
    date.getFullYear();

  return `${month} ${day}${suffix}, ${year}`;
}


// =====================================================
// START OF TODAY
// =====================================================

export function startOfToday() {
  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  return today;
}


// =====================================================
// DAYS BETWEEN DATES
// =====================================================

export function daysBetween(
  fromDate,
  toDate
) {
  const from =
    parseDate(fromDate);

  const to =
    parseDate(toDate);

  if (!from || !to) {
    return null;
  }

  from.setHours(
    0,
    0,
    0,
    0
  );

  to.setHours(
    0,
    0,
    0,
    0
  );

  const difference =
    to.getTime() -
    from.getTime();

  return Math.round(
    difference /
      (1000 * 60 * 60 * 24)
  );
}


// =====================================================
// CALCULATE NEXT PAYMENT
// =====================================================
//
// We start from lease_ends and keep advancing
// according to the tenant's payment interval until
// the payment date is today or in the future.
//
// Example:
//
// lease_ends = 2026-01-01
// interval   = monthly
//
// next payment:
// 2026-01-31
// 2026-03-02
// etc.
//
// =====================================================

export function calculateNextPayment(
  tenant
) {
  if (!tenant) {
    return null;
  }

  const leaseEnd =
    parseDate(
      tenant.lease_ends ||
      tenant.leaseEnds
    );

  if (!leaseEnd) {
    return null;
  }

  const interval =
    tenant.lease_interval ||
    tenant.leaseInterval ||
    "monthly";

  const today =
    startOfToday();

  let nextPayment =
    new Date(leaseEnd);

  /*
   * Keep advancing the payment date until
   * we reach today or a future date.
   */

  let safetyCounter = 0;

  while (
    nextPayment < today &&
    safetyCounter < 1000
  ) {
    nextPayment =
      addPaymentInterval(
        nextPayment,
        interval
      );

    safetyCounter++;
  }

  return nextPayment;
}


// =====================================================
// CALCULATE PAYMENT STATUS
// =====================================================
//
// No real payment system exists yet.
//
// Therefore:
// - Future = pending
// - Due today = pending
// - 1-7 days late = pending
// - More than 7 days late = overdue
//
// =====================================================

export function calculatePaymentStatus(
  dueDate
) {
  const due =
    parseDate(dueDate);

  if (!due) {
    return "Pending";
  }

  const today =
    startOfToday();

  due.setHours(
    0,
    0,
    0,
    0
  );

  const difference =
    Math.round(
      (
        today.getTime() -
        due.getTime()
      ) /
        (1000 * 60 * 60 * 24)
    );


  // Future payment
  if (difference < 0) {
    return "Pending";
  }


  // Due today
  if (difference === 0) {
    return "Pending";
  }


  // 1-7 days late
  if (difference <= 7) {
    return "Pending";
  }


  // More than 7 days late
  return "Overdue";
}


// =====================================================
// BUILD PAYMENT RECORD
// =====================================================

export function createPaymentRecord(
  tenant
) {
  const nextPayment =
    calculateNextPayment(
      tenant
    );

  if (!nextPayment) {
    return null;
  }

  const status =
    calculatePaymentStatus(
      nextPayment
    );

  const rent =
    Number(
      tenant.rent
    );

  return {
    id:
      `${tenant.id}-${nextPayment.getTime()}`,

    tenantId:
      tenant.id,

    tenant:
      tenant.name ||
      "Unknown Tenant",

    apartment:
      tenant.apartment ||
      "No apartment",

    amount:
      Number.isFinite(rent)
        ? rent
        : 0,

    dueDate:
      nextPayment,

    date:
      formatDate(
        nextPayment
      ),

    status:
      status.toLowerCase(),

    interval:
      tenant.lease_interval ||
      tenant.leaseInterval ||
      "monthly",
  };
}


// =====================================================
// GET UPCOMING PAYMENTS
// =====================================================
//
// Returns payments whose due date is within the
// next 30 days.
//
// =====================================================

export function getUpcomingPayments(
  tenants,
  days = 30
) {
  if (!Array.isArray(tenants)) {
    return [];
  }

  const today =
    startOfToday();

  const endDate =
    new Date(today);

  endDate.setDate(
    endDate.getDate() + days
  );


  return tenants
    .map((tenant) =>
      createPaymentRecord(
        tenant
      )
    )
    .filter(Boolean)
    .filter(
      (payment) =>
        payment.dueDate >= today &&
        payment.dueDate <= endDate
    )
    .sort(
      (a, b) =>
        a.dueDate -
        b.dueDate
    );
}


// =====================================================
// GET RECENT PAYMENT OBLIGATIONS
// =====================================================
//
// Since actual payments do not exist yet, this returns
// the five most recent calculated payment obligations.
//
// =====================================================

export function getRecentPayments(
  tenants,
  limit = 5
) {
  if (!Array.isArray(tenants)) {
    return [];
  }

  return tenants
    .map((tenant) =>
      createPaymentRecord(
        tenant
      )
    )
    .filter(Boolean)
    .sort(
      (a, b) =>
        b.dueDate -
        a.dueDate
    )
    .slice(0, limit);
}


// =====================================================
// FORMAT MONEY
// =====================================================

export function formatMoney(
  amount
) {
  const value =
    Number(amount);

  if (!Number.isFinite(value)) {
    return "$0";
  }

  return `$${value.toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  )}`;
}