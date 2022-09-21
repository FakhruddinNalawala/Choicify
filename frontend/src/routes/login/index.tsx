import { FC } from "react";
import { GOOGLE_AUTH_URL } from "../../constants";
import "./style.css";

export const LogIn: FC = () => {
  return (
    <div className="flex justify-center">
      <a
        className="login-with-google-btn"
        href={GOOGLE_AUTH_URL}
        style={{ boxSizing: "border-box", height: "100%", display: "block" }}
      >
        Sign in with Google
      </a>
    </div>
  );
};
