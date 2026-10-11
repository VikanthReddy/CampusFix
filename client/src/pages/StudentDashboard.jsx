import { useEffect, useRef, useState } from "react";
import api, { getApiResourceUrl } from "../services/api";
import NotificationBell from "../components/NotificationBell";

function StudentDashboard({ onNewComplaint }) {

    const [user, setUser] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    // =========================================================
    // FEEDBACK STATE
    // =========================================================
    const [feedbackForm, setFeedbackForm] = useState({ rating: 5, feedback: "" });
    const [feedbackComplaintId, setFeedbackComplaintId] = useState(null);
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    const handleFeedbackSubmit = async (e, complaintId) => {
        e.preventDefault();
        setFeedbackLoading(true);
        try {
            const res = await api.post(`/complaints/${complaintId}/feedback`, feedbackForm);
            setComplaints(complaints.map(c => c.id === complaintId ? res.data : c));
            setFeedbackComplaintId(null);
            setFeedbackForm({ rating: 5, feedback: "" });
        } catch (err) {
            alert(err.response?.data || "Failed to submit feedback");
        } finally {
            setFeedbackLoading(false);
        }
    };


    // =========================================================
    // EDIT COMPLAINT STATE
    // =========================================================

    const [editingComplaint, setEditingComplaint] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");
    const [editSuccess, setEditSuccess] = useState("");

    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        location: "",
        category: "",
        priority: ""
    });

    // =========================================================
    // EDIT CAMERA / RETAKE PHOTO STATE
    // =========================================================

    const editVideoRef = useRef(null);
    const editCanvasRef = useRef(null);
    const editStreamRef = useRef(null);
    const editPreviewUrlRef = useRef(null);

    const [editCameraOpen, setEditCameraOpen] = useState(false);
    const [editCameraReady, setEditCameraReady] = useState(false);
    const [editPhoto, setEditPhoto] = useState(null);
    const [editPhotoPreview, setEditPhotoPreview] = useState(null);


    // =========================================================
    // LOAD USER + COMPLAINTS
    // =========================================================

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

        return () => {
            stopEditCamera();

            if (editPreviewUrlRef.current) {
                URL.revokeObjectURL(editPreviewUrlRef.current);
                editPreviewUrlRef.current = null;
            }
        };

    }, []);


    // =========================================================
    // LOAD MY COMPLAINTS
    // =========================================================

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


    // =========================================================
    // LOGOUT
    // =========================================================

    const logout = () => {

        localStorage.removeItem("user");
        localStorage.removeItem("token");

        window.location.reload();
    };


    // =========================================================
    // FORMAT STATUS
    // =========================================================

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


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {

        if (!date) {
            return "Not available";
        }

        return new Date(date).toLocaleString();
    };


    // =========================================================
    // OPEN EDIT FORM
    // =========================================================

    const handleEditClick = (complaint) => {

        // Only pending complaints can be edited.
        if (
            !complaint.status ||
            complaint.status.toUpperCase() !== "PENDING"
        ) {
            return;
        }

        stopEditCamera();

        if (editPreviewUrlRef.current) {
            URL.revokeObjectURL(editPreviewUrlRef.current);
            editPreviewUrlRef.current = null;
        }

        setEditingComplaint(complaint);

        setEditForm({
            title: complaint.title || "",
            description: complaint.description || "",
            location: complaint.location || "",
            category: complaint.category || "",
            priority: complaint.priority || ""
        });

        setEditPhoto(null);
        setEditPhotoPreview(null);
        setEditCameraOpen(false);
        setEditCameraReady(false);

        setEditError("");
        setEditSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    // =========================================================
    // CLOSE EDIT FORM
    // =========================================================

    const handleCancelEdit = () => {

        stopEditCamera();

        if (editPreviewUrlRef.current) {
            URL.revokeObjectURL(editPreviewUrlRef.current);
            editPreviewUrlRef.current = null;
        }

        setEditingComplaint(null);

        setEditPhoto(null);
        setEditPhotoPreview(null);
        setEditCameraOpen(false);
        setEditCameraReady(false);

        setEditForm({
            title: "",
            description: "",
            location: "",
            category: "",
            priority: ""
        });

        setEditError("");
        setEditSuccess("");
    };


    // =========================================================
    // HANDLE EDIT INPUT
    // =========================================================

    const handleEditChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setEditForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };


    // =========================================================
    // EDIT CAMERA / RETAKE PHOTO
    // =========================================================

    const openEditCamera = async () => {

        setEditError("");
        setEditSuccess("");
        setEditCameraReady(false);

        try {

            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                setEditError(
                    "Camera access is not supported by this browser."
                );
                return;
            }

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "environment",
                        width: {
                            ideal: 1280
                        },
                        height: {
                            ideal: 720
                        }
                    },
                    audio: false
                });

            editStreamRef.current = stream;
            setEditCameraOpen(true);

            setTimeout(async () => {

                if (!editVideoRef.current) {
                    return;
                }

                editVideoRef.current.srcObject = stream;

                try {
                    await editVideoRef.current.play();
                } catch (error) {
                    console.log(
                        "Edit camera play error:",
                        error
                    );
                }

                setEditCameraReady(true);

            }, 100);

        } catch (error) {

            console.error(
                "Edit camera error:",
                error
            );

            if (error.name === "NotAllowedError") {

                setEditError(
                    "Camera permission was denied. Please allow camera access."
                );

            } else if (error.name === "NotFoundError") {

                setEditError(
                    "No camera was found on this device."
                );

            } else {

                setEditError(
                    "Unable to open the camera. Please try again."
                );
            }
        }
    };


    const stopEditCamera = () => {

        if (editStreamRef.current) {

            editStreamRef.current
                .getTracks()
                .forEach(track => track.stop());

            editStreamRef.current = null;
        }

        if (editVideoRef.current) {
            editVideoRef.current.srcObject = null;
        }

        setEditCameraOpen(false);
        setEditCameraReady(false);
    };


    const captureEditPhoto = () => {

        if (
            !editVideoRef.current ||
            !editCanvasRef.current ||
            !editCameraReady
        ) {
            setEditError(
                "Camera is not ready yet. Please wait a moment."
            );
            return;
        }

        const video = editVideoRef.current;
        const canvas = editCanvasRef.current;

        const width = video.videoWidth;
        const height = video.videoHeight;

        if (!width || !height) {
            setEditError(
                "Unable to capture the camera image. Please try again."
            );
            return;
        }

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        context.drawImage(
            video,
            0,
            0,
            width,
            height
        );

        canvas.toBlob(
            (blob) => {

                if (!blob) {
                    setEditError(
                        "Failed to capture photo."
                    );
                    return;
                }

                const file = new File(
                    [blob],
                    `complaint-retake-${Date.now()}.jpg`,
                    {
                        type: "image/jpeg"
                    }
                );

                if (editPreviewUrlRef.current) {
                    URL.revokeObjectURL(
                        editPreviewUrlRef.current
                    );
                }

                const previewUrl =
                    URL.createObjectURL(blob);

                editPreviewUrlRef.current =
                    previewUrl;

                setEditPhoto(file);
                setEditPhotoPreview(previewUrl);

                setEditSuccess(
                    "New photo captured. It will replace the old photo."
                );

                setEditError("");

                stopEditCamera();
            },
            "image/jpeg",
            0.90
        );
    };


    const retakeEditPhoto = () => {

        if (editPreviewUrlRef.current) {
            URL.revokeObjectURL(
                editPreviewUrlRef.current
            );

            editPreviewUrlRef.current = null;
        }

        setEditPhoto(null);
        setEditPhotoPreview(null);
        setEditSuccess("");
        setEditError("");

        openEditCamera();
    };


    const keepExistingPhoto = () => {

        stopEditCamera();

        if (editPreviewUrlRef.current) {
            URL.revokeObjectURL(
                editPreviewUrlRef.current
            );

            editPreviewUrlRef.current = null;
        }

        setEditPhoto(null);
        setEditPhotoPreview(null);

        setEditSuccess(
            "Existing photo will be kept."
        );
    };


    // =========================================================
    // SAVE EDITED COMPLAINT
    // =========================================================

    const handleUpdateComplaint = async (event) => {

        event.preventDefault();

        setEditError("");
        setEditSuccess("");

        if (!editingComplaint) {
            return;
        }

        if (
            String(editingComplaint.status || "").toUpperCase() !==
            "PENDING"
        ) {
            setEditError(
                "Only pending complaints can be edited."
            );
            return;
        }

        if (!editForm.title.trim()) {
            setEditError(
                "Complaint title is required."
            );
            return;
        }

        if (!editForm.description.trim()) {
            setEditError(
                "Complaint description is required."
            );
            return;
        }

        if (!editForm.location.trim()) {
            setEditError(
                "Complaint location is required."
            );
            return;
        }

        try {

            setEditLoading(true);

            /*
             * Multipart request:
             *
             * image is OPTIONAL during edit.
             * - No retake -> backend keeps existing image.
             * - Retake -> backend replaces existing image.
             */

            const formData = new FormData();

            formData.append(
                "title",
                editForm.title.trim()
            );

            formData.append(
                "description",
                editForm.description.trim()
            );

            formData.append(
                "location",
                editForm.location.trim()
            );

            if (editForm.category) {
                formData.append(
                    "category",
                    editForm.category
                );
            }

            if (editForm.priority) {
                formData.append(
                    "priority",
                    editForm.priority
                );
            }

            if (editPhoto) {
                formData.append(
                    "image",
                    editPhoto
                );
            }

            const response =
                await api.put(
                    `/complaints/${editingComplaint.id}`,
                    formData
                );

            setComplaints((previous) =>
                previous.map((complaint) =>
                    complaint.id === editingComplaint.id
                        ? response.data
                        : complaint
                )
            );

            setEditSuccess(
                editPhoto
                    ? "Complaint and photo updated successfully!"
                    : "Complaint updated successfully!"
            );

            setTimeout(() => {
                handleCancelEdit();
            }, 1200);

        } catch (error) {

            console.error(
                "Error updating complaint:",
                error
            );

            let message =
                "Unable to update complaint.";

            if (
                error.response &&
                error.response.data
            ) {

                if (
                    typeof error.response.data ===
                    "string"
                ) {

                    message =
                        error.response.data;

                } else if (
                    error.response.data.message
                ) {

                    message =
                        error.response.data.message;
                }
            }

            setEditError(message);

        } finally {

            setEditLoading(false);
        }
    };


    // =========================================================
    // LOGIN CHECK
    // =========================================================

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


    // =========================================================
    // DASHBOARD
    // =========================================================

    return (

        <div className="dashboard">

            {/* =================================================
                HEADER
            ================================================= */}

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


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="dashboard-content">


                {/* =================================================
                    EDIT COMPLAINT FORM
                ================================================= */}

                {editingComplaint && (

                    <section
                        className="complaints-section edit-complaint-section"
                        style={{
                            marginBottom: "30px"
                        }}
                    >

                        <div className="section-header">

                            <h2>
                                ✏️ Edit Complaint
                            </h2>

                            <button
                                className="secondary-button"
                                onClick={
                                    handleCancelEdit
                                }
                                type="button"
                            >
                                ✕ Cancel
                            </button>

                        </div>


                        {/* COMPLAINT ID */}

                        <p
                            style={{
                                marginBottom: "20px"
                            }}
                        >
                            Editing Complaint #
                            {editingComplaint.id}
                        </p>


                        {/* SUCCESS */}

                        {editSuccess && (

                            <div
                                className="success-message"
                                style={{
                                    padding: "12px",
                                    marginBottom: "15px",
                                    borderRadius: "8px"
                                }}
                            >
                                {editSuccess}
                            </div>

                        )}


                        {/* ERROR */}

                        {editError && (

                            <div
                                className="error-message"
                                style={{
                                    padding: "12px",
                                    marginBottom: "15px",
                                    borderRadius: "8px"
                                }}
                            >
                                {editError}
                            </div>

                        )}


                        <form
                            onSubmit={
                                handleUpdateComplaint
                            }
                        >

                            {/* TITLE */}

                            <div
                                className="form-group"
                                style={{
                                    marginBottom: "18px"
                                }}
                            >

                                <label>
                                    Complaint Title
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={
                                        editForm.title
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                    placeholder="Enter complaint title"
                                    disabled={editLoading}
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div
                                className="form-group"
                                style={{
                                    marginBottom: "18px"
                                }}
                            >

                                <label>
                                    Problem Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        editForm.description
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                    placeholder="Describe the problem"
                                    rows="5"
                                    disabled={editLoading}
                                />

                            </div>


                            {/* LOCATION */}

                            <div
                                className="form-group"
                                style={{
                                    marginBottom: "18px"
                                }}
                            >

                                <label>
                                    Location
                                </label>

                                <input
                                    type="text"
                                    name="location"
                                    value={
                                        editForm.location
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                    placeholder="Enter location"
                                    disabled={editLoading}
                                />

                            </div>


                            {/* CATEGORY */}

                            <div
                                className="form-group"
                                style={{
                                    marginBottom: "18px"
                                }}
                            >

                                <label>
                                    Category
                                </label>

                                <select
                                    name="category"
                                    value={
                                        editForm.category
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                    disabled={editLoading}
                                >

                                    <option value="">
                                        Auto Detect
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
                                        General
                                    </option>

                                </select>

                            </div>


                            {/* PRIORITY */}

                            <div
                                className="form-group"
                                style={{
                                    marginBottom: "20px"
                                }}
                            >

                                <label>
                                    Priority
                                </label>

                                <select
                                    name="priority"
                                    value={
                                        editForm.priority
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                    disabled={editLoading}
                                >

                                    <option value="">
                                        Auto Detect
                                    </option>

                                    <option value="LOW">
                                        Low
                                    </option>

                                    <option value="MEDIUM">
                                        Medium
                                    </option>

                                    <option value="HIGH">
                                        High
                                    </option>

                                    <option value="URGENT">
                                        Urgent
                                    </option>

                                </select>

                            </div>


                            {/* =================================================
                                EXISTING PHOTO / RETAKE PHOTO
                            ================================================= */}

                            <div
                                className="edit-photo-section"
                                style={{
                                    marginTop: "22px",
                                    marginBottom: "24px",
                                    padding: "22px",
                                    border:
                                        "1px solid rgba(107,169,216,.25)",
                                    borderRadius: "14px",
                                    background:
                                        "rgba(16,39,64,.55)"
                                }}
                            >

                                <h3
                                    style={{
                                        marginTop: 0
                                    }}
                                >
                                    📷 Complaint Photo
                                </h3>

                                <p
                                    style={{
                                        color: "#91a8c0"
                                    }}
                                >
                                    You can keep the current photo
                                    or retake it.
                                </p>


                                {/* CURRENT PHOTO */}

                                {!editPhotoPreview &&
                                    editingComplaint.imageUrl && (

                                    <div
                                        style={{
                                            marginBottom: "18px"
                                        }}
                                    >

                                        <p>
                                            Current Photo
                                        </p>

                                        <img
                                            src={
                                                getApiResourceUrl(editingComplaint.imageUrl)
                                            }
                                            alt="Current complaint"
                                            style={{
                                                width: "220px",
                                                height: "145px",
                                                objectFit: "cover",
                                                borderRadius: "10px",
                                                border:
                                                    "1px solid rgba(255,255,255,.15)"
                                            }}
                                        />

                                    </div>

                                )}


                                {/* CAMERA */}

                                {editCameraOpen && (

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection:
                                                "column",
                                            alignItems:
                                                "center",
                                            gap: "12px",
                                            marginBottom:
                                                "18px"
                                        }}
                                    >

                                        <video
                                            ref={editVideoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            style={{
                                                width: "100%",
                                                maxWidth:
                                                    "720px",
                                                aspectRatio:
                                                    "16 / 9",
                                                objectFit:
                                                    "cover",
                                                background:
                                                    "#020617",
                                                border:
                                                    "3px solid #ffffff",
                                                borderRadius:
                                                    "12px"
                                            }}
                                        />


                                        {!editCameraReady && (

                                            <p>
                                                Camera is starting...
                                            </p>

                                        )}


                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                gap: "10px",
                                                flexWrap:
                                                    "wrap",
                                                justifyContent:
                                                    "center"
                                            }}
                                        >

                                            <button
                                                type="button"
                                                className="primary-button"
                                                disabled={
                                                    !editCameraReady ||
                                                    editLoading
                                                }
                                                onClick={
                                                    captureEditPhoto
                                                }
                                            >
                                                📸 Capture New Photo
                                            </button>


                                            <button
                                                type="button"
                                                className="secondary-button"
                                                onClick={
                                                    stopEditCamera
                                                }
                                                disabled={
                                                    editLoading
                                                }
                                            >
                                                Cancel Camera
                                            </button>

                                        </div>

                                    </div>

                                )}


                                {/* NEW PHOTO PREVIEW */}

                                {editPhotoPreview && (

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            flexDirection:
                                                "column",
                                            alignItems:
                                                "flex-start",
                                            gap: "10px",
                                            marginBottom:
                                                "18px"
                                        }}
                                    >

                                        <p
                                            style={{
                                                color:
                                                    "#4ade80",
                                                fontWeight:
                                                    "700"
                                            }}
                                        >
                                            ✓ New photo selected
                                        </p>


                                        <img
                                            src={
                                                editPhotoPreview
                                            }
                                            alt="New complaint photo"
                                            style={{
                                                width: "220px",
                                                height: "145px",
                                                objectFit:
                                                    "cover",
                                                borderRadius:
                                                    "10px"
                                            }}
                                        />


                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                gap: "10px",
                                                flexWrap:
                                                    "wrap"
                                            }}
                                        >

                                            <button
                                                type="button"
                                                className="primary-button"
                                                onClick={
                                                    retakeEditPhoto
                                                }
                                                disabled={
                                                    editLoading
                                                }
                                            >
                                                🔄 Retake Photo
                                            </button>


                                            <button
                                                type="button"
                                                className="secondary-button"
                                                onClick={
                                                    keepExistingPhoto
                                                }
                                                disabled={
                                                    editLoading
                                                }
                                            >
                                                Keep Existing Photo
                                            </button>

                                        </div>

                                    </div>

                                )}


                                {/* OPEN CAMERA */}

                                {!editCameraOpen &&
                                    !editPhotoPreview && (

                                    <button
                                        type="button"
                                        className="primary-button"
                                        onClick={
                                            openEditCamera
                                        }
                                        disabled={
                                            editLoading
                                        }
                                    >
                                        📷 Retake Photo
                                    </button>

                                )}


                                <canvas
                                    ref={editCanvasRef}
                                    style={{
                                        display: "none"
                                    }}
                                />

                            </div>


                            {/* BUTTONS */}

                            <div
                                style={{
                                    display: "flex",
                                    gap: "12px",
                                    marginTop: "20px"
                                }}
                            >

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={
                                        editLoading
                                    }
                                >

                                    {editLoading
                                        ? "Saving..."
                                        : "💾 Save Changes"}

                                </button>


                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        handleCancelEdit
                                    }
                                    disabled={
                                        editLoading
                                    }
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    </section>

                )}


                {/* =================================================
                    WELCOME
                ================================================= */}

                <div className="welcome-card">

                    <h2>
                        Welcome to CampusFix 👋
                    </h2>

                    <p>
                        Report campus problems and
                        track your complaints.
                    </p>

                </div>


                {/* =================================================
                    STATISTICS
                ================================================= */}

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


                {/* =================================================
                    MY COMPLAINTS
                ================================================= */}

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


                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {loading ? (

                        <div className="empty-state">

                            <h3>
                                Loading complaints...
                            </h3>

                        </div>


                    ) : complaints.length === 0 ? (


                        /* =================================================
                            NO COMPLAINTS
                        ================================================= */

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


                        /* =================================================
                            COMPLAINT LIST
                        ================================================= */

                        <div className="complaint-list">

                            {complaints.map(
                                complaint => (

                                    <div
                                        className="complaint-card"
                                        key={
                                            complaint.id
                                        }
                                    >


                                        {/* =================================================
                                            PHOTO + INFORMATION
                                        ================================================= */}

                                        <div className="complaint-info">


                                            {/* PHOTO */}

                                            {complaint.imageUrl ? (

                                                <img
                                                    src={
                                                        getApiResourceUrl(complaint.imageUrl)
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


                                        {/* =================================================
                                            COMPLAINT META
                                        ================================================= */}

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


                                            {/* =================================================
                                                EDIT BUTTON
                                            ================================================= */}

                                            {complaint.status &&
                                                complaint.status.toUpperCase() ===
                                                "PENDING" && (

                                                    <button
                                                        type="button"
                                                        className="edit-complaint-button"
                                                        onClick={() =>
                                                            handleEditClick(
                                                                complaint
                                                            )
                                                        }
                                                    >
                                                        ✏️ Edit / Change
                                                    </button>

                                                )}

                                        {/* =================================================
                                            FEEDBACK SECTION
                                        ================================================= */}
                                        {complaint.status === 'RESOLVED' && (
                                            <div style={{marginTop: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd'}}>
                                                {complaint.rating ? (
                                                    <div>
                                                        <strong style={{color: '#ffc107', fontSize: '1.2em'}}>? {complaint.rating} / 5</strong>
                                                        <p style={{margin: '5px 0 0 0', fontStyle: 'italic'}}>{complaint.feedback}</p>
                                                    </div>
                                                ) : (
                                                    feedbackComplaintId === complaint.id ? (
                                                        <form onSubmit={(e) => handleFeedbackSubmit(e, complaint.id)}>
                                                            <div style={{marginBottom: '10px'}}>
                                                                <label style={{fontWeight: 'bold', marginRight: '10px'}}>Rating (1-5):</label>
                                                                <input type="number" min="1" max="5" value={feedbackForm.rating} onChange={(e) => setFeedbackForm({...feedbackForm, rating: e.target.value})} style={{width: '60px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc'}} required/>
                                                            </div>
                                                            <textarea placeholder="Write your feedback..." value={feedbackForm.feedback} onChange={(e) => setFeedbackForm({...feedbackForm, feedback: e.target.value})} style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '60px'}} required></textarea>
                                                            <div style={{marginTop: '10px'}}>
                                                                <button type="submit" disabled={feedbackLoading} style={{background: '#28a745', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', marginRight: '10px'}}>Submit Feedback</button>
                                                                <button type="button" onClick={() => setFeedbackComplaintId(null)} style={{background: '#6c757d', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer'}}>Cancel</button>
                                                            </div>
                                                        </form>
                                                    ) : (
                                                        <button onClick={() => setFeedbackComplaintId(complaint.id)} style={{background: '#007bff', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer'}}>
                                                            Provide Feedback
                                                        </button>
                                                    )
                                                )}
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

export default StudentDashboard;
