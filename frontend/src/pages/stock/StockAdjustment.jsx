import { useState, useEffect } from "react";
import AppIcon from "../../components/common/AppIcon";
import { getAllItems } from "../../services/itemService";
import { adjustStock, getStockByItem, getStockMovements } from "../../services/StockService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ICONS } from "../../icons/icons";
import "../../styles/stock-adjustment.css";

function StockAdjustment() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    itemId: "",
    adjustmentType: "increase",
    quantity: "",
    reason: "",
  });
  const [adjustmentHistory, setAdjustmentHistory] = useState([]);
  const [currentStock, setCurrentStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [itemsMap, setItemsMap] = useState({});
  const [itemSearch, setItemSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch items on mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await getAllItems();
        const itemList = response.data || [];
        setItems(itemList);

        // Create items map for quick lookup
        const map = {};
        itemList.forEach((item) => {
          map[item.id] = item;
        });
        setItemsMap(map);
      } catch (err) {
        setError("Failed to load items");
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Fetch stock and movements when item changes
  const fetchStockForItem = async (itemId) => {
    try {
      const stockResponse = await getStockByItem(itemId);
      setCurrentStock(stockResponse?.quantity || 0);

      // Fetch recent adjustments for this item
      const movementsResponse = await getStockMovements(itemId);
      setAdjustmentHistory(movementsResponse || []);
    } catch (err) {
      console.error("Error fetching stock data:", err);
      setCurrentStock(null);
      setAdjustmentHistory([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Fetch stock when item changes
    if (name === "itemId" && value) {
      fetchStockForItem(value);
      setShowDropdown(false);
      setItemSearch("");
    }
  };

  // Filter items based on search
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  // Calculate preview of new stock
  const getPreviewStock = () => {
    if (currentStock === null || !formData.quantity) return null;
    const quantity = parseFloat(formData.quantity);
    if (isNaN(quantity)) return null;

    return formData.adjustmentType === "increase"
      ? currentStock + quantity
      : currentStock - quantity;
  };

  const handleSave = async () => {
    if (!formData.itemId || !formData.quantity) {
      alert("Please select item and enter quantity");
      return;
    }

    const quantity = parseFloat(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      alert("Quantity must be a positive number");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Calculate new quantity based on adjustment type
      const newQuantity =
        formData.adjustmentType === "increase"
          ? (currentStock || 0) + quantity
          : (currentStock || 0) - quantity;

      if (newQuantity < 0) {
        alert("Insufficient stock for decrease adjustment");
        setSaving(false);
        return;
      }

      // Save adjustment
      await adjustStock({
        itemId: formData.itemId,
        newQuantity: newQuantity,
        reason: formData.reason || `Stock ${formData.adjustmentType}`,
      });

      alert("Stock adjustment saved successfully!");

      // Refresh data
      await fetchStockForItem(formData.itemId);

      // Reset form
      setFormData({
        itemId: formData.itemId,
        adjustmentType: "increase",
        quantity: "",
        reason: "",
      });
    } catch (err) {
      setError("Failed to save stock adjustment");
      console.error("Error saving adjustment:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      itemId: "",
      adjustmentType: "increase",
      quantity: "",
      reason: "",
    });
    setCurrentStock(null);
    setAdjustmentHistory([]);
  };

  const getItemName = (itemId) => {
    return itemsMap[itemId]?.name || "Unknown Item";
  };

  const getMovementType = (movement) => {
    if (movement.movementType === "ADJUSTMENT") {
      return movement.quantity > 0 ? "Increase" : "Decrease";
    }
    return movement.movementType;
  };

  if (loading) {
    return (
      <div className="stock-adjustment-container">
        <p>Loading items...</p>
      </div>
    );
  }

  return (
    <div className="stock-adjustment-container">
      <div className="adjustment-header">
        <div className="header-content">
          <h1>Stock Adjustment</h1>
          <p className="header-subtitle">Adjust stock levels due to damages, discrepancies, or other reasons</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="adjustment-content">
        <div className="adjustment-form-section">
          <div className="form-header">
            <h2>Adjustment Form</h2>
            <p className="form-description">Enter stock adjustment details below</p>
          </div>

          {formData.itemId && currentStock !== null && (
            <div style={{ marginBottom: "24px", padding: "16px", backgroundColor: "#f9f9f9", borderRadius: "6px", border: "1px solid #e8e8e8" }}>
              <p style={{ margin: 0, fontSize: "12px", color: "#888", marginBottom: "8px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>Current Stock</p>
              <p style={{ margin: 0, fontSize: "28px", fontWeight: "600", color: "#333" }}>
                {currentStock} <span style={{ fontSize: "13px", color: "#999", fontWeight: "400", marginLeft: "8px" }}>{itemsMap[formData.itemId]?.unit || ""}</span>
              </p>
            </div>
          )}

          <form className="adjustment-form">
            <div className="form-row">
              <div className="form-group" style={{ position: "relative" }}>
                <label htmlFor="itemId">Select Item *</label>
                <div
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{
                    padding: "12px 14px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                    minHeight: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "14px",
                    fontWeight: "400",
                    color: formData.itemId ? "#333" : "#888",
                    transition: "all 0.2s ease",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#bbb";
                    e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#ddd";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
                  }}
                >
                  <span>{formData.itemId ? itemsMap[formData.itemId]?.name : "-- Select Item --"}</span>
                  <FontAwesomeIcon icon={ICONS.angleDown} style={{ marginLeft: "8px", fontSize: "12px", color: "#999" }} />
                </div>

                {showDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      right: 0,
                      backgroundColor: "#fff",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      maxHeight: "280px",
                      overflowY: "auto",
                      zIndex: 10,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid #f0f0f0", backgroundColor: "#fafafa", position: "sticky", top: 0 }}>
                      <FontAwesomeIcon icon={ICONS.search} style={{ marginRight: "8px", fontSize: "13px", color: "#999" }} />
                      <input
                        type="text"
                        placeholder="Search items..."
                        value={itemSearch}
                        onChange={(e) => setItemSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        style={{
                          width: "100%",
                          padding: "8px 0",
                          border: "none",
                          boxSizing: "border-box",
                          fontSize: "13px",
                          backgroundColor: "transparent",
                          outline: "none",
                          color: "#333",
                        }}
                      />
                    </div>
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              itemId: item.id,
                            });
                            fetchStockForItem(item.id);
                            setShowDropdown(false);
                            setItemSearch("");
                          }}
                          style={{
                            padding: "11px 14px",
                            cursor: "pointer",
                            backgroundColor:
                              formData.itemId === item.id ? "#f0f0f0" : "#fff",
                            borderBottom: "1px solid #f5f5f5",
                            transition: "all 0.15s ease",
                            fontWeight: "400",
                            color: "#333",
                            fontSize: "14px",
                          }}
                          onMouseEnter={(e) => {
                            if (formData.itemId !== item.id) {
                              e.currentTarget.style.backgroundColor = "#f8f8f8";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = formData.itemId === item.id ? "#f0f0f0" : "#fff";
                          }}
                        >
                          {formData.itemId === item.id && (
                            <FontAwesomeIcon icon={ICONS.check} style={{ marginRight: "8px", fontSize: "11px", color: "#666" }} />
                          )}
                          {item.name}
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          padding: "20px 14px",
                          textAlign: "center",
                          color: "#999",
                          fontSize: "13px",
                        }}
                      >
                        No items found
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="adjustmentType">Adjustment Type *</label>
                <select
                  id="adjustmentType"
                  name="adjustmentType"
                  value={formData.adjustmentType}
                  onChange={handleChange}
                  className="form-control"
                  style={{
                    borderColor: "#ddd",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  <option value="increase">Increase (+)</option>
                  <option value="decrease">Decrease (-)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Quantity *</label>
                <input
                  id="quantity"
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  className="form-control"
                  min="0"
                  style={{
                    borderColor: "#ddd",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                />
              </div>
            </div>

            {getPreviewStock() !== null && (
              <div
                style={{
                  marginBottom: "20px",
                  padding: "14px",
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #dbeade",
                  borderRadius: "6px",
                }}
              >
                <p
                  style={{
                    margin: "0 0 6px 0",
                    fontSize: "11px",
                    color: "#666",
                    fontWeight: "500",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <FontAwesomeIcon icon={ICONS.hardDrive} style={{ fontSize: "13px", color: "#16a34a" }} /> Stock Preview
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#166534",
                  }}
                >
                  {currentStock} → {getPreviewStock()} {itemsMap[formData.itemId]?.unit || ""}
                </p>
              </div>
            )}

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="reason">Reason for Adjustment</label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Enter reason (e.g., Damaged stock, Stock discrepancy, etc.)"
                  className="form-control textarea"
                  rows="4"
                  style={{
                    borderColor: "#ddd",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                ></textarea>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-save" onClick={handleSave} disabled={saving}>
                <AppIcon name="check" />
                {saving ? "Saving..." : "Save Adjustment"}
              </button>
              <button type="button" className="btn-reset" onClick={handleReset} disabled={saving}>
                <AppIcon name="close" />
                Clear Form
              </button>
            </div>
          </form>
        </div>

        <div className="adjustment-history-section">
          <div className="history-header">
            <h2>Recent Adjustments</h2>
            <p className="history-description">Track all stock adjustments made in your system</p>
          </div>

          <div className="table-container">
            <table className="data-table adjustment-history-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th className="center">Type</th>
                  <th className="center">Quantity</th>
                  <th>Reason</th>
                  <th className="center">Date</th>
                </tr>
              </thead>

              <tbody>
                {adjustmentHistory.length > 0 ? (
                  adjustmentHistory
                    .filter((record) => record.movementType === "ADJUSTMENT")
                    .map((record, index) => (
                      <tr key={index}>
                        <td className="item-name">{getItemName(record.itemId)}</td>
                        <td className="center">
                          <span
                            className={`type-badge ${
                              record.quantity > 0 ? "increase" : "decrease"
                            }`}
                          >
                            {getMovementType(record)}
                          </span>
                        </td>
                        <td className="center amount">{Math.abs(record.quantity)}</td>
                        <td className="reason-text">{record.remarks || "-"}</td>
                        <td className="center date">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="5" className="center">
                      No adjustments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="info-section">
        <div className="info-card">
          <h3><AppIcon name="clipboard" /> Important Notes</h3>
          <ul>
            <li>All adjustments are recorded and tracked for audit purposes</li>
            <li>Always provide a reason for stock adjustments</li>
            <li>Increases add stock, decreases subtract from current stock</li>
            <li>Current stock is displayed at the top of the form</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default StockAdjustment;
