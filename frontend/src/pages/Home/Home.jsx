import React from "react";
import "./style.css";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";

import { Link } from "react-router-dom";
import { ResponsiveMenu } from "../../components/navBar/ResponsiveMenu";

export const Home = () => {
  return (
    <>
      <header id="inicio">
        <ResponsiveMenu />
      </header>
      <main>
        <section className="container-title-p">
          <article className="container-title">
            <h1 className="principal-title" >
              La mejor App, para tus recargas <br />
              juegos y plataformas.
            </h1>
            <div className="sub-title-container">
              <p className="sub-title">
                <strong>Somos lo mas confiable y rapido en el mercado</strong>{" "}
                al momento de recargar.
              </p>
            </div>
            <div className="btn-info">
              <div className="button-login fill-btn fill">
                <Link to="/login">
                  <span className="btn-go">
                    Recargar. EMPEZEMOS{" "}
                    <ArrowForwardIcon
                      sx={{
                        fontSize: "22px",
                        marginInlineStart: "8px",
                        marginBlock: "-3px",
                      }}
                    />{" "}
                  </span>
                </Link>
              </div>
              <div className="subtitle">
                <p>Seguro y Rapido.</p>
              </div>
            </div>
            <div className="aditional-info">
              <p>Confiado por miles de personas a nivel nacional.</p>
            </div>
          </article>

          <article className="manage-info">
            <div className="img-background-home">
              <div className="color-background"></div>
              <div className="list-img">
                <div className="item">
                  <img src="https://imgs.search.brave.com/9nWchqXQiE79mF-r96Jjm37xPbughbzSB4tRGuNctR8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJjYXZlLmNv/bS93cC93cDczMzc3/ODIuanBn" alt="" />
                </div>
                <div className="item">
                  <img src="https://imgs.search.brave.com/9VqES7xOY8pFm7AXvs17nOTq3D3wtQ5brQ-ziN4K9bA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJjYXZlLmNv/bS93cC93cDQyNzc0/NDAuanBn" alt="" />
                </div>
                <div className="item">
                  <img src="https://imgs.search.brave.com/hYLJ6i1BCW_ysVPxnl40lBv85Y3ZwdTdiX1JRuThUcQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJjYXQuY29t/L3cvZnVsbC8zLzAv/ZC8xODY4NDc0LTE5/MjB4MTA4MC1kZXNr/dG9wLTEwODBwLWdh/cmVuYS1mcmVlLWZp/cmUtd2FsbHBhcGVy/LXBob3RvLmpwZw" alt="" />
                </div>
                <div className="item">
                  <img src="https://imgs.search.brave.com/QX1PPCe8TMZ8JpAyxPNNysFZTfORKDu6OeYJZkuUEdk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJzLmNvbS9p/bWFnZXMvaGQvZ2Fy/ZW5hLWZyZWUtZmly/ZS1uZW9uLWNyaW1p/bmFscy1ucWw1ZzZt/N2kwYTRlcWc5Lmpw/Zw" alt="" />
                </div>
              </div>
            </div>
          </article>

          <article className="motivation">
            <div>La nueva era de jugadores ha llegado...</div>
            <div className="personal-champion">
              <img
                src="https://imgs.search.brave.com/GgDfXfapuhjRfHlBmSHuN39jsFzmkyHtJZAstzjAqHg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvNDcw/MjczNjEwL2VzL3Zl/Y3Rvci92aWN0b3Jp/YS1leHByZXNpJUMz/JUIzbi1kZS5qcGc_/cz02MTJ4NjEyJnc9/MCZrPTIwJmM9THdS/SFUtV2tCUWY3S3Z2/UThGWV9obkdibkZv/NzdSQy0zdHdybGN0/NFhEbz0"
                alt=""
              />
            </div>
          </article>

          <article className="marketing-box">
            <div className="marketing mark1">SUBSCRIBETE</div>

            <div className="marketing mark1">TORNEOS SEMANALES +</div>
            <div className="marketing ">GANA PREMIOS +</div>
            <div className="marketing mark1">DISFRUTA EL JUEGO +</div>
          </article>

          {/* Sección Torneos */}
          <article id="Torneos" className="tournaments-section">
            <div className="section-content">
              <h2 className="section-title">Torneos y Competencias</h2>
              <div className="tournaments-grid">
                <div className="tournament-card">
                  <h3>Torneos Semanales</h3>
                  <p>Participa en torneos semanales y compite con los mejores jugadores. Premios en diamantes y recargas gratis.</p>
                </div>
                <div className="tournament-card">
                  <h3>Ligas Mensuales</h3>
                  <p>Únete a nuestras ligas mensuales y sube de ranking. Los mejores jugadores reciben premios exclusivos.</p>
                </div>
                <div className="tournament-card">
                  <h3>Eventos Especiales</h3>
                  <p>Eventos temáticos con premios únicos. No te pierdas nuestras competencias especiales cada mes.</p>
                </div>
              </div>
            </div>
          </article>

          {/* Sección Servicios */}
          <article id="services" className="services-section">
            <div className="section-content">
              <h2 className="section-title">Nuestros Servicios</h2>
              <div className="services-grid">
                <div className="service-card">
                  <h3>🎮 Recargas Instantáneas</h3>
                  <p>Recarga diamantes en Free Fire, Mobile Legends, PUBG y más juegos en segundos. Proceso 100% automatizado y seguro.</p>
                </div>
                <div className="service-card">
                  <h3>💎 Mejores Precios</h3>
                  <p>Los precios más competitivos del mercado. Ofertas especiales y descuentos para usuarios frecuentes.</p>
                </div>
                <div className="service-card">
                  <h3>🔒 Seguridad Garantizada</h3>
                  <p>Transacciones seguras con encriptación de datos. Tu información está protegida en todo momento.</p>
                </div>
                <div className="service-card">
                  <h3>⚡ Atención 24/7</h3>
                  <p>Soporte técnico disponible las 24 horas. Resolvemos tus dudas y problemas de forma inmediata.</p>
                </div>
              </div>
            </div>
          </article>

          {/* Sección Soporte */}
          <article id="about" className="support-section">
            <div className="section-content">
              <h2 className="section-title">Soporte y Ayuda</h2>
              <div className="support-content">
                <div className="support-info">
                  <h3>¿Necesitas ayuda?</h3>
                  <p>Nuestro equipo de soporte está disponible 24/7 para ayudarte con cualquier consulta o problema.</p>
                  <ul>
                    <li>✓ Respuesta inmediata a tus consultas</li>
                    <li>✓ Ayuda con problemas de recargas</li>
                    <li>✓ Asesoramiento sobre métodos de pago</li>
                    <li>✓ Soporte técnico especializado</li>
                  </ul>
                  <div className="support-buttons">
                    <Link to="/support" className="btn-support">
                      Abrir Ticket de Soporte
                    </Link>
                  </div>
                </div>
                <div className="faq-section">
                  <h3>Preguntas Frecuentes</h3>
                  <div className="faq-item">
                    <h4>¿Cuánto tiempo tarda la recarga?</h4>
                    <p>Las recargas son instantáneas, generalmente en menos de 2 minutos.</p>
                  </div>
                  <div className="faq-item">
                    <h4>¿Qué métodos de pago aceptan?</h4>
                    <p>Aceptamos transferencias bancarias, tarjetas de crédito/débito y pagos electrónicos.</p>
                  </div>
                  <div className="faq-item">
                    <h4>¿Es seguro recargar aquí?</h4>
                    <p>Sí, todas las transacciones están encriptadas y protegidas. Miles de usuarios confían en nosotros.</p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>
      </main>

      <footer id="contact">

        <div className="contacts-icon">
          <div>
            <img className="x" src="src\assets\gorjeo.png" alt="Facebook" />
          </div>
          <div>
            <InstagramIcon />
          </div>
          <div>
            <FacebookIcon />
          </div>
        </div>
        <div className="info-footer footers">

          <div >
            <span> © 2025 recargas</span>
          </div>
          <div>terminos</div>
          <div>seguridad</div>
          <div>Torneos</div>
        </div>
      </footer>
    </>
  );
};
