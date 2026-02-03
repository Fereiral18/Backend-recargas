import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminRechargeService } from '../../services/admin.service';
import { rechargeService } from '../../services';
import { 
  RechargeStatusLabels, 
  GameOperatorLabels, 
  RechargeTypeLabels,
  RechargeStatus 
} from '../../constants/enums';
import { toast } from 'react-toastify';
import './AdminRecharges.css';

export const AdminRechargesPage = () => {
  const navigate = useNavigate();
  const [recharges, setRecharges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecharge, setSelectedRecharge] = useState(null); // Para ver detalles
  const [proofImageUrl, setProofImageUrl] = useState(null); // URL blob del comprobante
  const [loadingProof, setLoadingProof] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'PENDING', // Por defecto mostrar solo pendientes
    operator: '',
  });

  const loadRecharges = useCallback(async () => {
    try {
      const response = await adminRechargeService.getAllRecharges({
        ...filters,
        search: searchTerm || undefined,
      });
      setRecharges(response.data || []);
    } catch (error) {
      console.error('Error al cargar recargas:', error);
      toast.error('Error al cargar las recargas');
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchTerm]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role !== 'ADMIN') {
      toast.error('No tienes permisos de administrador');
      navigate('/dashboard');
      return;
    }
    loadRecharges();
  }, [loadRecharges, navigate]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleUpdateStatus = async (uuid, newStatus) => {
    try {
      await adminRechargeService.updateRechargeStatus(uuid, newStatus);
      const statusText = newStatus === RechargeStatus.COMPLETED ? 'aprobada' : 'rechazada';
      toast.success(`Recarga ${statusText} exitosamente`);
      setSelectedRecharge(null);
      setProofImageUrl(null);
      loadRecharges();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  // Cargar imagen de comprobante cuando se selecciona una recarga
  const handleViewDetails = async (recharge) => {
    setSelectedRecharge(recharge);
    setProofImageUrl(null);
    
    if (recharge.proof_image_path) {
      setLoadingProof(true);
      try {
        const url = await rechargeService.getProofImageUrl(recharge.uuid);
        setProofImageUrl(url);
      } catch (error) {
        console.error('Error al cargar comprobante:', error);
        toast.error('Error al cargar el comprobante');
      } finally {
        setLoadingProof(false);
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedRecharge(null);
    if (proofImageUrl) {
      URL.revokeObjectURL(proofImageUrl); // Liberar memoria
      setProofImageUrl(null);
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

  return (
    <div className="admin-recharges-page">
      <div className="admin-recharges-container">
        <div className="page-header">
          <h1>Gestión de Recargas</h1>
          <button className="btn-back" onClick={() => navigate('/admin')}>
            ← Volver al Panel
          </button>
        </div>

        <div className="filters">
          <input
            type="text"
            placeholder="Buscar por referencia, ID jugador o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="COMPLETED">Completada</option>
            <option value="FAILED">Fallida</option>
            <option value="CANCELLED">Cancelada</option>
          </select>

          <select name="operator" value={filters.operator} onChange={handleFilterChange}>
            <option value="">Todos los juegos</option>
            <option value="FREE_FIRE">Free Fire</option>
            <option value="PUBG_MOBILE">PUBG Mobile</option>
            <option value="MOBILE_LEGENDS">Mobile Legends</option>
            <option value="GENSHIN_IMPACT">Genshin Impact</option>
            <option value="COD_MOBILE">Call of Duty Mobile</option>
          </select>
        </div>

        {isLoading ? (
          <div className="loading">Cargando...</div>
        ) : recharges.length === 0 ? (
          <div className="empty-state">
            {filters.status === 'PENDING' 
              ? 'No hay recargas pendientes de verificación' 
              : 'No hay recargas con ese filtro'}
          </div>
        ) : (
          <div className="recharges-table">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Juego</th>
                  <th>ID Jugador</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recharges.map((recharge) => (
                  <tr key={recharge.uuid}>
                    <td>
                      <div className="user-cell">
                        {recharge.user?.first_name} {recharge.user?.last_name}
                        <span className="user-email">{recharge.user?.email}</span>
                      </div>
                    </td>
                    <td>
                      <strong>{GameOperatorLabels[recharge.operator]}</strong>
                      <span className="recharge-type">{RechargeTypeLabels[recharge.type]}</span>
                    </td>
                    <td className="game-id">{recharge.phone_number}</td>
                    <td className="amount">
                      ${parseFloat(recharge.amount).toFixed(2)}
                      <span className="currency">{recharge.currency || ''}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(recharge.status)}`}>
                        {RechargeStatusLabels[recharge.status]}
                      </span>
                    </td>
                    <td className="date-cell">{new Date(recharge.created_at).toLocaleDateString()}</td>
                    <td>
                      {recharge.status === 'PENDING' && (
                        <button
                          className="btn-view"
                          onClick={() => handleViewDetails(recharge)}
                        >
                          Ver Detalles
                        </button>
                      )}
                      {recharge.status !== 'PENDING' && (
                        <select
                          onChange={(e) => handleUpdateStatus(recharge.uuid, e.target.value)}
                          value={recharge.status}
                          className="action-select"
                        >
                          <option value="PENDING">Pendiente</option>
                          <option value="COMPLETED">Completada</option>
                          <option value="FAILED">Fallida</option>
                          <option value="CANCELLED">Cancelada</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MODAL DE DETALLES Y COMPROBANTE */}
        {selectedRecharge && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Verificar Comprobante</h2>
                <button className="modal-close" onClick={handleCloseModal}>✕</button>
              </div>

              <div className="modal-body">
                {/* INFORMACIÓN DE LA RECARGA */}
                <div className="section">
                  <h3>Información de la Recarga</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Usuario:</span>
                      <span className="value">{selectedRecharge.user?.email}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Juego:</span>
                      <span className="value">{GameOperatorLabels[selectedRecharge.operator]}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Tipo:</span>
                      <span className="value">{RechargeTypeLabels[selectedRecharge.type]}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Paquete:</span>
                      <span className="value">{selectedRecharge.package || '-'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">ID Jugador:</span>
                      <span className="value">{selectedRecharge.phone_number}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Monto:</span>
                      <span className="value" style={{ fontWeight: 'bold', color: '#d32f2f' }}>
                        ${parseFloat(selectedRecharge.amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* INFORMACIÓN DE PAGO */}
                <div className="section">
                  <h3>Información de Pago</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Moneda:</span>
                      <span className="value">{selectedRecharge.currency || '-'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Método:</span>
                      <span className="value">{selectedRecharge.payment_method || '-'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">ID Transacción:</span>
                      <span className="value" style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                        {selectedRecharge.transaction_id || '-'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Referencia:</span>
                      <span className="value" style={{ fontSize: '12px' }}>{selectedRecharge.reference}</span>
                    </div>
                  </div>
                </div>

                {/* COMPROBANTE */}
                {selectedRecharge.proof_image_path && (
                  <div className="section">
                    <h3>Comprobante Enviado</h3>
                    <div className="proof-image-container">
                      {loadingProof ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>Cargando comprobante...</div>
                      ) : proofImageUrl ? (
                        <>
                          <img 
                            src={proofImageUrl}
                            alt="Comprobante" 
                            style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                          />
                          <button 
                            onClick={() => window.open(proofImageUrl, '_blank')}
                            className="btn-open-image"
                          >
                            Abrir en nueva pestaña
                          </button>
                        </>
                      ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#d32f2f' }}>
                          Error al cargar el comprobante
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button 
                  className="btn-approve" 
                  onClick={() => handleUpdateStatus(selectedRecharge.uuid, RechargeStatus.COMPLETED)}
                >
                  ✓ Aprobar Recarga
                </button>
                <button 
                  className="btn-reject" 
                  onClick={() => handleUpdateStatus(selectedRecharge.uuid, RechargeStatus.FAILED)}
                >
                  ✕ Rechazar Recarga
                </button>
                <button 
                  className="btn-cancel" 
                  onClick={handleCloseModal}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
