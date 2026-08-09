import React from "react";
import { AuthProvider } from "../core/AuthContext/authContext";
import { ProtectedRoute } from "../core/authroute";
import { Route, Routes } from "react-router-dom";
import { Login } from "../pages/Login/LoginPage";
import { RegisterPage } from "../pages/createAcount/RegisterPage";
import { Home } from "../pages/Home/Home";

import { Password } from "../pages/rescuePassword/Password";
import { CreateRechargePage } from "../pages/Recharges/CreateRechargePage";
import { RechargesListPage } from "../pages/Recharges/RechargesListPage";
import { TransactionsPage } from "../pages/Transactions/TransactionsPage";
import { SupportPage } from "../pages/Support/SupportPage";
import { ProfilePage } from "../pages/Profile/ProfilePage";
import { AdminDashboard } from "../pages/Admin/AdminDashboard";
import { AdminUsersPage } from "../pages/Admin/AdminUsersPage";
import { AdminRechargesPage } from "../pages/Admin/AdminRechargesPage";
import { AdminTicketsPage } from "../pages/Admin/AdminTicketsPage";
import { DashboardPage } from "../pages/Dashboard/DashboardPage";


export const AppRouter = () => {
  return (
    <>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home/>}/>
          <Route path="/create" element={<RegisterPage/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/password-reset" element={<Password/>}/>
          
          {/* Rutas protegidas */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage/>
            </ProtectedRoute>
          }/>
          
          {/* Recargas */}
          <Route path="/recharges" element={
            <ProtectedRoute>
              <RechargesListPage/>
            </ProtectedRoute>
          }/>
          <Route path="/recharges/create" element={
            <ProtectedRoute>
              <CreateRechargePage/>
            </ProtectedRoute>
          }/>
          
          {/* Transacciones */}
          <Route path="/transactions" element={
            <ProtectedRoute>
              <TransactionsPage/>
            </ProtectedRoute>
          }/>
          
          {/* Soporte */}
          <Route path="/support" element={
            <ProtectedRoute>
              <SupportPage/>
            </ProtectedRoute>
          }/>
          
          {/* Perfil */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage/>
            </ProtectedRoute>
          }/>
          
          {/* Admin - Requiere rol ADMIN */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard/>
            </ProtectedRoute>
          }/>
          <Route path="/admin/users" element={
            <ProtectedRoute requireAdmin>
              <AdminUsersPage/>
            </ProtectedRoute>
          }/>
          <Route path="/admin/recharges" element={
            <ProtectedRoute requireAdmin>
              <AdminRechargesPage/>
            </ProtectedRoute>
          }/>
          <Route path="/admin/tickets" element={
            <ProtectedRoute requireAdmin>
              <AdminTicketsPage/>
            </ProtectedRoute>
          }/>
        </Routes>
      </AuthProvider>
    </>
  );
};
