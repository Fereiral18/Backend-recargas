
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppRouter } from "./router/AppRouter";


export const App = () => {
  return (
    <>
      <div className="general-container">

          <AppRouter />

          <ToastContainer
            position="top-right"
            theme="dark"
            autoClose={4000}
          />

      </div>
    </>
  );
};
