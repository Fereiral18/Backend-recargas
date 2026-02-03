import React, { useState } from "react";

export const FormInputs = (initialForm = {}) => {
  const [formulario, setFormulario] = useState(initialForm);

  const handleOnChange = (e) => {
    const { value, name } = e.target;
    setFormulario({ ...formulario, [name]: value });
  };
  const onResetForm = () => {
    setFormulario(initialForm);
  };

  return {
    ...formulario,
    formulario,
    handleOnChange,
    onResetForm,
  };
};
