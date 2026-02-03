import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rechargeService, supportService } from '../../services';
import { adminUserService } from '../../services/admin.service';
import { toast } from 'react-toastify';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    users: { total: 0 },
    recharges: { total: 0, pending: 0, completed: 0, failed: 0, todayTotal: 0, todayPending: 0, todayAmount: 0 },
    tickets: { open: 0, total: 0 },
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role !== 'ADMIN') {
      toast.error('No tienes permisos de administrador');
      navigate('/dashboard');
      return;
    }
    loadStats();
  }, [navigate]);

  const loadStats = async () => {
    try {
      const [usersRes, rechargesRes, ticketsRes] = await Promise.all([
        adminUserService.getStats(),
        rechargeService.getStats(),
        supportService.getStats().catch(() => ({ open: 0, total: 0 })),
      ]);

      setStats({
        users: usersRes.data || usersRes || { total: 0 },
        recharges: rechargesRes || { total: 0, pending: 0, completed: 0, failed: 0, todayTotal: 0, todayPending: 0, todayAmount: 0 },
        tickets: ticketsRes.data || ticketsRes || { open: 0, total: 0 },
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      toast.error('Error al cargar las estadísticas');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="page-header">
          <h1>Panel de Administración</h1>
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            ← Volver al Dashboard
          </button>
        </div>

        {/* ALERTA DE PENDIENTES */}
        {(stats.recharges.pending > 0 || stats.tickets.open > 0) && (
          <div className="alerts-section">
            {stats.recharges.pending > 0 && (
              <div className="alert alert-warning" onClick={() => navigate('/admin/recharges')}>
                ⚠️ <strong>{stats.recharges.pending}</strong> recargas pendientes de verificación
              </div>
            )}
            {stats.tickets.open > 0 && (
              <div className="alert alert-info" onClick={() => navigate('/admin/tickets')}>
                🎫 <strong>{stats.tickets.open}</strong> tickets abiertos requieren atención
              </div>
            )}
          </div>
        )}

        {/* RESUMEN DE HOY */}
        <div className="section">
          <h2>📅 Resumen de Hoy</h2>
          <div className="stats-grid stats-grid-3">
            <div className="stat-card stat-highlight" onClick={() => navigate('/admin/recharges')}>
              <div className="stat-icon" style={{ background: '#FF5722' }}>
                ⏳
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.recharges.todayPending}</span>
                <span className="stat-label">Pendientes Hoy</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#2196F3' }}>
                📦
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.recharges.todayTotal}</span>
                <span className="stat-label">Recargas Hoy</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#4CAF50' }}>
                💵
              </div>
              <div className="stat-info">
                <span className="stat-value">${stats.recharges.todayAmount?.toFixed(2) || '0.00'}</span>
                <span className="stat-label">Procesado Hoy</span>
              </div>
            </div>
          </div>
        </div>

        {/* ESTADÍSTICAS GENERALES */}
        <div className="section">
          <h2>📊 Estadísticas Generales</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#667eea' }}>
                👥
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.users.total}</span>
                <span className="stat-label">Usuarios Registrados</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#9C27B0' }}>
                💎
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.recharges.total}</span>
                <span className="stat-label">Total Recargas</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#4CAF50' }}>
                ✅
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.recharges.completed}</span>
                <span className="stat-label">Completadas</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#f44336' }}>
                ❌
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.recharges.failed}</span>
                <span className="stat-label">Fallidas</span>
              </div>
            </div>
          </div>
        </div>

        {/* ACCIONES RÁPIDAS */}
        <div className="section">
          <h2>⚡ Acciones Rápidas</h2>
          <div className="actions-grid">
            <button className="action-card action-primary" onClick={() => navigate('/admin/recharges')}>
              <span className="action-icon">💎</span>
              <span className="action-title">Verificar Recargas</span>
              <span className="action-desc">{stats.recharges.pending} pendientes</span>
            </button>

            <button className="action-card" onClick={() => navigate('/admin/users')}>
              <span className="action-icon">👥</span>
              <span className="action-title">Gestionar Usuarios</span>
              <span className="action-desc">{stats.users.total} registrados</span>
            </button>

            <button className="action-card" onClick={() => navigate('/admin/tickets')}>
              <span className="action-icon">🎫</span>
              <span className="action-title">Tickets de Soporte</span>
              <span className="action-desc">{stats.tickets.open} abiertos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
