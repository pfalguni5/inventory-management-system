import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/auth.css";
import { registerUser } from "../../services/authService";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().split(" ").length < 2) {
      newErrors.fullName = "Please enter your full name (first and last)";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and numbers";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerUser({
        
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        agreeToTerms: formData.agreeToTerms,
        
      });
      //console.log("Full response: ", res);
      //console.log("Token: ", res);

      localStorage.setItem("token", res);
      localStorage.setItem("userEmail", formData.email);
      localStorage.setItem("userName", formData.fullName);

      // store token
      //const token = res.data;

      /*if (token) {
        localStorage.setItem("token", res);
      } else {
        console.error("Token is undefined!");
      }*/

      // go directly inside app
      navigate("/app");

    } catch (error) {
      setErrors({ submit: "Registration failed." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box register-box">
        <div className="login-header">
          <h1>Create Account</h1>
          <p>Join Billing System today</p>
        </div>

        {errors.submit && (
          <div className="error-message">{errors.submit}</div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleInputChange}
              className={errors.fullName ? "input-error" : ""}
            />
            {errors.fullName && (
              <span className="error-text">{errors.fullName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder="Enter your 10-digit phone number"
              value={formData.phone}
              onChange={handleInputChange}
              className={errors.phone ? "input-error" : ""}
              maxLength="10"
            />
            {errors.phone && (
              <span className="error-text">{errors.phone}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter a strong password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? "input-error" : ""}
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
            <small className="helper-text">
              At least 8 characters with uppercase, lowercase, and numbers
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={errors.confirmPassword ? "input-error" : ""}
            />
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="form-group checkbox-group" style={{ marginTop: "18px", marginBottom: "32px" }}>
            <label className="checkbox-label" style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", lineHeight: "1.6" }}>
              <input
                id="agreeToTerms"
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                style={{ width: "14px", height: "14px", margin: 0, flexShrink: 0, cursor: "pointer", verticalAlign: "middle" }}
              />
              <span style={{ lineHeight: "1.6", verticalAlign: "middle" }}>
                I AGREE TO THE{" "}
                <button type="button" className="link-button">
                  Terms and Conditions
                </button>{" "}
                AND{" "}
                <button type="button" className="link-button">
                  Privacy Policy
                </button>
                *
              </span>
            </label>
            {errors.agreeToTerms && (
              <span className="error-text">{errors.agreeToTerms}</span>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-login"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        <div className="signup-link">
          Already have an account?{" "}
          <button
            type="button"
            className="link-button"
            onClick={() => navigate("/login")}
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
