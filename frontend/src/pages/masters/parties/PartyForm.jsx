import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createParty, getPartyById, updateParty } from "../../../services/partyService";
import "../../../styles/item-form.css";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

function validateEmail(email) {
  return /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(email);
}

function validateGSTIN(gstin) {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/.test(gstin);
}

function PartyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [form, setForm] = useState({
    partyName: "",
    partyType: "",
    gstin: "",
    creditLimit: null,
    openingBalance: null,
    sinceDate: "",
    phone: "",
    email: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEditMode) return;

  const fetchPartyData = async () => {
    try {
      const response = await getPartyById(id);
      const party = response.data;

      setForm({
        partyName: party.name || "",
        partyType:
          party.type === "CUSTOMER"
            ? "Customer"
            : party.type === "SUPPLIER"
            ? "Supplier"
            : "Both",
         gstin: party.gstin || "",
        creditLimit: party.creditLimit ?? null,
        openingBalance: party.openingBalance ?? null,
        sinceDate: party.sinceDate || "",
        phone: party.phone || "",
        email: party.email || "",
        addressLine1: party.addressLine1 || "",
        city: party.city || "",
        state: party.state || "",
        pincode: party.pincode || "",
        country: party.country || "India",
        });
      } catch (error) {
        console.error("Error fetching party details:", error);
        alert("Failed to load party details");
      }
    };

    fetchPartyData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: (name === "creditLimit" || name === "openingBalance")
        ? (value === "" ? null : Number(value))
        : value 
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.partyName.trim()) newErrors.partyName = "Party name is required";
    if (!form.partyType) newErrors.partyType = "Party type is required";
    if (!form.phone.trim()) newErrors.phone = "Phone is required";
    else if (!/^[0-9]{10}$/.test(form.phone)) newErrors.phone = "Phone must be 10 digits";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(form.email)) newErrors.email = "Invalid email format";
    if (!form.addressLine1.trim()) newErrors.addressLine1 = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state.trim()) newErrors.state = "State is required";
    if (!form.pincode.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^[0-9]{6}$/.test(form.pincode)) newErrors.pincode = "Pincode must be 6 digits";
    if (!form.country.trim()) newErrors.country = "Country is required";
    if (form.gstin) {
      if (form.gstin.length !== 15) newErrors.gstin = "GSTIN must be 15 characters";
      else if (!validateGSTIN(form.gstin)) newErrors.gstin = "Invalid GSTIN format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const payload = {
      name: form.partyName,
      type:
        form.partyType === "Customer"
          ? "CUSTOMER"
          : form.partyType === "Supplier"
          ? "SUPPLIER"
          : "BOTH",
      gstin: form.gstin || null,
      sinceDate: form.sinceDate || null,
      creditLimit: form.creditLimit !== null ? Number(form.creditLimit) : null,
      openingBalance: form.openingBalance !== null ? Number(form.openingBalance) : null,
      phone: form.phone || null,
      email: form.email || null,
      addressLine1: form.addressLine1 || null,
      city: form.city || null,
      state: form.state || null,
      pincode: form.pincode || null,
      country: form.country || null,
    };

    try {
      if (isEditMode) {
        await updateParty(id, payload);
        alert("Party updated successfully");
        navigate(`/app/parties/${id}`);
      } else {
        await createParty(payload);
        alert("Party created successfully");
        navigate("/app/parties");
      }
    } catch (error) {
      console.error("Error saving party:", error);
      alert(
        error.response?.data?.message ||
        "Failed to save party"
      );
    }
  };

  return (
    <div className="item-form-container">
      <div className="item-form-header">
        <h2 className="item-form-title">{isEditMode ? "Edit Party" : "Add Party"}</h2>
        <p className="item-form-subtitle">
          {isEditMode ? "Update customer or supplier details" : "Create a new customer or supplier party"}
        </p>
      </div>
      <form className="card item-form-card" onSubmit={handleSubmit}>
        <div className="item-form-grid">
          {/* Party Name */}
          <div className="form-group">
            <label>Party Name *</label>
            <input type="text" name="partyName" value={form.partyName} onChange={handleChange} placeholder="Enter party name" className={errors.partyName ? "input-error" : ""} />
            {errors.partyName && <span className="error-text">{errors.partyName}</span>}
          </div>
          {/* Party Type */}
          <div className="form-group">
            <label>Party Type *</label>
            <select name="partyType" value={form.partyType} onChange={handleChange} className={errors.partyType ? "input-error" : ""}>
              <option value="">Select type</option>
              <option>Customer</option>
              <option>Supplier</option>
              <option>Both</option>
            </select>
            {errors.partyType && <span className="error-text">{errors.partyType}</span>}
          </div>
          {/* GSTIN */}
          <div className="form-group">
            <label>GSTIN (Optional)</label>
            <input type="text" name="gstin" value={form.gstin} onChange={handleChange} placeholder="Enter GSTIN if available" maxLength={15} className={errors.gstin ? "input-error" : ""} />
            {errors.gstin && <span className="error-text">{errors.gstin}</span>}
          </div>
          {/* Customer/Supplier Since */}
          <div className="form-group">
            <label>
              {form.partyType === "Customer" ? "Customer Since" : form.partyType === "Supplier" ? "Supplier Since" : "Since"}
            </label>
            <input 
              type="date" 
              name="sinceDate" 
              value={form.sinceDate} 
              onChange={handleChange} 
              className={errors.sinceDate ? "input-error" : ""} 
            />
            {errors.sinceDate && <span className="error-text">{errors.sinceDate}</span>}
          </div>
          {/* Credit Limit */}
          <div className="form-group">
            <label>Credit Limit (Optional)</label>
            <input 
              type="number" 
              name="creditLimit" 
              min="0" 
              step="0.01"
              value={form.creditLimit ?? ""} 
              onChange={handleChange}
              placeholder="Leave blank for no limit"
              className={errors.creditLimit ? "input-error" : ""} 
            />
            {errors.creditLimit && <span className="error-text">{errors.creditLimit}</span>}
          </div>
          {/* Opening Balance */}
          <div className="form-group">
            <label>Opening Balance (Optional)</label>
            <input 
              type="number" 
              name="openingBalance" 
              min="0" 
              step="0.01"
              value={form.openingBalance ?? ""} 
              onChange={handleChange}
              placeholder="Opening balance for party account"
              className={errors.openingBalance ? "input-error" : ""} 
            />
            {errors.openingBalance && <span className="error-text">{errors.openingBalance}</span>}
          </div>
        </div>

        {/* Party Contact Details */}
        <div className="form-section">
          <h3 className="section-title">Contact Details</h3>
          <div className="item-form-grid">
            <div className="form-group">
              <label>Phone *</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="10 digit phone" maxLength={10} className={errors.phone ? "input-error" : ""} />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter email address" className={errors.email ? "input-error" : ""} />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="form-section">
          <h3 className="section-title">Address</h3>
          <div className="item-form-grid">
            <div className="form-group">
              <label>Address Line 1 *</label>
              <input type="text" name="addressLine1" value={form.addressLine1} onChange={handleChange} placeholder="Flat/Building/Street" className={errors.addressLine1 ? "input-error" : ""} />
              {errors.addressLine1 && <span className="error-text">{errors.addressLine1}</span>}
            </div>
            <div className="form-group">
              <label>City *</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="Enter city" className={errors.city ? "input-error" : ""} />
              {errors.city && <span className="error-text">{errors.city}</span>}
            </div>
            <div className="form-group">
              <label>State *</label>
              <select name="state" value={form.state} onChange={handleChange} className={errors.state ? "input-error" : ""}>
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
              {errors.state && <span className="error-text">{errors.state}</span>}
            </div>
            <div className="form-group">
              <label>Pincode *</label>
              <input type="text" name="pincode" value={form.pincode} onChange={handleChange} placeholder="6 digit pincode" maxLength={6} className={errors.pincode ? "input-error" : ""} />
              {errors.pincode && <span className="error-text">{errors.pincode}</span>}
            </div>
            <div className="form-group">
              <label>Country *</label>
              <input type="text" name="country" value={form.country} onChange={handleChange} placeholder="Country" className={errors.country ? "input-error" : ""} />
              {errors.country && <span className="error-text">{errors.country}</span>}
            </div>
          </div>
        </div>

        <button className="split-button-main" style={{ marginTop: "24px" }}>
          {isEditMode ? "Update Party" : "Save Party"}
        </button>
      </form>
    </div>
  );
}

export default PartyForm;
