import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Profile.css";
import {getProfile, updateProfile, changePassword} from "../../services/profileService";
import AppIcon from "../../components/common/AppIcon";

function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.d@ex.com",
    phone: "9876543210",
    role: "Owner",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  //const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        alert("Failed to load profile");
      }
    };

    fetchProfile();
  }, []);
    

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    try {
      const updated = await updateProfile(profile);
      setProfile(updated);
      setIsEditing(false);
      alert("Profile updated successfully");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Error updating profile");
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();

    try {
      await changePassword(passwords);
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      alert("Password updated successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Error changing password");
    }
  };

  const handleAddBusiness = () => {
    navigate("/business-setup");
  };

  return (
    <div className="page-container">
      <h1 className="page-title">User Profile</h1>

      <div className="profile-grid">
        <div className="card profile-card">
          <div className="card-header">
            <h2 className="card-title">Personal Information</h2>
            {!isEditing && (
              <button
                type="button"
                className="btn-edit"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            )}
          </div>
          <form onSubmit={handleSaveProfile} className="card-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={profile.firstName}
                  onChange={handleProfileChange}
                  placeholder="Enter first name"
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={profile.lastName}
                  onChange={handleProfileChange}
                  placeholder="Enter last name"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  placeholder="Enter phone number"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={profile.role}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                >
                  <option value="Owner">Owner</option>
                  <option value="Manager">Manager</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>
            </div>

            {isEditing && (
              <div className="card-actions">
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="card profile-card">
          <h2 className="card-title">Change Password</h2>
          <form onSubmit={handleSavePassword} className="card-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <div className="password-input-wrapper">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPassword.current ? "text" : "password"}
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => togglePasswordVisibility("current")}
                  title={showPassword.current ? "Hide password" : "Show password"}
                >
                  <AppIcon name={showPassword.current ? "eyeOff" : "eye"} />
                </button>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword.new ? "text" : "password"}
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => togglePasswordVisibility("new")}
                    title={showPassword.new ? "Hide password" : "Show password"}
                  >
                    <AppIcon name={showPassword.new ? "eyeOff" : "eye"} />
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword.confirm ? "text" : "password"}
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Re-enter new password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => togglePasswordVisibility("confirm")}
                    title={showPassword.confirm ? "Hide password" : "Show password"}
                  >
                    <AppIcon name={showPassword.confirm ? "eyeOff" : "eye"} />
                  </button>
                </div>
              </div>
            </div>

            <div className="form-footer">
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
              <button
                type="button"
                className="link-button forgot-password-link"
              >
                Forgot password?
              </button>
            </div>
          </form>
        </div>

        <div className="card profile-card">
          <h2 className="card-title">Add Another Business</h2>
          <p className="card-description">
            Link another business to this account to manage multiple entities
            from one dashboard (demo only).
          </p>
          <div className="card-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={handleAddBusiness}
            >
              Add Business
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
