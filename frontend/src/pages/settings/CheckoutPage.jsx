import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import "../../styles/checkout-page.css";
//import { createSubscription, saveBillingDetails } from "../../services/settingService";
import api from "../../services/api";

const pricingPlans = {
  free: {
    id: "free",
    name: "Forever Free",
    price: 0,
    yearlyPrice: 0,
  },
  growth: {
    id: "growth",
    name: "Growth",
    price: 499,
    yearlyPrice: 499 * 12,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 999,
    yearlyPrice: 999 * 12,
  },
};

function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showBillingDetails, setShowBillingDetails] = useState(false);
  const [billingName, setBillingName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [isGSTRegistered, setIsGSTRegistered] = useState("no");
  const [gstin, setGstin] = useState("");
  const [paymentType, setPaymentType] = useState("credit-card");

  useEffect(() => {
    const planId = searchParams.get("plan");
    if (planId && pricingPlans[planId]) {
      setSelectedPlan(pricingPlans[planId]);
    } else {
      navigate("/app/pricing");
    }
  }, [searchParams, navigate]);

  const calculatePrice = () => {
    if (!selectedPlan) return 0;

    if (billingCycle === "monthly") {
      return selectedPlan.price;
    } else {
      // Yearly with 10% discount
      const yearlyPrice = selectedPlan.yearlyPrice;
      const discountedPrice = yearlyPrice * 0.9; // 10% discount
      return discountedPrice;
    }
  };

  const getDisplayPrice = () => {
    if (!selectedPlan) return 0;

    if (billingCycle === "monthly") {
      return selectedPlan.price;
    } else {
      return selectedPlan.yearlyPrice;
    }
  };

  const getDiscountAmount = () => {
    if (!selectedPlan || billingCycle === "monthly") return 0;
    const yearlyPrice = selectedPlan.yearlyPrice;
    return yearlyPrice * 0.1; // 10% discount
  };

  const handleProceed = () => {
    setShowBillingDetails(true);
  };

  const handlePayment = async () => {
    try {
      const businessId = 1; // ⚠️ Replace with actual logged-in user later

      const payload = {
        businessId: businessId,
        plan: selectedPlan.id.toUpperCase(), // IMPORTANT
        billingCycle: billingCycle.toUpperCase(),

        billingName: billingName,
        phone: phone,
        country: country,
        streetAddress: streetAddress,
        state: state,
        city: city,
        zip: zip,

        gstRegistered: isGSTRegistered === "yes",
        gstin: gstin,

        paymentType: paymentType
      };

      console.log("Sending payload:", payload);

      await api.post("/subscription/subscribe", payload);

      alert("Subscription successful!");

      navigate("/app/settings");

    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed");
    }
  };

  const handleBackToBilling = () => {
    setShowBillingDetails(false);
  };

  if (!selectedPlan) {
    return <div className="checkout-loading">Loading...</div>;
  }

  return (
    <div className="checkout-page-container">
      {/* Back Button */}
      <button 
        className="checkout-back-btn"
        onClick={() => navigate("/app/pricing")}
      >
        <MdArrowBack size={20} /> Back to Plans
      </button>

      {/* Header */}
      <div className="checkout-header">
        <h1>Complete Your Upgrade</h1>
        <p>Choose your billing cycle and proceed to payment</p>
      </div>

      {/* Two Column Layout */}
      <div className="checkout-container">
        {/* LEFT COLUMN - Plan Selection or Billing Details */}
        <div className="checkout-left">
          {!showBillingDetails ? (
            // STEP 1: Plan Selection
            <div className="plan-card">
              <h2 className="plan-name">{selectedPlan.name}</h2>
              
              {/* Billing Cycle Toggle */}
              <div className="billing-toggle-section">
                <label className="billing-toggle-label">Billing Cycle</label>
                <div className="billing-toggle">
                  <button
                    className={`toggle-btn ${billingCycle === "monthly" ? "active" : ""}`}
                    onClick={() => setBillingCycle("monthly")}
                  >
                    Monthly
                  </button>
                  <button
                    className={`toggle-btn ${billingCycle === "yearly" ? "active" : ""}`}
                    onClick={() => setBillingCycle("yearly")}
                  >
                    Yearly
                    {billingCycle === "yearly" && <span className="discount-badge">10% OFF</span>}
                  </button>
                </div>
              </div>

              {/* Price Display */}
              <div className="plan-price-section">
                {billingCycle === "monthly" ? (
                  <div className="price-display">
                    <span className="currency">₹</span>
                    <span className="amount">{selectedPlan.price}</span>
                    <span className="period">/month</span>
                  </div>
                ) : (
                  <>
                    <div className="price-display">
                      <span className="currency">₹</span>
                      <span className="amount">{calculatePrice().toFixed(0)}</span>
                      <span className="period">/year</span>
                    </div>
                    <div className="original-price">
                      Original: ₹{selectedPlan.yearlyPrice}
                    </div>
                  </>
                )}
              </div>

              {/* Plan Features Preview */}
              <div className="plan-features-preview">
                <h3>Includes:</h3>
                <ul>
                  {selectedPlan.id === "free" && (
                    <>
                      <li>✓ Unlimited Items & Parties</li>
                      <li>✓ Basic Dashboard</li>
                      <li>✓ Basic Reports</li>
                    </>
                  )}
                  {selectedPlan.id === "growth" && (
                    <>
                      <li>✓ All Free Features</li>
                      <li>✓ Stock Management</li>
                      <li>✓ GST Reports</li>
                      <li>✓ Unlimited Transactions</li>
                    </>
                  )}
                  {selectedPlan.id === "pro" && (
                    <>
                      <li>✓ All Growth Features</li>
                      <li>✓ E-Way Bill Generation</li>
                      <li>✓ Multi-Business Support</li>
                      <li>✓ CA/Auditor Access</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            // STEP 2: Billing Details
            <div className="billing-details-card">
              {/* Header with Back Button */}
              <div className="billing-header">
                <h2 className="billing-title">Billing Details</h2>
                <button 
                  className="billing-back-btn"
                  onClick={handleBackToBilling}
                >
                  ← Back
                </button>
              </div>

              {/* Form Fields */}
              <div className="billing-form">
                {/* Billing Name/Company */}
                <div className="form-group">
                  <label htmlFor="billing-name" className="form-label">Billing Name / Company Name</label>
                  <input 
                    type="text"
                    id="billing-name"
                    className="form-input"
                    placeholder="Enter name or company name"
                    value={billingName}
                    onChange={(e) => setBillingName(e.target.value)}
                  />
                </div>

                {/* Phone Number */}
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">Phone Number</label>
                  <input 
                    type="tel"
                    id="phone"
                    className="form-input"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {/* Country - Select Dropdown */}
                <div className="form-group">
                  <label htmlFor="country" className="form-label">Country</label>
                  <select 
                    id="country"
                    className="form-input"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="">Select a country</option>
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Singapore">Singapore</option>
                    <option value="UAE">UAE</option>
                  </select>
                </div>

                {/* Street Address */}
                <div className="form-group">
                  <label htmlFor="street" className="form-label">Street Address</label>
                  <input 
                    type="text"
                    id="street"
                    className="form-input"
                    placeholder="Enter street address"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                  />
                </div>

                {/* Row: State, City, Zip */}
                <div className="form-row">
                  {/* State */}
                  <div className="form-group">
                    <label htmlFor="state" className="form-label">State</label>
                    <input 
                      type="text"
                      id="state"
                      className="form-input"
                      placeholder="Enter state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>

                  {/* City */}
                  <div className="form-group">
                    <label htmlFor="city" className="form-label">City</label>
                    <input 
                      type="text"
                      id="city"
                      className="form-input"
                      placeholder="Enter city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>

                  {/* ZIP */}
                  <div className="form-group">
                    <label htmlFor="zip" className="form-label">ZIP Code</label>
                    <input 
                      type="text"
                      id="zip"
                      className="form-input"
                      placeholder="ZIP code"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                    />
                  </div>
                </div>

                {/* GST Registration Section */}
                <div className="form-section-divider"></div>

                <div className="form-group">
                  <label className="form-label">Are you GST registered?</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input 
                        type="radio"
                        name="gst-registered"
                        value="yes"
                        checked={isGSTRegistered === "yes"}
                        onChange={(e) => setIsGSTRegistered(e.target.value)}
                      />
                      Yes
                    </label>
                    <label className="radio-label">
                      <input 
                        type="radio"
                        name="gst-registered"
                        value="no"
                        checked={isGSTRegistered === "no"}
                        onChange={(e) => setIsGSTRegistered(e.target.value)}
                      />
                      No
                    </label>
                  </div>
                </div>

                {/* GSTIN Field (shown only if GST registered = Yes) */}
                {isGSTRegistered === "yes" && (
                  <div className="form-group">
                    <label htmlFor="gstin" className="form-label">GSTIN</label>
                    <input 
                      type="text"
                      id="gstin"
                      className="form-input"
                      placeholder="Enter GSTIN"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                    />
                  </div>
                )}

                {/* Payment Method Section */}
                <div className="form-section-divider"></div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input 
                        type="radio"
                        name="payment-type"
                        value="credit-card"
                        checked={paymentType === "credit-card"}
                        onChange={(e) => setPaymentType(e.target.value)}
                      />
                      Credit Card
                    </label>
                    <label className="radio-label">
                      <input 
                        type="radio"
                        name="payment-type"
                        value="upi"
                        checked={paymentType === "upi"}
                        onChange={(e) => setPaymentType(e.target.value)}
                      />
                      UPI
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - Order Summary */}
        <div className="summary-card">
          {/* Header */}
          <h2 className="summary-header">Summary</h2>

          {/* Summary Body */}
          <div className="summary-body">
            {/* Subtotal Item */}
            <div className="summary-item">
              <span className="item-label">Subtotal</span>
              <span className="item-price">
                ₹{getDisplayPrice() === 0 ? "0" : getDisplayPrice()}
              </span>
            </div>

            {/* Discount Item (Yearly Only) */}
            {selectedPlan.price > 0 && billingCycle === "yearly" && (
              <div className="summary-item">
                <span className="item-label">Discount (10%)</span>
                <span className="item-price discount">
                  -₹{getDiscountAmount().toFixed(0)}
                </span>
              </div>
            )}

            {/* Tax Item (Paid Plans Only) */}
            {selectedPlan.price > 0 && (
              <div className="summary-item">
                <span className="item-label">Tax (18% GST)</span>
                <span className="item-price">
                  ₹{(calculatePrice() * 0.18).toFixed(0)}
                </span>
              </div>
            )}

            {/* Divider */}
            <div className="summary-divider"></div>

            {/* Total Section */}
            <div className="summary-total">
              <span className="total-label">Total Amount</span>
              <span className="total-price">
                ₹{selectedPlan.price === 0 ? "0" : (calculatePrice() * 1.18).toFixed(0)}
              </span>
            </div>
          </div>

          {/* Button */}
          {!showBillingDetails ? (
            <button 
              className="summary-btn"
              onClick={handleProceed}
            >
              {selectedPlan.price === 0 ? "Get Started" : "Proceed"}
            </button>
          ) : (
            <button 
              type="button"
              className="summary-btn"
              onClick={handlePayment}
            >
              Proceed to Pay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
