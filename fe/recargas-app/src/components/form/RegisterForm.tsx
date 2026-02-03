import React from 'react';
'use client';

import useRegister from '../../Hooks/use-register';
import  Form  from './FormBase';

export default function RegisterForm() {
	const {
		firstName,
		lastName,
		email,
		phone,
		password,
		re_password,
		isLoading,
		onChange,
		onSubmit,
	} = useRegister();
	
	// Pasamos los inputs del formulario
	const config = [
		{
			labelText: 'Nombre',
			labelId: 'firstName',
			type: 'text',
			value: firstName,
			placeholder: 'Nombre',
			required: true,
		},
		{
			labelText: 'Apellido',
			labelId: 'lastName',
			type: 'text',
			value: lastName,
			placeholder: 'Apellido',
			required: true,
		},
		{
			labelText: 'Correo electronico',
			labelId: 'email',
			type: 'email',
			value: email,
			placeholder: 'Correo electronico',
			required: true,
		},
		{
			labelText: 'Teléfono (opcional)',
			labelId: 'phone',
			type: 'tel',
			value: phone,
			placeholder: '+54 9 11 1234-5678',
			required: false,
		},
		{
			labelText: 'Contraseña',
			labelId: 'password',
			type: 'password',
			value: password,
			placeholder: 'Contraseña',
			required: true,
		},
		{
			labelText: 'Confirma la contraseña',
			labelId: 're_password',
			type: 'password',
			placeholder: 'Confirma la contraseña',
			value: re_password,
			required: true,
		},
	];

	return (
		<Form
			config={config}
			isLoading={isLoading}
			btnText='Crear cuenta'
			onChange={onChange}
			onSubmit={onSubmit}
		/>
	);
}