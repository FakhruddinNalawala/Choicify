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
import { Home } from "./routes/Home";
import { Lists } from "./routes/lists";
import { Settings } from "./routes/settings";
import { NewDecisionList } from "./routes/decisionList/new";
import { FullPageLoader } from "./components/FullPageLoader";
import "react-toastify/dist/ReactToastify.css";
import { EditDecisionList } from "./routes/decisionList/edit";

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
        path: "/",
        element: <Home />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/lists",
        element: <Lists />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/list/new",
        element: <NewDecisionList />,
      },
      {
        path: "/list/edit/:decisionListId",
        element: <EditDecisionList />,
        loader: async ({ params }) => {
          let res = await request(`/api/decisionList/${params.decisionListId}`);
          if (!res.ok) {
            return redirect("/error"); // TODO: go to route showing that there was an error with the deicision list, most likely they don't have access to it
          }
          return await res.json();
        },
      },
    ],
  },
  {
    path: "login",
    element: <LogIn />,
    loader: async () => {
      let res = await request("/api/test_session");
      if (res.ok) {
        return redirect("/");
      }
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
      <RouterProvider router={router} fallbackElement={<FullPageLoader />} />
    </QueryClientProvider>
  </React.StrictMode>
);
