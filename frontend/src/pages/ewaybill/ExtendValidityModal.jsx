import { useState } from "react";
import "../../styles/global.css";

function ExtendValidityModal({ isOpen, onClose, onConfirm, currentDistance }) {
  // State for additional distance
  const [additionalDistance, setAdditionalDistance] = useState("");

  const handleConfirm = () => {
    if (!additionalDistance || parseInt(additionalDistance) <= 0) {
      alert("Please enter a valid additional distance greater than 0");
      return;
    }
    // Pass the numeric value back to parent
    onConfirm(parseInt(additionalDistance));
    setAdditionalDistance("");
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
          maxWidth: "400px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "700", color: "#1a1a1a" }}>
          Extend Validity
        </h3>
        <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#666" }}>
          Enter the additional distance required. Validity will be recalculated based on total distance.
        </p>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#333" }}>
            Current Distance
          </label>
          <div
            style={{
              padding: "10px 12px",
              backgroundColor: "#f5f5f5",
              borderRadius: "6px",
              fontSize: "13px",
              color: "#666",
              border: "1px solid #e0e0e0",
            }}
          >
            {currentDistance ? `${currentDistance} KM` : "0 KM"}
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#333" }}>
            Additional Distance (KM) *
          </label>
          <input
            type="number"
            value={additionalDistance}
            onChange={(e) => setAdditionalDistance(e.target.value)}
            placeholder="e.g. 50"
            min="1"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "13px",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
          <p style={{ fontSize: "11px", color: "#999", marginTop: "6px" }}>
            Note: 100 KM adds approx. 1 day validity.
          </p>
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
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: "8px 20px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#0056b3";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#007bff";
            }}
          >
            Extend
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExtendValidityModal;