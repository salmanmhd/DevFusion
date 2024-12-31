import { useEffect, useState } from "react";
import { useUser } from "../context/User.context";
import { useNavigate } from "react-router-dom";

function UserAuth({ children }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = useUser();
  const token = localStorage.getItem("token");
  console.log(user);
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !user) {
      navigate("/login");
    } else {
      setLoading(false);
    }
  }, [navigate, user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
export default UserAuth;
