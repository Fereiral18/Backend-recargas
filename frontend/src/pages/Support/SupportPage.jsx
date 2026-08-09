import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supportService } from '../../services';
import { TicketStatusLabels, TicketPriorityLabels } from '../../constants/enums';
import { toast } from 'react-toastify';


export const SupportPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'MEDIUM',
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await supportService.getTickets();
      setTickets(response.data || []);
    } catch (error) {
      console.error('Error al cargar tickets:', error);
      toast.error('Error al cargar los tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject || !formData.description) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      await supportService.createTicket(formData);
      toast.success('Ticket creado exitosamente');
      setShowCreateForm(false);
      setFormData({
        subject: '',
        description: '',
        category: 'general',
        priority: 'MEDIUM',
      });
      loadTickets();
    } catch (error) {
      console.error('Error al crear ticket:', error);
      toast.error('Error al crear el ticket');
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
    <div className="support-page">
      <div className="support-container">
        <div className="page-header">
          <h1>Soporte Técnico</h1>
          <div className="header-actions">
            {!showCreateForm && (
              <button className="btn-primary" onClick={() => setShowCreateForm(true)}>
                + Nuevo Ticket
              </button>
            )}
            <button className="btn-back" onClick={() => navigate('/dashboard')}>
              ← Volver
            </button>
          </div>
        </div>

        {showCreateForm && (
          <div className="create-ticket-form">
            <h2>Crear Nuevo Ticket</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="subject">Asunto</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Describe brevemente tu problema"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe detalladamente tu problema"
                  rows="5"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Categoría</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="general">General</option>
                    <option value="tecnico">Técnico</option>
                    <option value="recarga">Recarga</option>
                    <option value="pago">Pago</option>
                    <option value="cuenta">Cuenta</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Prioridad</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowCreateForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  Crear Ticket
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="loading">Cargando...</div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <p>No tienes tickets de soporte</p>
            <button className="btn-primary" onClick={() => setShowCreateForm(true)}>
              Crear primer ticket
            </button>
          </div>
        ) : (
          <div className="tickets-list">
            <h2>Mis Tickets</h2>
            {tickets.map((ticket) => (
              <div key={ticket.uuid} className="ticket-card">
                <div className="ticket-header">
                  <div className="ticket-title">
                    <strong>{ticket.subject}</strong>
                    <span className="ticket-category">{ticket.category}</span>
                  </div>
                  <div className="ticket-badges">
                    <span className={`priority-badge ${getPriorityClass(ticket.priority)}`}>
                      {TicketPriorityLabels[ticket.priority]}
                    </span>
                    <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                      {TicketStatusLabels[ticket.status]}
                    </span>
                  </div>
                </div>
                <div className="ticket-body">
                  <p>{ticket.description}</p>
                </div>
                <div className="ticket-footer">
                  <span className="ticket-date">
                    Creado: {new Date(ticket.created_at).toLocaleString()}
                  </span>
                  <button className="btn-view" onClick={() => navigate(`/support/${ticket.uuid}`)}>
                    Ver detalles →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
