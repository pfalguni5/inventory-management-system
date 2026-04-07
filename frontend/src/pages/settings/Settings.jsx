import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppIcon from "../../components/common/AppIcon";
import "../../styles/settings.css";
import api from "../../services/api";

function Settings() {
  const navigate = useNavigate();
  const [businessDetails, setBusinessDetails] = useState({
    businessName: "ABC Trading Company",
    gstin: "29ABCDE1234F1Z5",
    address: "123 Business Street",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try{
      const res = await api.get(`/settings`);

      const data = res.data;

      //business details
      setBusinessDetails({
        businessName: data.businessName,
        gstin: data.gstin,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
      });

      setGstEnabled(data.gstEnabled);
      setStockEnabled(data.stockEnabled);

      //subscription
      setSubscription({
        plan: data.plan,
        validFrom: data.validFrom,
        validTill: data.validTill,
        daysRemaining: data.daysRemaining
      });
    } catch (err) {
      console.error("Error fetching settings", err);
    }
  };

  const [gstEnabled, setGstEnabled] = useState(true);
  const [stockEnabled, setStockEnabled] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [subscription, setSubscription] = useState({
    plan: "",
    validFrom: "",
    validTill: "",
    daysRemaining: 0
  });
  

  const handleBusinessDetailsChange = (field, value) => {
    setBusinessDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      await api.put(`/settings`, {
        businessName: businessDetails.businessName,
        gstin: businessDetails.gstin,
        address: businessDetails.address,
        city: businessDetails.city,
        state: businessDetails.state,
        pincode: businessDetails.pincode,
        gstEnabled,
        stockEnabled
      });

      setEditMode(false);
      alert("Settings saved successfully!");

    } catch (err) {
      console.error("Error saving settings", err);
      alert("Error saving settings. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1><AppIcon name="settings" /> Settings</h1>
        <p>Manage your business settings and preferences</p>
      </div>

      {/* BUSINESS DETAILS */}
      <div className="settings-card">
        <div className="settings-card-header">
          <h2><AppIcon name="business" /> Business Details</h2>
          <button 
            className={`btn-edit ${editMode ? 'cancel' : ''}`}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? <><AppIcon name="close" /> Cancel</> : <><AppIcon name="edit" /> Edit</>}
          </button>
        </div>
        <div className="settings-card-content">
          <div className="form-grid">
            <div className="form-group">
              <label>Business Name</label>
              <input 
                type="text" 
                value={businessDetails.businessName}
                onChange={(e) => handleBusinessDetailsChange('businessName', e.target.value)}
                disabled={!editMode}
              />
            </div>

            <div className="form-group">
              <label>GSTIN</label>
              <input 
                type="text" 
                value={businessDetails.gstin}
                onChange={(e) => handleBusinessDetailsChange('gstin', e.target.value)}
                disabled={!editMode}
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input 
                type="text" 
                value={businessDetails.address}
                onChange={(e) => handleBusinessDetailsChange('address', e.target.value)}
                disabled={!editMode}
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input 
                type="text" 
                value={businessDetails.city}
                onChange={(e) => handleBusinessDetailsChange('city', e.target.value)}
                disabled={!editMode}
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input 
                type="text" 
                value={businessDetails.state}
                onChange={(e) => handleBusinessDetailsChange('state', e.target.value)}
                disabled={!editMode}
              />
            </div>

            <div className="form-group">
              <label>Pincode</label>
              <input 
                type="text" 
                value={businessDetails.pincode}
                onChange={(e) => handleBusinessDetailsChange('pincode', e.target.value)}
                disabled={!editMode}
              />
            </div>
          </div>
          {editMode && (
            <button className="btn-save" onClick={handleSave}><AppIcon name="save" /> Save Changes</button>
          )}
        </div>
      </div>

      {/* GST TOGGLE */}
      <div className="settings-card">
        <div className="settings-card-header">
          <h2><AppIcon name="clipboard" /> GST Settings</h2>
        </div>
        <div className="settings-card-content">
          <div className="toggle-item">
            <div className="toggle-info">
              <p className="toggle-label">Enable GST Compliance</p>
              <p className="toggle-description">Enable GST features including GSTR-1, GSTR-3B, and E-Way Bill generation</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={gstEnabled}
                onChange={(e) => setGstEnabled(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* STOCK TOGGLE */}
      <div className="settings-card">
        <div className="settings-card-header">
          <h2><AppIcon name="stock" /> Stock Management</h2>
        </div>
        <div className="settings-card-content">
          <div className="toggle-item">
            <div className="toggle-info">
              <p className="toggle-label">Enable Stock Tracking</p>
              <p className="toggle-description">Enable inventory management, stock adjustments, and low stock alerts</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={stockEnabled}
                onChange={(e) => setStockEnabled(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* SUBSCRIPTION */}
      <div className="settings-card subscription-card">
        <div className="settings-card-header">
          <div>
            <h2><AppIcon name="subscription" /> Subscription Information</h2>
          </div>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/app/pricing")}
          >
            Upgrade plan
          </button>
        </div>
        <div className="settings-card-content">
          <div className="subscription-info">
            <div className="subscription-item">
              <span className="sub-label">Current Plan</span>
              <span className="sub-value">
                {subscription.plan || "Free Plan"}
              </span>
            </div>
            <div className="subscription-item">
              <span className="sub-label">Valid From</span>
              <span className="sub-value">
                {subscription.validFrom 
                  ? new Date(subscription.validFrom).toLocaleDateString() 
                  : "-"}
              </span>
            </div>
            <div className="subscription-item">
              <span className="sub-label">Valid Till</span>
              <span className="sub-value">
                {subscription.validTill 
                  ? new Date(subscription.validTill).toLocaleDateString() 
                  : "-"}
              </span>
            </div>
            <div className="subscription-item">
              <span className="sub-label">Days Remaining</span>
              <span className="sub-value days-remaining">
                {subscription.daysRemaining ?? 0} days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SIGN OUT */}
      <div className="settings-card signout-card">
        <div className="settings-card-header signout-header">
          <div>
            <h2><AppIcon name="logout" /> Sign out</h2>
            <p className="signout-description">End your current session. You'll need to login again to access your business.</p>
          </div>
        </div>
        <div className="settings-card-content signout-content">
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
