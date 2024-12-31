import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home, { loader as projectLoader } from "../pages/Home";
import Projects from "../pages/Projects";
import UserAuth from "../auth/UserAuth";

function Approutes() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <UserAuth>
          <Home />
        </UserAuth>
      ),
      // loader: projectLoader,
    },
    {
      path: "login",
      element: <Login />,
    },
    {
      path: "register",
      element: <Register />,
    },
    {
      path: "project",
      element: (
        <UserAuth>
          <Projects />
        </UserAuth>
      ),
    },
  ]);
  return <RouterProvider router={router} />;
}

export default Approutes;
