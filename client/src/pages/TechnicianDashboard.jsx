import { useEffect, useState } from "react";
import api from "../services/api";
import NotificationBell from "../components/NotificationBell";

function TechnicianDashboard() {

    const [user, setUser] = useState(null);
    const [technician, setTechnician] = useState(null);
    const [complaints, setComplaints] = useState([]);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");


    // ==========================================
    // LOAD USER
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

            loadTechnician();

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
    // GET LOGGED-IN TECHNICIAN
    // ==========================================

    const loadTechnician = async () => {

        try {

            const response =
                await api.get("/technicians/me");

            setTechnician(
                response.data
            );

            await loadComplaints();

        } catch (error) {

            console.error(
                "Error loading technician:",
                error
            );

            setMessage(
                error.response?.data ||
                "Unable to load technician profile."
            );

            setLoading(false);
        }
    };


    // ==========================================
    // LOAD ASSIGNED COMPLAINTS
    // ==========================================

    const loadComplaints = async () => {

        try {

            const response =
                await api.get(
                    "/technicians/my-complaints"
                );

            setComplaints(
                response.data
            );

        } catch (error) {

            console.error(
                "Error loading complaints:",
                error
            );

            setMessage(
                error.response?.data ||
                "Unable to load assigned complaints."
            );

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // UPDATE COMPLAINT STATUS
    // ==========================================

    const updateStatus = async (
        complaintId,
        status
    ) => {

        if (!technician) {
            return;
        }

        try {

            const response =
                await api.put(
                    `/technicians/complaints/${complaintId}/status?status=${status}`
                );


            setComplaints(
                previous =>
                    previous.map(
                        complaint =>
                            complaint.id === complaintId
                                ? response.data
                                : complaint
                    )
            );


            setMessage(
                "Complaint status updated successfully."
            );

        } catch (error) {

            console.error(error);

            const serverMessage =
                error.response?.data;

            setMessage(
                typeof serverMessage === "string"
                    ? serverMessage
                    : "Failed to update complaint status."
            );
        }
    };


    // ==========================================
    // UPDATE AVAILABILITY
    // ==========================================

    const updateAvailability = async (
        available
    ) => {

        try {

            const response =
                await api.put(
                    `/technicians/availability?available=${available}`
                );

            setTechnician(
                response.data
            );

            setMessage(
                available
                    ? "You are now available for assignments."
                    : "You are now unavailable for assignments."
            );

        } catch (error) {

            console.error(error);

            setMessage(
                error.response?.data ||
                "Failed to update availability."
            );
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
    // STATUS FORMAT
    // ==========================================

    const formatStatus = (
        status
    ) => {

        if (
            status ===
            "IN_PROGRESS"
        ) {

            return "In Progress";
        }


        if (
            status ===
            "PENDING"
        ) {

            return "Pending";
        }


        if (
            status ===
            "RESOLVED"
        ) {

            return "Resolved";
        }


        return status || "Unknown";
    };


    // ==========================================
    // LOGIN CHECK
    // ==========================================

    if (!user) {

        return (

            <div className="technician-dashboard">

                <div className="technician-empty">

                    <h2>
                        Please login first.
                    </h2>

                </div>

            </div>
        );
    }


    // ==========================================
    // STATISTICS
    // ==========================================

    const total =
        complaints.length;


    const pending =
        complaints.filter(
            complaint =>
                complaint.status ===
                "PENDING"
        ).length;


    const inProgress =
        complaints.filter(
            complaint =>
                complaint.status ===
                "IN_PROGRESS"
        ).length;


    const resolved =
        complaints.filter(
            complaint =>
                complaint.status ===
                "RESOLVED"
        ).length;


    // ==========================================
    // DASHBOARD
    // ==========================================

    return (

        <div className="technician-dashboard">


            {/* ==================================
                HEADER
            ================================== */}

            <header className="technician-header">
                <div className="technician-brand">
                    <div className="technician-brand-icon">CF</div>
                    <div>
                        <h1>CampusFix</h1>
                        <p>Technician Dashboard</p>
                    </div>
                </div>

                <div className="technician-user">
                    <div className="technician-profile">
                        <div className="technician-avatar">
                            {(user.name || "T").charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <strong>{user.name}</strong>
                            <span>Technician</span>
                        </div>
                    </div>

                    <NotificationBell />

                    <button
                        className="technician-logout"
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>
            </header>


            {/* ==================================
                MAIN
            ================================== */}

            <main className="technician-content">


                {/* ==================================
                    WELCOME
                ================================== */}

                <section className="technician-welcome">

                    <div>

                        <p className="technician-welcome-label">
                            TECHNICIAN PORTAL
                        </p>


                        <h2>

                            Welcome,{" "}
                            {user.name} 👋

                        </h2>


                        <p>

                            Manage your assigned campus
                            complaints and update their
                            progress.

                        </p>

                    </div>


                    {technician && (
                        <div className="technician-welcome-side">
                            <div className="technician-welcome-icon">🔧</div>
                            <div className="specialization-card">
                                <span>Specialization</span>
                                <strong>
                                    🔧{" "}
                                    {technician.specialization ||
                                        "General Maintenance"}
                                </strong>
                            </div>
                        </div>
                    )}

                </section>


                {/* ==================================
                    MESSAGE
                ================================== */}

                {message && (

                    <div className="technician-message">

                        {message}

                    </div>

                )}


                {/* ==================================
                    TECHNICIAN PROFILE
                ================================== */}

                {technician && (
                    <section className="technician-info">

                        <div className="technician-info-item">
                            <span className="technician-info-label">
                                Department
                            </span>
                            <strong className="technician-info-value">
                                {technician.department || "Not specified"}
                            </strong>
                        </div>

                        <div className="technician-info-item">
                            <span className="technician-info-label">
                                Phone
                            </span>
                            <strong className="technician-info-value">
                                {technician.phone || "Not specified"}
                            </strong>
                        </div>

                        <div className="technician-info-item">
                            <span className="technician-info-label">
                                Availability
                            </span>
                            <strong className="technician-info-value availability-status">
                                {technician.available
                                    ? "Available"
                                    : "Unavailable"}
                            </strong>
                        </div>

                        <button
                            className="availability-button"
                            onClick={() =>
                                updateAvailability(!technician.available)
                            }
                        >
                            {technician.available
                                ? "Set Unavailable"
                                : "Set Available"}
                        </button>
                    </section>
                )}


                {/* ==================================
                    STATISTICS
                ================================== */}

                <div className="technician-stats">


                    <div className="technician-stat-card">

                        <span className="technician-stat-icon">
                            📋
                        </span>

                        <div>

                            <p>
                                Assigned
                            </p>

                            <strong>
                                {total}
                            </strong>

                        </div>

                    </div>


                    <div className="technician-stat-card">

                        <span className="technician-stat-icon">
                            ⏳
                        </span>

                        <div>

                            <p>
                                Pending
                            </p>

                            <strong>
                                {pending}
                            </strong>

                        </div>

                    </div>


                    <div className="technician-stat-card">

                        <span className="technician-stat-icon">
                            🔧
                        </span>

                        <div>

                            <p>
                                In Progress
                            </p>

                            <strong>
                                {inProgress}
                            </strong>

                        </div>

                    </div>


                    <div className="technician-stat-card">

                        <span className="technician-stat-icon">
                            ✅
                        </span>

                        <div>

                            <p>
                                Resolved
                            </p>

                            <strong>
                                {resolved}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* ==================================
                    ASSIGNED COMPLAINTS
                ================================== */}

                <section className="technician-section">


                    <div className="technician-section-header">

                        <div>

                            <h2>
                                Assigned Complaints
                            </h2>

                            <p>
                                Complaints assigned to you
                                by the administrator.
                            </p>

                        </div>


                        <span className="assignment-count">

                            {total} Assigned

                        </span>

                    </div>


                    {loading ? (

                        <div className="technician-empty">

                            <div className="loading-spinner">
                                ⏳
                            </div>

                            <h3>
                                Loading complaints...
                            </h3>

                        </div>


                    ) : complaints.length === 0 ? (

                        <div className="technician-empty">

                            <div className="empty-icon">
                                📋
                            </div>

                            <h3>
                                No complaints assigned
                            </h3>

                            <p>
                                You don't have any complaints
                                assigned to you yet.
                            </p>

                        </div>


                    ) : (

                        <div className="technician-complaint-list">

                            {complaints.map(
                                complaint => (

                                    <div
                                        className={`technician-complaint-card ${complaint.status?.toUpperCase() === "RESOLVED" ? "technician-resolved-card" : ""}`}
                                        key={
                                            complaint.id
                                        }
                                    >


                                        {/* PHOTO */}

                                        <div className="technician-photo">

                                            {complaint.imageUrl ? (

                                                <img
                                                    src={
                                                        `http://localhost:4040${complaint.imageUrl}`
                                                    }
                                                    alt="Complaint"
                                                />

                                            ) : (

                                                <div className="technician-no-photo">

                                                    📷

                                                    <span>
                                                        No Photo
                                                    </span>

                                                </div>

                                            )}

                                        </div>


                                        {/* DETAILS */}

                                        <div className="technician-complaint-details">


                                            <div className="complaint-title-row">

                                                <div>

                                                    <span className="complaint-id">
                                                        #{complaint.id}
                                                    </span>


                                                    <h3>
                                                        {
                                                            complaint.title
                                                        }
                                                    </h3>

                                                </div>


                                                <span
                                                    className={`technician-status status-${complaint.status?.toLowerCase()}`}
                                                >

                                                    {
                                                        formatStatus(
                                                            complaint.status
                                                        )
                                                    }

                                                </span>

                                            </div>


                                            <p className="technician-description">

                                                {
                                                    complaint.description
                                                }

                                            </p>


                                            <div className="technician-details-grid">


                                                <div>

                                                    <span>
                                                        Student
                                                    </span>

                                                    <strong>

                                                        {
                                                            complaint
                                                                .user
                                                                ?.name ||
                                                            "Unknown"
                                                        }

                                                    </strong>

                                                </div>


                                                <div>

                                                    <span>
                                                        Location
                                                    </span>

                                                    <strong>

                                                        📍{" "}

                                                        {
                                                            complaint.location ||
                                                            "Not specified"
                                                        }

                                                    </strong>

                                                </div>


                                                <div>

                                                    <span>
                                                        Category
                                                    </span>

                                                    <strong>

                                                        {
                                                            complaint.category ||
                                                            "GENERAL"
                                                        }

                                                    </strong>

                                                </div>


                                                <div>

                                                    <span>
                                                        Priority
                                                    </span>

                                                    <strong>

                                                        {
                                                            complaint.priority ||
                                                            "MEDIUM"
                                                        }

                                                    </strong>

                                                </div>

                                            </div>

                                            {/* STATUS CONTROL */}

                                            {complaint.status?.toUpperCase() !== "RESOLVED" ? (

                                                <div className="technician-controls">

                                                    <div className="technician-control-group">
                                                        <label>
                                                            Update Complaint Status
                                                        </label>

                                                        <select
                                                            value={
                                                                complaint.status ||
                                                                "PENDING"
                                                            }
                                                            onChange={e =>
                                                                updateStatus(
                                                                    complaint.id,
                                                                    e.target.value
                                                                )
                                                            }
                                                        >
                                                            <option value="PENDING">
                                                                Pending
                                                            </option>

                                                            <option value="IN_PROGRESS">
                                                                In Progress
                                                            </option>

                                                            <option value="RESOLVED">
                                                                Resolved
                                                            </option>
                                                        </select>
                                                    </div>

                                                </div>

                                            ) : (

                                                <div className="technician-resolved-message">
                                                    ✓ Complaint resolved — no further changes allowed.
                                                </div>

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

export default TechnicianDashboard;