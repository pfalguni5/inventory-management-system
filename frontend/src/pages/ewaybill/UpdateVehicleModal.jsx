import { useState } from "react";
import "../../styles/global.css";

function UpdateVehicleModal({ isOpen, onClose, onConfirm, currentVehicleNumber }) {
  const [newVehicleNumber, setNewVehicleNumber] = useState(currentVehicleNumber || "");

  const handleConfirm = () => {
    const trimmed = newVehicleNumber.trim().toUpperCase();
    if (!trimmed) {
      alert("Please enter a vehicle number");
      return;
    }
    onConfirm(trimmed);
    setNewVehicleNumber("");
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
          Update Vehicle Number
        </h3>
        <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#666" }}>
          Update the vehicle number for this e-way bill. The system will auto-format to uppercase.
        </p>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#333" }}>
            Current Vehicle Number
          </label>
          <div
            style={{
              padding: "10px 12px",
              backgroundColor: "#f5f5f5",
              borderRadius: "6px",
              fontSize: "13px",
              color: "#666",
              border: "1px solid #e0e0e0",
              fontWeight: "500",
              letterSpacing: "0.5px",
            }}
          >
            {currentVehicleNumber || "Not set"}
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#333" }}>
            New Vehicle Number *
          </label>
          <input
            type="text"
            value={newVehicleNumber}
            onChange={(e) => setNewVehicleNumber(e.target.value)}
            placeholder="e.g., MH02AB1234"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "13px",
              fontFamily: "inherit",
              boxSizing: "border-box",
              textTransform: "uppercase",
            }}
          />
          <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "#999" }}>
            Format: State Code + 2 digits + 2 letters + 4 digits
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
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#1e7e34";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#28a745";
            }}
          >
            Update Vehicle
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpdateVehicleModal;
