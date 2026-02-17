import { Container } from "@mui/material";
import strings from "src/localization/strings";

/**
 * Screen displayed when user is not opted in
 */
const NotOptedInScreen = () => {
  return (
    <Container>
      <h1>{strings.notOptedInDescription.title}</h1>
      <p>{strings.notOptedInDescription.redirectingMessage}</p>
    </Container>
  );
};

export default NotOptedInScreen;
