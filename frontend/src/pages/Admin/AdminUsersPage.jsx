import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminUserService } from '../../services/admin.service';
import { toast } from 'react-toastify';
import './AdminUsers.css';

export const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: '',
  });

  const loadUsers = useCallback(async () => {
    try {
      const response = await adminUserService.getAllUsers({
        ...filters,
        search: searchTerm || undefined,
      });
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar los usuarios');
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
    loadUsers();
  }, [loadUsers, navigate]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleChangeRole = async (uuid, newRole) => {
    try {
      await adminUserService.changeUserRole(uuid, newRole);
      toast.success('Rol actualizado exitosamente');
      loadUsers();
    } catch (error) {
      console.error('Error al cambiar rol:', error);
      toast.error('Error al cambiar el rol');
    }
  };

  const handleChangeStatus = async (uuid, newStatus) => {
    try {
      await adminUserService.changeUserStatus(uuid, newStatus);
      toast.success('Estado actualizado exitosamente');
      loadUsers();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al cambiar el estado');
    }
  };

  const getStatusClass = (status) => {
    const classes = {
      ACTIVE: 'status-active',
      INACTIVE: 'status-inactive',
      SUSPENDED: 'status-suspended',
      BANNED: 'status-banned',
    };
    return classes[status] || '';
  };

  const getRoleBadge = (role) => {
    return role === 'ADMIN' ? 'role-admin' : 'role-user';
  };

  return (
    <div className="admin-users-page">
      <div className="admin-users-container">
        <div className="page-header">
          <h1>Gestión de Usuarios</h1>
          <button className="btn-back" onClick={() => navigate('/admin')}>
            ← Volver al Panel
          </button>
        </div>

        <div className="filters">
          <input
            type="text"
            placeholder="Buscar por email, nombre o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select name="role" value={filters.role} onChange={handleFilterChange}>
            <option value="">Todos los roles</option>
            <option value="USER">Usuario</option>
            <option value="ADMIN">Administrador</option>
          </select>

          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">Todos los estados</option>
            <option value="ACTIVE">Activo</option>
            <option value="INACTIVE">Inactivo</option>
            <option value="SUSPENDED">Suspendido</option>
            <option value="BANNED">Baneado</option>
          </select>
        </div>

        {isLoading ? (
          <div className="loading">Cargando...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">No hay usuarios</div>
        ) : (
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Balance</th>
                  <th>Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.uuid}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                        </div>
                        <div>
                          <strong>{user.first_name} {user.last_name}</strong>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || '-'}</td>
                    <td>
                      <span className={`role-badge ${getRoleBadge(user.role)}`}>
                        {user.role === 'ADMIN' ? 'Admin' : 'Usuario'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(user.status)}`}>
                        {user.status === 'ACTIVE' ? 'Activo' : user.status}
                      </span>
                    </td>
                    <td className="balance">${parseFloat(user.balance || 0).toFixed(2)}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="actions">
                        <select
                          onChange={(e) => handleChangeRole(user.uuid, e.target.value)}
                          value={user.role}
                          className="action-select"
                        >
                          <option value="USER">Usuario</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        <select
                          onChange={(e) => handleChangeStatus(user.uuid, e.target.value)}
                          value={user.status}
                          className="action-select"
                        >
                          <option value="ACTIVE">Activo</option>
                          <option value="INACTIVE">Inactivo</option>
                          <option value="SUSPENDED">Suspendido</option>
                          <option value="BANNED">Baneado</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
