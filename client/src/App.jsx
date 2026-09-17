import { useEffect, useState } from "react";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateComplaint from "./pages/CreateComplaint";

import "./App.css";

function App() {

    // =====================================================
    // USER
    // =====================================================

    const [user, setUser] = useState(null);


    // =====================================================
    // PAGE
    //
    // landing
    // login
    // signup
    // student
    // technician
    // admin
    // create-complaint
    // =====================================================

    const [page, setPage] = useState("landing");


    // =====================================================
    // THEME
    // =====================================================

    const [theme, setTheme] = useState(
        () =>
            localStorage.getItem("campusfix-theme") ||
            "dark"
    );


    // =====================================================
    // APPLY GLOBAL THEME
    // =====================================================

    useEffect(() => {

        document.body.classList.toggle(
            "theme-dark",
            theme === "dark"
        );

        document.body.classList.toggle(
            "theme-light",
            theme === "light"
        );

        localStorage.setItem(
            "campusfix-theme",
            theme
        );

        return () => {

            document.body.classList.remove(
                "theme-dark"
            );

            document.body.classList.remove(
                "theme-light"
            );

        };

    }, [theme]);


    // =====================================================
    // TOGGLE THEME
    // =====================================================

    const toggleTheme = () => {

        setTheme((current) =>
            current === "dark"
                ? "light"
                : "dark"
        );

    };


    // =====================================================
    // LOAD SAVED LOGIN
    //
    // IMPORTANT:
    // If user is NOT logged in,
    // stay on LANDING page.
    // =====================================================

    useEffect(() => {

        const savedUser =
            localStorage.getItem("user");

        const token =
            localStorage.getItem("token");


        // -------------------------------------------------
        // NO LOGIN
        // -------------------------------------------------

        if (!savedUser || !token) {

            setUser(null);

            setPage("landing");

            return;
        }


        // -------------------------------------------------
        // LOAD USER
        // -------------------------------------------------

        try {

            const loggedUser =
                JSON.parse(savedUser);


            if (!loggedUser?.role) {

                throw new Error(
                    "Invalid saved user"
                );

            }


            setUser(loggedUser);


            // -------------------------------------------------
            // ROLE BASED DASHBOARD
            // -------------------------------------------------

            if (
                loggedUser.role === "ADMIN"
            ) {

                setPage("admin");

            }

            else if (
                loggedUser.role === "TECHNICIAN"
            ) {

                setPage("technician");

            }

            else {

                setPage("student");

            }

        }

        catch (error) {

            console.error(
                "Invalid saved user:",
                error
            );


            localStorage.removeItem(
                "user"
            );

            localStorage.removeItem(
                "token"
            );


            setUser(null);

            setPage("landing");

        }

    }, []);


    // =====================================================
    // LOGIN
    // =====================================================

    const handleLogin = (
        loggedUser,
        token
    ) => {

        if (
            !loggedUser ||
            !token
        ) {

            return;

        }


        // Save login

        localStorage.setItem(
            "user",
            JSON.stringify(
                loggedUser
            )
        );

        localStorage.setItem(
            "token",
            token
        );


        setUser(loggedUser);


        // -------------------------------------------------
        // ROLE BASED DASHBOARD
        // -------------------------------------------------

        if (
            loggedUser.role === "ADMIN"
        ) {

            setPage("admin");

        }

        else if (
            loggedUser.role === "TECHNICIAN"
        ) {

            setPage("technician");

        }

        else {

            setPage("student");

        }

    };


    // =====================================================
    // LOGOUT
    //
    // After logout -> LANDING PAGE
    // =====================================================

    const handleLogout = () => {

        localStorage.removeItem(
            "user"
        );

        localStorage.removeItem(
            "token"
        );


        setUser(null);

        setPage("landing");

    };


    // =====================================================
    // LANDING PAGE
    // =====================================================

    const openLanding = () => {

        // If already logged in,
        // don't show landing page.

        if (user) {

            if (
                user.role === "ADMIN"
            ) {

                setPage("admin");

            }

            else if (
                user.role === "TECHNICIAN"
            ) {

                setPage("technician");

            }

            else {

                setPage("student");

            }

            return;
        }


        setPage("landing");

    };


    // =====================================================
    // OPEN LOGIN
    // =====================================================

    const openLogin = () => {

        setPage("login");

    };


    // =====================================================
    // OPEN SIGNUP
    // =====================================================

    const openSignup = () => {

        setPage("signup");

    };


    // =====================================================
    // CREATE COMPLAINT
    // =====================================================

    const openCreateComplaint = () => {

        if (
            user?.role !== "STUDENT"
        ) {

            return;

        }


        setPage(
            "create-complaint"
        );

    };


    // =====================================================
    // BACK TO STUDENT DASHBOARD
    // =====================================================

    const backToStudentDashboard = () => {

        if (
            user?.role === "STUDENT"
        ) {

            setPage("student");

        }

    };


    // =====================================================
    // GLOBAL THEME NAVBAR
    //
    // IMPORTANT:
    // This navbar is NOT shown on Landing page
    // because Landing.jsx already has its own navbar.
    // =====================================================

    const ThemeNavbar = () => (

        <div className="app-theme-navbar">

            {/* BRAND */}

            <div className="app-theme-brand">

                <span className="app-theme-logo">
                    CF
                </span>


                <div>

                    <strong>
                        CampusFix
                    </strong>

                    <span>
                        Campus Complaint Management
                    </span>

                </div>

            </div>


            {/* THEME BUTTON */}

            <button
                className="app-theme-switch"
                onClick={toggleTheme}
                type="button"
                aria-label={`Switch to ${
                    theme === "dark"
                        ? "light"
                        : "dark"
                } theme`}
            >

                <span className="app-theme-switch-icon">

                    {theme === "dark"
                        ? "☀️"
                        : "🌙"}

                </span>


                <span>

                    {theme === "dark"
                        ? "Light"
                        : "Dark"}

                </span>

            </button>

        </div>

    );


    // =====================================================
    // RENDER PAGE
    // =====================================================

    const renderPage = () => {


        // =================================================
        // NOT LOGGED IN
        // =================================================

        if (!user) {


            // ---------------------------------------------
            // LANDING
            // ---------------------------------------------

            if (
                page === "landing"
            ) {

                return (

                    <Landing
                        onLogin={openLogin}
                        onSignup={openSignup}
                    />

                );

            }


            // ---------------------------------------------
            // SIGNUP
            // ---------------------------------------------

            if (
                page === "signup"
            ) {

                return (

                    <Signup
                        onSwitchToLogin={
                            openLogin
                        }
                    />

                );

            }


            // ---------------------------------------------
            // LOGIN
            // ---------------------------------------------

            return (

                <Login
                    onSwitchToSignup={
                        openSignup
                    }
                    onLogin={
                        handleLogin
                    }
                />

            );

        }


        // =================================================
        // STUDENT
        // =================================================

        if (
            user.role === "STUDENT"
        ) {


            // ---------------------------------------------
            // CREATE COMPLAINT
            // ---------------------------------------------

            if (
                page ===
                "create-complaint"
            ) {

                return (

                    <CreateComplaint
                        onBack={
                            backToStudentDashboard
                        }
                        onComplaintCreated={
                            backToStudentDashboard
                        }
                    />

                );

            }


            // ---------------------------------------------
            // STUDENT DASHBOARD
            // ---------------------------------------------

            return (

                <StudentDashboard
                    onNewComplaint={
                        openCreateComplaint
                    }
                    onLogout={
                        handleLogout
                    }
                />

            );

        }


        // =================================================
        // TECHNICIAN
        // =================================================

        if (
            user.role === "TECHNICIAN"
        ) {

            return (

                <TechnicianDashboard
                    onLogout={
                        handleLogout
                    }
                />

            );

        }


        // =================================================
        // ADMIN
        // =================================================

        if (
            user.role === "ADMIN"
        ) {

            return (

                <AdminDashboard
                    onLogout={
                        handleLogout
                    }
                />

            );

        }


        return null;

    };


    // =====================================================
    // MAIN APP
    // =====================================================

    return (

        <div
            className={`app-shell ${
                theme === "dark"
                    ? "app-shell-dark"
                    : "app-shell-light"
            }`}
        >

            {/* ---------------------------------------------
                GLOBAL NAVBAR

                Don't show it on Landing because
                Landing.jsx has its own navbar.
            --------------------------------------------- */}

            {page !== "landing" && (
                <ThemeNavbar />
            )}


            <main
                className={
                    page === "landing"
                        ? "app-page-content app-landing-content"
                        : "app-page-content"
                }
            >

                {renderPage()}

            </main>

        </div>

    );

}


export default App;