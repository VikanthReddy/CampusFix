import { useState } from "react";
import api from "../services/api";

function Login({ onLogin, onSwitchToSignup }) {

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response =
                await api.post(
                    "/auth/login",
                    {
                        email: email.trim(),
                        password
                    }
                );

            const data =
                response.data;

            if (
                !data ||
                !data.token ||
                !data.role
            ) {
                throw new Error(
                    "Invalid login response."
                );
            }


            const loggedUser = {
                id: data.id,
                name: data.name,
                email: data.email,
                role: data.role
            };


            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(
                    loggedUser
                )
            );


            if (onLogin) {
                onLogin(
                    loggedUser,
                    data.token
                );
            }

        } catch (err) {

            console.error(
                "Login error:",
                err
            );

            const serverMessage =
                err.response?.data;

            if (
                typeof serverMessage ===
                "string"
            ) {

                setError(
                    serverMessage
                );

            } else if (
                serverMessage?.message
            ) {

                setError(
                    serverMessage.message
                );

            } else {

                setError(
                    "Invalid email or password."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    return (
        <div className="auth-container">

            <div className="auth-card">

                <h1>
                    CampusFix
                </h1>

                <p className="auth-subtitle">
                    Institutional Complaint Management System
                </p>


                <h2>
                    Login
                </h2>


                <form
                    onSubmit={handleLogin}
                >

                    {/* EMAIL */}

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) =>
                            setEmail(
                                e.target.value
                            )
                        }
                        required
                    />


                    {/* PASSWORD */}

                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) =>
                            setPassword(
                                e.target.value
                            )
                        }
                        required
                    />


                    {/* ERROR */}

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}


                    {/* LOGIN */}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>


                {/* SIGNUP */}

                <p className="switch-auth">

                    Don't have an account?

                    <button
                        type="button"
                        onClick={
                            onSwitchToSignup
                        }
                    >
                        Sign Up
                    </button>

                </p>

            </div>

        </div>
    );
}

export default Login;