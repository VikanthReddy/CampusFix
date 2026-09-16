import { useEffect, useState } from "react";
import api from "../services/api";
import NotificationBell from "../components/NotificationBell";

function StudentDashboard({ onNewComplaint }) {

    const [user, setUser] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    // ==========================================
    // LOAD USER + COMPLAINTS
    // ==========================================

    useEffect(() => {

        const savedUser =
            localStorage.getItem("user");

        if (!savedUser) {
            setLoading(false);
            return;
        }

        try {

            const loggedUser =
                JSON.parse(savedUser);

            setUser(loggedUser);

            loadComplaints();

        } catch (error) {

            console.error(
                "Invalid user data:",
                error
            );

            localStorage.removeItem("user");
            localStorage.removeItem("token");

            setLoading(false);
        }

    }, []);


    // ==========================================
    // LOAD MY COMPLAINTS
    // ==========================================

    const loadComplaints = async () => {

        try {

            const response =
                await api.get("/complaints/my");

            setComplaints(
                response.data
            );

        } catch (error) {

            console.error(
                "Error loading complaints:",
                error
            );

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // LOGOUT
    // ==========================================

    const logout = () => {

        localStorage.removeItem("user");
        localStorage.removeItem("token");

        window.location.reload();
    };


    // ==========================================
    // FORMAT STATUS
    // ==========================================

    const formatStatus = (status) => {

        if (status === "IN_PROGRESS") {
            return "In Progress";
        }

        if (status === "PENDING") {
            return "Pending";
        }

        if (status === "RESOLVED") {
            return "Resolved";
        }

        return status || "Unknown";
    };


    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {

        if (!date) {
            return "Not available";
        }

        return new Date(date).toLocaleString();
    };


    // ==========================================
    // LOGIN CHECK
    // ==========================================

    if (!user) {

        return (
            <div className="dashboard">

                <div className="empty-state">

                    <h2>
                        Please login first.
                    </h2>

                </div>

            </div>
        );
    }


    // ==========================================
    // DASHBOARD
    // ==========================================

    return (

        <div className="dashboard">

            {/* ==================================
                HEADER
            ================================== */}

            <header className="dashboard-header">

                <div>

                    <h1>
                        CampusFix
                    </h1>

                    <p>
                        Student Dashboard
                    </p>

                </div>


                <div className="user-info">

                    <span>
                        Welcome,{" "}

                        <strong>
                            {user.name}
                        </strong>
                    </span>


                    {/* NOTIFICATION BELL */}

                    <NotificationBell />


                    <button
                        onClick={logout}
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* ==================================
                MAIN
            ================================== */}

            <main className="dashboard-content">


                {/* ==================================
                    WELCOME
                ================================== */}

                <div className="welcome-card">

                    <h2>
                        Welcome to CampusFix 👋
                    </h2>

                    <p>
                        Report campus problems and
                        track your complaints.
                    </p>

                </div>


                {/* ==================================
                    STATISTICS
                ================================== */}

                <div className="dashboard-grid">


                    {/* TOTAL */}

                    <div className="stat-card">

                        <h3>
                            Total Complaints
                        </h3>

                        <p>
                            {complaints.length}
                        </p>

                    </div>


                    {/* PENDING */}

                    <div className="stat-card">

                        <h3>
                            Pending
                        </h3>

                        <p>

                            {
                                complaints.filter(
                                    complaint =>
                                        complaint.status ===
                                        "PENDING"
                                ).length
                            }

                        </p>

                    </div>


                    {/* IN PROGRESS */}

                    <div className="stat-card">

                        <h3>
                            In Progress
                        </h3>

                        <p>

                            {
                                complaints.filter(
                                    complaint =>
                                        complaint.status ===
                                        "IN_PROGRESS"
                                ).length
                            }

                        </p>

                    </div>


                    {/* RESOLVED */}

                    <div className="stat-card">

                        <h3>
                            Resolved
                        </h3>

                        <p>

                            {
                                complaints.filter(
                                    complaint =>
                                        complaint.status ===
                                        "RESOLVED"
                                ).length
                            }

                        </p>

                    </div>

                </div>


                {/* ==================================
                    MY COMPLAINTS
                ================================== */}

                <section className="complaints-section">


                    {/* SECTION HEADER */}

                    <div className="section-header">

                        <h2>
                            My Complaints
                        </h2>


                        {complaints.length > 0 && (

                            <button
                                className="primary-button"
                                onClick={
                                    onNewComplaint
                                }
                            >
                                + New Complaint
                            </button>

                        )}

                    </div>


                    {/* ==================================
                        LOADING
                    ================================== */}

                    {loading ? (

                        <div className="empty-state">

                            <h3>
                                Loading complaints...
                            </h3>

                        </div>


                    ) : complaints.length === 0 ? (


                        /* ==================================
                            NO COMPLAINTS
                        ================================== */

                        <div className="empty-state">

                            <div className="empty-state-icon">
                                📷
                            </div>

                            <div className="empty-state-content">

                                <h3>
                                    No complaints yet
                                </h3>

                                <p>
                                    Have a campus issue?
                                    Report it here and we'll
                                    help get it resolved.
                                </p>

                                <button
                                    className="empty-state-button"
                                    onClick={
                                        onNewComplaint
                                    }
                                >

                                    <span className="button-icon">
                                        📷
                                    </span>

                                    Report a Campus Problem

                                </button>

                            </div>

                        </div>


                    ) : (


                        /* ==================================
                            COMPLAINT LIST
                        ================================== */

                        <div className="complaint-list">

                            {complaints.map(
                                complaint => (

                                    <div
                                        className="complaint-card"
                                        key={
                                            complaint.id
                                        }
                                    >


                                        {/* ==================================
                                            PHOTO + INFORMATION
                                        ================================== */}

                                        <div className="complaint-info">


                                            {/* PHOTO */}

                                            {complaint.imageUrl ? (

                                                <img
                                                    src={
                                                        `http://localhost:4040${complaint.imageUrl}`
                                                    }
                                                    alt="Complaint"
                                                    className="complaint-image"
                                                />

                                            ) : (

                                                <div className="no-photo">

                                                    📷
                                                    <br />
                                                    No Photo

                                                </div>

                                            )}


                                            {/* DETAILS */}

                                            <div className="complaint-details">

                                                <h3>
                                                    {
                                                        complaint.title
                                                    }
                                                </h3>


                                                <p>
                                                    {
                                                        complaint.description
                                                    }
                                                </p>


                                                <small>

                                                    📍 Location:{" "}

                                                    {
                                                        complaint.location
                                                    }

                                                </small>

                                                <br />


                                                <small>

                                                    🆔 Complaint ID: #

                                                    {
                                                        complaint.id
                                                    }

                                                </small>

                                                <br />


                                                <small>

                                                    🕒 Submitted:{" "}

                                                    {
                                                        formatDate(
                                                            complaint.createdAt
                                                        )
                                                    }

                                                </small>


                                                {/* UPDATED */}

                                                {complaint.updatedAt && (

                                                    <>

                                                        <br />

                                                        <small>

                                                            🔄 Updated:{" "}

                                                            {
                                                                formatDate(
                                                                    complaint.updatedAt
                                                                )
                                                            }

                                                        </small>

                                                    </>

                                                )}


                                                {/* TECHNICIAN */}

                                                {complaint.technician && (

                                                    <>

                                                        <br />

                                                        <small>

                                                            👨‍🔧 Technician:{" "}

                                                            {
                                                                complaint
                                                                    .technician
                                                                    .name
                                                            }

                                                        </small>

                                                    </>

                                                )}

                                            </div>

                                        </div>


                                        {/* ==================================
                                            COMPLAINT META
                                        ================================== */}

                                        <div className="complaint-meta">


                                            {/* CATEGORY */}

                                            <span className="category">

                                                Category:{" "}

                                                {
                                                    complaint.category ||
                                                    "GENERAL"
                                                }

                                            </span>


                                            {/* PRIORITY */}

                                            <span className="priority">

                                                Priority:{" "}

                                                {
                                                    complaint.priority ||
                                                    "MEDIUM"
                                                }

                                            </span>


                                            {/* STATUS */}

                                            <span className="status">

                                                Status:{" "}

                                                {
                                                    formatStatus(
                                                        complaint.status
                                                    )
                                                }

                                            </span>


                                            {/* TECHNICIAN ASSIGNED */}

                                            {complaint.technician && (

                                                <span className="technician">

                                                    Assigned

                                                </span>

                                            )}

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}

export default StudentDashboard;