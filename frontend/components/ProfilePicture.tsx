import { FC, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { request, useToken } from "../utils/sessionUtils";
import { logInContext } from "./ProfileLayout";

const RenderPicture: FC = () => {
  const { data, isLoading, error, isError } = useQuery<any, Error>(
    ["profile-picture"],
    async () => {
      let response = await request("/api/profile");
      if (response.ok) {
        return response.json();
      }
      throw new Error("Error loading the data");
    }
  );

  if (isLoading) return null;

  if (isError) {
    return <div>{error.message}</div>;
  }
  return <div>{JSON.stringify(data)}</div>;
};

export const ProfilePicture: FC = () => {
  const { isLogIn, setLogIn } = useContext(logInContext);
  const { removeAccessToken } = useToken(setLogIn);
  if (isLogIn) {
    return (
      <div>
        <RenderPicture />
        <button onClick={() => removeAccessToken()}>Log out</button>
      </div>
    );
  }
  return null;
};
