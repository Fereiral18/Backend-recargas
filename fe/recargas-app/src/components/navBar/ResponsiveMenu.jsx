import React, { useState, useEffect } from "react";

import "./style.css"; // Los estilos los veremos después
import { Link } from "react-router-dom";

export const ResponsiveMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar el tamaño de la pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 1100);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { label: "Inicio", href: "#inicio" },
    { label: "Torneos", href: "#Torneos" },
    { label: "Servicios", href: "#services" },
    { label: "Soporte", href: "#about" },
    { label: "Contacto", href: "#contact" },
  ];
console.log({isOpen})
console.log({isMobile})
  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <div className="logo">
          <Link to="/">
            <div className="logo">DiamantesFree</div>
            <span className="logo-info">la mejor APP para recargas</span>
          </Link>
        </div>
        {/* Menú para desktop */}
        {!isMobile && (
          <div className="nav-menu">
            {menuItems.map((item, index) => (
              <a key={index} href={item.href} className="nav-link">
                {item.label}
              </a>
            ))}
          </div>
        )}

        <div className="login-register">
          <Link className="login-register btn-login" to="/login">
            <span className="box-login">Iniciar sesión</span>
          </Link>

          <div className="register-button">
            <Link to="create" className="btn">
              <span className="btn-register">Crear cuenta</span>
            </Link>
          </div>
        </div>

        {/* Botón hamburguesa para mobile */}
        {isMobile && (
          <>
            <button
              className="menu-toggle"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <div className="menu">
                <p className="menu-item-principal">_</p>
                <p className="menu-item">_</p>
                <p className="menu-item">_</p>
              </div>
            </button>

            {/* Menú desplegable */}
            {isOpen && (
              <div className={`mobile-menu ${isOpen ? "active" : "desactived"}`}>
                {menuItems.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className="mobile-link"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}

            {/* Overlay para cerrar el menú */}
            {isOpen && (
              <div className="menu-overlay" onClick={() => setIsOpen(false)} />
            )}
          </>
        )}
      </div>
    </nav>
  );
};
