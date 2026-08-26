import React, {
  useMemo,
  useState,
} from "react";

import {
  LuSearch,
  LuFilter,
  LuEllipsisVertical,
  LuMail,
  LuPhone,
  LuCalendar,
} from "react-icons/lu";

import {
  useOutletContext,
} from "react-router-dom";

import styles from "../css/Tenant.module.css";


// ==================================================
// STATUS CLASSES
// ==================================================

const statusClass = {
  Paid: styles.statusPaid,
  Pending: styles.statusPending,
  Overdue: styles.statusOverdue,
};


// ==================================================
// FORMAT LEASE END DATE
// Example:
// 2026-06-03
// becomes:
// June 3rd, 2026
// ==================================================

function formatLeaseDate(dateValue) {

  if (!dateValue) {
    return "Not specified";
  }


  // ------------------------------------------
  // Convert database date to Date
  // ------------------------------------------

  const date =
    new Date(dateValue);


  // ------------------------------------------
  // Invalid date protection
  // ------------------------------------------

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not specified";
  }


  // ------------------------------------------
  // Get date parts
  // ------------------------------------------

  const month =
    date.toLocaleString(
      "en-US",
      {
        month: "long",
        timeZone: "UTC",
      }
    );


  const day =
    date.getUTCDate();


  const year =
    date.getUTCFullYear();


  // ------------------------------------------
  // Ordinal suffix
  // ------------------------------------------

  let suffix = "th";


  if (
    day % 100 >= 11 &&
    day % 100 <= 13
  ) {

    suffix = "th";

  } else {

    switch (day % 10) {

      case 1:
        suffix = "st";
        break;

      case 2:
        suffix = "nd";
        break;

      case 3:
        suffix = "rd";
        break;

      default:
        suffix = "th";

    }

  }


  return `${month} ${day}${suffix}, ${year}`;
}


// ==================================================
// TENANT CARD
// ==================================================

function TenantCard({
  tenant,
  onEdit,
  onDelete,
}) {

  const [
    showMenu,
    setShowMenu,
  ] = useState(false);


  // ==================================================
  // TENANT NAME
  // ==================================================

  const tenantName =
    tenant?.name ||
    `${tenant?.firstName || ""} ${
      tenant?.lastName || ""
    }`.trim() ||
    "Tenant";


  // ==================================================
  // AVATAR
  // ==================================================

  const avatarLetter =
    tenantName
      .charAt(0)
      .toUpperCase();


  // ==================================================
  // RENT
  // ==================================================

  const numericRent =
    Number(tenant?.rent);


  const rent =
    Number.isFinite(numericRent)
      ? `$${numericRent.toLocaleString()}`
      : "$0";


  // ==================================================
  // STATUS
  // ==================================================

  const status =
    tenant?.status || "Pending";


  // ==================================================
  // LEASE END
  // ==================================================

  const leaseEnds =
    tenant?.leaseEnds ||
    tenant?.lease_ends ||
    null;


  const formattedLeaseEnds =
    formatLeaseDate(
      leaseEnds
    );


  // ==================================================
  // EDIT
  // ==================================================

  const handleEdit = () => {

    setShowMenu(false);

    if (onEdit) {
      onEdit(tenant);
    }

  };


  // ==================================================
  // DELETE
  // ==================================================

  const handleDelete = () => {

    setShowMenu(false);

    if (onDelete) {
      onDelete(tenant);
    }

  };


  return (

    <div
      className={
        styles.tenantCard
      }
    >

      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        className={
          styles.cardHeader
        }
      >

        <div
          className={
            styles.tenantIdentity
          }
        >

          <div
            className={
              styles.avatar
            }
          >
            {avatarLetter}
          </div>


          <div>

            <p
              className={
                styles.tenantName
              }
            >
              {tenantName}
            </p>


            <p
              className={
                styles.apartment
              }
            >
              {tenant?.apartment ||
                "No apartment"}
            </p>

          </div>

        </div>


        {/* ==================================================
            OPTIONS
        ================================================== */}

        <div
          style={{
            position: "relative",
          }}
        >

          <button
            className={
              styles.moreButton
            }
            type="button"
            aria-label={
              `More options for ${tenantName}`
            }
            onClick={() =>
              setShowMenu(
                (previous) =>
                  !previous
              )
            }
          >

            <LuEllipsisVertical
              size={18}
              strokeWidth={2.67}
            />

          </button>


          {showMenu && (

            <div
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                zIndex: 20,
                background: "#fff",
                border:
                  "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "6px",
                minWidth: "120px",
                boxShadow:
                  "0 8px 20px rgba(0,0,0,0.1)",
              }}
            >

              <button
                type="button"
                onClick={
                  handleEdit
                }
                style={{
                  display: "block",
                  width: "100%",
                  padding:
                    "8px 10px",
                  border: "none",
                  background:
                    "transparent",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                Edit
              </button>


              <button
                type="button"
                onClick={
                  handleDelete
                }
                style={{
                  display: "block",
                  width: "100%",
                  padding:
                    "8px 10px",
                  border: "none",
                  background:
                    "transparent",
                  textAlign: "left",
                  cursor: "pointer",
                  color: "#dc2626",
                }}
              >
                Delete
              </button>

            </div>

          )}

        </div>

      </div>


      {/* ==================================================
          CONTACT DETAILS
      ================================================== */}

      <div
        className={
          styles.contactDetails
        }
      >

        <div
          className={
            styles.contactRow
          }
        >

          <LuMail
            size={14}
            strokeWidth={3.43}
          />

          <span
            className={
              styles.truncate
            }
          >
            {tenant?.email ||
              "No email"}
          </span>

        </div>


        <div
          className={
            styles.contactRow
          }
        >

          <LuPhone
            size={14}
            strokeWidth={3.43}
          />

          <span>
            {tenant?.phone ||
              "No phone"}
          </span>

        </div>

      </div>


      {/* ==================================================
          PAYMENT
      ================================================== */}

      <div
        className={
          styles.paymentRow
        }
      >

        <div>

          <p
            className={
              styles.rentLabel
            }
          >
            Monthly Rent
          </p>


          <p
            className={
              styles.rentAmount
            }
          >
            {rent}
          </p>

        </div>


        <div
          className={
            statusClass[status] ||
            styles.statusPending
          }
        >
          {status}
        </div>

      </div>


      {/* ==================================================
          LEASE
      ================================================== */}

      <div
        className={
          styles.leaseInfo
        }
      >

        <LuCalendar
          size={14}
          strokeWidth={3.43}
        />

        <span>
          Lease ends:{" "}
          {formattedLeaseEnds}
        </span>

      </div>

    </div>

  );

}


