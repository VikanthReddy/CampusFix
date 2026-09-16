import { useState } from "react";
import api from "../services/api";

function Signup({ onSwitchToLogin }) {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "STUDENT",
        department: "",
        phone: "",
        specialization: ""
    });

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [loading, setLoading] = useState(false);


    // =====================================================
    // HANDLE NORMAL INPUT CHANGES
    // =====================================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };


    // =====================================================
    // HANDLE ROLE CHANGE
    // =====================================================

    const handleRoleChange = (e) => {

        const role = e.target.value;

        setFormData((previous) => ({
            ...previous,

            role,

            department:
                role === "TECHNICIAN"
                    ? previous.department
                    : "",

            phone:
                role === "TECHNICIAN"
                    ? previous.phone
                    : "",

            specialization:
                role === "TECHNICIAN"
                    ? previous.specialization
                    : ""
        }));
    };


    // =====================================================
    // SUBMIT SIGNUP
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setMessageType("");


        // -------------------------------
        // NAME VALIDATION
        // -------------------------------

        if (!formData.name.trim()) {

            setMessage("Please enter your name.");
            setMessageType("error");

            return;
        }


        // -------------------------------
        // EMAIL VALIDATION
        // -------------------------------

        if (!formData.email.trim()) {

            setMessage("Please enter your email.");
            setMessageType("error");

            return;
        }


        // -------------------------------
        // PASSWORD VALIDATION
        // -------------------------------

        if (formData.password.length < 6) {

            setMessage(
                "Password must contain at least 6 characters."
            );

            setMessageType("error");

            return;
        }


        // -------------------------------
        // TECHNICIAN VALIDATION
        // -------------------------------

        if (formData.role === "TECHNICIAN") {

            if (!formData.department.trim()) {

                setMessage(
                    "Department is required for technicians."
                );

                setMessageType("error");

                return;
            }


            if (!/^\d{10}$/.test(formData.phone)) {

                setMessage(
                    "Please enter a valid 10-digit phone number."
                );

                setMessageType("error");

                return;
            }


            if (!formData.specialization) {

                setMessage(
                    "Please select a specialization."
                );

                setMessageType("error");

                return;
            }
        }


        // =================================================
        // API REQUEST
        // =================================================

        setLoading(true);

        try {

            const response = await api.post(
                "/auth/signup",
                formData
            );


            const user = response.data;


            // =================================================
            // STUDENT / FIRST ADMIN
            // =================================================

            if (user?.id && user?.role) {

                setMessage(
                    "Account created successfully. You can now login."
                );

                setMessageType("success");


                // Clear form

                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    role: "STUDENT",
                    department: "",
                    phone: "",
                    specialization: ""
                });

                return;
            }


            // =================================================
            // OTHER SUCCESS RESPONSE
            // =================================================

            setMessage(
                "Account created successfully."
            );

            setMessageType("success");

        } catch (error) {

            console.error(
                "Signup error:",
                error
            );


            let errorMessage =
                "Unable to create account.";


            if (error.response) {

                if (
                    typeof error.response.data === "string"
                ) {

                    errorMessage =
                        error.response.data;

                } else if (
                    error.response.data?.message
                ) {

                    errorMessage =
                        error.response.data.message;
                }

            } else if (error.message) {

                errorMessage =
                    error.message;
            }


            /*
             * Admin / Technician requests can return
             * HTTP 400 even when the request was saved
             * successfully as PENDING.
             */

            setMessage(errorMessage);
            setMessageType("info");

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="auth-container">

            {/* Decorative Background */}

            <div className="auth-decoration auth-decoration-one"></div>

            <div className="auth-decoration auth-decoration-two"></div>


            {/* =================================================
                AUTH CARD
            ================================================= */}

            <div className="auth-card signup-card">


                {/* LOGO */}

                <div className="auth-logo">
                    🏫
                </div>


                {/* TITLE */}

                <h1 className="auth-title">
                    CampusFix
                </h1>


                {/* SUBTITLE */}

                <p className="subtitle">
                    Institutional Complaint Management System
                </p>


                {/* =================================================
                    CREATE ACCOUNT HEADING
                ================================================= */}

                <div className="login-heading">

                    <h2>
                        Create Account
                    </h2>

                    <p>
                        Join CampusFix to manage campus issues
                    </p>

                </div>


                {/* =================================================
                    FORM
                ================================================= */}

                <form onSubmit={handleSubmit}>


                    {/* =================================================
                        NAME
                    ================================================= */}

                    <div className="auth-field">

                        <label htmlFor="name">
                            Full Name
                        </label>

                        <div className="input-wrapper">

                            <span className="input-icon">
                                👤
                            </span>

                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                autoComplete="name"
                                required
                            />

                        </div>

                    </div>


                    {/* =================================================
                        EMAIL
                    ================================================= */}

                    <div className="auth-field">

                        <label htmlFor="email">
                            Email Address
                        </label>

                        <div className="input-wrapper">

                            <span className="input-icon">
                                ✉
                            </span>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                                required
                            />

                        </div>

                    </div>


                    {/* =================================================
                        PASSWORD
                    ================================================= */}

                    <div className="auth-field">

                        <label htmlFor="password">
                            Password
                        </label>

                        <div className="input-wrapper">

                            <span className="input-icon">
                                🔒
                            </span>

                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Minimum 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                                required
                            />

                        </div>

                    </div>


                    {/* =================================================
                        ACCOUNT TYPE
                    ================================================= */}

                    <div className="auth-field">

                        <label htmlFor="role">
                            Account Type
                        </label>

                        <div className="input-wrapper">

                            <span className="input-icon">
                                👥
                            </span>

                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleRoleChange}
                            >

                                <option value="STUDENT">
                                    Student
                                </option>

                                <option value="ADMIN">
                                    Administrator
                                </option>

                                <option value="TECHNICIAN">
                                    Technician
                                </option>

                            </select>

                        </div>

                    </div>


                    {/* =================================================
                        TECHNICIAN DETAILS
                    ================================================= */}

                    {formData.role === "TECHNICIAN" && (

                        <>


                            {/* =================================================
                                DEPARTMENT
                            ================================================= */}

                            <div className="auth-field">

                                <label htmlFor="department">
                                    Department
                                </label>

                                <div className="input-wrapper">

                                    <span className="input-icon">
                                        🏢
                                    </span>

                                    <input
                                        id="department"
                                        name="department"
                                        type="text"
                                        placeholder="e.g. Maintenance"
                                        value={formData.department}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                            </div>


                            {/* =================================================
                                PHONE
                            ================================================= */}

                            <div className="auth-field">

                                <label htmlFor="phone">
                                    Phone Number
                                </label>

                                <div className="input-wrapper">

                                    <span className="input-icon">
                                        📱
                                    </span>

                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="10-digit phone number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        maxLength="10"
                                        inputMode="numeric"
                                        required
                                    />

                                </div>

                            </div>


                            {/* =================================================
                                SPECIALIZATION
                            ================================================= */}

                            <div className="auth-field">

                                <label htmlFor="specialization">
                                    Specialization
                                </label>

                                <div className="input-wrapper">

                                    <span className="input-icon">
                                        🛠
                                    </span>

                                    <select
                                        id="specialization"
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        required
                                    >

                                        <option value="">
                                            Select specialization
                                        </option>

                                        <option value="ELECTRICAL">
                                            Electrical
                                        </option>

                                        <option value="PLUMBING">
                                            Plumbing
                                        </option>

                                        <option value="NETWORK">
                                            Network
                                        </option>

                                        <option value="FURNITURE">
                                            Furniture
                                        </option>

                                        <option value="CIVIL">
                                            Civil
                                        </option>

                                        <option value="GENERAL">
                                            General Maintenance
                                        </option>

                                    </select>

                                </div>

                            </div>

                        </>

                    )}


                    {/* =================================================
                        CREATE ACCOUNT BUTTON
                    ================================================= */}

                    <button
                        type="submit"
                        className="auth-submit-button"
                        disabled={loading}
                    >

                        {loading ? (

                            <>

                                <span className="button-spinner"></span>

                                Creating Account...

                            </>

                        ) : (

                            <>

                                Create Account

                                <span className="button-arrow">
                                    →
                                </span>

                            </>

                        )}

                    </button>

                </form>


                {/* =================================================
                    MESSAGE
                ================================================= */}

                {message && (

                    <div
                        className={
                            `auth-message ${
                                messageType === "success"
                                    ? "success"
                                    : messageType === "info"
                                        ? "info"
                                        : "error"
                            }`
                        }
                    >

                        {message}

                    </div>

                )}


                {/* =================================================
                    LOGIN LINK
                ================================================= */}

                <div className="switch-text">

                    <span>
                        Already have an account?
                    </span>

                    <button
                        type="button"
                        className="link-button"
                        onClick={onSwitchToLogin}
                    >
                        Login
                    </button>

                </div>


                {/* =================================================
                    FOOTER REMOVED
                ================================================= */}

            </div>

        </div>

    );
}


export default Signup;