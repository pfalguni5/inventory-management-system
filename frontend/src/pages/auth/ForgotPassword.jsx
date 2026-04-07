import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/auth.css";
import { sendOtp, verifyOtp, resetPassword } from "../../services/authService";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (step !== 2) return;

    setTimer(60);
    setIsResendDisabled(true);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setIsResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "otp") setOtp(value);
    if (name === "newPassword") setNewPassword(value);
    if (name === "confirmPassword") setConfirmPassword(value);

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateEmailStep = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else {
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isValidEmail) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtpStep = () => {
    const newErrors = {};

    if (!otp) {
      newErrors.otp = "OTP is required";
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = "OTP must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordStep = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = false;

    if (step === 1) {
      isValid = validateEmailStep();
      if (!isValid) return;

      setIsLoading(true);
      try {
        await sendOtp({ email });
        setStep(2);
        setErrors({ submit: "" });
      } catch (error) {
        setErrors({ submit: getErrorMessage(error, "email") });
      } finally {
        setIsLoading(false);
      }
    } else if (step === 2) {
      isValid = validateOtpStep();
      if (!isValid) return;

      setIsLoading(true);
      try {
        await verifyOtp({ email, otp });
        setStep(3);
        setErrors({ submit: "" });
      } catch (error) {
        setErrors({ submit: getErrorMessage(error, "otp") });
      } finally {
        setIsLoading(false);
      }
    } else if (step === 3) {
      isValid = validatePasswordStep();
      if (!isValid) return;

      setIsLoading(true);
      try {
        await resetPassword({ email, otp, newPassword });
        setIsSubmitted(true);
        // Clear sensitive data
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (error) {
        setErrors({ submit: getErrorMessage(error, "password") });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  const handleResendOtp = async () => {
    setIsResendDisabled(true);
    try {
      await sendOtp({ email });
      setTimer(60);
      setErrors({ submit: "" });
    } catch (error) {
      setErrors({ submit: getErrorMessage(error, "email") });
      setIsResendDisabled(false);
    }
  };

  const getErrorMessage = (error, stepType) => {
    // Check if error has response with status code
    if (error.response?.status === 400) {
      if (stepType === "otp") {
        return "Wrong OTP. Please check and try again.";
      }
      return error.message || "Invalid request. Please try again.";
    }
    
    // Use custom error message from API if available
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    // Use error message if available
    if (error.message && !error.message.includes("status code")) {
      return error.message;
    }
    
    // Return step-specific fallback
    if (stepType === "otp") {
      return "Invalid or expired OTP. Please try again.";
    }
    if (stepType === "email") {
      return "Failed to send OTP. Please try again.";
    }
    if (stepType === "password") {
      return "Failed to reset password. Please try again.";
    }
    
    return "Something went wrong. Please try again.";
  };

  const maskEmail = (emailAddress) => {
    if (!emailAddress) return "";
    const [localPart, domain] = emailAddress.split("@");
    if (localPart.length <= 3) {
      return `${localPart}****@${domain}`;
    }
    const masked = localPart.substring(0, 3) + "****";
    return `${masked}@${domain}`;
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Reset Password</h1>
          <p>
            {step === 1 && "Enter your email to receive an OTP"}
            {step === 2 && "Enter the OTP sent to your email"}
            {step === 3 && "Create your new password"}
          </p>
        </div>

        {isSubmitted && (
          <div className="success-message">
            <p>Password reset successful. Redirecting to login...</p>
          </div>
        )}

        {errors.submit && (
          <div className="error-message">
            {errors.submit}
          </div>
        )}

        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            {/* Step 1: Email Input */}
            {step === 1 && (
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={errors.email ? "input-error" : ""}
                />
                {errors.email && (
                  <span className="error-text">{errors.email}</span>
                )}
              </div>
            )}

            {/* Step 2: OTP Input */}
            {step === 2 && (
              <>
                <div className="form-group">
                  <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
                    OTP sent to {maskEmail(email)}
                  </p>
                  <label htmlFor="otp">Enter OTP *</label>
                  <input
                    id="otp"
                    type="text"
                    name="otp"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    maxLength="6"
                    className={errors.otp ? "input-error" : ""}
                  />
                  {errors.otp && (
                    <span className="error-text">{errors.otp}</span>
                  )}
                </div>

                <div className="form-group">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResendDisabled || isLoading}
                    className="link-button"
                  >
                    {isResendDisabled ? `Resend in ${timer}s` : "Resend OTP"}
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Password Input */}
            {step === 3 && (
              <>
                <div className="form-group">
                  <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
                    Resetting password for {maskEmail(email)}
                  </p>
                  <label htmlFor="newPassword">New Password *</label>
                  <input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={errors.newPassword ? "input-error" : ""}
                  />
                  {errors.newPassword && (
                    <span className="error-text">{errors.newPassword}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={errors.confirmPassword ? "input-error" : ""}
                  />
                  {errors.confirmPassword && (
                    <span className="error-text">{errors.confirmPassword}</span>
                  )}
                </div>
              </>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="btn-login"
                disabled={isLoading}
              >
                {isLoading && "Loading..."}
                {!isLoading && step === 1 && "Send OTP"}
                {!isLoading && step === 2 && "Verify OTP"}
                {!isLoading && step === 3 && "Reset Password"}
              </button>
            </div>
          </form>
        ) : (
          <div className="form-actions">
            <button
              type="button"
              className="btn-login"
              onClick={handleBackToLogin}
            >
              Back to Login
            </button>
          </div>
        )}

        <div className="signup-link">
          Remember your password?{" "}
          <button
            type="button"
            className="link-button"
            onClick={handleBackToLogin}
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
