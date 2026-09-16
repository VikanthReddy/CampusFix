import { useEffect, useState } from "react";
import api from "../services/api";

function NotificationBell() {

    const [user, setUser] =
        useState(null);

    const [notifications, setNotifications] =
        useState([]);

    const [unreadCount, setUnreadCount] =
        useState(0);

    const [open, setOpen] =
        useState(false);

    const [loading, setLoading] =
        useState(false);


    // ==========================================
    // LOAD NOTIFICATIONS
    // ==========================================

    const loadNotifications = async () => {

        try {

            const [
                notificationsResponse,
                unreadResponse
            ] = await Promise.all([

                api.get("/notifications"),

                api.get("/notifications/unread")

            ]);


            const allNotifications =
                Array.isArray(
                    notificationsResponse.data
                )
                    ? notificationsResponse.data
                    : [];


            const unreadNotifications =
                Array.isArray(
                    unreadResponse.data
                )
                    ? unreadResponse.data
                    : [];


            setNotifications(
                allNotifications
            );


            setUnreadCount(
                unreadNotifications.length
            );

        } catch (error) {

            console.error(
                "Error loading notifications:",
                error
            );

        }
    };


    // ==========================================
    // INITIAL LOAD + AUTO REFRESH
    // ==========================================

    useEffect(() => {

        const savedUser =
            localStorage.getItem("user");


        if (!savedUser) {
            return;
        }


        try {

            const loggedUser =
                JSON.parse(savedUser);

            setUser(loggedUser);

            loadNotifications();


            // Refresh every 30 seconds

            const interval =
                setInterval(
                    loadNotifications,
                    30000
                );


            return () =>
                clearInterval(interval);

        } catch (error) {

            console.error(
                "Invalid user data:",
                error
            );

        }

    }, []);


    // ==========================================
    // OPEN / CLOSE
    // ==========================================

    const handleOpen = () => {

        setOpen(
            previous => !previous
        );

        if (!open) {
            loadNotifications();
        }
    };


    // ==========================================
    // MARK ONE AS READ
    // ==========================================

    const markAsRead = async (
        notification
    ) => {

        if (notification.read) {
            return;
        }


        try {

            await api.put(
                `/notifications/${notification.id}/read`
            );


            setNotifications(
                previous =>
                    previous.map(
                        item =>
                            item.id ===
                            notification.id
                                ? {
                                    ...item,
                                    read: true
                                }
                                : item
                    )
            );


            setUnreadCount(
                previous =>
                    Math.max(
                        previous - 1,
                        0
                    )
            );

        } catch (error) {

            console.error(
                "Error marking notification as read:",
                error
            );

        }
    };


    // ==========================================
    // MARK ALL AS READ
    // ==========================================

    const markAllAsRead = async () => {

        const unread =
            notifications.filter(
                notification =>
                    !notification.read
            );


        if (
            unread.length === 0
        ) {
            return;
        }


        setLoading(true);


        try {

            await Promise.all(

                unread.map(
                    notification =>
                        api.put(
                            `/notifications/${notification.id}/read`
                        )
                )

            );


            setNotifications(
                previous =>
                    previous.map(
                        notification => ({
                            ...notification,
                            read: true
                        })
                    )
            );


            setUnreadCount(0);

        } catch (error) {

            console.error(
                "Error marking all notifications as read:",
                error
            );

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // FORMAT TIME
    // ==========================================

    const formatTime = (
        createdAt
    ) => {

        if (!createdAt) {
            return "";
        }


        const date =
            new Date(createdAt);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "";
        }


        return date.toLocaleString();
    };


    // ==========================================
    // NOT LOGGED IN
    // ==========================================

    if (!user) {
        return null;
    }


    // ==========================================
    // UI
    // ==========================================

    return (

        <div
            style={{
                position: "relative",
                display: "inline-block"
            }}
        >


            {/* ==================================
                NOTIFICATION BUTTON
            ================================== */}

            <button
                type="button"
                onClick={handleOpen}
                aria-label="Notifications"
                style={{
                    position: "relative",
                    width: "42px",
                    height: "42px",
                    border: "1px solid #d9e2ef",
                    borderRadius: "50%",
                    background: "#ffffff",
                    cursor: "pointer",
                    fontSize: "19px"
                }}
            >

                🔔


                {unreadCount > 0 && (

                    <span
                        style={{
                            position: "absolute",
                            top: "-3px",
                            right: "-3px",
                            minWidth: "19px",
                            height: "19px",
                            padding: "0 4px",
                            borderRadius: "20px",
                            background: "#245A9B",
                            color: "#ffffff",
                            fontSize: "11px",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid #ffffff"
                        }}
                    >
                        {
                            unreadCount > 99
                                ? "99+"
                                : unreadCount
                        }
                    </span>

                )}

            </button>


            {/* ==================================
                NOTIFICATION PANEL
            ================================== */}

            {open && (

                <div
                    style={{
                        position: "absolute",
                        top: "50px",
                        right: "0",
                        width: "350px",
                        maxWidth:
                            "calc(100vw - 30px)",
                        background: "#ffffff",
                        border:
                            "1px solid #d9e2ef",
                        borderRadius: "12px",
                        boxShadow:
                            "0 12px 30px rgba(30, 60, 90, 0.15)",
                        zIndex: 1000,
                        overflow: "hidden"
                    }}
                >


                    {/* HEADER */}

                    <div
                        style={{
                            padding:
                                "14px 16px",
                            display: "flex",
                            justifyContent:
                                "space-between",
                            alignItems: "center",
                            borderBottom:
                                "1px solid #e8eef5"
                        }}
                    >

                        <strong
                            style={{
                                color: "#245A9B",
                                fontSize: "15px"
                            }}
                        >
                            Notifications
                        </strong>


                        <button
                            type="button"
                            onClick={
                                markAllAsRead
                            }
                            disabled={
                                loading ||
                                unreadCount === 0
                            }
                            style={{
                                border: "none",
                                background:
                                    "transparent",
                                color:
                                    unreadCount > 0
                                        ? "#3476C5"
                                        : "#9aa8b8",
                                cursor:
                                    unreadCount > 0
                                        ? "pointer"
                                        : "default",
                                fontSize: "12px",
                                fontWeight: "600"
                            }}
                        >
                            Mark all read
                        </button>

                    </div>


                    {/* NOTIFICATION LIST */}

                    <div
                        style={{
                            maxHeight: "360px",
                            overflowY: "auto"
                        }}
                    >

                        {notifications.length === 0 ? (

                            <div
                                style={{
                                    padding:
                                        "30px 18px",
                                    textAlign:
                                        "center",
                                    color:
                                        "#718096",
                                    fontSize:
                                        "13px"
                                }}
                            >

                                <div
                                    style={{
                                        fontSize: "30px",
                                        marginBottom: "8px"
                                    }}
                                >
                                    🔔
                                </div>

                                No notifications yet.

                            </div>

                        ) : (

                            notifications.map(
                                notification => (

                                    <button
                                        type="button"
                                        key={
                                            notification.id
                                        }
                                        onClick={() =>
                                            markAsRead(
                                                notification
                                            )
                                        }
                                        style={{
                                            width:
                                                "100%",
                                            textAlign:
                                                "left",
                                            border: "none",
                                            borderBottom:
                                                "1px solid #eef2f7",
                                            background:
                                                notification.read
                                                    ? "#ffffff"
                                                    : "#f0f7ff",
                                            padding:
                                                "13px 16px",
                                            cursor:
                                                notification.read
                                                    ? "default"
                                                    : "pointer"
                                        }}
                                    >

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                gap:
                                                    "9px"
                                            }}
                                        >

                                            <span
                                                style={{
                                                    fontSize:
                                                        "15px"
                                                }}
                                            >
                                                {
                                                    notification.read
                                                        ? "✓"
                                                        : "🔔"
                                                }
                                            </span>


                                            <div
                                                style={{
                                                    flex:
                                                        "1"
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        color:
                                                            "#26384a",
                                                        fontSize:
                                                            "13px",
                                                        lineHeight:
                                                            "1.4",
                                                        fontWeight:
                                                            notification.read
                                                                ? "500"
                                                                : "700"
                                                    }}
                                                >

                                                    {
                                                        notification.message
                                                    }

                                                </div>


                                                {notification.type && (

                                                    <span
                                                        style={{
                                                            display:
                                                                "inline-block",
                                                            marginTop:
                                                                "5px",
                                                            padding:
                                                                "2px 7px",
                                                            borderRadius:
                                                                "10px",
                                                            background:
                                                                "#e8f2ff",
                                                            color:
                                                                "#245A9B",
                                                            fontSize:
                                                                "10px",
                                                            fontWeight:
                                                                "600"
                                                        }}
                                                    >
                                                        {
                                                            notification.type
                                                        }
                                                    </span>

                                                )}


                                                <small
                                                    style={{
                                                        display:
                                                            "block",
                                                        marginTop:
                                                            "5px",
                                                        color:
                                                            "#8a98a8",
                                                        fontSize:
                                                            "11px"
                                                    }}
                                                >

                                                    {
                                                        formatTime(
                                                            notification.createdAt
                                                        )
                                                    }

                                                </small>

                                            </div>

                                        </div>

                                    </button>

                                )
                            )

                        )}

                    </div>

                </div>

            )}

        </div>
    );
}

export default NotificationBell;