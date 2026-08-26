import React from "react";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import TenantDashboard from "./pages/TenantDashboard";
import Profile from "./pages/Profile";
import Tenants from "./pages/Tenants";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PaymentCallback from './pages/PaymentCallback'


function AppHome() {

  const savedUser =
    JSON.parse(
      localStorage.getItem("user")
    );

  const role =
    String(
      savedUser?.role || ""
    )
      .trim()
      .toLowerCase();


  if (role === "landlord") {

    return <Dashboard />;

  }


  if (role === "tenant") {

    return <TenantDashboard />;

  }


  return <Login />;

}


const router = createBrowserRouter(

  createRoutesFromElements(

    <Route path="/">

      <Route
        index
        element={<Login />}
      />

      <Route
        path="signup"
        element={<Signup />}
      />

      <Route
        path="app"
        element={<Layout />}
      >

        {/* ============================================
            THIS IS THE IMPORTANT PART

            /app
            -> Layout
               -> AppHome
                  -> Dashboard OR TenantDashboard
        ============================================ */}

        <Route
          index
          element={<AppHome />}
        />

        <Route
          path="tenants"
          element={<Tenants />}
        />

        <Route
          path="profile"
          element={<Profile />}
        />

      </Route>

      
      <Route
        path="/payment/callback"
        element={<PaymentCallback />}
      />

    </Route>

  )

);


function App() {

  return (
    <RouterProvider
      router={router}
    />
  );

}


export default App;