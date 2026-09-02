import React, { useEffect, useState } from "react";
import axios from "axios";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import styles from "../css/Layout.module.css";
import AddTenantModal from "../Modals/AddTenantModal";
import EditTenantModal from "../Modals/EditTenantModal";
import DeleteTenantModal from "../Modals/DeleteTenantModal";
import EditProfileModal from "../Modals/EditProfileModal";
import LogoutModal from "../Modals/LogoutModal";
import PayoutConnectModal from "../Modals/PaystackConnectModal";
import UpgradePlanModal from "../Modals/UpgradePlanModal";

const API_URL = "http://localhost:5000";

function Layout() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [tenantToDelete, setTenantToDelete] = useState(null);

  const [isPayoutConnected, setIsPayoutConnected] = useState(false);

  const [isAddTenantModal, setIsAddTenantModal] = useState(false);
  const [isEditTenantModal, setIsEditTenantModal] = useState(false);
  const [isDeleteTenantModal, setIsDeleteTenantModal] = useState(false);
  const [isEditProfileModal, setIsEditProfileModal] = useState(false);
  const [isLogoutModal, setIsLogoutModal] = useState(false);
  const [isPayoutConnectModal, setIsPayoutConnectModal] = useState(false);
  const [isUpgradeModal, setIsUpgradeModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/", { replace: true });
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      const role = String(parsedUser?.role || "").trim().toLowerCase();

      if (role !== "landlord" && role !== "tenant") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/", { replace: true });
        return;
      }

      setUser({ ...parsedUser, role });
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/", { replace: true });
      return;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const getTenants = async () => {
    if (!user || user.role !== "landlord") return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    try {
      setTenantsLoading(true);
      const response = await axios.get(`${API_URL}/tenants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTenants(response.data?.tenants || []);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/", { replace: true });
      }
    } finally {
      setTenantsLoading(false);
    }
  };

  const checkPayoutStatus = async () => {
    if (!user || user.role !== "landlord") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(`${API_URL}/paystack/payout`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const connected = Boolean(response.data?.connected);
      setIsPayoutConnected(connected);

      if (connected) {
        setUser((prev) => (prev ? { ...prev, paystack_connected: true } : prev));
      }
    } catch (error) {
      setIsPayoutConnected(false);
    }
  };

  const fetchSubscriptionStatus = async () => {
    if (!user || user.role !== "landlord") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(`${API_URL}/subscription/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser((prev) => {
        if (!prev) return prev;
        const updatedUser = { ...prev, subscription: response.data };

        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        storedUser.subscription = response.data;
        localStorage.setItem("user", JSON.stringify(storedUser));

        return updatedUser;
      });
    } catch (error) {
      console.error("Failed to fetch subscription status", error);
    }
  };

  useEffect(() => {
    if (!loading && user && user.role === "landlord") {
      getTenants();
      checkPayoutStatus();
      fetchSubscriptionStatus();
    }
  }, [loading, user?.id]);

  const handleOpenAddTenant = (value = true) => {
    if (value === false) {
      setIsAddTenantModal(false);
      return;
    }

    const hasPayout =
      isPayoutConnected ||
      Boolean(user?.paystack_subaccount_code) ||
      Boolean(user?.paystack_connected);

    if (!hasPayout) {
      setIsPayoutConnectModal(true);
      return;
    }

    const maxTenants = user?.subscription?.maxTenants ?? 5;
    if (maxTenants !== null && tenants.length >= maxTenants) {
      setIsUpgradeModal(true);
      return;
    }

    setIsAddTenantModal(true);
  };

  const handleTenantAdded = async (newTenant) => {
    if (newTenant) {
      setTenants((prev) => [newTenant, ...prev]);
    }
    await getTenants();
  };

  const handleOpenEditTenant = (tenant) => {
    setSelectedTenant(tenant);
    setIsEditTenantModal(true);
  };

  const handleCloseEditTenant = () => {
    setIsEditTenantModal(false);
    setSelectedTenant(null);
  };

  const handleEditTenant = async (formData) => {
    if (!user || user.role !== "landlord" || !selectedTenant) return;
    const token = localStorage.getItem("token");
    if (!token) return navigate("/", { replace: true });

    try {
      await axios.put(`${API_URL}/tenants/${selectedTenant.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await getTenants();
      handleCloseEditTenant();
    } catch (error) {
      throw error;
    }
  };

  const handleOpenDeleteTenant = (tenant) => {
    setTenantToDelete(tenant);
    setIsDeleteTenantModal(true);
  };

  const handleCloseDeleteTenant = () => {
    setIsDeleteTenantModal(false);
    setTenantToDelete(null);
  };

  const handleDeleteTenant = async () => {
    if (!user || user.role !== "landlord" || !tenantToDelete) return;
    const token = localStorage.getItem("token");
    if (!token) return navigate("/", { replace: true });

    try {
      await axios.delete(`${API_URL}/tenants/${tenantToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTenants((prev) =>
        prev.filter((tenant) => Number(tenant.id) !== Number(tenantToDelete.id))
      );
      handleCloseDeleteTenant();
    } catch (error) {
      throw error;
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          color: "#374151",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={styles.layout}>
      <Navbar
        setIsAddTenantModal={handleOpenAddTenant}
        onOpenPayoutModal={() => setIsPayoutConnectModal(true)}
        onOpenUpgradeModal={() => setIsUpgradeModal(true)}
        isPayoutConnected={isPayoutConnected}
        user={user}
        tenants={tenants}
        subscription={user?.subscription || { plan_type: "free" }}
        onLogoutClick={() => setIsLogoutModal(true)}
      />

      <div className={styles.layoutBody}>
        <Sidebar
          user={user}
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
              openEditTenant: handleOpenEditTenant,
              openDeleteTenant: handleOpenDeleteTenant,
            }}
          />
        </main>
      </div>

      <BottomNav
        user={user}
        setIsAddTenantModal={handleOpenAddTenant}
        onPaymentClick={() => setIsPayoutConnectModal(true)}
      />

      {user.role === "landlord" && (
        <>
          <AddTenantModal
            isAddTenantModal={isAddTenantModal}
            setIsAddTenantModal={setIsAddTenantModal}
            onTenantAdded={handleTenantAdded}
          />
          <EditTenantModal
            tenant={selectedTenant}
            isOpen={isEditTenantModal}
            onClose={handleCloseEditTenant}
            onSubmit={handleEditTenant}
          />
          <DeleteTenantModal
            tenant={tenantToDelete}
            isOpen={isDeleteTenantModal}
            onClose={handleCloseDeleteTenant}
            onConfirm={handleDeleteTenant}
          />
          <PayoutConnectModal
            isOpen={isPayoutConnectModal}
            setIsOpen={setIsPayoutConnectModal}
            user={user}
            onConnectedSuccess={() => {
              setIsPayoutConnected(true);
              checkPayoutStatus();
            }}
          />
          <EditProfileModal
            isEditProfileModal={isEditProfileModal}
            setIsEditProfileModal={setIsEditProfileModal}
            user={user}
            setUser={setUser}
          />
          <UpgradePlanModal
            isOpen={isUpgradeModal}
            onClose={() => setIsUpgradeModal(false)}
            currentPlan={user?.subscription?.plan_type || user?.subscription?.effective_plan || "free"}
          />
        </>
      )}

      <LogoutModal
        isLogoutModal={isLogoutModal}
        setIsLogoutModal={setIsLogoutModal}
      />
    </div>
  );
}

export default Layout;