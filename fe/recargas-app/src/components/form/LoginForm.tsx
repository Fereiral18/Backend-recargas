import React, { useContext } from 'react';
'use client';
import useLogin  from '../../Hooks/use-login';
import Form from './FormBase';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../core/AuthContext/authContext';

export default function LoginForm() {
	const { email, password, isLoading, onChange, handleLogin } = useLogin();
	const navigate = useNavigate();
	const { setUserInfo } = useContext(AuthContext);
	
	const onSubmit = async (event) => {
		event.preventDefault();
		
		const result = await handleLogin();
		if (result.success) {
			setUserInfo(result.user);
			// Redirigir según el rol
			if (result.user?.role === 'ADMIN') {
				navigate("/admin");
			} else {
				navigate("/dashboard");
			}
		}
	};
	
	const config = [
		{
			labelText: 'Correo electronico',
			labelId: 'email',
			type: 'email',
			value: email,
			placeholder: 'Correo electronico',
			required: true,
		},
		{
			labelText: 'Contraseña',
			labelId: 'password',
			type: 'password',
			value: password,
			link: {
				linkText: 'olvidaste tu contraseña?',
				linkUrl: '/password-reset',
			},
			placeholder: 'Contraseña',
			required: true,
		},
	];

	return (
		<Form
			config={config}
			isLoading={isLoading}
			btnText='Iniciar sesion'
			onChange={onChange}
			onSubmit={onSubmit}
		/>
	);
}