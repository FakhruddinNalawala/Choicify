import {
  ReactElement,
  FC,
  createContext,
  SetStateAction,
  useState,
  Dispatch,
} from "react";
import { useToken } from "../utils/sessionUtils";
import { ProfilePicture } from "./ProfilePicture";

const defaultValue: {
  isLogIn: boolean;
  setLogIn: Dispatch<SetStateAction<boolean>>;
} = {
  isLogIn: false,
  setLogIn: () => {},
};

export const logInContext = createContext(defaultValue);

export const ProfileLayout: FC<{ children: ReactElement }> = ({ children }) => {
  const [isLogIn, setLogIn] = useState(false);
  const { loading } = useToken(setLogIn);
  return (
    <div>
      <logInContext.Provider value={{ isLogIn, setLogIn }}>
        {loading ? (
          <div>Loading</div>
        ) : (
          <div>
            <ProfilePicture />
            {children}
          </div>
        )}
      </logInContext.Provider>
    </div>
  );
};
