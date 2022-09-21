import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

let accessTokenInternal: string | null = null;
export const useToken = (setLogIn: Dispatch<SetStateAction<boolean>>) => {
  const [loading, setLoading] = useState(accessTokenInternal === null);

  const setAccessToken = useCallback((accessToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    accessTokenInternal = accessToken;
    setLogIn(true);
    setLoading(false);
  }, []);

  const removeAccessToken = useCallback(() => {
    localStorage.removeItem("accessToken");
    accessTokenInternal = null;
    setLogIn(false);
  }, []);

  useEffect(() => {
    let accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      // TODO: make request to server to check the token and decide based on that to log in or not
      accessTokenInternal = accessToken;
      setLogIn(true);
    }
    setLoading(false);
  }, []);

  return { loading, setAccessToken, removeAccessToken };
};

export const request: (
  input: RequestInfo | URL,
  init?: RequestInit | undefined
) => Promise<Response> = (input, init) => {
  const headers = new Headers({
    "Content-Type": "application/json",
  });
  if (accessTokenInternal) {
    headers.append("Authorization", `Bearer ${accessTokenInternal}`);
  }
  const defaults = { headers: headers };
  init = Object.assign({}, defaults, init);
  return fetch(input, init);
};
