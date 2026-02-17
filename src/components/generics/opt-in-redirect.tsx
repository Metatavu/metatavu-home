import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotOptedInScreen from "../screens/not-opted-in-screen";

const OptInRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return <NotOptedInScreen />;
};

export default OptInRedirect;
