import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppIcon from "../../components/common/AppIcon";
import "../../styles/ewaybill.css";
import { getAllSalesInvoices } from "../../services/salesService";
import { getAllParties } from "../../services/partyService";
import { createEWayBill } from "../../services/ewayBillService";

function calculateValidityDays(distanceKm) {
  if (!distanceKm || distanceKm <= 0) return null;
  return Math.ceil(distanceKm / 100);
}

function EWayBillForm() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [parties, setParties] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    transporterId: "",
    transporterName: "",
    transportDocumentNumber: "",
    transportDocumentDate: "",
    transportMode: "ROAD",
    vehicleNumber: "",
    distanceKm: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoiceRes, partyRes] = await Promise.all([
          getAllSalesInvoices(),
          getAllParties(),
        ]);

        const partyMap = {};
        partyRes.data.forEach((p) => {
          partyMap[p.id] = p.name;
        });

        const eligibleInvoices = invoiceRes.data
          .filter((inv) => inv.grandTotal > 50000)
          .map((inv) => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            invoiceDate: inv.invoiceDate,
            customerName: partyMap[inv.partyId] || `Party #${inv.partyId}`,
            grandTotal: inv.grandTotal,
          }));

        setInvoices(eligibleInvoices);
        setParties(partyRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleInvoiceSelect = (e) => {
    const invoiceId = e.target.value;
    setSelectedInvoiceId(invoiceId);

    if (invoiceId) {
      const invoice = invoices.find((inv) => inv.id === Number(invoiceId));
      setSelectedInvoice(invoice);

      if (invoice) {
        const buyerParty = parties.find((p) => p.name === invoice.customerName);
        setSelectedBuyer(buyerParty || null);
      }
    } else {
      setSelectedInvoice(null);
      setSelectedBuyer(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validityDays = useMemo(() => {
    return calculateValidityDays(parseFloat(formData.distanceKm));
  }, [formData.distanceKm]);

  const validateForm = () => {
    const newErrors = {};

    if (!selectedInvoiceId) {
      newErrors.invoice = "Please select a sales invoice";
    }
    if (!formData.transportMode) {
      newErrors.transportMode = "Transport mode is required";
    }
    if (!formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = "Vehicle number is required";
    }
    if (!formData.distanceKm || parseFloat(formData.distanceKm) <= 0) {
      newErrors.distanceKm = "Distance must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      salesInvoiceId: Number(selectedInvoiceId),
      transporterId: formData.transporterId || null,
      transporterName: formData.transporterName || null,
      transportDocumentNumber: formData.transportDocumentNumber || null,
      transportDocumentDate: formData.transportDocumentDate || null,
      transportMode: formData.transportMode,
      vehicleNumber: formData.vehicleNumber,
      distanceKm: Number(formData.distanceKm),
    };

    setIsSubmitting(true);
    try {
      const response = await createEWayBill(payload);
      alert("E-Way Bill created successfully!");
      navigate(`/app/e-way-bills/${response.data.id}`);
    } catch (error) {
      console.error("Error creating e-way bill:", error);
      alert(error.response?.data?.message || "Failed to create E-Way Bill");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ewaybill-container">
      <div className="ewaybill-header">
        <h1 className="ewaybill-title">Generate E-Way Bill</h1>
        <p className="ewaybill-subtitle">
          Select a sales invoice and fill transport details
        </p>
      </div>

      {/* INVOICE SELECTION */}
      <div className="ewaybill-card">
        <div className="ewaybill-section-title">
          <span><AppIcon name="document" /></span>
          <span>Select Sales Invoice</span>
        </div>

        <div className="ewaybill-form-group">
          <label className="ewaybill-label">Sales Invoice *</label>
          <select
            value={selectedInvoiceId}
            onChange={handleInvoiceSelect}
            className={`ewaybill-select ${errors.invoice ? "error" : ""}`}
          >
            <option value="">-- Select Invoice (above ₹50,000) --</option>
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.invoiceNumber} - {inv.customerName} - ₹
                {inv.grandTotal?.toLocaleString("en-IN")}
              </option>
            ))}
          </select>
          {errors.invoice && (
            <span className="ewaybill-error-text">{errors.invoice}</span>
          )}
        </div>

        {selectedInvoice && (
          <div
            style={{
              marginTop: "16px",
              padding: "16px",
              backgroundColor: "#f0f7ff",
              borderRadius: "8px",
              border: "1px solid #b3d9ff",
            }}
          >
            <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#0066cc" }}>
              Invoice Details
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px" }}>
              <div>
                <strong>Invoice No:</strong> {selectedInvoice.invoiceNumber}
              </div>
              <div>
                <strong>Date:</strong>{" "}
                {new Date(selectedInvoice.invoiceDate).toLocaleDateString("en-IN")}
              </div>
              <div>
                <strong>Customer:</strong> {selectedInvoice.customerName}
              </div>
              <div>
                <strong>Total Value:</strong> ₹
                {selectedInvoice.grandTotal?.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ADDRESS DETAILS (READ ONLY) */}
      {selectedInvoice && (
        <div className="ewaybill-card">
          <div className="ewaybill-section-title">
            <span><AppIcon name="address" /></span>
            <span>Address Details</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {/* SELLER (FROM) */}
            <div>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "#333" }}>
                From (Seller)
              </h4>

              <div className="ewaybill-form-group">
                <label className="ewaybill-label">GSTIN</label>
                <input
                  type="text"
                  value="27ABCDE1234F1Z5"
                  disabled
                  className="ewaybill-input"
                  style={{ backgroundColor: "#f5f5f5" }}
                />
              </div>

              <div className="ewaybill-form-group">
                <label className="ewaybill-label">Business Name</label>
                <input
                  type="text"
                  value="My Business Pvt Ltd"
                  disabled
                  className="ewaybill-input"
                  style={{ backgroundColor: "#f5f5f5" }}
                />
              </div>

              <div className="ewaybill-form-group">
                <label className="ewaybill-label">State</label>
                <input
                  type="text"
                  value="Maharashtra"
                  disabled
                  className="ewaybill-input"
                  style={{ backgroundColor: "#f5f5f5" }}
                />
              </div>
            </div>

            {/* BUYER (TO) */}
            <div>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "#333" }}>
                To (Buyer)
              </h4>

              <div className="ewaybill-form-group">
                <label className="ewaybill-label">GSTIN</label>
                <input
                  type="text"
                  value={selectedBuyer?.gstin || "-"}
                  disabled
                  className="ewaybill-input"
                  style={{ backgroundColor: "#f5f5f5" }}
                />
              </div>

              <div className="ewaybill-form-group">
                <label className="ewaybill-label">Party Name</label>
                <input
                  type="text"
                  value={selectedBuyer?.name || selectedInvoice?.customerName || "-"}
                  disabled
                  className="ewaybill-input"
                  style={{ backgroundColor: "#f5f5f5" }}
                />
              </div>

              <div className="ewaybill-form-group">
                <label className="ewaybill-label">State</label>
                <input
                  type="text"
                  value={selectedBuyer?.state || "-"}
                  disabled
                  className="ewaybill-input"
                  style={{ backgroundColor: "#f5f5f5" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRANSPORT DETAILS */}
      <div className="ewaybill-card">
        <div className="ewaybill-section-title">
          <span><AppIcon name="ewaybill" /></span>
          <span>Transportation Details</span>
        </div>

        <div className="ewaybill-form-row">
          <div className="ewaybill-form-group">
            <label className="ewaybill-label">Transporter ID</label>
            <input
              type="text"
              name="transporterId"
              value={formData.transporterId}
              onChange={handleInputChange}
              placeholder="GSTIN or Enrolment ID (optional)"
              className="ewaybill-input"
            />
          </div>
          <div className="ewaybill-form-group">
            <label className="ewaybill-label">Transporter Name</label>
            <input
              type="text"
              name="transporterName"
              value={formData.transporterName}
              onChange={handleInputChange}
              placeholder="Self / Transporter Name"
              className="ewaybill-input"
            />
          </div>
        </div>

        <div className="ewaybill-form-row">
          <div className="ewaybill-form-group">
            <label className="ewaybill-label">Transport Document No</label>
            <input
              type="text"
              name="transportDocumentNumber"
              value={formData.transportDocumentNumber}
              onChange={handleInputChange}
              placeholder="LR / GR / Document No"
              className="ewaybill-input"
            />
          </div>
          <div className="ewaybill-form-group">
            <label className="ewaybill-label">Document Date</label>
            <input
              type="date"
              name="transportDocumentDate"
              value={formData.transportDocumentDate}
              onChange={handleInputChange}
              className="ewaybill-input"
            />
          </div>
        </div>
      </div>

      {/* VEHICLE DETAILS */}
      <div className="ewaybill-card">
        <div className="ewaybill-section-title">
          <span><AppIcon name="vehicle" /></span>
          <span>Vehicle Details</span>
        </div>

        <div className="ewaybill-form-row">
          <div className="ewaybill-form-group">
            <label className="ewaybill-label">Mode of Transport *</label>
            <select
              name="transportMode"
              value={formData.transportMode}
              onChange={handleInputChange}
              className={`ewaybill-select ${errors.transportMode ? "error" : ""}`}
            >
              <option value="ROAD">Road</option>
              <option value="RAIL">Rail</option>
              <option value="AIR">Air</option>
              <option value="SHIP">Ship</option>
            </select>
          </div>
          <div className="ewaybill-form-group">
            <label className="ewaybill-label">Distance (KM) *</label>
            <input
              type="number"
              name="distanceKm"
              value={formData.distanceKm}
              onChange={handleInputChange}
              placeholder="0"
              min="1"
              className={`ewaybill-input ${errors.distanceKm ? "error" : ""}`}
            />
            {errors.distanceKm && (
              <span className="ewaybill-error-text">{errors.distanceKm}</span>
            )}
            {validityDays && (
              <span className="ewaybill-helper-text">
                Estimated validity: {validityDays} day{validityDays > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        
          <div className="ewaybill-form-row">
            <div className="ewaybill-form-group">
              <label className="ewaybill-label">Vehicle Number *</label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleInputChange}
                placeholder="MH12AB1234"
                className={`ewaybill-input ${errors.vehicleNumber ? "error" : ""}`}
              />
              {errors.vehicleNumber && (
                <span className="ewaybill-error-text">{errors.vehicleNumber}</span>
              )}
            </div>
          </div>
      </div>

      {/* ACTION */}
      <div className="ewaybill-button-container">
        <button
          className="ewaybill-button"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Generate E-Way Bill"}
        </button>
      </div>
    </div>
  );
}

export default EWayBillForm;