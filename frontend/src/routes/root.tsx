import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { ToastContainer } from "react-toastify";

function Root() {
  return (
    <div className="App" style={{ fontFamily: "Dangrek" }}>
      <Sidebar />
      <Outlet />
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default Root;
