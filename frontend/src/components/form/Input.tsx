import React, { ChangeEvent } from 'react';
//Input personalizado para ser reutilizado en todos los formularios
import { Config } from "./fromType";
import { Link } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";



export default function Input({
  labelId,
  type,
  value,
  onChange,
  children,
  link,
  required = false,
  placeholder,
}: Config) {

  return (
    <div>
      
      <div className="cu-form_row">
        <div className="cu-form-icon">
          
			{
        
				labelId == 'name_completed' ? <PersonIcon sx={{ width: "20px" }} /> :  labelId == 'email' ?  <EmailIcon sx={{ width: "20px" }} /> : labelId == 'password' ? <LockIcon sx={{ width: "20px" }} /> : ""
			}

          
        </div>
        <input
          id={labelId}
            className="cu-form-input"
          name={labelId}
          type={type}
          onChange={onChange}
          value={value}
          required={required}
          placeholder={placeholder}
        />
      </div>
      
       
    </div>
  );
}
