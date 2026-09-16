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
    // LOAD SAVED LOGIN
    // ==========================================

    useEffect(() => {

        const savedUser =
            localStorage.getItem("user");

        const token =
            localStorage.getItem("token");

        if (!savedUser || !token) {
            setUser(null);
            setPage("login");
            return;
        }

        try {

            const loggedUser =
                JSON.parse(savedUser);

            if (!loggedUser?.role) {
                throw new Error(
                    "Invalid user"
                );
            }

            setUser(loggedUser);

            // Go directly to correct dashboard

            if (
                loggedUser.role ===
                "ADMIN"
            ) {
                setPage("admin");
            }

            else if (
                loggedUser.role ===
                "TECHNICIAN"
            ) {
                setPage("technician");
            }

            else {
                setPage("student");
            }

        } catch (error) {

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
            setPage("login");
        }

    }, []);


    // ==========================================
    // LOGIN
    // ==========================================

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


        // Role-based dashboard

        if (
            loggedUser.role ===
            "ADMIN"
        ) {
            setPage("admin");
        }

        else if (
            loggedUser.role ===
            "TECHNICIAN"
        ) {
            setPage("technician");
        }

        else {
            setPage("student");
        }
    };


    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {

        localStorage.removeItem(
            "user"
        );

        localStorage.removeItem(
            "token"
        );

        setUser(null);
        setPage("login");
    };


    // ==========================================
    // SIGNUP
    // ==========================================

    const openSignup = () => {
        setPage("signup");
    };


    // ==========================================
    // LOGIN PAGE
    // ==========================================

    const openLogin = () => {
        setPage("login");
    };


    // ==========================================
    // CREATE COMPLAINT
    // ==========================================

    const openCreateComplaint = () => {

        if (
            user?.role !==
            "STUDENT"
        ) {
            return;
        }

        setPage(
            "create-complaint"
        );
    };


    // ==========================================
    // BACK TO STUDENT DASHBOARD
    // ==========================================

    const backToStudentDashboard =
        () => {

            if (
                user?.role ===
                "STUDENT"
            ) {
                setPage("student");
            }
        };


    // ==========================================
    // NOT LOGGED IN
    // ==========================================

    if (!user) {

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


    // ==========================================
    // STUDENT
    // ==========================================

    if (
        user.role ===
        "STUDENT"
    ) {

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


    // ==========================================
    // TECHNICIAN
    // ==========================================

    if (
        user.role ===
        "TECHNICIAN"
    ) {

        return (
            <TechnicianDashboard
                onLogout={
                    handleLogout
                }
            />
        );
    }


    // ==========================================
    // ADMIN
    // ==========================================

    if (
        user.role ===
        "ADMIN"
    ) {

        return (
            <AdminDashboard
                onLogout={
                    handleLogout
                }
            />
        );
    }


    // ==========================================
    // UNKNOWN ROLE
    // ==========================================

    handleLogout();

    return null;
}

export default App;