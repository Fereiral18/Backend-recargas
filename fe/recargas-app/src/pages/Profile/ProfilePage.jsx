import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, authService } from '../../services';
import { toast } from 'react-toastify';
import './ProfilePage.css';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userService.getProfile();
      setProfile(response.data);
      setFormData({
        firstName: response.data.first_name || '',
        lastName: response.data.last_name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
      });
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      toast.error('Error al cargar el perfil');
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

    try {
      await userService.updateProfile(formData);
      toast.success('Perfil actualizado exitosamente');
      setIsEditing(false);
      loadProfile();
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      toast.error('Error al actualizar el perfil');
    }
  };

  const handleLogout = () => {
    authService.logout();
    toast.info('Sesión cerrada');
    navigate('/login');
  };

  if (isLoading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="page-header">
          <h1>Mi Perfil</h1>
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            ← Volver
          </button>
        </div>

        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0)}
            </div>
            <div className="profile-info">
              <h2>{profile?.first_name} {profile?.last_name}</h2>
              <p className="profile-email">{profile?.email}</p>
              <span className={`role-badge role-${profile?.role?.toLowerCase()}`}>
                {profile?.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
              </span>
            </div>
          </div>

          {!isEditing ? (
            <div className="profile-details">
              <div className="detail-row">
                <span className="detail-label">Nombre:</span>
                <span className="detail-value">{profile?.first_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Apellido:</span>
                <span className="detail-value">{profile?.last_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{profile?.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Teléfono:</span>
                <span className="detail-value">{profile?.phone || 'No especificado'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Balance:</span>
                <span className="detail-value balance">${parseFloat(profile?.balance || 0).toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Estado:</span>
                <span className={`status-badge status-${profile?.status?.toLowerCase()}`}>
                  {profile?.status === 'ACTIVE' ? 'Activo' : profile?.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Miembro desde:</span>
                <span className="detail-value">{new Date(profile?.created_at).toLocaleDateString()}</span>
              </div>

              <div className="profile-actions">
                <button className="btn-primary" onClick={() => setIsEditing(true)}>
                  Editar Perfil
                </button>
                <button className="btn-danger" onClick={handleLogout}>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="firstName">Nombre</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Apellido</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  Guardar Cambios
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
