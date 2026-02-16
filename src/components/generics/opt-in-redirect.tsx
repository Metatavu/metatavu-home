import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ErrorScreen from "../screens/error-screen";

const OptInRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return <ErrorScreen title="Not Opted In" message="You are not opted in. Redirecting to home page..." />;
};

export default OptInRedirect;
