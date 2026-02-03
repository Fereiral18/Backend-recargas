import React from "react";
import "./styles.css";
import { AppRouter } from "./router/AppRouter";

export const App = () => {
  return (
    <>
      <div className="general-container">

          <AppRouter />
     
      </div>
    </>
  );
};
