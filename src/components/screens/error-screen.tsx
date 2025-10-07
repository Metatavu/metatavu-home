import { Container } from "@mui/material";
import { useRouteError } from "react-router-dom";
import strings from "src/localization/strings";

/**
 * Component properties
 */
interface Props {
  title?: string;
  message?: string;
}

/**
 * Error page for displaying error status text and message
 */
const ErrorScreen = ({ title, message }: Props) => {
  const error: unknown = useRouteError();

  return (
    <Container>
      <h1>{title ?? strings.error.oops}</h1>
      <p>{message ?? strings.error.generic}</p>
      <p>
        <i>{(error as Error)?.message || (error as { statusText?: string })?.statusText}</i>
      </p>
    </Container>
  );
};

export default ErrorScreen;
