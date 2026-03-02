import { useState, useEffect } from "react";
import { Container, Typography } from "@mui/material";
import strings from "src/localization/strings";
import { useNavigate } from "react-router-dom";

/**
  * Component that redirects users who have not opted in
  * to home page after countdown timer 
  * if they try to access a page that requires opt in
 */
const OptInRedirect = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown === 0) {
      navigate("/", { replace: true });
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <Container>
      <Typography variant="h3">{strings.notOptedInDescription.title}</Typography>
      <Typography>{strings.notOptedInDescription.redirectingMessage} {countdown}</Typography>
    </Container>
  );
};

export default OptInRedirect;