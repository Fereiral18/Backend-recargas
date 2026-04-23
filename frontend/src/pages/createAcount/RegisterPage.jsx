import "./styles.css";
import { Link } from "react-router-dom";

import RegisterForm  from '../../components/form/RegisterForm';

export const RegisterPage = () => {
  return (
    <>
      <div className="login-page-new">
        <div className="top-divider">
          <nav>
            <Link className="login-page-logo" to="/">
              DiamantesFree
              <div className="logo-text">
                La aplicacion que abarca todo lo referente a las recargas
              </div>
            </Link>
            <div className="new-top-rigth">
              <div className="top-rigth-text">
                ¿Ya estas recargando con nosotros?
              </div>
              <Link to="/login" className="signup-top-rigth">
                Inicia sesion
              </Link>
            </div>
          </nav>
        </div>
        <div className="login-page-new_main">
          <div className="cu-background-login-register">
            <div className="img-background-login-register"></div>
          </div>
          <div className="container">
            <div className="signup_main">
              <div>
                <div className="signup-page-new">
                <h1 className="title-form">¡Regístrate en segundos!</h1>
                  <RegisterForm/>
                </div>
            
            </div>
              <div className="onBoarding">
                    Si haces click en el boton de arriba, aceptas nuestra{" "}
                    <a href="" className="cu-link">
                      condiciones de servicio
                    </a>{" "}
                    y{" "}
                    <a href="" className="cu-link">
                      politica de privacidad
                    </a>
                  </div>
              </div>
            <div className="register-page-teams">
              Descubre por que somos la plataforma mas confiable y segura al
              momento de recargar.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
