import { useState } from "react";
import api from "../services/api";

function Login({ onLogin, onSwitchToSignup }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const [mode, setMode] = useState("login"); // login, forgot, reset
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email: email.trim(),
                password
            });

            const data = response.data;
            if (!data || !data.token || !data.role) {
                throw new Error("Invalid login response.");
            }

            const loggedUser = {
                id: data.id,
                name: data.name,
                email: data.email,
                role: data.role
            };

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(loggedUser));

            if (onLogin) {
                onLogin(loggedUser, data.token);
            }

        } catch (err) {
            console.error("Login error:", err);
            const serverMessage = err.response?.data;
            if (typeof serverMessage === "string") {
                setError(serverMessage);
            } else if (serverMessage?.message) {
                setError(serverMessage.message);
            } else {
                setError("Invalid email or password.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await api.post("/auth/forgot-password", { email: email.trim() });
            setSuccess("OTP sent successfully to your email.");
            setMode("reset");
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || "Unable to process request.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await api.post("/auth/reset-password", { 
                email: email.trim(), 
                otp: otp.trim(), 
                newPassword 
            });
            setSuccess("Password reset successfully. You can now login.");
            setMode("login");
            setPassword("");
            setOtp("");
            setNewPassword("");
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || "Unable to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>CampusFix</h1>
                <p className="auth-subtitle">Institutional Complaint Management System</p>

                {mode === "login" && <h2>Login</h2>}
                {mode === "forgot" && <h2>Forgot Password</h2>}
                {mode === "reset" && <h2>Reset Password</h2>}

                {error && <div className="auth-error">{error}</div>}
                {success && <div className="success-message" style={{padding: '10px', color: 'green', marginBottom: '10px'}}>{success}</div>}

                {mode === "login" && (
                    <form onSubmit={handleLogin}>
                        <label>Email</label>
                        <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <label>Password</label>
                        <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        
                        <div style={{textAlign: 'right', marginBottom: '10px'}}>
                            <button type="button" className="switch-auth-btn" style={{background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer'}} onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }}>
                                Forgot Password?
                            </button>
                        </div>

                        <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
                    </form>
                )}

                {mode === "forgot" && (
                    <form onSubmit={handleForgotPassword}>
                        <label>Email</label>
                        <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <button type="submit" disabled={loading}>{loading ? "Sending OTP..." : "Send OTP"}</button>
                        <button type="button" onClick={() => { setMode("login"); setError(""); setSuccess(""); }} style={{marginTop: '10px', backgroundColor: '#6c757d'}}>Back to Login</button>
                    </form>
                )}

                {mode === "reset" && (
                    <form onSubmit={handleResetPassword}>
                        <label>Email</label>
                        <input type="email" value={email} disabled />
                        <label>OTP</label>
                        <input type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                        <label>New Password</label>
                        <input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        <button type="submit" disabled={loading}>{loading ? "Resetting..." : "Reset Password"}</button>
                        <button type="button" onClick={() => { setMode("login"); setError(""); setSuccess(""); }} style={{marginTop: '10px', backgroundColor: '#6c757d'}}>Back to Login</button>
                    </form>
                )}

                {mode === "login" && (
                    <p className="switch-auth">
                        Don't have an account? <button type="button" onClick={onSwitchToSignup}>Sign Up</button>
                    </p>
                )}
            </div>
        </div>
    );
}

export default Login;
