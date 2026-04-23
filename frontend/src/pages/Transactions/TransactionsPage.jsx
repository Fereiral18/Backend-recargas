import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionService } from '../../services';
import { TransactionTypeLabels, TransactionStatusLabels } from '../../constants/enums';
import { toast } from 'react-toastify';
import './TransactionsPage.css';

export const TransactionsPage = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
  });

  const loadData = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Cargar balance
      const balanceResponse = await transactionService.getBalance(user.uuid);
      setBalance(balanceResponse.data);

      // Cargar transacciones
      const transactionsResponse = await transactionService.getAll({
        user_id: user.uuid,
        ...filters,
      });
      setTransactions(transactionsResponse.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar las transacciones');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
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

  const getTypeClass = (type) => {
    const classes = {
      DEPOSIT: 'type-deposit',
      WITHDRAWAL: 'type-withdrawal',
      PURCHASE: 'type-purchase',
      REFUND: 'type-refund',
      FEE: 'type-fee',
    };
    return classes[type] || '';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('es-AR');
  };

  return (
    <div className="transactions-page">
      <div className="transactions-container">
        <div className="page-header">
          <h1>Mis Transacciones</h1>
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            ← Volver
          </button>
        </div>

        {balance && (
          <div className="balance-card">
            <div className="balance-item">
              <span className="balance-label">Balance Total</span>
              <span className="balance-value">${parseFloat(balance.total_balance || 0).toFixed(2)}</span>
            </div>
            <div className="balance-item">
              <span className="balance-label">Total Depósitos</span>
              <span className="balance-value positive">+${parseFloat(balance.total_deposits || 0).toFixed(2)}</span>
            </div>
            <div className="balance-item">
              <span className="balance-label">Total Retiros</span>
              <span className="balance-value negative">-${parseFloat(balance.total_withdrawals || 0).toFixed(2)}</span>
            </div>
            <div className="balance-item">
              <span className="balance-label">Total Compras</span>
              <span className="balance-value negative">-${parseFloat(balance.total_purchases || 0).toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="filters">
          <select name="type" value={filters.type} onChange={handleFilterChange}>
            <option value="">Todos los tipos</option>
            <option value="DEPOSIT">Depósito</option>
            <option value="WITHDRAWAL">Retiro</option>
            <option value="PURCHASE">Compra</option>
            <option value="REFUND">Reembolso</option>
            <option value="FEE">Comisión</option>
          </select>

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
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <p>No tienes transacciones aún</p>
          </div>
        ) : (
          <div className="transactions-list">
            {transactions.map((transaction) => (
              <div key={transaction.uuid} className="transaction-card">
                <div className="transaction-header">
                  <div className={`transaction-type ${getTypeClass(transaction.type)}`}>
                    <strong>{TransactionTypeLabels[transaction.type]}</strong>
                  </div>
                  <span className={`status-badge ${getStatusClass(transaction.status)}`}>
                    {TransactionStatusLabels[transaction.status]}
                  </span>
                </div>
                <div className="transaction-details">
                  <div className="detail-row">
                    <span>Monto:</span>
                    <strong className={transaction.type === 'DEPOSIT' || transaction.type === 'REFUND' ? 'positive' : 'negative'}>
                      {transaction.type === 'DEPOSIT' || transaction.type === 'REFUND' ? '+' : '-'}
                      ${parseFloat(transaction.amount).toFixed(2)}
                    </strong>
                  </div>
                  
                  {transaction.currency && (
                    <div className="detail-row">
                      <span>Moneda:</span>
                      <span>{transaction.currency}</span>
                    </div>
                  )}
                  
                  {transaction.fee > 0 && (
                    <div className="detail-row">
                      <span>Comisión:</span>
                      <span className="fee">-${parseFloat(transaction.fee).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="detail-row">
                    <span>Neto:</span>
                    <strong>${parseFloat(transaction.net_amount).toFixed(2)}</strong>
                  </div>
                  
                  <div className="detail-row">
                    <span>Referencia:</span>
                    <span className="reference">{transaction.reference}</span>
                  </div>

                  {transaction.transaction_id && (
                    <div className="detail-row">
                      <span>ID Transacción:</span>
                      <span className="reference">{transaction.transaction_id}</span>
                    </div>
                  )}

                  {transaction.payment_method && (
                    <div className="detail-row">
                      <span>Método:</span>
                      <span>{transaction.payment_method}</span>
                    </div>
                  )}
                  
                  <div className="detail-row">
                    <span>Creado:</span>
                    <span>{formatDate(transaction.created_at)}</span>
                  </div>

                  {transaction.completed_at && (
                    <div className="detail-row">
                      <span>Completado:</span>
                      <span>{formatDate(transaction.completed_at)}</span>
                    </div>
                  )}

                  {transaction.proof_image_path && (
                    <div className="detail-row">
                      <span>Comprobante:</span>
                      <a href={transaction.proof_image_path} target="_blank" rel="noopener noreferrer" style={{ color: '#2196F3', textDecoration: 'underline' }}>
                        Ver imagen
                      </a>
                    </div>
                  )}

                  {transaction.metadata && (
                    <div className="detail-row">
                      <span>Info adicional:</span>
                      <small style={{ color: '#666' }}>{JSON.stringify(transaction.metadata)}</small>
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
