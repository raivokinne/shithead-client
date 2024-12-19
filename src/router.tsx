import { createBrowserRouter } from "react-router";

import Home from "./pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Create from "./pages/lobby/Create";
import Index from "./pages/lobby/Index";
import Show from "./pages/lobby/Show";
import Profile from "./pages/Profile";
import GameShow from "./pages/game/Show";
import GameIndex from "./pages/game/Index";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/lobbies",
    element: <Index />,
  },
  {
    path: "/lobbies/new",
    element: <Create />,
  },
  {
    path: "/lobbies/:id/show",
    element: <Show />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/games/:id",
    element: <GameShow />,
  },
  {
    path: "/game",
    element: <GameIndex />,
  },
  {
    path: "/game/:id/show",
    element: <GameShow />,
  },
]);
