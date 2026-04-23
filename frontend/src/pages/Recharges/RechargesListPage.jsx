import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { rechargeService } from '../../services';
import { RechargeStatusLabels, GameOperatorLabels, RechargeTypeLabels, GameOperator, DiamondPackages, PBCardPackage } from '../../constants/enums';
import { toast } from 'react-toastify';
import './RechargesPage.css';

export const RechargesListPage = () => {
  const navigate = useNavigate();
  const [recharges, setRecharges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    operator: GameOperator.FREE_FIRE, // Solo FREE_FIRE por defecto
  });

  const loadRecharges = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await rechargeService.getAll({
        user_id: user.uuid,
        ...filters,
      });
      setRecharges(response.data || []);
    } catch (error) {
      console.error('Error al cargar recargas:', error);
      toast.error('Error al cargar las recargas');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadRecharges();
  }, [loadRecharges]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Función para verificar si se puede cancelar (PENDING y < 10 min)
  const canCancel = (recharge) => {
    if (recharge.status !== 'PENDING') return false;
    const createdAt = new Date(recharge.created_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    return diffMinutes <= 10;
  };

  // Función para obtener minutos restantes
  const getMinutesLeft = (recharge) => {
    const createdAt = new Date(recharge.created_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    return Math.max(0, Math.ceil(10 - diffMinutes));
  };

  const handleCancel = async (uuid) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta recarga?')) {
      return;
    }
    
    setCancelingId(uuid);
    try {
      await rechargeService.cancel(uuid);
      toast.success('Recarga cancelada exitosamente');
      loadRecharges();
    } catch (error) {
      console.error('Error al cancelar:', error);
      toast.error(error.response?.data?.message || 'Error al cancelar la recarga');
    } finally {
      setCancelingId(null);
    }
  };

  const getStatusClass = (status) => {
    const classes = {
      PENDING: 'status-pending',
      COMPLETED: 'status-completed',
      FAILED: 'status-failed',
      CANCELLED: 'status-cancelled',
    };
    return classes[status] || '';
  };

  const getPackageName = (recharge) => {
    if (recharge.type === 'DIAMONDS' && recharge.package) {
      return DiamondPackages[recharge.package]?.label || 'Paquete desconocido';
    } else if (recharge.type === 'PB_CARD') {
      return PBCardPackage.label;
    }
    return null;
  };

  const getEmptyMessage = () => {
    if (filters.status) {
      const statusLabel = {
        PENDING: 'pendientes',
        COMPLETED: 'completadas',
        FAILED: 'fallidas',
        CANCELLED: 'canceladas'
      }[filters.status];
      return `No tienes recargas ${statusLabel}`;
    }
    return 'No tienes recargas aún';
  };

  return (
    <div className="recharges-page">
      <div className="recharges-container">
        <div className="page-header">
          <h1>Mis Recargas</h1>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => navigate('/recharges/create')}>
              + Nueva Recarga
            </button>
            <button className="btn-back" onClick={() => navigate('/dashboard')}>
              ← Volver
            </button>
          </div>
        </div>

        <div className="filters">
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="COMPLETED">Completada</option>
            <option value="FAILED">Fallida</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
        </div>

        {isLoading ? (
          <div className="loading">Cargando...</div>
        ) : recharges.length === 0 ? (
          <div className="empty-state">
            <p>{getEmptyMessage()}</p>
            {!filters.status && (
              <button className="btn-primary" onClick={() => navigate('/recharges/create')}>
                Crear primera recarga
              </button>
            )}
          </div>
        ) : (
          <div className="recharges-list">
            {recharges.map((recharge) => (
              <div key={recharge.uuid} className="recharge-card">
                <div className="recharge-header">
                  <div className="recharge-game">
                    <strong>{GameOperatorLabels[recharge.operator]}</strong>
                    <span className="recharge-type">
                      {RechargeTypeLabels[recharge.type]}
                    </span>
                  </div>
                  <span className={`status-badge ${getStatusClass(recharge.status)}`}>
                    {RechargeStatusLabels[recharge.status]}
                  </span>
                </div>
                <div className="recharge-details">
                  <div className="detail-row">
                    <span>ID Jugador:</span>
                    <strong>{recharge.phone_number}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Paquete:</span>
                    <strong>{getPackageName(recharge)}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Monto:</span>
                    <strong>${parseFloat(recharge.amount).toFixed(2)}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Referencia:</span>
                    <span className="reference">{recharge.reference}</span>
                  </div>
                  <div className="detail-row">
                    <span>Fecha:</span>
                    <span>{new Date(recharge.created_at).toLocaleString()}</span>
                  </div>
                  {recharge.proof_image_path && (
                    <div className="detail-row">
                      <span>Comprobante:</span>
                      <button 
                        onClick={async () => {
                          try {
                            const url = await rechargeService.getProofImageUrl(recharge.uuid);
                            window.open(url, '_blank');
                          } catch (error) {
                            console.error('Error al cargar comprobante:', error);
                            toast.error('Error al cargar el comprobante');
                          }
                        }}
                        style={{ 
                          color: '#2196F3', 
                          textDecoration: 'underline', 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer' 
                        }}
                      >
                        📎 Ver comprobante
                      </button>
                    </div>
                  )}
                  {canCancel(recharge) && (
                    <div className="detail-row cancel-action">
                      <button 
                        className="btn-cancel-recharge"
                        onClick={() => handleCancel(recharge.uuid)}
                        disabled={cancelingId === recharge.uuid}
                      >
                        {cancelingId === recharge.uuid ? 'Cancelando...' : `❌ Cancelar (${getMinutesLeft(recharge)} min restantes)`}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
