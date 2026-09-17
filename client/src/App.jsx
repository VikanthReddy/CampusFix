import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateComplaint from "./pages/CreateComplaint";

import "./App.css";

function App() {
    const [user, setUser] = useState(null);
    const [page, setPage] = useState("login");

    // ==========================================
    // GLOBAL THEME
    // ==========================================

    const [theme, setTheme] = useState(
        () => localStorage.getItem("campusfix-theme") || "dark"
    );

    useEffect(() => {
        document.body.classList.toggle("theme-dark", theme === "dark");
        document.body.classList.toggle("theme-light", theme === "light");

        localStorage.setItem("campusfix-theme", theme);

        return () => {
            document.body.classList.remove("theme-dark");
            document.body.classList.remove("theme-light");
        };
    }, [theme]);

    const toggleTheme = () => {
        setTheme((current) =>
            current === "dark" ? "light" : "dark"
        );
    };

    // ==========================================
    // LOAD SAVED LOGIN
    // ==========================================

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!savedUser || !token) {
            setUser(null);
            setPage("login");
            return;
        }

        try {
            const loggedUser = JSON.parse(savedUser);

            if (!loggedUser?.role) {
                throw new Error("Invalid user");
            }

            setUser(loggedUser);

            if (loggedUser.role === "ADMIN") {
                setPage("admin");
            } else if (loggedUser.role === "TECHNICIAN") {
                setPage("technician");
            } else {
                setPage("student");
            }
        } catch (error) {
            console.error("Invalid saved user:", error);

            localStorage.removeItem("user");
            localStorage.removeItem("token");

            setUser(null);
            setPage("login");
        }
    }, []);

    // ==========================================
    // LOGIN
    // ==========================================

    const handleLogin = (loggedUser, token) => {
        if (!loggedUser || !token) {
            return;
        }

        localStorage.setItem(
            "user",
            JSON.stringify(loggedUser)
        );

        localStorage.setItem("token", token);

        setUser(loggedUser);

        if (loggedUser.role === "ADMIN") {
            setPage("admin");
        } else if (loggedUser.role === "TECHNICIAN") {
            setPage("technician");
        } else {
            setPage("student");
        }
    };

    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");

        setUser(null);
        setPage("login");
    };

    // ==========================================
    // NAVIGATION
    // ==========================================

    const openSignup = () => {
        setPage("signup");
    };

    const openLogin = () => {
        setPage("login");
    };

    const openCreateComplaint = () => {
        if (user?.role !== "STUDENT") {
            return;
        }

        setPage("create-complaint");
    };

    const backToStudentDashboard = () => {
        if (user?.role === "STUDENT") {
            setPage("student");
        }
    };

    // ==========================================
    // GLOBAL THEME NAVBAR
    // ==========================================

    const ThemeNavbar = () => (
        <div className="app-theme-navbar">
            <div className="app-theme-brand">
                <span className="app-theme-logo">CF</span>

                <div>
                    <strong>CampusFix</strong>
                    <span>Campus Complaint Management</span>
                </div>
            </div>

            <button
                className="app-theme-switch"
                onClick={toggleTheme}
                type="button"
                aria-label={`Switch to ${
                    theme === "dark" ? "light" : "dark"
                } theme`}
            >
                <span className="app-theme-switch-icon">
                    {theme === "dark" ? "☀️" : "🌙"}
                </span>

                <span>
                    {theme === "dark" ? "Light" : "Dark"}
                </span>
            </button>
        </div>
    );

    // ==========================================
    // RENDER PAGE
    // ==========================================

    const renderPage = () => {
        // NOT LOGGED IN
        if (!user) {
            if (page === "signup") {
                return (
                    <Signup
                        onSwitchToLogin={openLogin}
                    />
                );
            }

            return (
                <Login
                    onSwitchToSignup={openSignup}
                    onLogin={handleLogin}
                />
            );
        }

        // STUDENT
        if (user.role === "STUDENT") {
            if (page === "create-complaint") {
                return (
                    <CreateComplaint
                        onBack={backToStudentDashboard}
                        onComplaintCreated={
                            backToStudentDashboard
                        }
                    />
                );
            }

            return (
                <StudentDashboard
                    onNewComplaint={
                        openCreateComplaint
                    }
                    onLogout={handleLogout}
                />
            );
        }

        // TECHNICIAN
        if (user.role === "TECHNICIAN") {
            return (
                <TechnicianDashboard
                    onLogout={handleLogout}
                />
            );
        }

        // ADMIN
        if (user.role === "ADMIN") {
            return (
                <AdminDashboard
                    onLogout={handleLogout}
                />
            );
        }

        return null;
    };

    return (
        <div
            className={`app-shell ${
                theme === "dark"
                    ? "app-shell-dark"
                    : "app-shell-light"
            }`}
        >
            <ThemeNavbar />
            <main className="app-page-content">
                {renderPage()}
            </main>
        </div>
    );
}

export default App;