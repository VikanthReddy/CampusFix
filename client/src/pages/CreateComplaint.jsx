import React, { useEffect, useRef, useState } from "react";
import api from "../services/api";

function CreateComplaint({ onBack, onComplaintCreated }) {

    // =========================================================
    // FORM STATE
    // =========================================================

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [category, setCategory] = useState("");
    const [priority, setPriority] = useState("");

    // =========================================================
    // CAMERA STATE
    // =========================================================

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    // =========================================================
    // OTHER STATE
    // =========================================================

    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // =========================================================
    // STOP CAMERA WHEN COMPONENT CLOSES
    // =========================================================

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    // =========================================================
    // OPEN CAMERA
    // =========================================================

    const openCamera = async () => {

        setError("");
        setMessage("");
        setCameraReady(false);

        try {

            if (!navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia) {

                setError(
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

            streamRef.current = stream;

            setCameraOpen(true);

            // Wait for React to render the video element
            setTimeout(async () => {

                if (videoRef.current) {

                    videoRef.current.srcObject = stream;

                    try {
                        await videoRef.current.play();
                    } catch (playError) {
                        console.log(
                            "Video autoplay error:",
                            playError
                        );
                    }

                    setCameraReady(true);
                }

            }, 100);

        } catch (err) {

            console.error("Camera error:", err);

            if (err.name === "NotAllowedError") {

                setError(
                    "Camera permission was denied. Please allow camera access in your browser."
                );

            } else if (err.name === "NotFoundError") {

                setError(
                    "No camera was found on this device."
                );

            } else {

                setError(
                    "Unable to open the camera. Please try again."
                );
            }
        }
    };

    // =========================================================
    // STOP CAMERA
    // =========================================================

    const stopCamera = () => {

        if (streamRef.current) {

            streamRef.current
                .getTracks()
                .forEach(track => track.stop());

            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setCameraOpen(false);
        setCameraReady(false);
    };

    // =========================================================
    // CAPTURE PHOTO
    // =========================================================

    const capturePhoto = () => {

        if (!videoRef.current ||
            !canvasRef.current ||
            !cameraReady) {

            setError(
                "Camera is not ready yet. Please wait a moment."
            );

            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;

        const width = video.videoWidth;
        const height = video.videoHeight;

        if (!width || !height) {

            setError(
                "Unable to capture the camera image. Please try again."
            );

            return;
        }

        canvas.width = width;
        canvas.height = height;

        const context =
            canvas.getContext("2d");

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

                    setError(
                        "Failed to capture photo."
                    );

                    return;
                }

                const file = new File(
                    [blob],
                    `complaint-${Date.now()}.jpg`,
                    {
                        type: "image/jpeg"
                    }
                );

                setPhoto(file);

                const previewUrl =
                    URL.createObjectURL(blob);

                setPhotoPreview(previewUrl);

                setMessage(
                    "Photo captured successfully."
                );

                setError("");

                stopCamera();
            },
            "image/jpeg",
            0.90
        );
    };

    // =========================================================
    // RETAKE PHOTO
    // =========================================================

    const retakePhoto = () => {

        if (photoPreview) {
            URL.revokeObjectURL(photoPreview);
        }

        setPhoto(null);
        setPhotoPreview(null);
        setMessage("");
        setError("");

        openCamera();
    };

    // =========================================================
    // SUBMIT COMPLAINT
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setMessage("");

        // Validate title
        if (!title.trim()) {

            setError(
                "Please enter a complaint title."
            );

            return;
        }

        // Validate description
        if (!description.trim()) {

            setError(
                "Please describe the problem."
            );

            return;
        }

        // Validate location
        if (!location.trim()) {

            setError(
                "Please enter the complaint location."
            );

            return;
        }

        // Photo is compulsory
        if (!photo) {

            setError(
                "Please capture a photo before submitting the complaint."
            );

            return;
        }

        try {

            setSubmitting(true);

            const formData = new FormData();

            formData.append(
                "title",
                title.trim()
            );

            formData.append(
                "description",
                description.trim()
            );

            formData.append(
                "location",
                location.trim()
            );

            if (category) {

                formData.append(
                    "category",
                    category
                );
            }

            if (priority) {

                formData.append(
                    "priority",
                    priority
                );
            }

            formData.append(
                "image",
                photo
            );

            const response =
                await api.post(
                    "/complaints",
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data"
                        }
                    }
                );

            console.log(
                "Complaint created:",
                response.data
            );

            setMessage(
                "Complaint submitted successfully!"
            );

            // Notify parent
            if (onComplaintCreated) {
                onComplaintCreated(
                    response.data
                );
            }

            // Small delay so user can see success message
            setTimeout(() => {

                if (onBack) {
                    onBack();
                }

            }, 1000);

        } catch (err) {

            console.error(
                "Complaint submission error:",
                err
            );

            let errorMessage =
                "Failed to submit complaint.";

            if (err.response?.data) {

                if (
                    typeof err.response.data ===
                    "string"
                ) {

                    errorMessage =
                        err.response.data;

                } else if (
                    err.response.data.message
                ) {

                    errorMessage =
                        err.response.data.message;
                }
            }

            setError(errorMessage);

        } finally {

            setSubmitting(false);
        }
    };

    // =========================================================
    // STYLES
    // =========================================================

    const pageStyle = {
        minHeight: "100vh",
        width: "100%",
        padding: "30px 20px 50px",
        background: "#f5f7fb",
        fontFamily:
            'Inter, "Segoe UI", Arial, sans-serif'
    };

    const cardStyle = {
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
        padding: "35px",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "18px",
        boxShadow:
            "0 15px 45px rgba(15, 23, 42, 0.08)"
    };

    const fieldStyle = {
        width: "100%",
        marginBottom: "22px"
    };

    const labelStyle = {
        display: "block",
        marginBottom: "8px",
        color: "#374151",
        fontSize: "14px",
        fontWeight: "700"
    };

    const inputStyle = {
        width: "100%",
        height: "50px",
        padding: "0 14px",
        border: "1px solid #d7dce5",
        borderRadius: "10px",
        background: "#ffffff",
        color: "#1f2937",
        fontSize: "15px",
        outline: "none"
    };

    const textareaStyle = {
        width: "100%",
        minHeight: "130px",
        padding: "13px 14px",
        border: "1px solid #d7dce5",
        borderRadius: "10px",
        background: "#ffffff",
        color: "#1f2937",
        fontSize: "15px",
        lineHeight: "1.5",
        resize: "vertical",
        outline: "none"
    };

    const selectStyle = {
        width: "100%",
        height: "50px",
        padding: "0 12px",
        border: "1px solid #d7dce5",
        borderRadius: "10px",
        background: "#ffffff",
        color: "#1f2937",
        fontSize: "15px",
        outline: "none",
        cursor: "pointer"
    };

    const buttonStyle = {
        border: "none",
        borderRadius: "10px",
        padding: "11px 20px",
        fontSize: "14px",
        fontWeight: "700",
        cursor: "pointer"
    };

    // =========================================================
    // UI
    // =========================================================

    return (
        <div style={pageStyle}>

            <div style={cardStyle}>

                {/* =====================================================
                    BACK BUTTON
                ====================================================== */}

                <button
                    type="button"
                    onClick={() => {
                        stopCamera();

                        if (onBack) {
                            onBack();
                        }
                    }}
                    style={{
                        ...buttonStyle,
                        marginBottom: "22px",
                        background: "#f3f4f6",
                        color: "#374151",
                        border: "1px solid #e5e7eb"
                    }}
                >
                    ← Back
                </button>


                {/* =====================================================
                    TITLE
                ====================================================== */}

                <h1
                    style={{
                        margin: "0 0 8px",
                        color: "#1f2937",
                        fontSize: "30px",
                        fontWeight: "800"
                    }}
                >
                    Report Campus Problem
                </h1>

                <p
                    style={{
                        margin: "0 0 30px",
                        color: "#6b7280",
                        fontSize: "14px"
                    }}
                >
                    Submit a complaint with a photo of the problem.
                </p>


                {/* =====================================================
                    ERROR MESSAGE
                ====================================================== */}

                {error && (

                    <div
                        style={{
                            marginBottom: "20px",
                            padding: "13px 15px",
                            borderRadius: "10px",
                            background: "#fef2f2",
                            border:
                                "1px solid #fecaca",
                            color: "#b91c1c",
                            fontSize: "14px",
                            fontWeight: "600"
                        }}
                    >
                        ⚠️ {error}
                    </div>

                )}


                {/* =====================================================
                    SUCCESS MESSAGE
                ====================================================== */}

                {message && (

                    <div
                        style={{
                            marginBottom: "20px",
                            padding: "13px 15px",
                            borderRadius: "10px",
                            background: "#ecfdf5",
                            border:
                                "1px solid #a7f3d0",
                            color: "#047857",
                            fontSize: "14px",
                            fontWeight: "600"
                        }}
                    >
                        ✓ {message}
                    </div>

                )}


                {/* =====================================================
                    FORM
                ====================================================== */}

                <form onSubmit={handleSubmit}>

                    {/* TITLE */}

                    <div style={fieldStyle}>

                        <label style={labelStyle}>
                            Complaint Title *
                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) =>
                                setTitle(e.target.value)
                            }
                            placeholder="Example: Classroom fan not working"
                            style={inputStyle}
                        />

                    </div>


                    {/* DESCRIPTION */}

                    <div style={fieldStyle}>

                        <label style={labelStyle}>
                            Description *
                        </label>

                        <textarea
                            value={description}
                            onChange={(e) =>
                                setDescription(
                                    e.target.value
                                )
                            }
                            placeholder="Describe the problem clearly..."
                            style={textareaStyle}
                        />

                    </div>


                    {/* LOCATION */}

                    <div style={fieldStyle}>

                        <label style={labelStyle}>
                            Location *
                        </label>

                        <input
                            type="text"
                            value={location}
                            onChange={(e) =>
                                setLocation(
                                    e.target.value
                                )
                            }
                            placeholder="Example: Block A, Room 201"
                            style={inputStyle}
                        />

                    </div>


                    {/* CATEGORY + PRIORITY */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "1fr 1fr",
                            gap: "18px",
                            marginBottom: "22px"
                        }}
                    >

                        {/* CATEGORY */}

                        <div>

                            <label style={labelStyle}>
                                Category
                            </label>

                            <select
                                value={category}
                                onChange={(e) =>
                                    setCategory(
                                        e.target.value
                                    )
                                }
                                style={selectStyle}
                            >

                                <option value="">
                                    AI will categorize
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

                                <option value="GENERAL MAINTENANCE">
                                    General Maintenance
                                </option>

                            </select>

                        </div>


                        {/* PRIORITY */}

                        <div>

                            <label style={labelStyle}>
                                Priority
                            </label>

                            <select
                                value={priority}
                                onChange={(e) =>
                                    setPriority(
                                        e.target.value
                                    )
                                }
                                style={selectStyle}
                            >

                                <option value="">
                                    AI will determine priority
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

                    </div>


                    {/* =================================================
                        CAMERA SECTION
                    ================================================== */}

                    <div
                        style={{
                            width: "100%",
                            margin: "10px 0 25px",
                            padding: "28px",
                            textAlign: "center",
                            background:
                                "linear-gradient(135deg,#f8f8ff,#f4f7ff)",
                            border:
                                "2px dashed #c7cdf4",
                            borderRadius: "16px"
                        }}
                    >

                        <h2
                            style={{
                                margin:
                                    "0 0 8px",
                                color: "#4f46e5",
                                fontSize: "21px",
                                fontWeight: "800"
                            }}
                        >
                            📷 Complaint Photo *
                        </h2>

                        <p
                            style={{
                                margin:
                                    "0 0 20px",
                                color: "#6b7280",
                                fontSize: "14px"
                            }}
                        >
                            A photo is compulsory for every complaint.
                        </p>


                        {/* CAMERA NOT OPEN */}

                        {!cameraOpen &&
                         !photoPreview && (

                            <button
                                type="button"
                                onClick={openCamera}
                                style={{
                                    ...buttonStyle,
                                    background:
                                        "#6366f1",
                                    color: "#ffffff",
                                    padding:
                                        "12px 24px",
                                    boxShadow:
                                        "0 8px 20px rgba(99,102,241,.20)"
                                }}
                            >
                                📷 Open Camera
                            </button>

                        )}


                        {/* CAMERA */}

                        {cameraOpen && (

                            <div
                                style={{
                                    display: "flex",
                                    flexDirection:
                                        "column",
                                    alignItems:
                                        "center"
                                }}
                            >

                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    style={{
                                        display: "block",
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
                                            "4px solid #ffffff",
                                        borderRadius:
                                            "14px",
                                        boxShadow:
                                            "0 12px 30px rgba(15,23,42,.18)"
                                    }}
                                />

                                {!cameraReady && (

                                    <p
                                        style={{
                                            margin:
                                                "14px 0",
                                            color:
                                                "#b45309",
                                            fontSize:
                                                "13px",
                                            fontWeight:
                                                "700"
                                        }}
                                    >
                                        Camera is starting...
                                    </p>

                                )}

                                {cameraReady && (

                                    <span
                                        style={{
                                            display:
                                                "inline-flex",
                                            margin:
                                                "12px 0",
                                            padding:
                                                "7px 13px",
                                            borderRadius:
                                                "20px",
                                            background:
                                                "#dcfce7",
                                            color:
                                                "#15803d",
                                            fontSize:
                                                "12px",
                                            fontWeight:
                                                "700"
                                        }}
                                    >
                                        ✓ Camera Ready
                                    </span>

                                )}

                                <button
                                    type="button"
                                    disabled={
                                        !cameraReady
                                    }
                                    onClick={
                                        capturePhoto
                                    }
                                    style={{
                                        ...buttonStyle,
                                        marginTop:
                                            "10px",
                                        background:
                                            cameraReady
                                                ? "#16a34a"
                                                : "#9ca3af",
                                        color:
                                            "#ffffff",
                                        padding:
                                            "13px 26px",
                                        cursor:
                                            cameraReady
                                                ? "pointer"
                                                : "not-allowed"
                                    }}
                                >
                                    📸 Capture Photo
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        stopCamera
                                    }
                                    style={{
                                        ...buttonStyle,
                                        marginTop:
                                            "10px",
                                        background:
                                            "#ffffff",
                                        color:
                                            "#475569",
                                        border:
                                            "1px solid #cbd5e1"
                                    }}
                                >
                                    Cancel Camera
                                </button>

                            </div>

                        )}


                        {/* PHOTO PREVIEW */}

                        {photoPreview && (

                            <div
                                style={{
                                    display: "flex",
                                    flexDirection:
                                        "column",
                                    alignItems:
                                        "center"
                                }}
                            >

                                <img
                                    src={
                                        photoPreview
                                    }
                                    alt="Captured complaint"
                                    style={{
                                        display:
                                            "block",
                                        width: "100%",
                                        maxWidth:
                                            "720px",
                                        maxHeight:
                                            "480px",
                                        objectFit:
                                            "contain",
                                        padding:
                                            "5px",
                                        background:
                                            "#ffffff",
                                        border:
                                            "1px solid #dbe1ea",
                                        borderRadius:
                                            "14px"
                                    }}
                                />

                                <div
                                    style={{
                                        marginTop:
                                            "12px",
                                        padding:
                                            "7px 13px",
                                        borderRadius:
                                            "20px",
                                        background:
                                            "#dcfce7",
                                        color:
                                            "#15803d",
                                        fontSize:
                                            "13px",
                                        fontWeight:
                                            "700"
                                    }}
                                >
                                    ✓ Photo Captured
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        retakePhoto
                                    }
                                    style={{
                                        ...buttonStyle,
                                        marginTop:
                                            "13px",
                                        background:
                                            "#f59e0b",
                                        color:
                                            "#ffffff"
                                    }}
                                >
                                    🔄 Retake Photo
                                </button>

                            </div>

                        )}

                    </div>


                    {/* =================================================
                        HIDDEN CANVAS
                    ================================================== */}

                    <canvas
                        ref={canvasRef}
                        style={{
                            display: "none"
                        }}
                    />


                    {/* =================================================
                        SUBMIT
                    ================================================== */}

                    <button
                        type="submit"
                        disabled={
                            submitting ||
                            !photo
                        }
                        style={{
                            width: "100%",
                            minHeight: "55px",
                            border: "none",
                            borderRadius: "12px",
                            background:
                                submitting ||
                                !photo
                                    ? "#cbd5e1"
                                    : "linear-gradient(135deg,#4f46e5,#6366f1)",
                            color: "#ffffff",
                            fontSize: "16px",
                            fontWeight: "800",
                            cursor:
                                submitting ||
                                !photo
                                    ? "not-allowed"
                                    : "pointer",
                            boxShadow:
                                submitting ||
                                !photo
                                    ? "none"
                                    : "0 10px 25px rgba(79,70,229,.20)"
                        }}
                    >
                        {submitting
                            ? "Submitting Complaint..."
                            : !photo
                                ? "📷 Capture Photo to Submit"
                                : "🚀 Submit Complaint"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default CreateComplaint;