// ==================================================
// TENANTS PAGE
// ==================================================

export default function Tenants() {

  const context =
    useOutletContext();


  const {
    tenants = [],
    tenantsLoading = false,
    openEditTenant,
    openDeleteTenant,
  } = context || {};


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    filter,
    setFilter,
  ] = useState("All");


  // ==================================================
  // FILTER TENANTS
  // ==================================================

  const filteredTenants =
    useMemo(() => {

      const searchValue =
        search
          .toLowerCase()
          .trim();


      return tenants.filter(
        (tenant) => {

          const name =
            tenant?.name ||
            `${tenant?.firstName || ""} ${
              tenant?.lastName || ""
            }`.trim();


          const matchesSearch =
            !searchValue ||

            name
              .toLowerCase()
              .includes(
                searchValue
              ) ||

            tenant?.email
              ?.toLowerCase()
              .includes(
                searchValue
              ) ||

            tenant?.phone
              ?.toLowerCase()
              .includes(
                searchValue
              ) ||

            tenant?.apartment
              ?.toLowerCase()
              .includes(
                searchValue
              );


          const matchesFilter =
            filter === "All" ||
            tenant?.status === filter;


          return (
            matchesSearch &&
            matchesFilter
          );

        }
      );

    }, [
      tenants,
      search,
      filter,
    ]);


  // ==================================================
  // FILTER BUTTON
  // ==================================================

  const handleFilter = () => {

    setFilter(
      (current) => {

        if (current === "All") {
          return "Paid";
        }

        if (current === "Paid") {
          return "Pending";
        }

        if (current === "Pending") {
          return "Overdue";
        }

        return "All";

      }
    );

  };


  // ==================================================
  // PAGE
  // ==================================================

  return (

    <div
      className={
        styles.main
      }
    >

      <div
        className={
          styles.content
        }
      >

        <div
          className={
            styles.heading
          }
        >

          <h1>
            Tenants
          </h1>


          <p>
            Manage all your tenants
            and their payment information
          </p>

        </div>


        <div
          className={
            styles.toolbar
          }
        >

          <div
            className={
              styles.searchWrapper
            }
          >

            <LuSearch
              size={16}
              strokeWidth={3}
              className={
                styles.searchIcon
              }
            />


            <input
              type="text"
              placeholder="Search tenants..."
              className={
                styles.searchInput
              }
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>


          <button
            className={
              styles.filterButton
            }
            type="button"
            onClick={
              handleFilter
            }
          >

            <LuFilter
              size={16}
              strokeWidth={3}
            />

            <span>
              {filter === "All"
                ? "Filter"
                : filter}
            </span>

          </button>

        </div>


        {tenantsLoading ? (

          <div
            style={{
              padding: "40px",
              textAlign: "center",
            }}
          >
            Loading tenants...
          </div>

        ) : filteredTenants.length === 0 ? (

          <div
            style={{
              padding: "40px",
              textAlign: "center",
            }}
          >

            {search.trim()
              ? "No tenants match your search."
              : filter !== "All"
                ? `No ${filter.toLowerCase()} tenants.`
                : "You don't have any tenants yet."}

          </div>

        ) : (

          <div
            className={
              styles.tenantGrid
            }
          >

            {filteredTenants.map(
              (tenant) => (

                <TenantCard
                  key={
                    tenant.id
                  }
                  tenant={
                    tenant
                  }
                  onEdit={
                    openEditTenant
                  }
                  onDelete={
                    openDeleteTenant
                  }
                />

              )
            )}

          </div>

        )}

      </div>

    </div>

  );

}