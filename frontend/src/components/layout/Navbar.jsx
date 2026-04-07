import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppIcon from "../common/AppIcon";
import api from "../../services/api";

function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [ businesses, setBusinesses ] = useState([]);
  
  const notificationDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

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

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await api.get("/business/my");
        const data = res.data;

        setBusinesses(data);

        const savedBusinessId = localStorage.getItem("businessId");

        if (savedBusinessId) {
          setSelectedBusiness(savedBusinessId);

          // 🔥 notify whole app
          window.dispatchEvent(new Event("businessChanged"));

        } else if (data.length > 0) {
          const defaultId = data[0].id;

          setSelectedBusiness(defaultId);
          localStorage.setItem("businessId", defaultId);

          // 🔥 notify whole app
          window.dispatchEvent(new Event("businessChanged"));
        }

      } catch (error) {
        console.error("Error fetching businesses:", error);
      }
    };

    fetchBusinesses();

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

    return () => {
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

              // 🔥 SAVE SELECTED BUSINESS
              localStorage.setItem("businessId", businessId);

              // 🔥 Instead of reload:
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
            {businesses.find(b => b.id == selectedBusiness)?.name || ""}
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
              <div className="dropdown-header">Notifications</div>
              <div className="notification-items">
                <div className="notification-item">
                  <span className="notification-icon"><AppIcon name="warning" /></span>
                  <p>Low stock: Item A</p>
                </div>
                <div className="notification-item">
                  <span className="notification-icon"><AppIcon name="subscription" /></span>
                  <p>Subscription expires in 5 days</p>
                </div>
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
            <div className="profile-avatar-navbar">JD</div>
          </button>

          {showProfile && (
            <div className="dropdown-menu profile-menu">
              <button
                type="button"
                className="profile-header profile-header-clickable"
                onClick={handleProfileHeaderClick}
              >
                <div className="profile-avatar-dropdown">JD</div>
                <div className="profile-info">
                  <p className="profile-email">john.d@example.com</p>
                  <p className="profile-role">Owner</p>
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
