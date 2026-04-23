import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminSupportService } from '../../services/admin.service';
import { TicketStatusLabels, TicketPriorityLabels } from '../../constants/enums';
import { toast } from 'react-toastify';
import './AdminTickets.css';

export const AdminTicketsPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
  });

  const loadTickets = useCallback(async () => {
    try {
      const response = await adminSupportService.getAllTickets({ ...filters, search: searchTerm });
      setTickets(response.data || []);
    } catch (error) {
      console.error('Error al cargar tickets:', error);
      toast.error('Error al cargar los tickets');
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
    loadTickets();
  }, [loadTickets, navigate]);;

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleViewTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
    // Aquí cargaríamos los mensajes del ticket si tuviéramos el endpoint
  };

  const handleUpdateStatus = async (uuid, newStatus) => {
    try {
      await adminSupportService.updateTicketStatus(uuid, newStatus);
      toast.success('Estado actualizado exitosamente');
      loadTickets();
      if (selectedTicket?.uuid === uuid) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const handleAssignTicket = async (uuid) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await adminSupportService.assignTicket(uuid, user.uuid);
      toast.success('Ticket asignado exitosamente');
      loadTickets();
    } catch (error) {
      console.error('Error al asignar ticket:', error);
      toast.error('Error al asignar el ticket');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      toast.error('Escribe un mensaje');
      return;
    }

    try {
      await adminSupportService.replyToTicket(selectedTicket.uuid, replyMessage);
      toast.success('Respuesta enviada');
      setReplyMessage('');
      // Recargar mensajes
    } catch (error) {
      console.error('Error al enviar respuesta:', error);
      toast.error('Error al enviar la respuesta');
    }
  };

  const getStatusClass = (status) => {
    const classes = {
      OPEN: 'status-open',
      IN_PROGRESS: 'status-in-progress',
      RESOLVED: 'status-resolved',
      CLOSED: 'status-closed',
    };
    return classes[status] || '';
  };

  const getPriorityClass = (priority) => {
    const classes = {
      LOW: 'priority-low',
      MEDIUM: 'priority-medium',
      HIGH: 'priority-high',
      URGENT: 'priority-urgent',
    };
    return classes[priority] || '';
  };

  return (
    <div className="admin-tickets-page">
      <div className="admin-tickets-container">
        <div className="page-header">
          <h1>Gestión de Tickets de Soporte</h1>
          <button className="btn-back" onClick={() => navigate('/admin')}>
            ← Volver al Panel
          </button>
        </div>

        <div className="filters">
          <input
            type="text"
            placeholder="Buscar por asunto, usuario o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">Todos los estados</option>
            <option value="OPEN">Abierto</option>
            <option value="IN_PROGRESS">En Progreso</option>
            <option value="RESOLVED">Resuelto</option>
            <option value="CLOSED">Cerrado</option>
          </select>

          <select name="priority" value={filters.priority} onChange={handleFilterChange}>
            <option value="">Todas las prioridades</option>
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
            <option value="URGENT">Urgente</option>
          </select>
        </div>

        {isLoading ? (
          <div className="loading">Cargando...</div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">No hay tickets</div>
        ) : (
          <div className="tickets-table">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Asunto</th>
                  <th>Categoría</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Asignado a</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.uuid}>
                    <td>
                      <div className="user-cell">
                        {ticket.user?.first_name} {ticket.user?.last_name}
                        <span className="user-email">{ticket.user?.email}</span>
                      </div>
                    </td>
                    <td>
                      <strong>{ticket.subject}</strong>
                    </td>
                    <td>
                      <span className="category-badge">{ticket.category}</span>
                    </td>
                    <td>
                      <span className={`priority-badge ${getPriorityClass(ticket.priority)}`}>
                        {TicketPriorityLabels[ticket.priority]}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                        {TicketStatusLabels[ticket.status]}
                      </span>
                    </td>
                    <td>
                      {ticket.assigned_to_user ? (
                        <span className="assigned">
                          {ticket.assigned_to_user.first_name} {ticket.assigned_to_user.last_name}
                        </span>
                      ) : (
                        <span className="not-assigned">Sin asignar</span>
                      )}
                    </td>
                    <td>{new Date(ticket.created_at).toLocaleString()}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="btn-view"
                          onClick={() => handleViewTicket(ticket)}
                        >
                          Ver
                        </button>
                        {!ticket.assigned_to && (
                          <button
                            className="btn-assign"
                            onClick={() => handleAssignTicket(ticket.uuid)}
                          >
                            Asignarme
                          </button>
                        )}
                        <select
                          onChange={(e) => handleUpdateStatus(ticket.uuid, e.target.value)}
                          value={ticket.status}
                          className="action-select"
                        >
                          <option value="OPEN">Abierto</option>
                          <option value="IN_PROGRESS">En Progreso</option>
                          <option value="RESOLVED">Resuelto</option>
                          <option value="CLOSED">Cerrado</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal para ver ticket y responder */}
        {showModal && selectedTicket && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedTicket.subject}</h2>
                <button className="btn-close" onClick={() => setShowModal(false)}>
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="ticket-details">
                  <p><strong>Usuario:</strong> {selectedTicket.user?.first_name} {selectedTicket.user?.last_name}</p>
                  <p><strong>Descripción:</strong></p>
                  <p className="description">{selectedTicket.description}</p>
                  <p><strong>Categoría:</strong> {selectedTicket.category}</p>
                  <p>
                    <strong>Prioridad:</strong>{' '}
                    <span className={`priority-badge ${getPriorityClass(selectedTicket.priority)}`}>
                      {TicketPriorityLabels[selectedTicket.priority]}
                    </span>
                  </p>
                  <p>
                    <strong>Estado:</strong>{' '}
                    <span className={`status-badge ${getStatusClass(selectedTicket.status)}`}>
                      {TicketStatusLabels[selectedTicket.status]}
                    </span>
                  </p>
                </div>

                <div className="reply-section">
                  <h3>Responder</h3>
                  <form onSubmit={handleReply}>
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Escribe tu respuesta..."
                      rows="4"
                      required
                    />
                    <button type="submit" className="btn-send">
                      Enviar Respuesta
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
