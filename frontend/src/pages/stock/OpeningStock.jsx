import { useState, useEffect } from "react";
import AppIcon from "../../components/common/AppIcon";
import { getAllItems, updateItem } from "../../services/itemService";
import "../../styles/opening-stock.css";

function OpeningStock() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({});
  const [stockStatus, setStockStatus] = useState({}); // Track which items have opening stock set
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all items
        const allItemsResponse = await getAllItems();
        const allItems = (allItemsResponse.data || []).filter(item => item.type?.toLowerCase() === 'goods');

        setItems(allItems);

        // Check opening stock status from item.openingStock field
        const stockStatusMap = {};
        const formDataMap = {};

        for (const item of allItems) {
          // Check if opening stock is already set (openingStock > 0)
          if (item.openingStock && item.openingStock > 0) {
            stockStatusMap[item.id] = true;
            formDataMap[item.id] = item.openingStock.toString();
          } else {
            stockStatusMap[item.id] = false;
            formDataMap[item.id] = "";
          }
        }

        setStockStatus(stockStatusMap);
        setFormData(formDataMap);
      } catch (err) {
        setError("Failed to load items");
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e, itemId) => {
    setFormData({
      ...formData,
      [itemId]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      let hasChanges = false;

      // Save only items whose opening stock was not already set
      for (const item of items) {
        if (!stockStatus[item.id] && formData[item.id]) {
          hasChanges = true;
          const quantity = parseFloat(formData[item.id]);

          if (isNaN(quantity) || quantity < 0) {
            setError(`Invalid quantity for ${item.name}`);
            setSaving(false);
            return;
          }

          // Update item with opening stock value
          await updateItem(item.id, {
            ...item,
            openingStock: quantity,
          });
        }
      }

      if (hasChanges) {
        alert("Opening stock saved successfully!");
        // Refresh data
        window.location.reload();
      } else {
        alert("No new changes to save!");
      }
    } catch (err) {
      setError("Failed to save opening stock");
      console.error("Error saving opening stock:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const resetData = {};
    items.forEach((item) => {
      resetData[item.id] = stockStatus[item.id] ? formData[item.id] : "";
    });
    setFormData(resetData);
  };

  // Filter items based on search term and status
  const filteredItems = items.filter((item) => {
    const itemName = item.name.toLowerCase();
    const isSet = stockStatus[item.id];
    
    const matchesSearch = itemName.includes(searchTerm.toLowerCase());
    const matchesStatus = 
      selectedStatusFilter === "all" || 
      (selectedStatusFilter === "pending" && !isSet) ||
      (selectedStatusFilter === "set" && isSet);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="opening-stock-container">
        <p>Loading items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="opening-stock-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="opening-stock-container">
      <div className="opening-stock-header">
        <div className="header-content">
          <h1>Opening Stock Entry</h1>
          <p className="header-subtitle">Set the initial stock quantity for each item</p>
        </div>
      </div>

      <div className="opening-stock-form-section">
        <div className="form-header">
          <h2>Stock Entry Form</h2>
          <p className="form-description">Enter the opening stock quantity for items that don't have opening stock set</p>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ marginBottom: "16px" }}>
            <input
              type="text"
              placeholder="Search by item name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => setSelectedStatusFilter("all")}
              style={{
                padding: "8px 16px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                backgroundColor: selectedStatusFilter === "all" ? "#1976d2" : "#fff",
                color: selectedStatusFilter === "all" ? "#fff" : "#333",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: selectedStatusFilter === "all" ? "600" : "500",
                transition: "all 0.2s ease",
              }}
            >
              All Items
            </button>
            <button
              onClick={() => setSelectedStatusFilter("pending")}
              style={{
                padding: "8px 16px",
                border: "1px solid #ff9800",
                borderRadius: "6px",
                backgroundColor: selectedStatusFilter === "pending" ? "#ff9800" : "#fff",
                color: selectedStatusFilter === "pending" ? "#fff" : "#ff9800",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: selectedStatusFilter === "pending" ? "600" : "500",
                transition: "all 0.2s ease",
              }}
            >
              Pending
            </button>
            <button
              onClick={() => setSelectedStatusFilter("set")}
              style={{
                padding: "8px 16px",
                border: "1px solid #4caf50",
                borderRadius: "6px",
                backgroundColor: selectedStatusFilter === "set" ? "#4caf50" : "#fff",
                color: selectedStatusFilter === "set" ? "#fff" : "#4caf50",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: selectedStatusFilter === "set" ? "600" : "500",
                transition: "all 0.2s ease",
              }}
            >
              Already Set
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table opening-stock-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Unit</th>
                <th className="center">Opening Stock Quantity</th>
                <th className="center">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td className="item-name">{item.name}</td>
                    <td className="unit-cell">{item.unit}</td>
                    <td className="input-cell">
                      <input
                        type="number"
                        value={formData[item.id] || ""}
                        onChange={(e) => handleChange(e, item.id)}
                        placeholder="Enter quantity"
                        className="stock-input"
                        min="0"
                        disabled={stockStatus[item.id]}
                      />
                    </td>
                    <td className="center">
                      {stockStatus[item.id] ? (
                        <span className="status-badge status-ok">Already Set</span>
                      ) : (
                        <span className="status-badge status-pending">Pending</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="center">No items available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="form-actions">
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            <AppIcon name="check" />
            {saving ? "Saving..." : "Save Opening Stock"}
          </button>
          <button className="btn-reset" onClick={handleReset} disabled={saving}>
            <AppIcon name="close" />
            Clear Form
          </button>
        </div>
      </div>

      <div className="info-section">
        <div className="info-card">
          <h3><AppIcon name="instructions" /> Instructions</h3>
          <ul>
            <li>Items marked as "Already Set" cannot be edited as opening stock was set during item creation</li>
            <li>Items marked as "Pending" need opening stock to be entered</li>
            <li>Enter the initial stock quantity for pending items</li>
            <li>Quantities must be non-negative numbers</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default OpeningStock;
