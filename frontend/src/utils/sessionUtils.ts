let accessTokenInternal: string | null = null;
accessTokenInternal = localStorage.getItem("accessToken");

export const setToken = (accessToken: string) => {
  localStorage.setItem("accessToken", accessToken);
  accessTokenInternal = accessToken;
};

export const removeToken = () => {
  localStorage.removeItem("accessToken");
  accessTokenInternal = null;
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
