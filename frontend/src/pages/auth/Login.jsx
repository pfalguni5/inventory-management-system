import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/auth.css";
import { loginUser } from "../../services/authService";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
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

    if (!formData.email) {
      newErrors.email = "Phone number or email is required";
    } else {
      // Check if it's a valid email
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      // Check if it's a valid phone number (10 digits)
      const isValidPhone = /^[0-9]{10}$/.test(formData.email.replace(/\D/g, ""));
      
      if (!isValidEmail && !isValidPhone) {
        newErrors.email = "Please enter a valid email or 10-digit phone number";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Step 1: Login and get token
      const token = await loginUser({
        emailOrPhone: formData.email,
        password: formData.password,
      });

      localStorage.setItem("token", token);

      // Step 2: Fetch businesses (check if user has any businesses)
      const businessRes = await fetch("http://localhost:8080/api/business/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Step 3: Handle response safely
      let businesses = [];

      if (businessRes.ok) {
        businesses = await businessRes.json();
      }

      // Step 4: Store user info
      localStorage.setItem("userEmail", formData.email);

      const nameFromEmail = formData.email.includes("@")
        ? formData.email.split("@")[0]
        : formData.email;

      localStorage.setItem("userName", nameFromEmail);

      // ✅ Step 5: Routing logic (VERY IMPORTANT)
      if (businesses && businesses.length > 0) {
        localStorage.setItem("businessId", businesses[0].id);
        navigate("/app"); // user already has business
      } else {
        localStorage.removeItem("businessId");
        navigate("/business-setup"); // new user
      }

    } catch (error) {
      console.error("Login error:", error);

      //dont always say invalid credentials
      if(!localStorage.getItem("token")){
        setErrors({ submit: "Invalid credentials" });
      } else {
        //login succeeded but business missing
        navigate("/business-setup");
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Billing System</h1>
          <p>Sign in to your account</p>
        </div>

        {errors.submit && (
          <div className="error-message">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Phone Number or Email ID *</label>
            <input
              id="email"
              type="text"
              name="email"
              placeholder="Enter your phone number or email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? "input-error" : ""}
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
            <div className="forgot-password-link">
              <button
                type="button"
                className="link-button"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-login"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>

        <div className="signup-link">
          Don't have an account?{" "}
          <button
            type="button"
            className="link-button"
            onClick={() => navigate("/register")}
          >
            Sign up here
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
