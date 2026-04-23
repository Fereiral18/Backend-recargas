import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import "./style.css";
import { Link, useLocation } from "react-router-dom";

export const NavBarDashboard = (props) => {
  const { state } = useLocation();

  const navBarDashboard = [
    
  ]

  return (
    <>
      <nav className="navigation-2">
        <div className="log">
          <Link to="/">
            <picture>
              <img
                className="logo-dashboard-init"
                src="src\assets\WhatsApp Image 2024-12-12 at 1.29.27 AM.jpeg"
                alt=""
              />{" "}
            </picture>
          </Link>
        </div>

        <>
          {state?.logged ? (
            <>
              <div className="cu-box-dashboard-info">
                <div className="search-dashboard">
                  <div className="searchIcon">
                    <SearchIcon />
                  </div>
                  <input type="text" placeholder="Buscar..." />
                </div>
              </div>
              <span className="cu-btn-name">
                <>
                  <div className="cu-btn-logout">
                    <button className="btn-users-dashboard">
                      <div>{state?.name}</div>
                      <Link to="/" className=""></Link>
                      {/* <KeyboardArrowDownIcon /> */}
                    </button>
                  </div>
                </>
              </span>
            </>
          ) : (
            ""
          )}
        </>
      </nav>
    </>
  );
};
