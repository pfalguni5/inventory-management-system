import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppIcon from "../common/AppIcon";
import api from "../../services/api";
import { getProfile } from "../../services/profileService";
import notificationService from "../../services/notificationService";

function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  });

  const [notifications, setNotifications] = useState([]);
  
  const notificationDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const handleDismissNotification = async (notificationId) => {
    const success = await notificationService.dismissNotification(notificationId);
    if (success) {
      setNotifications(notifications.filter(n => n.id !== notificationId));
    }
  };

  const handleProfileHeaderClick = () => {
    navigate("/app/profile");
    setShowProfile(false);
  };

  const handleSettingsClick = () => {
    navigate("/app/settings");
    setShowProfile(false);
  };

  const handleLogoutClick = () => {
    navigate("/");
    setShowProfile(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      // Fetch businesses
      try {
        const res = await api.get("/business/my");
        const data = res.data;

        setBusinesses(data);

        const savedBusinessId = localStorage.getItem("businessId");

        if (savedBusinessId) {
          setSelectedBusiness(savedBusinessId);
          window.dispatchEvent(new Event("businessChanged"));
        } else if (data.length > 0) {
          const defaultId = data[0].id;
          setSelectedBusiness(defaultId);
          localStorage.setItem("businessId", defaultId);
          window.dispatchEvent(new Event("businessChanged"));
        }
      } catch (error) {
        console.error("Error fetching businesses:", error);
      }

      // Fetch user profile
      try {
        const userData = await getProfile();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }

      // Fetch notifications
      try {
        const notifData = await notificationService.getNotifications();
        setNotifications(notifData);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
      }
    };

    fetchData();

    // Refresh notifications every 30 seconds
    const notificationInterval = setInterval(async () => {
      try {
        const notifData = await notificationService.getNotifications();
        setNotifications(notifData);
      } catch (error) {
        console.error("Error refreshing notifications:", error);
      }
    }, 30000);

    // Event listeners for closing dropdowns
    const handleClickOutside = (event) => {
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setShowNotifications(false);
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    // Cleanup function
    return () => {
      clearInterval(notificationInterval);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-btn" onClick={toggleSidebar} title="Toggle Sidebar">
          <span className="menu-icon"><AppIcon name="menu" /></span>
        </button>
        <div className="navbar-brand">
          <div className="brand-icon"><AppIcon name="chart" /></div>
          <div>
            <h1>Inventory Hub</h1>
            <span className="brand-subtitle">Management System</span>
          </div>
        </div>
      </div>

      <div className="navbar-center">
        <div className="business-selector" title="Switch business">
          <select
            value={selectedBusiness}
            onChange={(e) => {
              const businessId = e.target.value;
              setSelectedBusiness(businessId);

              // SAVE SELECTED BUSINESS
              localStorage.setItem("businessId", businessId);

              // Instead of reload:
              window.dispatchEvent(new Event("businessChanged"));
            }}
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <AppIcon name="business" size="sm" color="rgba(255, 255, 255, 0.85)" />
          <span className="selector-label">Business</span>
          <span className="selector-name">
            {businesses.find(b => String(b.id) === selectedBusiness)?.name || ""}
            </span>
          <span className="biz-chevron">
            <AppIcon name="chevronDown" color="rgba(255, 255, 255, 0.88)" className="selector-caret" />
          </span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Notifications */}
        <div className="navbar-item dropdown" ref={notificationDropdownRef}>
          <button 
            className="navbar-icon-btn" 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            title="Notifications"
          >
            <span className="icon-badge"><AppIcon name="notification" /></span>
            <span className="notification-dot"></span>
          </button>

          {showNotifications && (
            <div className="dropdown-menu notification-menu">
              <div className="dropdown-header">
                Notifications {notifications.filter(n => !n.isRead).length > 0 && `(${notifications.filter(n => !n.isRead).length})`}
              </div>
              <div className="notification-items">
                {notifications && notifications.filter(n => !n.isRead).length > 0 ? (
                  notifications.filter(n => !n.isRead).map((notif) => (
                    <div key={notif.id} className={`notification-item notification-${notif.type.toLowerCase()}`}>
                      <span className="notification-icon">
                        <AppIcon name={notif.icon || "info"} />
                      </span>
                      <div className="notification-content">
                        <p className="notification-title">{notif.title}</p>
                        <p className="notification-message">{notif.message}</p>
                        <small className="notification-time">
                          {notif.createdAt ? new Date(notif.createdAt).toLocaleString(): "Just now"}
                        </small>
                      </div>
                      <button
                        className="notification-dismiss-btn"
                        onClick={() => handleDismissNotification(notif.id)}
                        title="Dismiss"
                      >
                        <AppIcon name="close" size="sm" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="notification-item empty">
                    <p>No notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="navbar-divider"></div>

        {/* User Profile */}
        <div className="navbar-item dropdown" ref={profileDropdownRef}>
          <button 
            className="navbar-icon-btn profile-btn" 
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            title="Profile Menu"
          >
            <div className="profile-avatar-navbar">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </div>
          </button>

          {showProfile && (
            <div className="dropdown-menu profile-menu">
              <button
                type="button"
                className="profile-header profile-header-clickable"
                onClick={handleProfileHeaderClick}
              >
                <div className="profile-avatar-dropdown">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </div>
                <div className="profile-info">
                  <p className="profile-email">{user.email || "No email"}</p>
                  <p className="profile-role">{user.role || "Owner"}</p>
                </div>
              </button>
              
              <div className="profile-menu-divider"></div>
              
              <div className="profile-actions">
                <button 
                  className="profile-menu-item" 
                  onClick={handleSettingsClick}
                >
                  <span className="menu-item-icon"><AppIcon name="settings" /></span>
                  <span className="menu-item-label">Settings</span>
                </button>
                
                <button 
                  className="profile-menu-item logout-item" 
                  onClick={handleLogoutClick}
                >
                  <span className="menu-item-icon"><AppIcon name="logout" /></span>
                  <span className="menu-item-label">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
