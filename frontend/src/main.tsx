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
import { NewDecisionList } from "./routes/decisionList/new";
import { FullPageLoader } from "./components/FullPageLoader";
import "react-toastify/dist/ReactToastify.css";
import { EditDecisionList } from "./routes/decisionList/edit";
import { Lobby } from "./routes/lobby";
import { PlayTournament } from "./routes/tournament/play";
import {
  IListTournamentLoaderType,
  ITournament,
  ListTournaments,
} from "./routes/decisionList/tournaments";
import { ErrorPage } from "./routes/error";
import { TournamentBracket } from "./routes/tournament/bracket";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
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
        path: "/error",
        element: <ErrorPage />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/lists",
        element: <Lists />,
        loader: async () => {
          let res = await request(`/api/decisionList`);
          if (!res.ok) {
            throw new Error(await res.text());
          }
          return await res.json();
        },
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
            throw new Error(await res.text());
          }
          return await res.json();
        },
      },
      {
        path: "/list/:decisionListId/tournaments",
        element: <ListTournaments />,
        loader: async ({ params }) => {
          let res = await request(
            `/api/decisionList/${params.decisionListId}/tournaments`
          );
          if (!res.ok) {
            throw new Error(await res.text());
          }
          let result: IListTournamentLoaderType = await res.json();
          let relativeFormatter = new Intl.RelativeTimeFormat();
          let absoluteFormatter = new Intl.DateTimeFormat();
          let timeNow = new Date().getTime();
          for (let t of result.tournaments) {
            let daysAgo = Math.round(
              (t.startTime - timeNow) / (1000 * 60 * 60 * 24)
            );
            if (Math.abs(daysAgo) > 31) {
              t.date = absoluteFormatter.format(t.startTime);
              continue;
            }
            t.date = relativeFormatter.format(daysAgo, "days");
          }
          return result;
        },
      },
      {
        path: "/lobby/:lobbyCode",
        element: <Lobby />,
        loader: async ({ params }) => {
          let res = await request(`/api/lobby/${params.lobbyCode}`);
          if (!res.ok) {
            throw new Error(await res.text());
          }
          return await res.json();
        },
      },
      {
        path: "/tournament/play/:id",
        element: <PlayTournament />,
        loader: async ({ params }) => {
          let res = await request(`/api/tournament/${params.id}`);
          if (!res.ok) {
            throw new Error(await res.text());
          }
          return await res.json();
        },
      },
      {
        path: "/tournament/bracket/:id",
        element: <TournamentBracket />,
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
