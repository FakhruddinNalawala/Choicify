import { FC } from "react";
import { GOOGLE_AUTH_URL } from "../../constants";
import "./style.css";

export const LogIn: FC = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div
        id="login-title"
        className="mb-12 text-center text-7xl md:text-8xl lg:text-9xl"
      >
        Choicify
      </div>
      <div className="flex justify-center text-center">
        <a
          className="login-with-google-btn"
          href={GOOGLE_AUTH_URL}
          style={{
            boxSizing: "border-box",
            display: "block",
            maxWidth: "200px",
          }}
        >
          Sign in with Google
        </a>
      </div>
    </div>
  );
};
