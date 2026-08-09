import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import HelpIcon from "@mui/icons-material/Help";
import PersonIcon from "@mui/icons-material/Person";
import DiamondIcon from "@mui/icons-material/Diamond";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

import { useState, useEffect } from "react";
import { userService, rechargeService } from "../../services";
import { toast } from "react-toastify";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userLocal = JSON.parse(localStorage.getItem('user'));
      setUser(userLocal);

      // Cargar datos del dashboard
      const dashboardResponse = await userService.getDashboard();
      setStats(dashboardResponse.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <>
      <div className="dashboard-container">
        <main>
          <div className="dashboard-body">
            <div className="barr-option">
              <div className="barr-option-name">
                <div className="bar_workspace">
                  <button className="btn-bar-users">
                    {user?.first_name} {user?.last_name}
                  </button>
                </div>
              </div>
              <div className="bar-body">
                <div className="item-container">
                  <button>
                    <Link to="/">
                      <HomeIcon />
                      Inicio
                    </Link>
                  </button>
                </div>
                <div className="item-container">
                  <button onClick={() => navigate('/recharges')}>
                    <DiamondIcon />
                    Recargas
                  </button>
                </div>
                <div className="item-container">
                  <button onClick={() => navigate('/transactions')}>
                    <AccountBalanceWalletIcon />
                    Transacciones
                  </button>
                </div>
                <div className="item-container">
                  <button onClick={() => navigate('/support')}>
                    <HelpIcon />
                    Soporte
                  </button>
                </div>
                <div className="item-container">
                  <button onClick={() => navigate('/profile')}>
                    <PersonIcon />
                    Mi Perfil
                  </button>
                </div>
                {user?.role === 'ADMIN' && (
                  <div className="item-container">
                    <button onClick={() => navigate('/admin')}>
                      <AdminPanelSettingsIcon />
                      Admin
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="container-apps_services">
              <div className="enunciados">
                <div className="btn-bar-users">
                  Bienvenido {user?.first_name}, ¿qué deseas hacer hoy?
                </div>
              </div>

              <div className="dashboard-stats">
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#4CAF50' }}>
                    💰
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Balance</span>
                    <span className="stat-value">${parseFloat(user?.balance || 0).toFixed(2)}</span>
                  </div>
                </div>

                <div className="stat-card" onClick={() => navigate('/recharges')}>
                  <div className="stat-icon" style={{ background: '#2196F3' }}>
                    💎
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Recargas</span>
                    <span className="stat-value">{stats?.total_recharges || 0}</span>
                  </div>
                </div>

                <div className="stat-card" onClick={() => navigate('/transactions')}>
                  <div className="stat-icon" style={{ background: '#FF9800' }}>
                    📊
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Transacciones</span>
                    <span className="stat-value">{stats?.total_transactions || 0}</span>
                  </div>
                </div>

                <div className="stat-card" onClick={() => navigate('/support')}>
                  <div className="stat-icon" style={{ background: '#9C27B0' }}>
                    🎫
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Tickets</span>
                    <span className="stat-value">{stats?.open_tickets || 0}</span>
                  </div>
                </div>
              </div>

              <div className="quick-actions">
                <h3>Acciones Rápidas</h3>
                <div className="actions-grid">
                  <button className="action-button" onClick={() => navigate('/recharges/create')}>
                    <span className="action-icon">➕</span>
                    <span>Nueva Recarga</span>
                  </button>
                  <button className="action-button" onClick={() => navigate('/transactions')}>
                    <span className="action-icon">💳</span>
                    <span>Ver Transacciones</span>
                  </button>
                  <button className="action-button" onClick={() => navigate('/support')}>
                    <span className="action-icon">💬</span>
                    <span>Crear Ticket</span>
                  </button>
                  <button className="action-button" onClick={() => navigate('/profile')}>
                    <span className="action-icon">⚙️</span>
                    <span>Configuración</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};
