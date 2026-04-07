import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/business-setup.css";
import api from "../../services/api";

function BusinessSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    industry: "",
    gstRegistered: "no",
    gstin: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    fyBeginningFrom: "01-04",
    stockManagement: "yes",
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...formData, [name]: value };
    // Business Type logic for stock
    if (name === "businessType") {
      if (value === "Service") {
        updated.stockManagement = "no";
      } else if (value === "Trading" || value === "Manufacturing") {
        updated.stockManagement = "yes";
      }
    }
    setFormData(updated);
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};


    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }
    if (!formData.businessType) {
      newErrors.businessType = "Business type is required";
    }

    if (formData.gstRegistered === "yes") {
      if (!formData.gstin.trim()) {
        newErrors.gstin = "GSTIN is required for registered businesses";
      } else if (formData.gstin.length !== 15) {
        newErrors.gstin = "GSTIN must be exactly 15 characters";
      }
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (formData.pincode.length !== 6) {
      newErrors.pincode = "Pincode must be exactly 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try{
      const response = await api.post("/business", {
        name: formData.businessName,
        businessType: formData.businessType,
        industry: formData.industry,
        gstRegistered: formData.gstRegistered === "yes",
        gstNumber: formData.gstin,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
        financialYear: formData.fyBeginningFrom,
        enableStockManagement: formData.stockManagement === "yes",
      });

      const businessId = response.data.id;

      //store businessId in localStorage
      localStorage.setItem("businessId", businessId);

      console.log("Business created:", response.data);

      navigate("/app");
    } catch(error){
      console.error("Error creating business: ", error);
    }
  };

  return (
    <div className="business-setup-container">
      <div className="business-setup-box">
        <div className="setup-header">
          <h1>Business Setup</h1>
          <p>Configure your business settings to get started</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="section-title">Business Information</h3>

            <div className="form-group">
              <label htmlFor="businessName">Business Name *</label>
              <input
                id="businessName"
                type="text"
                name="businessName"
                placeholder="Enter your business name"
                value={formData.businessName}
                onChange={handleInputChange}
                className={errors.businessName ? "input-error" : ""}
              />
              {errors.businessName && (
                <span className="error-text">{errors.businessName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="businessType">Business Type *</label>
              <select
                id="businessType"
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                className={errors.businessType ? "input-error" : ""}
                required
              >
                <option value="">Select business type</option>
                <option value="Trading">Trading</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Service">Service</option>
              </select>
              {errors.businessType && (
                <span className="error-text">{errors.businessType}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="industry">Industry</label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
              >
                <option value="">Select industry</option>
                <option>Agency / Sales House</option>
                <option>Agriculture</option>
                <option>Art & Design</option>
                <option>Automotive</option>
                <option>Construction</option>
                <option>Consulting</option>
                <option>Consumer Packaged Goods (FMCG)</option>
                <option>Education</option>
                <option>Engineering</option>
                <option>Entertainment</option>
                <option>Financial Services</option>
                <option>Food Services (Restaurant/Fast Food)</option>
                <option>Gaming</option>
                <option>Government</option>
                <option>Healthcare</option>
                <option>Interior Design</option>
                <option>IT / Software / Technology</option>
                <option>Legal</option>
                <option>Manufacturing</option>
                <option>Marketing / Advertising</option>
                <option>Mining & Logistics</option>
                <option>Non‑Profit</option>
                <option>Publishing / Media</option>
                <option>Real Estate</option>
                <option>Retail (E‑commerce and Offline)</option>
                <option>Services (General)</option>
                <option>Telecommunications</option>
                <option>Travel / Hospitality</option>
                <option>Transportation / Logistics</option>
                <option>Web Designing / Web Development</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="gstRegistered">GST Registration *</label>
              <select
                id="gstRegistered"
                name="gstRegistered"
                value={formData.gstRegistered}
                onChange={handleInputChange}
              >
                <option value="yes">Yes, I am GST Registered</option>
                <option value="no">No, I am not GST Registered</option>
              </select>
            </div>

            {formData.gstRegistered === "yes" && (
              <div className="form-group">
                <label htmlFor="gstin">GSTIN *</label>
                <input
                  id="gstin"
                  type="text"
                  name="gstin"
                  placeholder="Enter GSTIN (e.g., 27AABCT1234H1A0)"
                  value={formData.gstin}
                  onChange={handleInputChange}
                  maxLength="15"
                  className={errors.gstin ? "input-error" : ""}
                />
                <small className="helper-text">
                  GSTIN should be exactly 15 characters ({formData.gstin.length}/15)
                </small>
                {errors.gstin && (
                  <span className="error-text">{errors.gstin}</span>
                )}
              </div>
            )}
          </div>

          <div className="form-section">
            <h3 className="section-title">Company Address</h3>

            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <input
                id="address"
                type="text"
                name="address"
                placeholder="Enter company address"
                value={formData.address}
                onChange={handleInputChange}
                className={errors.address ? "input-error" : ""}
              />
              {errors.address && (
                <span className="error-text">{errors.address}</span>
              )}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={errors.city ? "input-error" : ""}
                />
                {errors.city && (
                  <span className="error-text">{errors.city}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="state">State *</label>
                <input
                  id="state"
                  type="text"
                  name="state"
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={errors.state ? "input-error" : ""}
                />
                {errors.state && (
                  <span className="error-text">{errors.state}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="pincode">Pincode *</label>
                <input
                  id="pincode"
                  type="text"
                  name="pincode"
                  placeholder="Enter pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  maxLength="6"
                  className={errors.pincode ? "input-error" : ""}
                />
                <small className="helper-text">
                  6 digit postal code ({formData.pincode.length}/6)
                </small>
                {errors.pincode && (
                  <span className="error-text">{errors.pincode}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="country">Country</label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                >
                  <option value="India">India</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Fiscal Year Settings</h3>

            <div className="form-group">
              <label htmlFor="fyBeginningFrom">FY Beginning From *</label>
              <select
                id="fyBeginningFrom"
                name="fyBeginningFrom"
                value={formData.fyBeginningFrom}
                onChange={handleInputChange}
              >
                <option value="01-04">April (01-04) - Standard India FY</option>
                <option value="01-01">January (01-01)</option>
                <option value="07-01">July (07-01)</option>
                <option value="10-01">October (10-01)</option>
              </select>
              <small className="helper-text">
                Select the month when your fiscal year begins
              </small>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Feature Settings</h3>

            <div className="form-group">
              <label htmlFor="stockManagement">Enable Stock Management *</label>
              <select
                id="stockManagement"
                name="stockManagement"
                value={formData.stockManagement}
                onChange={handleInputChange}
              >
                <option value="yes">Yes, Enable Stock Tracking</option>
                <option value="no">No, Disable Stock Tracking</option>
              </select>
              <small className="helper-text">
                Stock management helps track inventory across transactions
              </small>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Save & Continue
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/app")}
            >
              Skip for Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BusinessSetup;
