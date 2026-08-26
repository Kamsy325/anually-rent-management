import React, {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  Outlet,
  useNavigate,
} from "react-router-dom";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

import styles from "../css/Layout.module.css";

import AddTenantModal from "../Modals/AddTenantModal";
import EditTenantModal from "../Modals/EditTenantModal";
import DeleteTenantModal from "../Modals/DeleteTenantModal";
import EditProfileModal from "../Modals/EditProfileModal";
import LogoutModal from "../Modals/LogoutModal";
import PayoutConnectModal from "../Modals/PaystackConnectModal";


const API_URL =
  "http://localhost:5000";


function Layout() {

  const navigate = useNavigate();


  // =====================================================
  // USER
  // =====================================================

  const [
    user,
    setUser,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  // =====================================================
  // TENANTS
  // =====================================================

  const [
    tenants,
    setTenants,
  ] = useState([]);


  const [
    tenantsLoading,
    setTenantsLoading,
  ] = useState(false);


  const [
    selectedTenant,
    setSelectedTenant,
  ] = useState(null);


  const [
    tenantToDelete,
    setTenantToDelete,
  ] = useState(null);


  // =====================================================
  // MODALS
  // =====================================================

  const [
    isAddTenantModal,
    setIsAddTenantModal,
  ] = useState(false);


  const [
    isEditTenantModal,
    setIsEditTenantModal,
  ] = useState(false);


  const [
    isDeleteTenantModal,
    setIsDeleteTenantModal,
  ] = useState(false);


  const [
    isEditProfileModal,
    setIsEditProfileModal,
  ] = useState(false);


  const [
    isLogoutModal,
    setIsLogoutModal,
  ] = useState(false);


  // =====================================================
  // PAYOUT CONNECT MODAL
  // =====================================================

  const [
    isPayoutConnectModal,
    setIsPayoutConnectModal,
  ] = useState(false);


  // =====================================================
  // GET USER FROM LOCAL STORAGE
  //
  // IMPORTANT:
  //
  // We DO NOT call:
  //
  // GET /get-user
  //
  // anymore.
  //
  // The login already saves:
  //
  // localStorage.user
  //
  // containing:
  //
  // {
  //   ...user,
  //   role: "tenant"
  // }
  //
  // or:
  //
  // {
  //   ...user,
  //   role: "landlord"
  // }
  // =====================================================

  useEffect(() => {

    const token =
      localStorage.getItem(
        "token"
      );


    const storedUser =
      localStorage.getItem(
        "user"
      );


    console.log(
      "LAYOUT TOKEN:",
      token
    );


    console.log(
      "LAYOUT STORED USER:",
      storedUser
    );


    // ===================================================
    // NO TOKEN
    // ===================================================

    if (!token) {

      console.error(
        "No authentication token found."
      );


      navigate("/", {
        replace: true,
      });


      return;

    }


    // ===================================================
    // NO USER
    // ===================================================

    if (!storedUser) {

      console.error(
        "No user found in localStorage."
      );


      localStorage.removeItem(
        "token"
      );


      navigate("/", {
        replace: true,
      });


      return;

    }


    try {

      // =================================================
      // PARSE USER
      // =================================================

      const parsedUser =
        JSON.parse(
          storedUser
        );


      console.log(
        "LAYOUT PARSED USER:",
        parsedUser
      );


      // =================================================
      // NORMALIZE ROLE
      // =================================================

      const role =
        String(
          parsedUser?.role || ""
        )
          .trim()
          .toLowerCase();


      console.log(
        "LAYOUT USER ROLE:",
        role
      );


      // =================================================
      // VALIDATE ROLE
      // =================================================

      if (
        role !== "landlord" &&
        role !== "tenant"
      ) {

        console.error(
          "INVALID USER ROLE:",
          parsedUser?.role
        );


        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );


        navigate("/", {
          replace: true,
        });


        return;

      }


      // =================================================
      // CREATE CLEAN USER
      // =================================================

      const authenticatedUser = {

        ...parsedUser,

        role: role,

      };


      // =================================================
      // SET USER
      // =================================================

      setUser(
        authenticatedUser
      );


      console.log(
        "LAYOUT AUTHENTICATED USER:",
        authenticatedUser
      );


    } catch (error) {

      console.error(
        "INVALID USER DATA:",
        error
      );


      // =================================================
      // INVALID LOCAL STORAGE DATA
      // =================================================

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );


      navigate("/", {
        replace: true,
      });


      return;

    } finally {

      setLoading(false);

    }

  }, [navigate]);


  // =====================================================
  // GET TENANTS
  //
  // ONLY LANDLORDS SHOULD CALL THIS.
  //
  // Tenants should NOT call:
  //
  // GET /tenants
  //
  // when they open /app.
  // =====================================================

  const getTenants = async () => {

    // ===================================================
    // MAKE SURE USER IS LANDLORD
    // ===================================================

    if (
      !user ||
      user.role !== "landlord"
    ) {

      console.log(
        "Skipping getTenants because user is not a landlord."
      );


      return;

    }


    // ===================================================
    // GET TOKEN
    // ===================================================

    const token =
      localStorage.getItem(
        "token"
      );


    if (!token) {

      navigate("/", {
        replace: true,
      });


      return;

    }


    try {

      setTenantsLoading(
        true
      );


      console.log(
        "GETTING TENANTS..."
      );


      const response =
        await axios.get(
          `${API_URL}/tenants`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      console.log(
        "GET TENANTS RESPONSE:",
        response.data
      );


      // =================================================
      // SAVE TENANTS
      // =================================================

      setTenants(
        response.data?.tenants || []
      );


    } catch (error) {

      console.error(
        "GET TENANTS ERROR:",
        error
      );


      console.error(
        "GET TENANTS RESPONSE:",
        error.response?.data
      );


      // =================================================
      // ONLY LOGOUT ON 401
      //
      // A 403 or other error should not automatically
      // destroy the login session.
      // =================================================

      if (
        error.response?.status === 401
      ) {

        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );


        navigate("/", {
          replace: true,
        });

      }

    } finally {

      setTenantsLoading(
        false
      );

    }

  };


  // =====================================================
  // LOAD TENANTS AFTER USER LOADS
  //
  // IMPORTANT:
  //
  // Only landlords load tenants.
  //
  // Tenants go directly to their TenantDashboard
  // without requesting /tenants.
  // =====================================================

  useEffect(() => {

    if (
      !loading &&
      user &&
      user.role === "landlord"
    ) {

      getTenants();

    }

  }, [
    loading,
    user,
  ]);


  // =====================================================
  // ADD TENANT
  // =====================================================

  const handleAddTenant = async (
    formData
  ) => {

    // ===================================================
    // ONLY LANDLORD
    // ===================================================

    if (
      !user ||
      user.role !== "landlord"
    ) {

      console.error(
        "Only landlords can add tenants."
      );


      return;

    }


    const token =
      localStorage.getItem(
        "token"
      );


    if (!token) {

      navigate("/", {
        replace: true,
      });


      return;

    }


    try {

      const response =
        await axios.post(
          `${API_URL}/tenants`,
          formData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      console.log(
        "ADD TENANT RESPONSE:",
        response.data
      );


      // =================================================
      // REFRESH TENANTS
      // =================================================

      await getTenants();


      // =================================================
      // CLOSE MODAL
      // =================================================

      setIsAddTenantModal(
        false
      );


    } catch (error) {

      console.error(
        "ADD TENANT ERROR:",
        error
      );


      console.error(
        "ADD TENANT RESPONSE:",
        error.response?.data
      );


      alert(
        error.response?.data?.message ||
        "Failed to add tenant."
      );

    }

  };


  // =====================================================
  // OPEN EDIT TENANT
  // =====================================================

  const handleOpenEditTenant = (
    tenant
  ) => {

    console.log(
      "OPEN EDIT TENANT:",
      tenant
    );


    setSelectedTenant(
      tenant
    );


    setIsEditTenantModal(
      true
    );

  };


  // =====================================================
  // CLOSE EDIT TENANT
  // =====================================================

  const handleCloseEditTenant = () => {

    setIsEditTenantModal(
      false
    );


    setSelectedTenant(
      null
    );

  };


  // =====================================================
  // EDIT TENANT
  // =====================================================

  const handleEditTenant = async (
    formData
  ) => {

    // ===================================================
    // ONLY LANDLORD
    // ===================================================

    if (
      !user ||
      user.role !== "landlord"
    ) {

      console.error(
        "Only landlords can edit tenants."
      );


      return;

    }


    const token =
      localStorage.getItem(
        "token"
      );


    if (!token) {

      navigate("/", {
        replace: true,
      });


      return;

    }


    if (!selectedTenant) {

      console.error(
        "No tenant selected for editing."
      );


      return;

    }


    try {

      const response =
        await axios.put(
          `${API_URL}/tenants/${selectedTenant.id}`,
          formData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      console.log(
        "EDIT TENANT RESPONSE:",
        response.data
      );


      // =================================================
      // REFRESH TENANTS
      // =================================================

      await getTenants();


      // =================================================
      // CLOSE MODAL
      // =================================================

      handleCloseEditTenant();


    } catch (error) {

      console.error(
        "EDIT TENANT ERROR:",
        error
      );


      console.error(
        "EDIT TENANT RESPONSE:",
        error.response?.data
      );


      throw error;

    }

  };


  // =====================================================
  // OPEN DELETE TENANT
  // =====================================================

  const handleOpenDeleteTenant = (
    tenant
  ) => {

    console.log(
      "OPEN DELETE TENANT:",
      tenant
    );


    setTenantToDelete(
      tenant
    );


    setIsDeleteTenantModal(
      true
    );

  };


  // =====================================================
  // CLOSE DELETE TENANT
  // =====================================================

  const handleCloseDeleteTenant = () => {

    setIsDeleteTenantModal(
      false
    );


    setTenantToDelete(
      null
    );

  };


  // =====================================================
  // DELETE TENANT
  // =====================================================

  const handleDeleteTenant = async () => {

    // ===================================================
    // ONLY LANDLORD
    // ===================================================

    if (
      !user ||
      user.role !== "landlord"
    ) {

      console.error(
        "Only landlords can delete tenants."
      );


      return;

    }


    const token =
      localStorage.getItem(
        "token"
      );


    if (!token) {

      navigate("/", {
        replace: true,
      });


      return;

    }


    if (!tenantToDelete) {

      console.error(
        "No tenant selected for deletion."
      );


      return;

    }


    try {

      console.log(
        "DELETING TENANT:",
        tenantToDelete.id
      );


      const response =
        await axios.delete(
          `${API_URL}/tenants/${tenantToDelete.id}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      console.log(
        "DELETE TENANT RESPONSE:",
        response.data
      );


      // =================================================
      // REMOVE FROM FRONTEND
      // =================================================

      setTenants(
        (previousTenants) =>
          previousTenants.filter(
            (tenant) =>
              Number(
                tenant.id
              ) !==
              Number(
                tenantToDelete.id
              )
          )
      );


      // =================================================
      // CLOSE MODAL
      // =================================================

      handleCloseDeleteTenant();


    } catch (error) {

      console.error(
        "DELETE TENANT ERROR:",
        error
      );


      console.error(
        "DELETE RESPONSE:",
        error.response?.data
      );


      throw error;

    }

  };


  // =====================================================
  // OPEN PAYOUT CONNECT
  // =====================================================

  const handleOpenPayoutConnect = () => {

    console.log(
      "OPEN PAYOUT CONNECT MODAL"
    );


    setIsPayoutConnectModal(
      true
    );

  };


  // =====================================================
  // CLOSE PAYOUT CONNECT
  // =====================================================

  const handleClosePayoutConnect = () => {

    setIsPayoutConnectModal(
      false
    );

  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleOpenLogout = () => {

    setIsLogoutModal(
      true
    );

  };


  // =====================================================
  // LOADING
  // =====================================================

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


  // =====================================================
  // SAFETY CHECK
  // =====================================================

  if (!user) {

    return null;

  }


  // =====================================================
  // LAYOUT
  // =====================================================

  return (

    <div
      className={
        styles.layout
      }
    >

      {/* =================================================
          NAVBAR
      ================================================= */}

      <Navbar

        setIsAddTenantModal={
          setIsAddTenantModal
        }

        user={
          user
        }

      />


      {/* =================================================
          LAYOUT BODY
      ================================================= */}

      <div
        className={
          styles.layoutBody
        }
      >

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <Sidebar

          onPaymentClick={
            handleOpenPayoutConnect
          }

          onLogoutClick={
            handleOpenLogout
          }

        />


        {/* =================================================
            MAIN
        ================================================= */}

        <main
          className={
            styles.main
          }
        >

          <Outlet
            context={{

              // ==========================================
              // USER
              // ==========================================

              user,

              setUser,


              // ==========================================
              // TENANTS
              //
              // These are primarily for landlord pages.
              // ==========================================

              tenants,

              tenantsLoading,

              getTenants,


              // ==========================================
              // PROFILE
              // ==========================================

              setIsEditProfileModal,


              // ==========================================
              // TENANT ACTIONS
              // ==========================================

              openEditTenant:
                handleOpenEditTenant,

              openDeleteTenant:
                handleOpenDeleteTenant,

            }}
          />

        </main>

      </div>


      {/* =================================================
          ADD TENANT MODAL
      ================================================= */}

      {user.role === "landlord" && (

        <AddTenantModal

          isAddTenantModal={
            isAddTenantModal
          }

          setIsAddTenantModal={
            setIsAddTenantModal
          }

          onSubmit={
            handleAddTenant
          }

        />

      )}


      {/* =================================================
          EDIT TENANT MODAL
      ================================================= */}

      {user.role === "landlord" && (

        <EditTenantModal

          tenant={
            selectedTenant
          }

          isOpen={
            isEditTenantModal
          }

          setIsOpen={
            (value) => {

              if (!value) {

                handleCloseEditTenant();

                return;

              }

              setIsEditTenantModal(
                value
              );

            }
          }

          onTenantUpdated={
            async () => {

              await getTenants();

              handleCloseEditTenant();

            }
          }

          onSubmit={
            handleEditTenant
          }

        />

      )}


      {/* =================================================
          DELETE TENANT MODAL
      ================================================= */}

      {user.role === "landlord" && (

        <DeleteTenantModal

          tenant={
            tenantToDelete
          }

          isDeleteTenantModal={
            isDeleteTenantModal
          }

          setIsDeleteTenantModal={
            (value) => {

              if (!value) {

                handleCloseDeleteTenant();

                return;

              }

              setIsDeleteTenantModal(
                value
              );

            }
          }

          onDelete={
            handleDeleteTenant
          }

        />

      )}


      {/* =================================================
          EDIT PROFILE MODAL
      ================================================= */}

      <EditProfileModal

        isEditProfileModal={
          isEditProfileModal
        }

        setIsEditProfileModal={
          setIsEditProfileModal
        }

        user={
          user
        }

        setUser={
          setUser
        }

      />


      {/* =================================================
          PAYSTACK CONNECT MODAL
      ================================================= */}

      <PayoutConnectModal

        isOpen={
          isPayoutConnectModal
        }

        setIsOpen={
          setIsPayoutConnectModal
        }

        user={
          user
        }

      />


      {/* =================================================
          LOGOUT MODAL
      ================================================= */}

      <LogoutModal

        isLogoutModal={
          isLogoutModal
        }

        setIsLogoutModal={
          setIsLogoutModal
        }

      />

    </div>

  );

}


export default Layout;