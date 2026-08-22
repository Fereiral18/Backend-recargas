import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';
import { toast } from 'react-toastify';

export default function useRegister() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);

	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		password: '',
		re_password: '',
	});

	const { firstName, lastName, email, phone, password, re_password } = formData;

	const onChange = (event) => {
		const { name, value } = event.target;
		setFormData({ ...formData, [name]: value });
	};

	const onSubmit = async (event) => {
		event.preventDefault();

		// Validaciones
		if (!firstName || !lastName || !email || !password || !re_password) {
			toast.error('Por favor completa todos los campos obligatorios');
			return;
		}

		if (password !== re_password) {
			toast.error('Las contraseñas no coinciden');
			return;
		}

		if (password.length < 6) {
			toast.error('La contraseña debe tener al menos 6 caracteres');
			return;
		}

		setIsLoading(true);
		try {
			// Preparar datos para el backend
			const userData = {
				firstName,
				lastName,
				email,
				phone: phone || undefined, // Opcional
				password,
			};

			const response = await authService.register(userData);
			toast.success('¡Registro exitoso! Redirigiendo...');
			
			// Redirigir al dashboard después de 1 segundo
			setTimeout(() => {
				navigate('/dashboard');
			}, 1000);
		} catch (error) {
			console.error('Error en registro:', error);
			toast.error(error.message || 'Error al registrar usuario');
		} finally {
			setIsLoading(false);
		}
	};

	return {
		firstName,
		lastName,
		email,
		phone,
		password,
		re_password,
		isLoading,
		onChange,
		onSubmit,
		
	};
}