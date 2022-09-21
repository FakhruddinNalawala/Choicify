import { useQuery } from "@tanstack/react-query";
import { FC } from "react";
import { request } from "../../utils/sessionUtils";

export const Profile: FC = () => {
  const { data, isLoading, error, isError } = useQuery<any, Error>(
    ["user-profile"],
    async () => {
      let res = await request("/api/profile");
      if (!res.ok) throw new Error("Error while getting the user information");
      return await res.json();
    }
  );

  if (isLoading) return <div>Loading user info...</div>;
  if (isError) return <div>{error.message}</div>;
  return <div>{JSON.stringify(data)}</div>;
};
