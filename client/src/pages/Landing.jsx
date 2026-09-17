import { useEffect, useRef, useState } from "react";
import "./Landing.css";

function Landing({ onLogin, onSignup }) {

    const [mobileMenu, setMobileMenu] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [status, setStatus] = useState("PENDING");
    const [visibleSections, setVisibleSections] = useState({});

    const sectionRefs = useRef([]);

    // ==========================================
    // SCROLL REVEAL
    // ==========================================

    useEffect(() => {

        const observer = new IntersectionObserver(
            (entries) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {

                        setVisibleSections((previous) => ({
                            ...previous,
                            [entry.target.dataset.section]: true
                        }));

                    }

                });

            },
            {
                threshold: 0.12
            }
        );

        sectionRefs.current.forEach((section) => {

            if (section) {
                observer.observe(section);
            }

        });

        return () => observer.disconnect();

    }, []);


    // ==========================================
    // SMOOTH SCROLL
    // ==========================================

    const scrollToSection = (id) => {

        const element =
            document.getElementById(id);

        if (element) {

            element.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

        setMobileMenu(false);
    };


    // ==========================================
    // HOW IT WORKS
    // ==========================================

    const steps = [
        {
            number: "01",
            icon: "📢",
            title: "Report",
            description:
                "Students report campus problems by providing the issue details, location and a compulsory photo.",
            details: [
                "Describe the problem",
                "Select location",
                "Upload camera photo"
            ]
        },
        {
            number: "02",
            icon: "🧠",
            title: "Analyze & Assign",
            description:
                "The complaint is categorized and administrators assign it to a technician based on specialization.",
            details: [
                "AI categorization",
                "Priority detection",
                "Specialist assignment"
            ]
        },
        {
            number: "03",
            icon: "🛠️",
            title: "Resolve",
            description:
                "The technician works on the complaint and updates its progress until the issue is resolved.",
            details: [
                "Track progress",
                "Update status",
                "Notify student"
            ]
        }
    ];


    // ==========================================
    // STATUS DEMO
    // ==========================================

    const statusData = {

        PENDING: {
            label: "Complaint Submitted",
            description:
                "Your complaint has been successfully submitted and is waiting for administrator review.",
            icon: "📩",
            color: "pending"
        },

        ASSIGNED: {
            label: "Technician Assigned",
            description:
                "A technician with the appropriate specialization has been assigned to your complaint.",
            icon: "👨‍🔧",
            color: "assigned"
        },

        IN_PROGRESS: {
            label: "Work In Progress",
            description:
                "The assigned technician is currently working on resolving the reported issue.",
            icon: "🔧",
            color: "progress"
        },

        RESOLVED: {
            label: "Complaint Resolved",
            description:
                "The reported campus issue has been resolved successfully.",
            icon: "✓",
            color: "resolved"
        }
    };


    // ==========================================
    // CLOSE MOBILE MENU
    // ==========================================

    const closeMenu = () => {
        setMobileMenu(false);
    };


    return (

        <div className="landing-page">

            {/* ==================================
                NAVBAR
            ================================== */}

            <nav className="landing-navbar">

                <div
                    className="landing-logo"
                    onClick={() =>
                        scrollToSection("home")
                    }
                >

                    <div className="logo-icon">
                        CF
                    </div>

                    <span>
                        Campus<span>Fix</span>
                    </span>

                </div>


                {/* Desktop navigation */}

                <div className="landing-nav-links">

                    <button
                        onClick={() =>
                            scrollToSection("home")
                        }
                    >
                        Home
                    </button>

                    <button
                        onClick={() =>
                            scrollToSection("features")
                        }
                    >
                        Features
                    </button>

                    <button
                        onClick={() =>
                            scrollToSection("how-it-works")
                        }
                    >
                        How It Works
                    </button>

                    <button
                        onClick={() =>
                            scrollToSection("status")
                        }
                    >
                        Track Complaint
                    </button>

                </div>


                <div className="landing-nav-actions">

                    <button
                        className="landing-login-btn"
                        onClick={onLogin}
                    >
                        Login
                    </button>

                    <button
                        className="landing-signup-btn"
                        onClick={onSignup}
                    >
                        Get Started
                    </button>

                </div>


                {/* Mobile menu button */}

                <button
                    className="mobile-menu-button"
                    onClick={() =>
                        setMobileMenu(!mobileMenu)
                    }
                    aria-label="Toggle navigation"
                >
                    {mobileMenu ? "✕" : "☰"}
                </button>

            </nav>


            {/* ==================================
                MOBILE MENU
            ================================== */}

            <div
                className={`mobile-menu ${
                    mobileMenu
                        ? "mobile-menu-open"
                        : ""
                }`}
            >

                <button
                    onClick={() =>
                        scrollToSection("home")
                    }
                >
                    Home
                </button>

                <button
                    onClick={() =>
                        scrollToSection("features")
                    }
                >
                    Features
                </button>

                <button
                    onClick={() =>
                        scrollToSection("how-it-works")
                    }
                >
                    How It Works
                </button>

                <button
                    onClick={() =>
                        scrollToSection("status")
                    }
                >
                    Track Complaint
                </button>

                <button
                    className="mobile-login"
                    onClick={() => {
                        closeMenu();
                        onLogin();
                    }}
                >
                    Login
                </button>

                <button
                    className="mobile-signup"
                    onClick={() => {
                        closeMenu();
                        onSignup();
                    }}
                >
                    Get Started
                </button>

            </div>


            {/* ==================================
                HERO
            ================================== */}

            <section
                id="home"
                className="landing-hero"
            >

                <div className="hero-content">

                    <div className="hero-badge">

                        <span className="live-dot"></span>

                        Smart Campus Management

                    </div>


                    <h1>

                        Fix Problems.
                        <br />

                        <span>
                            Improve Campus.
                        </span>

                    </h1>


                    <p>

                        CampusFix connects students,
                        administrators and technicians
                        on one smart platform to report,
                        track and resolve campus issues.

                    </p>


                    <div className="hero-buttons">

                        <button
                            className="primary-hero-btn"
                            onClick={onSignup}
                        >

                            Report an Issue

                            <span>→</span>

                        </button>


                        <button
                            className="secondary-hero-btn"
                            onClick={() =>
                                scrollToSection(
                                    "how-it-works"
                                )
                            }
                        >

                            See How It Works

                            <span>↓</span>

                        </button>

                    </div>

                </div>


                {/* Interactive dashboard */}

                <div className="hero-visual">

                    <div className="hero-glow glow-one"></div>
                    <div className="hero-glow glow-two"></div>


                    <div className="dashboard-card">

                        <div className="dashboard-top">

                            <div>

                                <span className="mini-label">
                                    CAMPUSFIX
                                </span>

                                <h3>
                                    Campus Overview
                                </h3>

                            </div>

                            <div className="live-status">
                                <span></span>
                                LIVE
                            </div>

                        </div>


                        <div className="dashboard-stats">

                            <div className="mini-stat">

                                <div className="mini-stat-icon blue">
                                    !
                                </div>

                                <div>
                                    <strong>24</strong>
                                    <small>Pending</small>
                                </div>

                            </div>


                            <div className="mini-stat">

                                <div className="mini-stat-icon orange">
                                    ↻
                                </div>

                                <div>
                                    <strong>12</strong>
                                    <small>In Progress</small>
                                </div>

                            </div>


                            <div className="mini-stat">

                                <div className="mini-stat-icon green">
                                    ✓
                                </div>

                                <div>
                                    <strong>86</strong>
                                    <small>Resolved</small>
                                </div>

                            </div>

                        </div>


                        <div className="dashboard-chart">

                            <div className="chart-heading">

                                <strong>
                                    Resolution Activity
                                </strong>

                                <span>
                                    This Week
                                </span>

                            </div>


                            <div className="chart-bars">

                                {[42, 60, 48, 78, 58, 90, 72].map(
                                    (height, index) => (

                                        <div
                                            className="chart-column"
                                            key={index}
                                        >

                                            <div
                                                className="chart-bar"
                                                style={{
                                                    height: `${height}%`
                                                }}
                                            ></div>

                                            <small>
                                                {
                                                    [
                                                        "M",
                                                        "T",
                                                        "W",
                                                        "T",
                                                        "F",
                                                        "S",
                                                        "S"
                                                    ][index]
                                                }
                                            </small>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>


                        <div className="recent-complaints">

                            <div className="recent-heading">

                                <strong>
                                    Recent Complaints
                                </strong>

                                <span>
                                    View all
                                </span>

                            </div>


                            <div className="complaint-row">

                                <div className="complaint-avatar electrical">
                                    E
                                </div>

                                <div className="complaint-info">

                                    <strong>
                                        Classroom Fan
                                    </strong>

                                    <small>
                                        Block A • Electrical
                                    </small>

                                </div>

                                <span className="row-status progress">
                                    In Progress
                                </span>

                            </div>


                            <div className="complaint-row">

                                <div className="complaint-avatar plumbing">
                                    P
                                </div>

                                <div className="complaint-info">

                                    <strong>
                                        Water Leakage
                                    </strong>

                                    <small>
                                        Hostel • Plumbing
                                    </small>

                                </div>

                                <span className="row-status pending">
                                    Pending
                                </span>

                            </div>


                            <div className="complaint-row">

                                <div className="complaint-avatar network">
                                    N
                                </div>

                                <div className="complaint-info">

                                    <strong>
                                        Wi-Fi Issue
                                    </strong>

                                    <small>
                                        Library • Network
                                    </small>

                                </div>

                                <span className="row-status resolved">
                                    Resolved
                                </span>

                            </div>

                        </div>

                    </div>


                    {/* Floating notification */}

                    <div className="floating-card floating-notification">

                        <div className="floating-icon">
                            ✓
                        </div>

                        <div>

                            <strong>
                                Issue Resolved
                            </strong>

                            <small>
                                Classroom Fan • 2 min ago
                            </small>

                        </div>

                    </div>


                    {/* Floating AI card */}

                    <div className="floating-card floating-ai">

                        <div className="ai-icon">
                            AI
                        </div>

                        <div>

                            <strong>
                                Smart Categorization
                            </strong>

                            <small>
                                Electrical • 98% confidence
                            </small>

                        </div>

                    </div>

                </div>

            </section>


            {/* ==================================
                FEATURES
            ================================== */}

            <section
                id="features"
                className={`features-section reveal-section ${
                    visibleSections.features
                        ? "visible"
                        : ""
                }`}
                data-section="features"
                ref={(element) =>
                    sectionRefs.current.push(element)
                }
            >

                <div className="section-heading">

                    <span>
                        POWERFUL FEATURES
                    </span>

                    <h2>
                        Everything your campus
                        needs to stay connected.
                    </h2>

                    <p>
                        A complete complaint management
                        system designed for students,
                        administrators and maintenance teams.
                    </p>

                </div>


                <div className="features-grid">

                    <div className="feature-card">

                        <div className="feature-icon purple">
                            📢
                        </div>

                        <div className="feature-number">
                            01
                        </div>

                        <h3>
                            Easy Complaint Reporting
                        </h3>

                        <p>
                            Report campus problems with
                            detailed descriptions, locations
                            and photo evidence.
                        </p>

                        <span className="feature-link">
                            Report faster →
                        </span>

                    </div>


                    <div className="feature-card featured-card">

                        <div className="feature-icon blue">
                            🤖
                        </div>

                        <div className="feature-number">
                            02
                        </div>

                        <h3>
                            AI-Powered Categorization
                        </h3>

                        <p>
                            Automatically identify complaint
                            categories and priorities to speed
                            up the resolution process.
                        </p>

                        <span className="feature-link">
                            Work smarter →
                        </span>

                    </div>


                    <div className="feature-card">

                        <div className="feature-icon orange">
                            🛠️
                        </div>

                        <div className="feature-number">
                            03
                        </div>

                        <h3>
                            Smart Technician Assignment
                        </h3>

                        <p>
                            Assign issues to technicians based
                            on their specialization and
                            availability.
                        </p>

                        <span className="feature-link">
                            Assign correctly →
                        </span>

                    </div>


                    <div className="feature-card">

                        <div className="feature-icon green">
                            📊
                        </div>

                        <div className="feature-number">
                            04
                        </div>

                        <h3>
                            Analytics Dashboard
                        </h3>

                        <p>
                            Monitor complaints, resolution
                            rates and maintenance performance
                            from one dashboard.
                        </p>

                        <span className="feature-link">
                            Analyze data →
                        </span>

                    </div>


                    <div className="feature-card">

                        <div className="feature-icon red">
                            🔔
                        </div>

                        <div className="feature-number">
                            05
                        </div>

                        <h3>
                            Smart Notifications
                        </h3>

                        <p>
                            Students and technicians receive
                            updates as complaints move through
                            the workflow.
                        </p>

                        <span className="feature-link">
                            Stay updated →
                        </span>

                    </div>


                    <div className="feature-card">

                        <div className="feature-icon cyan">
                            🔐
                        </div>

                        <div className="feature-number">
                            06
                        </div>

                        <h3>
                            Role-Based Security
                        </h3>

                        <p>
                            Separate access for students,
                            administrators and technicians
                            keeps the system secure.
                        </p>

                        <span className="feature-link">
                            Stay secure →
                        </span>

                    </div>

                </div>

            </section>


            {/* ==================================
                HOW IT WORKS
            ================================== */}

            <section
                id="how-it-works"
                className={`how-section reveal-section ${
                    visibleSections["how-it-works"]
                        ? "visible"
                        : ""
                }`}
                data-section="how-it-works"
                ref={(element) =>
                    sectionRefs.current.push(element)
                }
            >

                <div className="section-heading">

                    <span>
                        SIMPLE WORKFLOW
                    </span>

                    <h2>
                        From problem to solution
                        in three steps.
                    </h2>

                    <p>
                        CampusFix makes campus maintenance
                        transparent and easy to track.
                    </p>

                </div>


                <div className="interactive-workflow">

                    <div className="workflow-tabs">

                        {steps.map((step, index) => (

                            <button
                                key={step.number}
                                className={
                                    activeStep === index
                                        ? "workflow-tab active"
                                        : "workflow-tab"
                                }
                                onClick={() =>
                                    setActiveStep(index)
                                }
                            >

                                <span>
                                    {step.number}
                                </span>

                                <div>

                                    <strong>
                                        {step.icon}{" "}
                                        {step.title}
                                    </strong>

                                    <small>
                                        Step {index + 1}
                                    </small>

                                </div>

                            </button>

                        ))}

                    </div>


                    <div className="workflow-content">

                        <div className="workflow-large-number">
                            {steps[activeStep].number}
                        </div>

                        <div className="workflow-main-icon">
                            {steps[activeStep].icon}
                        </div>

                        <div className="workflow-text">

                            <span>
                                STEP{" "}
                                {activeStep + 1}
                            </span>

                            <h3>
                                {steps[activeStep].title}
                            </h3>

                            <p>
                                {
                                    steps[activeStep]
                                        .description
                                }
                            </p>


                            <div className="workflow-details">

                                {steps[
                                    activeStep
                                ].details.map(
                                    (detail) => (

                                        <div
                                            key={detail}
                                        >

                                            <span>
                                                ✓
                                            </span>

                                            {detail}

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* ==================================
                COMPLAINT STATUS DEMO
            ================================== */}

            <section
                id="status"
                className={`status-section reveal-section ${
                    visibleSections.status
                        ? "visible"
                        : ""
                }`}
                data-section="status"
                ref={(element) =>
                    sectionRefs.current.push(element)
                }
            >

                <div className="section-heading">

                    <span>
                        COMPLAINT TRACKING
                    </span>

                    <h2>
                        See how a complaint moves
                        through CampusFix.
                    </h2>

                    <p>
                        Explore the complaint lifecycle
                        from submission to resolution.
                    </p>

                </div>


                <div className="status-demo">

                    <div className="status-selector">

                        <p>
                            Select a status
                        </p>

                        <div>

                            {Object.keys(statusData).map(
                                (item) => (

                                    <button
                                        key={item}
                                        className={
                                            status === item
                                                ? "status-button active"
                                                : "status-button"
                                        }
                                        onClick={() =>
                                            setStatus(item)
                                        }
                                    >

                                        {item ===
                                            "PENDING" &&
                                            "📩"}

                                        {item ===
                                            "ASSIGNED" &&
                                            "👨‍🔧"}

                                        {item ===
                                            "IN_PROGRESS" &&
                                            "🔧"}

                                        {item ===
                                            "RESOLVED" &&
                                            "✓"}

                                        <span>
                                            {item.replace(
                                                "_",
                                                " "
                                            )}
                                        </span>

                                    </button>

                                )
                            )}

                        </div>

                    </div>


                    <div className="status-result">

                        <div
                            className={`status-big-icon ${statusData[status].color}`}
                        >
                            {statusData[status].icon}
                        </div>


                        <div className="status-result-content">

                            <span>
                                COMPLAINT #CF-1024
                            </span>

                            <h3>
                                {
                                    statusData[
                                        status
                                    ].label
                                }
                            </h3>

                            <p>
                                {
                                    statusData[
                                        status
                                    ].description
                                }
                            </p>

                        </div>

                    </div>


                    <div className="status-progress">

                        <div className="status-line"></div>

                        {[
                            "PENDING",
                            "ASSIGNED",
                            "IN_PROGRESS",
                            "RESOLVED"
                        ].map((item, index) => {

                            const current =
                                [
                                    "PENDING",
                                    "ASSIGNED",
                                    "IN_PROGRESS",
                                    "RESOLVED"
                                ].indexOf(status);

                            return (

                                <div
                                    className={
                                        index <= current
                                            ? "progress-step completed"
                                            : "progress-step"
                                    }
                                    key={item}
                                >

                                    <div className="progress-dot">

                                        {index <= current
                                            ? "✓"
                                            : index + 1}

                                    </div>

                                    <span>
                                        {
                                            item ===
                                            "IN_PROGRESS"
                                                ? "In Progress"
                                                : item
                                                  .charAt(0)
                                                  .toUpperCase() +
                                                  item
                                                    .slice(1)
                                                    .toLowerCase()
                                        }
                                    </span>

                                </div>

                            );

                        })}

                    </div>

                </div>

            </section>


            {/* ==================================
                CTA
            ================================== */}

            <section className="landing-cta">

                <div className="cta-content">

                    <span>
                        READY TO MAKE A DIFFERENCE?
                    </span>

                    <h2>
                        Your campus.
                        <br />
                        Your voice.
                        <br />
                        <em>One smarter platform.</em>
                    </h2>

                    <p>
                        Start reporting campus issues
                        and help create a cleaner,
                        safer and better campus.
                    </p>

                </div>


                <div className="cta-action">

                    <button
                        onClick={onSignup}
                    >
                        Get Started
                        <span>→</span>
                    </button>

                    <small>
                        Free for students
                    </small>

                </div>

            </section>


            {/* ==================================
                FOOTER
            ================================== */}

            <footer className="landing-footer">

                <div className="footer-brand">

                    <div className="landing-logo">

                        <div className="logo-icon">
                            CF
                        </div>

                        <span>
                            Campus<span>Fix</span>
                        </span>

                    </div>

                    <p>
                        Smart complaint management
                        for modern campuses.
                    </p>

                </div>


                <div className="footer-column">

                    <h4>
                        Platform
                    </h4>

                    <button
                        onClick={() =>
                            scrollToSection("features")
                        }
                    >
                        Features
                    </button>

                    <button
                        onClick={() =>
                            scrollToSection(
                                "how-it-works"
                            )
                        }
                    >
                        How It Works
                    </button>

                    <button
                        onClick={() =>
                            scrollToSection("status")
                        }
                    >
                        Track Complaint
                    </button>

                </div>


                <div className="footer-column">

                    <h4>
                        Account
                    </h4>

                    <button onClick={onLogin}>
                        Login
                    </button>

                    <button onClick={onSignup}>
                        Create Account
                    </button>

                </div>


                <div className="footer-column">

                    <h4>
                        Roles
                    </h4>

                    <span>
                        Students
                    </span>

                    <span>
                        Administrators
                    </span>

                    <span>
                        Technicians
                    </span>

                </div>


                <div className="footer-bottom">

                    <span>
                        © 2026 CampusFix Vikanth Reeddy. All rights reserved.
                    </span>

                    <span>
                        Smart Campus Complaint
                        Management System
                    </span>

                </div>

            </footer>

        </div>
    );
}

export default Landing;