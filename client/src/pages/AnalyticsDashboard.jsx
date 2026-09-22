import { useEffect, useState } from "react";
import api from "../services/api";

function AnalyticsDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadAnalytics();

        // Keep Admin analytics synchronized with technician status updates.
        const interval = setInterval(() => {
            loadAnalytics(true);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const loadAnalytics = async (silent = false) => {
        try {
            const response = await api.get("/analytics/summary");

            setAnalytics(response.data);
        } catch (error) {
            console.error("Analytics error:", error);

            setError("Unable to load analytics.");
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    /* ==============================
       LOADING
       ============================== */

    if (loading) {
        return (
            <section className="analytics-section">

                <div className="analytics-empty">

                    <div className="analytics-loading-icon">
                        📊
                    </div>

                    <h3>
                        Loading analytics...
                    </h3>

                </div>

            </section>
        );
    }


    /* ==============================
       ERROR
       ============================== */

    if (error) {
        return (
            <section className="analytics-section">

                <div className="analytics-error">
                    ⚠️ {error}
                </div>

            </section>
        );
    }


    if (!analytics) {
        return null;
    }


    /* ==============================
       SUMMARY DATA
       ============================== */

    const total =
        analytics.totalComplaints || 0;

    const pending =
        analytics.pendingComplaints || 0;

    const inProgress =
        analytics.inProgressComplaints || 0;

    const resolved =
        analytics.resolvedComplaints || 0;


    /* ==============================
       CATEGORY DATA
       ============================== */

    const electrical =
        analytics.electricalComplaints || 0;

    const plumbing =
        analytics.plumbingComplaints || 0;

    const network =
        analytics.networkComplaints || 0;

    const furniture =
        analytics.furnitureComplaints || 0;

    const civil =
        analytics.civilComplaints || 0;

    const general =
        analytics.generalComplaints || 0;

    const generalMaintenance =
        analytics.generalMaintenanceComplaints || 0;


    /* ==============================
       RESOLUTION
       ============================== */

    const resolutionPercentage =
        total > 0
            ? Math.round(
                (resolved / total) * 100
            )
            : 0;


    /* ==============================
       MAX CATEGORY
       ============================== */

    const maxCategory =
        Math.max(
            electrical,
            plumbing,
            network,
            furniture,
            civil,
            general,
            generalMaintenance,
            1
        );


    const categoryWidth = (value) => {
        return `${(value / maxCategory) * 100}%`;
    };


    return (
        <section className="analytics-section">

            {/* =================================
                HEADER
               ================================= */}

            <div className="analytics-header">

                <div>

                    <span className="analytics-label">
                        PERFORMANCE OVERVIEW
                    </span>

                    <h2>
                        Complaint Analytics
                    </h2>

                    <p>
                        Real-time overview of complaints
                        and campus maintenance activity.
                    </p>

                </div>


                <div className="analytics-total">

                    <span>
                        Total Complaints
                    </span>

                    <strong>
                        {total}
                    </strong>

                    <button
                        type="button"
                        className="analytics-refresh-button"
                        onClick={() => loadAnalytics(false)}
                    >
                        Refresh
                    </button>

                </div>

            </div>


            {/* =================================
                STATUS CARDS
               ================================= */}

            <div className="analytics-status-grid">

                {/* Pending */}

                <div className="analytics-status-card">

                    <div className="analytics-card-icon">
                        ⏳
                    </div>

                    <div>

                        <span>
                            Pending
                        </span>

                        <strong>
                            {pending}
                        </strong>

                    </div>

                </div>


                {/* In Progress */}

                <div className="analytics-status-card">

                    <div className="analytics-card-icon">
                        🔧
                    </div>

                    <div>

                        <span>
                            In Progress
                        </span>

                        <strong>
                            {inProgress}
                        </strong>

                    </div>

                </div>


                {/* Resolved */}

                <div className="analytics-status-card">

                    <div className="analytics-card-icon">
                        ✅
                    </div>

                    <div>

                        <span>
                            Resolved
                        </span>

                        <strong>
                            {resolved}
                        </strong>

                    </div>

                </div>


                {/* Resolution */}

                <div className="analytics-status-card">

                    <div className="analytics-card-icon">
                        📈
                    </div>

                    <div>

                        <span>
                            Resolution Rate
                        </span>

                        <strong>
                            {resolutionPercentage}%
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================
                ANALYTICS MAIN
               ================================= */}

            <div className="analytics-main-grid">


                {/* =================================
                    RESOLUTION CARD
                   ================================= */}

                <div className="resolution-card">

                    <div className="analytics-card-heading">

                        <div>

                            <span>
                                RESOLUTION PERFORMANCE
                            </span>

                            <h3>
                                Complaint Resolution
                            </h3>

                        </div>

                        <div className="analytics-check">
                            ✓
                        </div>

                    </div>


                    <div className="resolution-content">


                        {/* Circle */}

                        <div
                            className="resolution-circle"
                            style={{
                                "--progress":
                                    `${resolutionPercentage}%`
                            }}
                        >

                            <div>

                                <strong>
                                    {resolutionPercentage}%
                                </strong>

                                <span>
                                    Resolved
                                </span>

                            </div>

                        </div>


                        {/* Information */}

                        <div className="resolution-info">

                            <div>

                                <span className="dot pending-dot"></span>

                                <div>

                                    <strong>
                                        Pending
                                    </strong>

                                    <small>
                                        {pending} complaints
                                    </small>

                                </div>

                            </div>


                            <div>

                                <span className="dot progress-dot"></span>

                                <div>

                                    <strong>
                                        In Progress
                                    </strong>

                                    <small>
                                        {inProgress} complaints
                                    </small>

                                </div>

                            </div>


                            <div>

                                <span className="dot resolved-dot"></span>

                                <div>

                                    <strong>
                                        Resolved
                                    </strong>

                                    <small>
                                        {resolved} complaints
                                    </small>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================
                    CATEGORY CARD
                   ================================= */}

                <div className="category-card">

                    <div className="analytics-card-heading">

                        <div>

                            <span>
                                COMPLAINT DISTRIBUTION
                            </span>

                            <h3>
                                Complaints by Category
                            </h3>

                        </div>

                    </div>


                    <div className="category-bars">


                        {/* Electrical */}

                        <div>

                            <div className="category-row-top">

                                <span>
                                    ⚡ Electrical
                                </span>

                                <strong>
                                    {electrical}
                                </strong>

                            </div>

                            <div className="category-bar">

                                <div
                                    className="category-fill electrical-fill"
                                    style={{
                                        width:
                                            categoryWidth(
                                                electrical
                                            )
                                    }}
                                ></div>

                            </div>

                        </div>


                        {/* Plumbing */}

                        <div>

                            <div className="category-row-top">

                                <span>
                                    💧 Plumbing
                                </span>

                                <strong>
                                    {plumbing}
                                </strong>

                            </div>

                            <div className="category-bar">

                                <div
                                    className="category-fill plumbing-fill"
                                    style={{
                                        width:
                                            categoryWidth(
                                                plumbing
                                            )
                                    }}
                                ></div>

                            </div>

                        </div>


                        {/* Network */}

                        <div>

                            <div className="category-row-top">

                                <span>
                                    🌐 Network
                                </span>

                                <strong>
                                    {network}
                                </strong>

                            </div>

                            <div className="category-bar">

                                <div
                                    className="category-fill network-fill"
                                    style={{
                                        width:
                                            categoryWidth(
                                                network
                                            )
                                    }}
                                ></div>

                            </div>

                        </div>


                        {/* Furniture */}

                        <div>

                            <div className="category-row-top">

                                <span>
                                    🪑 Furniture
                                </span>

                                <strong>
                                    {furniture}
                                </strong>

                            </div>

                            <div className="category-bar">

                                <div
                                    className="category-fill furniture-fill"
                                    style={{
                                        width:
                                            categoryWidth(
                                                furniture
                                            )
                                    }}
                                ></div>

                            </div>

                        </div>


                        {/* Civil */}

                        <div>

                            <div className="category-row-top">

                                <span>
                                    🏗️ Civil
                                </span>

                                <strong>
                                    {civil}
                                </strong>

                            </div>

                            <div className="category-bar">

                                <div
                                    className="category-fill civil-fill"
                                    style={{
                                        width:
                                            categoryWidth(
                                                civil
                                            )
                                    }}
                                ></div>

                            </div>

                        </div>


                        {/* General */}

                        <div>

                            <div className="category-row-top">

                                <span>
                                    🛠️ General
                                </span>

                                <strong>
                                    {general}
                                </strong>

                            </div>

                            <div className="category-bar">

                                <div
                                    className="category-fill general-fill"
                                    style={{
                                        width:
                                            categoryWidth(
                                                general
                                            )
                                    }}
                                ></div>

                            </div>

                        </div>


                        {/* General Maintenance */}

                        <div>

                            <div className="category-row-top">

                                <span>
                                    🔨 General Maintenance
                                </span>

                                <strong>
                                    {generalMaintenance}
                                </strong>

                            </div>

                            <div className="category-bar">

                                <div
                                    className="category-fill general-fill"
                                    style={{
                                        width:
                                            categoryWidth(
                                                generalMaintenance
                                            )
                                    }}
                                ></div>

                            </div>

                        </div>


                    </div>

                </div>

            </div>

        </section>
    );
}

export default AnalyticsDashboard;