//funcion creada por jhesua
import { useRef } from 'react';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';   

import useRefresh from './use-refresh';
//-------------------------------------------------------

export default function useVerify() {
	const { setUser, setIsLoggedIn } = useUser();
	const { refreshToken } = useRefresh();
	const hasRefreshed = useRef(false);
	const navigate = useNavigate();   

	const verifyUser = async () => {
		try {
			const response = await fetch(`${import.meta.env.VITE_PUBLIC_HOST}/api/jwt/verify/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
			});
			
			if (!response.ok) {
                if (response.status === 401 && !hasRefreshed.current) {
					hasRefreshed.current = true;
                    await refreshToken(); // Usar la función compartida para manejar el refresco
                    return verifyUser(); // Reintentar la verificación después de refrescar
                } else {
                    toast.error('Error al autenticar.');
					throw new Error(`HTTP error! status: ${response.status}`);
				}
            }
			setIsLoggedIn(true);
			toast.info('Token verificado por el backend');
		} catch (error) {
			setIsLoggedIn(false);
			toast.error('Login failed. Please check your credentials.');
            navigate('/login', { replace: true });
		}
	}
	
	return {
		verifyUser,
	};
}