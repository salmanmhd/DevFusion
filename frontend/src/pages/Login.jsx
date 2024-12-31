import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import InputItems from "../components/InputItems";
import { useUser } from "../context/User.context";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const res = await axios.post("/users/login", {
        email,
        password,
      });
      if (res) {
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        console.log("user logged in", res.data.user);
        navigate("/");
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setError("");
      setPassword("");
      setEmail("");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-lg">
        <h2 className="mb-6 text-center text-3xl font-bold text-white">
          Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded bg-red-500 p-3 text-center text-white">
              {error}
            </div>
          )}
          <InputItems
            placeholderText={"Enter your email"}
            labelText={"Email"}
            value={email}
            setValue={setEmail}
            type={"email"}
          />
          <InputItems
            placeholderText={"Enter your password"}
            labelText={"Password"}
            value={password}
            setValue={setPassword}
            type={"password"}
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-500"
          >
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-400 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
