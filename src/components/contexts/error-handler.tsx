import { Divider, Typography } from "@mui/material";
import { useAtom } from "jotai";
import { type ReactNode, useMemo } from "react";
import { errorAtom } from "src/atoms/error";
import GenericDialog from "../generics/generic-dialog";

/**
 * Component properties
 */
interface Props {
  children: ReactNode;
}

/**
 * Error handler component
 *
 * @param props component properties
 */
const ErrorHandler = ({ children }: Props) => {
  const [error, setError] = useAtom(errorAtom);

  /**
   * Handles error message
   *
   * @param message error message
   * @param err any error
   */
  const handleError = async (message: string, err?: object) => {
    setError(message);

    if (err instanceof Response) {
      try {
        const errorJson = await err.json();
        console.error(errorJson);
        setError(errorJson.message);
      } catch {
        setError(JSON.stringify(err));
      }
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError(JSON.stringify(err));
    }
  };

  /**
   * Memoized context value
   */
  useMemo(
    () => ({
      setError: handleError
    }),
    [error]
  );

  /**
   * Component render
   */
  return (
    <>
      {children}
      <GenericDialog
        open={error !== undefined}
        error={false}
        onClose={() => setError(undefined)}
        onCancel={() => setError(undefined)}
        onConfirm={() => setError(undefined)}
        cancelButtonText={"Close"}
        title={"An error has occurred"}
      >
        {
          <Typography
            sx={{
              marginBottom: 3,
              fontSize: 16,
              fontWeight: "bold"
            }}
          >
            {error}
          </Typography>
        }
        <Divider />
      </GenericDialog>
    </>
  );
};

export default ErrorHandler;
