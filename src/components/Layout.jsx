// components/Layout.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Outlet, useNavigate } from "react-router-dom";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import styles from "../css/Layout.module.css";

// Existing Modals
import AddTenantModal from "../Modals/AddTenantModal";
import EditTenantModal from "../Modals/EditTenantModal";
import DeleteTenantModal from "../Modals/DeleteTenantModal";
import EditProfileModal from "../Modals/EditProfileModal";
import LogoutModal from "../Modals/LogoutModal";
import PayoutConnectModal from "../Modals/PaystackConnectModal";

// Subscription Modals
import ChoosePlanModal from "../Modals/ChoosePlanModal";
import UpgradePlanModal from "../Modals/UpgradePlanModal";
import RenewPlanModal from "../Modals/RenewPlanModal";

// Legal Modals
import PrivacyPolicyModal from "../Modals/PrivacyPolicyModal";
import TermsOfUseModal from "../Modals/TermsOfUseModal";

const API_URL = "http://localhost:5000";

function Layout() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [tenants, setTenants] = useState([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);

  const [selectedTenant, setSelectedTenant] = useState(null);
  const [tenantToDelete, setTenantToDelete] = useState(null);

  // Standard Modals
  const [isAddTenantModal, setIsAddTenantModal] = useState(false);
  const [isEditTenantModal, setIsEditTenantModal] = useState(false);
  const [isDeleteTenantModal, setIsDeleteTenantModal] = useState(false);
  const [isEditProfileModal, setIsEditProfileModal] = useState(false);
  const [isLogoutModal, setIsLogoutModal] = useState(false);
  const [isPayoutConnectModal, setIsPayoutConnectModal] = useState(false);

  // Subscription Modals & Data State
  const [isChoosePlanModal, setIsChoosePlanModal] = useState(false);
  const [isUpgradePlanModal, setIsUpgradePlanModal] = useState(false);
  const [isRenewPlanModal, setIsRenewPlanModal] = useState(false);

  // Legal Modals State
  const [isPrivacyPolicyModal, setIsPrivacyPolicyModal] = useState(false);
  const [isTermsOfUseModal, setIsTermsOfUseModal] = useState(false);

  const [subscription, setSubscription] = useState({
    plan_type: "free",
    status: "active",
    current_period_end: null,
    isFirstLogin: false,
  });

  // Load User Authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      localStorage.clear();
      navigate("/", { replace: true });
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      const role = String(parsedUser?.role || "").trim().toLowerCase();

      if (role !== "landlord" && role !== "tenant") {
        localStorage.clear();
        navigate("/", { replace: true });
        return;
      }

      setUser({ ...parsedUser, role });
    } catch (error) {
      localStorage.clear();
      navigate("/", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // AUTO-OPEN EDIT PROFILE MODAL ON SIGNUP
  useEffect(() => {
    if (!loading && user) {
      const isNewUser = localStorage.getItem("isNewUser");
      if (isNewUser === "true") {
        setIsEditProfileModal(true);
        localStorage.removeItem("isNewUser");
      }
    }
  }, [loading, user]);

  // Fetch Landlord Subscription Status & Determine Triggers
  const fetchSubscriptionStatus = async () => {
    if (!user || user.role !== "landlord") return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/subscription/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sub = res.data;
      setSubscription(sub);

      const now = new Date();
      const periodEnd = sub.current_period_end ? new Date(sub.current_period_end) : null;

      if (sub.isFirstLogin || !sub.plan_type) {
        setIsChoosePlanModal(true);
      } else if (sub.plan_type !== "free" && periodEnd && periodEnd < now) {
        setIsRenewPlanModal(true);
      }
    } catch (err) {
      console.error("Failed to fetch subscription status:", err);
    }
  };

  useEffect(() => {
    if (!loading && user?.role === "landlord") {
      fetchSubscriptionStatus();
    }
  }, [loading, user]);

  const getTenants = async () => {
    if (!user || user.role !== "landlord") return;
    const token = localStorage.getItem("token");
    if (!token) return navigate("/", { replace: true });

    try {
      setTenantsLoading(true);
      const response = await axios.get(`${API_URL}/tenants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTenants(response.data?.tenants || []);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/", { replace: true });
      }
    } finally {
      setTenantsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user?.role === "landlord") {
      getTenants();
    }
  }, [loading, user]);

  // Handle Add Tenant
  const handleAddTenant = async (formData) => {
    if (!user || user.role !== "landlord") return;
    const token = localStorage.getItem("token");
    if (!token) return navigate("/", { replace: true });

    try {
      await axios.post(`${API_URL}/tenants`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await getTenants();
      setIsAddTenantModal(false);
      fetchSubscriptionStatus();
    } catch (error) {
      if (error.response?.data?.code === "TENANT_LIMIT_REACHED" || error.response?.status === 403) {
        setIsAddTenantModal(false);
        setIsUpgradePlanModal(true);
      } else {
        alert(error.response?.data?.message || "Failed to add tenant.");
      }
    }
  };

  // Handle Edit Tenant
  const handleEditTenant = async (updatedData) => {
    if (!selectedTenant?.id) return;
    const token = localStorage.getItem("token");

    try {
      await axios.put(`${API_URL}/tenants/${selectedTenant.id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await getTenants();
      setIsEditTenantModal(false);
      setSelectedTenant(null);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update tenant.");
    }
  };

  // Handle Delete Tenant
  const handleDeleteTenant = async () => {
    if (!tenantToDelete?.id) return;
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`${API_URL}/tenants/${tenantToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await getTenants();
      setIsDeleteTenantModal(false);
      setTenantToDelete(null);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete tenant.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className={styles.layout}>
      <Navbar
        setIsAddTenantModal={setIsAddTenantModal}
        onOpenUpgradeModal={() => setIsUpgradePlanModal(true)}
        user={user}
        tenants={tenants}
        subscription={subscription}
        onOpenTermsModal={() => setIsTermsOfUseModal(true)}
        onOpenPrivacyModal={() => setIsPrivacyPolicyModal(true)}
      />

      <div className={styles.layoutBody}>
        <Sidebar
          onPaymentClick={() => setIsPayoutConnectModal(true)}
          onLogoutClick={() => setIsLogoutModal(true)}
        />

        <main className={styles.main}>
          <Outlet
            context={{
              user,
              setUser,
              tenants,
              tenantsLoading,
              getTenants,
              setIsEditProfileModal,
              selectedTenant,
              setSelectedTenant,
              tenantToDelete,
              setTenantToDelete,
              openEditTenant: (t) => {
                setSelectedTenant(t);
                setIsEditTenantModal(true);
              },
              openDeleteTenant: (t) => {
                setTenantToDelete(t);
                setIsDeleteTenantModal(true);
              },
              subscription,
              openChoosePlanModal: () => setIsChoosePlanModal(true),
              openUpgradePlanModal: () => setIsUpgradePlanModal(true),
              openRenewPlanModal: () => setIsRenewPlanModal(true),
              openTermsModal: () => setIsTermsOfUseModal(true),
              openPrivacyModal: () => setIsPrivacyPolicyModal(true),
            }}
          />
        </main>
      </div>

      {/* STANDARD TENANT MODALS */}
      {user.role === "landlord" && (
        <>
          <AddTenantModal
            isAddTenantModal={isAddTenantModal}
            setIsAddTenantModal={setIsAddTenantModal}
            onSubmit={handleAddTenant}
          />

          <EditTenantModal
            isOpen={isEditTenantModal}
            onClose={() => {
              setIsEditTenantModal(false);
              setSelectedTenant(null);
            }}
            tenant={selectedTenant}
            onSubmit={handleEditTenant}
          />

          <DeleteTenantModal
            isOpen={isDeleteTenantModal}
            onClose={() => {
              setIsDeleteTenantModal(false);
              setTenantToDelete(null);
            }}
            tenant={tenantToDelete}
            onConfirm={handleDeleteTenant}
          />
        </>
      )}

      {/* SUBSCRIPTION MODALS */}
      <ChoosePlanModal
        isOpen={isChoosePlanModal}
        onClose={() => setIsChoosePlanModal(false)}
        currentPlan={subscription.plan_type}
        onPlanUpdated={fetchSubscriptionStatus}
      />

      <UpgradePlanModal
        isOpen={isUpgradePlanModal}
        onClose={() => setIsUpgradePlanModal(false)}
        currentPlan={subscription.plan_type}
      />

      <RenewPlanModal
        isOpen={isRenewPlanModal}
        onClose={() => setIsRenewPlanModal(false)}
        currentPlan={subscription.plan_type}
        expiryDate={subscription.current_period_end}
      />

      {/* USER & PAYOUT MODALS */}
      <EditProfileModal
        isEditProfileModal={isEditProfileModal}
        setIsEditProfileModal={setIsEditProfileModal}
        user={user}
        setUser={setUser}
      />

      <PayoutConnectModal
        isOpen={isPayoutConnectModal}
        setIsOpen={setIsPayoutConnectModal}
        user={user}
      />

      <LogoutModal
        isLogoutModal={isLogoutModal}
        setIsLogoutModal={setIsLogoutModal}
      />

      {/* LEGAL POLICY MODALS */}
      <PrivacyPolicyModal
        isOpen={isPrivacyPolicyModal}
        onClose={() => setIsPrivacyPolicyModal(false)}
      />

      <TermsOfUseModal
        isOpen={isTermsOfUseModal}
        onClose={() => setIsTermsOfUseModal(false)}
      />
    </div>
  );
}

export default Layout;