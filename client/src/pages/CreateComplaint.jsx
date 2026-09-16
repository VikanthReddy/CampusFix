import { useEffect, useRef, useState } from "react";
import api from "../services/api";

function CreateComplaint({
    onBack,
    onComplaintCreated
}) {

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [title, setTitle] =
        useState("");

    const [description, setDescription] =
        useState("");

    const [location, setLocation] =
        useState("");

    const [category, setCategory] =
        useState("");

    const [priority, setPriority] =
        useState("");

    const [photo, setPhoto] =
        useState(null);

    const [preview, setPreview] =
        useState("");

    const [cameraActive, setCameraActive] =
        useState(false);

    const [cameraError, setCameraError] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");


    // ==========================================
    // START CAMERA
    // ==========================================

    const startCamera = async () => {

        setCameraError("");

        try {

            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                throw new Error(
                    "Camera access is not supported by this browser."
                );
            }

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: {
                            ideal: "environment"
                        }
                    },
                    audio: false
                });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject =
                    stream;
            }

            setCameraActive(true);

        } catch (err) {

            console.error(
                "Camera error:",
                err
            );

            setCameraError(
                "Camera access is required to submit a complaint. Please allow camera permission."
            );
        }
    };


    // ==========================================
    // STOP CAMERA
    // ==========================================

    const stopCamera = () => {

        if (streamRef.current) {

            streamRef.current
                .getTracks()
                .forEach(track => {
                    track.stop();
                });

            streamRef.current = null;
        }

        setCameraActive(false);
    };


    // ==========================================
    // CAPTURE PHOTO
    // ==========================================

    const capturePhoto = () => {

        const video =
            videoRef.current;

        const canvas =
            canvasRef.current;

        if (!video || !canvas) {
            return;
        }

        if (
            video.readyState <
            2
        ) {
            setCameraError(
                "Camera is not ready yet. Please wait a moment."
            );

            return;
        }

        const width =
            video.videoWidth;

        const height =
            video.videoHeight;

        if (!width || !height) {

            setCameraError(
                "Unable to capture the camera image."
            );

            return;
        }

        canvas.width =
            width;

        canvas.height =
            height;

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

                    setCameraError(
                        "Unable to capture photo."
                    );

                    return;
                }

                const file =
                    new File(
                        [blob],
                        `campusfix-${Date.now()}.jpg`,
                        {
                            type: "image/jpeg"
                        }
                    );

                setPhoto(file);

                setPreview(
                    URL.createObjectURL(
                        blob
                    )
                );

                setCameraError("");

                stopCamera();
            },
            "image/jpeg",
            0.9
        );
    };


    // ==========================================
    // RETAKE PHOTO
    // ==========================================

    const retakePhoto = () => {

        if (preview) {
            URL.revokeObjectURL(
                preview
            );
        }

        setPreview("");
        setPhoto(null);

        startCamera();
    };


    // ==========================================
    // CLEAN CAMERA ON UNMOUNT
    // ==========================================

    useEffect(() => {

        return () => {

            if (streamRef.current) {

                streamRef.current
                    .getTracks()
                    .forEach(track => {
                        track.stop();
                    });
            }

            if (preview) {
                URL.revokeObjectURL(
                    preview
                );
            }
        };

    }, [preview]);


    // ==========================================
    // SUBMIT COMPLAINT
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setMessage("");


        // PHOTO IS COMPULSORY

        if (!photo) {

            setError(
                "Please capture a photo of the campus problem before submitting."
            );

            return;
        }


        if (!title.trim()) {

            setError(
                "Please enter a complaint title."
            );

            return;
        }


        if (!description.trim()) {

            setError(
                "Please describe the problem."
            );

            return;
        }


        if (!location.trim()) {

            setError(
                "Please enter the complaint location."
            );

            return;
        }


        setLoading(true);

        try {

            const formData =
                new FormData();

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
                "Complaint submitted successfully."
            );


            setTitle("");
            setDescription("");
            setLocation("");
            setCategory("");
            setPriority("");
            setPhoto(null);

            if (preview) {
                URL.revokeObjectURL(
                    preview
                );
            }

            setPreview("");


            setTimeout(() => {

                if (
                    onComplaintCreated
                ) {
                    onComplaintCreated(
                        response.data
                    );

                } else if (onBack) {

                    onBack();
                }

            }, 1000);


        } catch (err) {

            console.error(
                "Complaint submission error:",
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
                    "Unable to submit complaint. Please try again."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    return (
        <div className="create-complaint-page">

            {/* ==================================
                HEADER
            ================================== */}

            <div className="create-complaint-header">

                <button
                    type="button"
                    onClick={() => {

                        stopCamera();

                        if (onBack) {
                            onBack();
                        }

                    }}
                >
                    ← Back
                </button>

                <div>

                    <h1>
                        Report Campus Problem
                    </h1>

                    <p>
                        Submit a complaint with a photo
                        of the problem.
                    </p>

                </div>

            </div>


            {/* ==================================
                FORM
            ================================== */}

            <form
                className="complaint-form"
                onSubmit={handleSubmit}
            >

                {/* TITLE */}

                <label>
                    Complaint Title *
                </label>

                <input
                    type="text"
                    placeholder="Example: Classroom fan not working"
                    value={title}
                    onChange={(e) =>
                        setTitle(
                            e.target.value
                        )
                    }
                    required
                />


                {/* DESCRIPTION */}

                <label>
                    Description *
                </label>

                <textarea
                    placeholder="Describe the problem clearly..."
                    value={description}
                    onChange={(e) =>
                        setDescription(
                            e.target.value
                        )
                    }
                    rows="5"
                    required
                />


                {/* LOCATION */}

                <label>
                    Location *
                </label>

                <input
                    type="text"
                    placeholder="Example: Block A, Room 204"
                    value={location}
                    onChange={(e) =>
                        setLocation(
                            e.target.value
                        )
                    }
                    required
                />


                {/* CATEGORY */}

                <label>
                    Category
                </label>

                <select
                    value={category}
                    onChange={(e) =>
                        setCategory(
                            e.target.value
                        )
                    }
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


                {/* PRIORITY */}

                <label>
                    Priority
                </label>

                <select
                    value={priority}
                    onChange={(e) =>
                        setPriority(
                            e.target.value
                        )
                    }
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


                {/* ==================================
                    CAMERA SECTION
                ================================== */}

                <div className="camera-section">

                    <h2>
                        📷 Complaint Photo *
                    </h2>

                    <p>
                        A photo is compulsory for every
                        complaint.
                    </p>


                    {!preview && !cameraActive && (

                        <button
                            type="button"
                            onClick={
                                startCamera
                            }
                        >
                            📷 Open Camera
                        </button>

                    )}


                    {/* CAMERA */}

                    {cameraActive && (

                        <div className="camera-container">

                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                            />

                            <button
                                type="button"
                                onClick={
                                    capturePhoto
                                }
                            >
                                📸 Capture Photo
                            </button>

                            <button
                                type="button"
                                onClick={
                                    stopCamera
                                }
                            >
                                Cancel Camera
                            </button>

                        </div>

                    )}


                    {/* PREVIEW */}

                    {preview && (

                        <div className="photo-preview">

                            <img
                                src={preview}
                                alt="Captured complaint"
                            />

                            <div>

                                <strong>
                                    ✓ Photo Captured
                                </strong>

                                <button
                                    type="button"
                                    onClick={
                                        retakePhoto
                                    }
                                >
                                    Retake Photo
                                </button>

                            </div>

                        </div>

                    )}


                    {/* HIDDEN CANVAS */}

                    <canvas
                        ref={canvasRef}
                        style={{
                            display: "none"
                        }}
                    />

                </div>


                {/* CAMERA ERROR */}

                {cameraError && (

                    <div className="complaint-error">
                        {cameraError}
                    </div>

                )}


                {/* SUCCESS */}

                {message && (

                    <div className="complaint-success">
                        {message}
                    </div>

                )}


                {/* ERROR */}

                {error && (

                    <div className="complaint-error">
                        {error}
                    </div>

                )}


                {/* SUBMIT */}

                <button
                    type="submit"
                    disabled={
                        loading ||
                        !photo
                    }
                >
                    {loading
                        ? "Submitting..."
                        : "Submit Complaint"}
                </button>

            </form>

        </div>
    );
}

export default CreateComplaint;