//funcion creada por jhesua
import { useState } from 'react';
import { authService } from '../services';
import { toast } from 'react-toastify';

export default function useLogin() {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});

	const [isLoading, setIsLoading] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(authService.isAuthenticated());

	const { email, password } = formData;

	const onChange = (event) => {
		const { name, value } = event.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleLogin = async () => {
		if (!email || !password) {
			toast.error('Por favor completa todos los campos');
			return { success: false };
		}

		setIsLoading(true);
		try {
			const response = await authService.login({ email, password });
			setIsLoggedIn(true);
			toast.success('¡Inicio de sesión exitoso!');
			return { success: true, user: response.data.user };
		} catch (error) {
			console.error('Error en login:', error);
			toast.error(error.message || 'Error al iniciar sesión');
			setIsLoggedIn(false);
			return { success: false };
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogout = () => {
		authService.logout();
		setIsLoggedIn(false);
		toast.info('Sesión cerrada');
	};

	return {
		email,
		password,
		isLoading,
		onChange,
		isLoggedIn,
		handleLogin,
		handleLogout,
	};
}