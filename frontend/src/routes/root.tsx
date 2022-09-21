import { Outlet, useNavigate } from "react-router-dom";
import { removeToken } from "../utils/sessionUtils";

function Root() {
  const navigate = useNavigate()

  return (
    <div className="App">
      <button onClick={() => {
        removeToken();
        navigate("/login")
      }}>Log Out</button>
      <div>You are in</div>
      <Outlet />
    </div>
  );
}

export default Root;
