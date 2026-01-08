import { Navigate } from "react-router-dom";

export function RootRedirect() {
  // route: path: "/"
  // redirect to "/home"
  return <Navigate to="/home" replace />;
}
