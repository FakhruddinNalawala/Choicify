import { useQuery } from "@tanstack/react-query";
import { FC, useEffect } from "react";
import { request, setToken } from "../../../utils/sessionUtils";
import { Navigate } from "react-router-dom";

let token: string | null = null;
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop as string),
}) as any;
token = params.token;
if (token) setToken(token);

export const OauthRedirect: FC = () => {
  const { isLoading, error, isError } = useQuery<any, Error>(
    ["test-session"],
    async () => {
      let res = await request("/api/test_session");
      if (res.ok) {
        return res.json();
      }
      throw new Error(await res.text());
    }
  );

  if (!isLoading && !isError) {
    return <Navigate to="/" />
  }

  if (isLoading) {
    return (
      <div>
        <div>Signing in to Choicify</div>
      </div>
    );
  }

  if (isError) return <div>{error.message}</div>;

  return <div>All done</div>;
};
