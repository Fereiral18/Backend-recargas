import "../createAcount/styles.css";
import { Link} from "react-router-dom";
import LoginForm from "../../components/form/LoginForm";

export const Login = () => {


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
              <div className="top-rigth-text">¿No tienes aun cuenta?</div>
              <Link to="/create" className="signup-top-rigth">
                Registrate
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
                 <h1 className="title-form">¡Te damos la bienvenida de nuevo!</h1>
                  <LoginForm />
                  
                </div>
              </div>
            </div>
            <div>
              <div className="bot-logos">
                <span className="text-register">
                  ¿No tienes cuenta?
                  <Link to="/create" className="register-btn-not-count">
                    {" "}
                    Registrate
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="login-page-teams">
          Este sitio esta protegido por reCAPTCHA, y se aplican{" "}
          <a href="https://policies.google.com/privacy">
            la politica de privacidad
          </a>{" "}
          y las{" "}
          <a href="https://policies.google.com/terms">
            condiciones de servicio
          </a>{" "}
          de Google.
        </div>
      </div>
    </>
  );
};
