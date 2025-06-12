import { Link } from "react-router-dom";
import Auth from "./Auth";
import { useLogin } from "../../hooks/useLogin";

const Login = () => {
  const { login, error } = useLogin();
  return (
    <>
      <Auth
        submitLabel="Login"
        onSubmit={(request) => login(request)}
        error={error}>
        <Link
          to={"/signup"}
          style={{
            alignSelf: "center",
            color: "#90caf9", // MUI default link color in dark mode
            textDecoration: "underline",
          }}>
          Signup
        </Link>
      </Auth>
    </>
  );
};
export default Login;
