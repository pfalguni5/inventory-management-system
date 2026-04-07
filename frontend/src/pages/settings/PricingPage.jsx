import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import { FiCheck, FiAlertCircle } from "react-icons/fi";
import "../../styles/pricing-page.css";
import api from "../../services/api";

function PricingPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const pricingPlans = [
    {
      id: "free",
      name: "Forever Free",
      subtitle: "Freelancers, Small Service Providers",
      price: 0,
      currency: "₹",
      period: "month",
      ctaText: "Get Started",
      isHighlighted: false,
      limits: ["Max 50 Invoices/mo", "Max 20 Quotations/mo"],
      features: [
        { name: "Unlimited Items & Parties", included: true },
        { name: "Basic Dashboard", included: true },
        { name: "Limited Invoices and Quotations", included: true },
        { name: "Stock Management", included: false },
        { name: "E-Way Bill", included: false },
        { name: "CA Access", included: false },
        { name: "Single Business Only", included: false, isRestriction: true },
      ],
    },
    {
      id: "growth",
      name: "Growth",
      subtitle: "Traders, Retailers, Wholesalers (GST Registered)",
      price: 499,
      currency: "₹",
      period: "month",
      ctaText: "Upgrade Now",
      isHighlighted: true,
      badge: "Best Value",
      limits: ["Unlimited Invoices & Quotations"],
      features: [
        { name: "All Free Features", included: true },
        { name: "Stock Management Enabled", included: true },
        { name: "Opening Stock, Adjustments, Low Stock Alerts", included: true },
        { name: "GST Reports", included: true },
        { name: "Profit & Loss Report", included: true },
        { name: "Quote-to-Invoice Conversion", included: true },
        { name: "E-Way Bill", included: false },
        { name: "Single Business Only", included: false, isRestriction: true },
      ],
    },
    {
      id: "pro",
      name: "Pro",
      subtitle: "Manufacturers, Large Distributors, Multi-chain owners",
      price: 999,
      currency: "₹",
      period: "month",
      ctaText: "Upgrade Now",
      isHighlighted: false,
      limits: ["Unlimited Everything"],
      features: [
        { name: "All Growth Features", included: true },
        { name: "E-Way Bill Generation", included: true },
        { name: "Multi-Business Support", included: true },
        { name: "Reports Forward to CA", included: true },
        { name: "Advanced Dashboard (Day/Month Comparison)", included: true },
        { name: "Priority Support", included: true },
      ],
    },
  ];

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);

    navigate(`/app/checkout?plan=${planId}`);
  };

  const handleFreePlan = async () => {
    try {
      setSelectedPlan("free");

      await api.post("/subscription/subscribe", {
        businessId: 1,
        plan: "FREE"
      });

      alert("Free plan activated!");
      navigate("/app/settings");

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pricing-page-container">
      {/* Back Button */}
      <button 
        className="pricing-page-back-btn"
        onClick={() => navigate("/app/settings")}
      >
        <MdArrowBack size={20} /> Back to Settings
      </button>

      {/* Header */}
      <div className="pricing-page-header">
        <h1>Choose Your Plan</h1>
        <p>Select the perfect plan for your business needs</p>
      </div>

      {/* Pricing Cards */}
      <div className="pricing-cards-container">
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            className={`pricing-card ${plan.isHighlighted ? "highlighted" : ""}`}
          >
            {/* Badge for Recommended Plan */}
            {plan.badge && <div className="pricing-badge">{plan.badge}</div>}

            {/* Plan Name and Details */}
            <div className="pricing-card-header">
              <h2 className="pricing-plan-name">{plan.name}</h2>
              <p className="pricing-plan-subtitle">{plan.subtitle}</p>
            </div>

            {/* Price */}
            <div className="pricing-price-section">
              <div className="pricing-amount">
                <span className="pricing-currency">{plan.currency}</span>
                <span className="pricing-value">{plan.price}</span>
                <span className="pricing-period">/ {plan.period}</span>
              </div>
            </div>

            {/* Limits */}
            <div className="pricing-limits">
              {plan.limits.map((limit, idx) => (
                <p key={idx} className="limit-item">
                  {limit}
                </p>
              ))}
            </div>

            {/* CTA Button */}
            <button
              className={`pricing-cta-button ${
                plan.isHighlighted ? "primary" : "secondary"
              } ${selectedPlan === plan.id ? "selected" : ""}`}
              onClick={() => {
                if (plan.id === "free") {
                  handleFreePlan();   // ✅ FREE PLAN
                } else {
                  handleSelectPlan(plan.id); // ✅ PAID PLAN
                }
              }}
            >
              {selectedPlan === plan.id ? "✓ Selected" : plan.ctaText}
            </button>

            {/* Features List */}
            <div className="pricing-features">
              <h3 className="features-title">What's Included:</h3>
              <ul className="features-list">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className={`feature-item ${
                      feature.included ? "included" : "excluded"
                    } ${feature.isRestriction ? "restriction" : ""}`}
                  >
                    <span className="feature-icon">
                      {feature.included ? (
                        <FiCheck size={18} className="check-icon" />
                      ) : (
                        <FiAlertCircle size={18} className="cross-icon" />
                      )}
                    </span>
                    <span className="feature-text">{feature.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="pricing-page-footer">
        <p>All plans include a 14-day free trial. No credit card required.</p>
      </div>
    </div>
  );
}

export default PricingPage;
