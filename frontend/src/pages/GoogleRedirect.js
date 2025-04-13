import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

const GoogleRedirect = () => {
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    console.log(params)

    const token = params.get("token");
    const username = params.get("username");
    const userType = params.get("userType");

    if (token && username && userType) {
      const user = { token, username, userType };
      console.log(user)

      // Save user data to localStorage and context
      localStorage.setItem("user", JSON.stringify(user));
      dispatch({ type: "LOGIN", payload: user });

      // Navigate to home page
      navigate("/");  // You can change this to "/" if needed
    }
  }, [dispatch, navigate]);

  return <p>Logging you in...</p>;
};

export default GoogleRedirect;
