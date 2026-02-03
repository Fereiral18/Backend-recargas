import React from 'react';
import { ChangeEvent, FormEvent } from "react";
import "./style.css";
import { Config } from './fromType';
import Input from './Input';
import { Link } from 'react-router-dom';







interface Props {
  config: Config[];
  isLoading: boolean;
  btnText: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function Form({
  config,
  isLoading,
  btnText,
  onChange,
  onSubmit,
}: Props) {

  return (

    <>
      <form onSubmit={onSubmit} className="signup-form">
        {
          config.map((input) => (
            <div key={input.labelId}>

            <Input
              key={input.labelId}
              labelId={input.labelId}
              type={input.type}
              onChange={onChange}
              value={input.value}
              link={input.link}
              required={input.required}
              placeholder={input.placeholder}
              />

              {input.link && (
        
                <div className="text-sm">
              <Link className="show-pwd" to={input.link?.linkUrl}>
              {input.link?.linkText}
              </Link>
              </div>
          )}
          </div>
          ))
        }


       {/*
       
       {
       config.map((item) =>
       (
       item.link && (
        
       <div className="text-sm">
       <Link className="show-pwd" to={item.link?.linkUrl}>
       {item.link?.linkText}
       </Link>
       </div>
      ))
    )}//
    */} 
    

        <div className="separations cu-form_row" >
          <div className="line"></div>
          <div className="circle">O</div>
          <div className="line"></div>
        </div>
        <div>

          <button
            type="submit"
            className="btn-block cu-form_row"
            disabled={isLoading}
            style={{ color: "white", marginTop: "9px", cursor: "pointer" }}

          >
            {btnText}
          </button>





        </div>
      </form>
    </>
  );
}
