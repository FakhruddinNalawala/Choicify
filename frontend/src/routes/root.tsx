import { Outlet, useNavigate } from "react-router-dom";
import { removeToken } from "../utils/sessionUtils";

function Root() {
  const navigate = useNavigate();

  return (
    <div className="App">
      <div className="absolute top-0 right-0">
        <button
          onClick={() => {
            removeToken();
            navigate("/login");
          }}
        >
          Log Out
        </button>
        <div>Profile Picture</div>
      </div>
      <Outlet />
    </div>
  );
}

export default Root;
