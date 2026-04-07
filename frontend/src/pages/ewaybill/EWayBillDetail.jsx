import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppIcon from "../../components/common/AppIcon";
import {
  getEWayBillById,
  updateVehicle,
  extendValidity,
  cancelEWayBill,
  deleteEWayBill,
} from "../../services/ewayBillService";
import ExtendValidityModal from "./ExtendValidityModal";
import UpdateVehicleModal from "./UpdateVehicleModal";
import CancelBillModal from "./CancelBillModal";
import "../../styles/global.css";

// Helper for title casing strings
const toTitleCase = (str) => {
  if (!str) return "-";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

function EWayBillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showUpdateVehicleModal, setShowUpdateVehicleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const fetchBill = async () => {
      setIsLoading(true);
      try {
        const response = await getEWayBillById(id);
        setBill(response.data);
      } catch (error) {
        console.error("Error fetching e-way bill:", error);
        setBill(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBill();
  }, [id]);

  const handleExtendValidity = async (additionalKm) => {
    try {
      // Backend expects total distance to calculate new validity date
      const newTotalDistance = (bill.distanceKm || 0) + additionalKm;

      const payload = {
        distanceKm: newTotalDistance,
      };

      const response = await extendValidity(id, payload);
      setBill(response.data);
      setShowExtendModal(false);
      alert(`Validity extended! New distance: ${newTotalDistance} KM`);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to extend validity");
    }
  };

  const handleUpdateVehicle = async (newVehicleNumber) => {
    try {
      const payload = {
        vehicleNumber: newVehicleNumber,
        transportMode: bill.transportMode,
      };

      const response = await updateVehicle(id, payload);
      setBill(response.data);
      setShowUpdateVehicleModal(false);
      alert("Vehicle updated successfully");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update vehicle");
    }
  };

  const handleCancelBill = async (reason) => {
    try {
      await cancelEWayBill(id);
      // Refresh bill data to see CANCELLED status
      const response = await getEWayBillById(id);
      setBill(response.data);
      setShowCancelModal(false);
      alert("E-Way Bill cancelled successfully");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to cancel bill");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this e-way bill?")) return;
    try {
      await deleteEWayBill(id);
      alert("E-Way Bill deleted");
      navigate("/app/e-way-bills");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return { bg: "#d4edda", text: "#155724" };
      case "EXPIRED":
        return { bg: "#f8d7da", text: "#721c24" };
      case "CANCELLED":
        return { bg: "#e2e3e5", text: "#383d41" };
      default:
        return { bg: "#e2e3e5", text: "#383d41" };
    }
  };

  if (isLoading) return <div style={{ padding: "24px", textAlign: "center" }}>Loading...</div>;
  if (!bill) return <div style={{ padding: "24px", color: "red" }}>E-Way Bill not found</div>;

  const statusColor = getStatusColor(bill.status);
  const isActive = bill.status === "ACTIVE";

  // Calculate remaining days for UI
  const now = new Date();
  const expiry = new Date(bill.validUntil);
  const diffTime = expiry - now;
  const remainingDays = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <h1 style={{ margin: "0", fontSize: "24px", fontWeight: "700" }}>
              {bill.ewayBillNumber}
            </h1>
            <span style={{ padding: "6px 12px", backgroundColor: statusColor.bg, color: statusColor.text, borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
              {toTitleCase(bill.status)}
            </span>
          </div>
          <p style={{ margin: "0", fontSize: "13px", color: "#999" }}>
            Created: {formatDate(bill.createdAt)}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleDelete} style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
            <AppIcon name="trash" size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        {/* Invoice Info */}
        <div style={{ padding: "20px", backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: "8px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: "700" }}>Invoice Details</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div><p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#999" }}>Invoice Number</p><p style={{ margin: "0", fontSize: "14px", fontWeight: "600" }}>{bill.invoiceNumber}</p></div>
            <div><p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#999" }}>Invoice Date</p><p style={{ margin: "0", fontSize: "14px", fontWeight: "600" }}>{bill.invoiceDate}</p></div>
            <div><p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#999" }}>Buyer</p><p style={{ margin: "0", fontSize: "14px", fontWeight: "600" }}>{bill.buyerName || "-"}</p></div>
            <div><p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#999" }}>Total Value</p><p style={{ margin: "0", fontSize: "14px", fontWeight: "600" }}>₹{bill.totalInvoiceValue?.toLocaleString("en-IN")}</p></div>
          </div>
        </div>

        {/* Validity */}
        <div style={{ padding: "20px", backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: "8px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: "700" }}>Validity</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div><p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#999" }}>Valid From</p><p style={{ margin: "0", fontSize: "14px", fontWeight: "600" }}>{formatDate(bill.validFrom)}</p></div>
            <div><p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#999" }}>Valid Until</p><p style={{ margin: "0", fontSize: "14px", fontWeight: "600" }}>{formatDate(bill.validUntil)}</p></div>
            <div style={{ padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "6px" }}>
              <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#999" }}>Days Remaining</p>
              <p style={{ margin: "0", fontSize: "18px", fontWeight: "700", color: remainingDays > 5 ? "#28a745" : remainingDays > 0 ? "#ffc107" : "#dc3545" }}>
                {remainingDays} days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transport & Vehicle */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        <div style={{ padding: "20px", backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: "8px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: "700" }}>Transport</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div><p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#999" }}>Mode</p><p style={{ margin: "0", fontSize: "14px", fontWeight: "600" }}>{toTitleCase(bill.transportMode)}</p></div>
            <div><p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#999" }}>Distance</p><p style={{ margin: "0", fontSize: "14px", fontWeight: "600" }}>{bill.distanceKm} km</p></div>
            <div><p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#999" }}>Vehicle Number</p><p style={{ margin: "0", fontSize: "14px", fontWeight: "600" }}>{bill.vehicleNumber}</p></div>
            
            {/* Added Fields */}
            <div><p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#999" }}>Transporter Name</p><p style={{ margin: "0", fontSize: "14px", fontWeight: "600" }}>{bill.transporterName || "-"}</p></div>
            <div><p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#999" }}>Transporter ID</p><p style={{ margin: "0", fontSize: "14px", fontWeight: "600" }}>{bill.transporterId || "-"}</p></div>
            <div><p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#999" }}>Doc No & Date</p><p style={{ margin: "0", fontSize: "14px", fontWeight: "600" }}>{bill.transporterDocumentNo || "-"} {bill.transporterDocumentDate ? `(${formatDate(bill.transporterDocumentDate)})` : ""}</p></div>
          </div>
        </div>

        <div style={{ padding: "20px", backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: "8px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: "700" }}>Seller & Buyer</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Seller */}
            <div style={{ borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "8px" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#999", fontWeight: "700" }}>FROM (SELLER)</p>
              <div><p style={{ margin: "0 0 2px 0", fontSize: "14px", fontWeight: "600" }}>{bill.sellerBusinessName || "-"}</p></div>
              <div><p style={{ margin: "0", fontSize: "13px", color: "#555" }}>GSTIN: {bill.sellerGstin || "-"}</p></div>
              <div><p style={{ margin: "0", fontSize: "13px", color: "#555" }}>State: {bill.sellerState || "-"}</p></div>
            </div>

            {/* Buyer */}
            <div>
              <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#999", fontWeight: "700" }}>TO (BUYER)</p>
              <div><p style={{ margin: "0 0 2px 0", fontSize: "14px", fontWeight: "600" }}>{bill.buyerName || "-"}</p></div>
              <div><p style={{ margin: "0", fontSize: "13px", color: "#555" }}>GSTIN: {bill.buyerGstin || "-"}</p></div>
              <div><p style={{ margin: "0", fontSize: "13px", color: "#555" }}>State: {bill.buyerState || "-"}</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {isActive && (
        <div style={{ padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button onClick={() => setShowExtendModal(true)} style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
            Extend Validity
          </button>
          <button onClick={() => setShowUpdateVehicleModal(true)} style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
            Update Vehicle
          </button>
          <button onClick={() => setShowCancelModal(true)} style={{ padding: "10px 20px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600", marginLeft: "auto" }}>
            Cancel Bill
          </button>
        </div>
      )}

      <div style={{ marginTop: "16px" }}>
        <button onClick={() => navigate("/app/e-way-bills")} style={{ padding: "10px 20px", backgroundColor: "#6c757d", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
          Back to List
        </button>
      </div>

      {/* Modals */}
      <ExtendValidityModal
        isOpen={showExtendModal}
        onClose={() => setShowExtendModal(false)}
        onConfirm={handleExtendValidity}
        currentDistance={bill.distanceKm}
      />
      <UpdateVehicleModal
        isOpen={showUpdateVehicleModal}
        onClose={() => setShowUpdateVehicleModal(false)}
        onConfirm={handleUpdateVehicle}
        currentVehicleNumber={bill.vehicleNumber}
      />
      <CancelBillModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelBill}
        billNumber={bill.ewayBillNumber}
      />
    </div>
  );
}

export default EWayBillDetail;