import { useState } from "react";
import "../../styles/global.css";

function CancelBillModal({ isOpen, onClose, onConfirm, billNumber }) {
  const [cancelReason, setCancelReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation");
      return;
    }
    if (!confirmed) {
      alert("Please confirm that you want to cancel this bill");
      return;
    }
    onConfirm(cancelReason.trim());
    setCancelReason("");
    setConfirmed(false);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "28px",
          width: "100%",
          maxWidth: "450px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "16px",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#fee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            ⚠️
          </div>
          <div>
            <h3 style={{ margin: "0", fontSize: "18px", fontWeight: "700", color: "#dc3545" }}>
              Cancel E-Way Bill
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#999" }}>
              Bill: {billNumber}
            </p>
          </div>
        </div>

        <div
          style={{
            padding: "12px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "6px",
            marginBottom: "20px",
            fontSize: "13px",
            color: "#856404",
          }}
        >
          This action cannot be reversed. Once cancelled, this e-way bill cannot be used.
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#333" }}>
            Reason for Cancellation *
          </label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g., Goods not supplied, Wrong GSTIN, etc."
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "13px",
              fontFamily: "inherit",
              boxSizing: "border-box",
              resize: "vertical",
              minHeight: "80px",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "24px",
            padding: "12px",
            backgroundColor: "#f8f9fa",
            borderRadius: "6px",
          }}
        >
          <input
            type="checkbox"
            id="confirm-cancel"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            style={{
              cursor: "pointer",
              width: "18px",
              height: "18px",
            }}
          />
          <label
            htmlFor="confirm-cancel"
            style={{
              cursor: "pointer",
              fontSize: "13px",
              color: "#333",
              fontWeight: "500",
              margin: "0",
            }}
          >
            I confirm that I want to cancel this e-way bill
          </label>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 20px",
              border: "1px solid #ddd",
              backgroundColor: "#fff",
              color: "#333",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f5f5f5";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#fff";
            }}
          >
            Keep Bill
          </button>
          <button
            onClick={handleConfirm}
            disabled={!confirmed}
            style={{
              padding: "8px 20px",
              backgroundColor: confirmed ? "#dc3545" : "#ccc",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: confirmed ? "pointer" : "not-allowed",
              fontSize: "13px",
              fontWeight: "600",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              if (confirmed) {
                e.target.style.backgroundColor = "#c82333";
              }
            }}
            onMouseLeave={(e) => {
              if (confirmed) {
                e.target.style.backgroundColor = "#dc3545";
              }
            }}
          >
            Cancel Bill
          </button>
        </div>
      </div>
    </div>
  );
}

export default CancelBillModal;
