import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";
import Root from "./routes/root";
import { LogIn } from "./routes/login";
import "./index.css";
import { request } from "./utils/sessionUtils";
import { OauthRedirect } from "./routes/oauth2/redirect";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Profile } from "./routes/profile";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    loader: async () => {
      let res = await request("/api/test_session");
      if (!res.ok) {
        return redirect("/login");
      }
      return "Log In";
    },
    children: [
      {
        path: "/profile",
        element: <Profile />,
      },
    ],
  },
  {
    path: "login",
    element: <LogIn />,
    loader: async () => {
      let res = await request("/api/test_session");
      // if (res.ok) {
      //   return redirect("/");
      // }
      return "Not Log In";
    },
  },
  {
    path: "oauth2/redirect",
    element: <OauthRedirect />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
