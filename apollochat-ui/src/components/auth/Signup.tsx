import { Link } from "react-router-dom";
import { TextField } from "@mui/material";
import Auth from "./Auth";
import { useCreateUser } from "../../hooks/useCreateUser";
import { useState } from "react";
import { extractErrorMessage } from "../../utils/errors";
import { useLogin } from "../../hooks/useLogin";
import { UNKNOWN_ERROR_MESSAGE } from "../../constants/error";

const Signup = () => {
  const [createUser] = useCreateUser();
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const { login } = useLogin();
  return (
    <Auth
      submitLabel="Signup"
      error={error}
      extraFields={[
        <TextField
          type="text"
          label="Username"
          variant="outlined"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          error={!!error}
          helperText={error}
        />,
      ]}
      onSubmit={async ({ email, password }) => {
        try {
          await createUser({
            variables: {
              createUserInput: {
                email,
                username,
                password,
              },
            },
          });
          await login({ email, password });
          setError("");
        } catch (error) {
          const errorMessage = extractErrorMessage(error);
          if (errorMessage) {
            setError(errorMessage);
            return;
          }
          setError(UNKNOWN_ERROR_MESSAGE);
        }
      }}>
      <Link
        to={"/login"}
        style={{
          alignSelf: "center",
          color: "#90caf9", // MUI default link color in dark mode
          textDecoration: "underline",
        }}>
        Login
      </Link>
    </Auth>
  );
};

export default Signup;
