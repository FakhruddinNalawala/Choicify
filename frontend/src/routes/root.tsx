import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";

function Root() {
  return (
    <div className="App">
      <Sidebar />
      <Outlet />
    </div>
  );
}

export default Root;
