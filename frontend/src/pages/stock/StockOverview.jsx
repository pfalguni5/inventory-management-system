import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AppIcon from "../../components/common/AppIcon";
import { getAllStock, getLowStockItems } from "../../services/StockService";
import { getAllItems } from "../../services/itemService";
import "../../styles/stock.css";

function StockOverview() {
  const navigate = useNavigate();
  const [stockData, setStockData] = useState([]);
  const [itemsMap, setItemsMap] = useState({});
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all stock and items in parallel
        const [allStock, allItems, lowStock] = await Promise.all([
          getAllStock(),
          getAllItems(),
          getLowStockItems(),
        ]);

        // Create a map of items by ID for quick lookup
        const itemMap = {};
        allItems.data?.forEach((item) => {
          itemMap[item.id] = item;
        });

        setItemsMap(itemMap);
        setStockData(allStock);
        setLowStockCount(lowStock.length);
      } catch (err) {
        setError("Failed to load stock data");
        console.error("Error fetching stock data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats
  const totalItems = stockData.length;
  const inStockItems = stockData.filter((stock) => {
    return stock.quantity > 0;
  }).length;

  const getItemName = (itemId) => {
    return itemsMap[itemId]?.name || `Item #${itemId}`;
  };

  const getItemUnit = (itemId) => {
    return itemsMap[itemId]?.unit || "-";
  };

  const getStockStatus = (stockItem) => {
    const item = itemsMap[stockItem.itemId];
    const minLevel = item?.lowStockAlert || 0;
    const currentStock = stockItem.quantity || 0;

    if (currentStock <= 0) {
      return { status: "Out of Stock", className: "status-out-of-stock" };
    } else if (currentStock <= minLevel) {
      return { status: "Low Stock", className: "status-low" };
    } else {
      return { status: "In Stock", className: "status-ok" };
    }
  };

  // Filter stock data based on search term and status
  const filteredStockData = stockData.filter((stock) => {
    const itemName = getItemName(stock.itemId).toLowerCase();
    const statusInfo = getStockStatus(stock);
    
    const matchesSearch = itemName.includes(searchTerm.toLowerCase());
    const matchesStatus = 
      selectedStatus === "all" || 
      statusInfo.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="stock-overview-container">
        <p>Loading stock data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stock-overview-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="stock-overview-container">
      <div className="stock-page-header">
        <div className="header-content">
          <h1>Stock Overview</h1>
          <p className="header-subtitle">Monitor and manage your inventory stock levels</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => navigate("/app/stock/opening")}>
            <span className="btn-icon"><AppIcon name="openingStock" /></span>
            Opening Stock
          </button>
          <button className="btn-secondary" onClick={() => navigate("/app/stock/adjustment")}>
            <span className="btn-icon"><AppIcon name="stockAdjustment" /></span>
            Adjust Stock
          </button>
        </div>
      </div>

      <div className="stock-stats">
        <div className="stat-card">
          <div className="stat-icon"><AppIcon name="chart" /></div>
          <div className="stat-content">
            <p className="stat-label">Total Items</p>
            <p className="stat-value">{totalItems}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><AppIcon name="warning" /></div>
          <div className="stat-content">
            <p className="stat-label">Low Stock Items</p>
            <p className="stat-value">{lowStockCount}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><AppIcon name="success" /></div>
          <div className="stat-content">
            <p className="stat-label">In Stock</p>
            <p className="stat-value">{inStockItems}</p>
          </div>
        </div>
      </div>

      <div className="table-section">
        <div className="table-header">
          <h2>Item Stock Details</h2>
          <p className="table-description">Current stock levels and status for all items</p>
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
              onClick={() => setSelectedStatus("all")}
              style={{
                padding: "8px 16px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                backgroundColor: selectedStatus === "all" ? "#1976d2" : "#fff",
                color: selectedStatus === "all" ? "#fff" : "#333",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: selectedStatus === "all" ? "600" : "500",
                transition: "all 0.2s ease",
              }}
            >
              All Items
            </button>
            <button
              onClick={() => setSelectedStatus("In Stock")}
              style={{
                padding: "8px 16px",
                border: "1px solid #4caf50",
                borderRadius: "6px",
                backgroundColor: selectedStatus === "In Stock" ? "#4caf50" : "#fff",
                color: selectedStatus === "In Stock" ? "#fff" : "#4caf50",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: selectedStatus === "In Stock" ? "600" : "500",
                transition: "all 0.2s ease",
              }}
            >
              In Stock
            </button>
            <button
              onClick={() => setSelectedStatus("Low Stock")}
              style={{
                padding: "8px 16px",
                border: "1px solid #ff9800",
                borderRadius: "6px",
                backgroundColor: selectedStatus === "Low Stock" ? "#ff9800" : "#fff",
                color: selectedStatus === "Low Stock" ? "#fff" : "#ff9800",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: selectedStatus === "Low Stock" ? "600" : "500",
                transition: "all 0.2s ease",
              }}
            >
              Low Stock
            </button>
            <button
              onClick={() => setSelectedStatus("Out of Stock")}
              style={{
                padding: "8px 16px",
                border: "1px solid #f44336",
                borderRadius: "6px",
                backgroundColor: selectedStatus === "Out of Stock" ? "#f44336" : "#fff",
                color: selectedStatus === "Out of Stock" ? "#fff" : "#f44336",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: selectedStatus === "Out of Stock" ? "600" : "500",
                transition: "all 0.2s ease",
              }}
            >
              Out of Stock
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table stock-table">
            <thead>
              <tr>
                <th className="center">Item Name</th>
                <th className="center">Unit</th>
                <th className="center">Current Stock</th>
                <th className="center">Min Level</th>
                <th className="center">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredStockData.length > 0 ? (
                filteredStockData.map((stock) => {
                  const statusInfo = getStockStatus(stock);
                  return (
                    <tr key={stock.itemId}>
                      <td className="item-name">{getItemName(stock.itemId)}</td>
                      <td>{getItemUnit(stock.itemId)}</td>
                      <td className="center amount">{stock.quantity || 0}</td>
                      <td className="center amount">{itemsMap[stock.itemId]?.lowStockAlert || 0}</td>
                      <td className="center">
                        <span className={`status-badge ${statusInfo.className}`}>
                          {statusInfo.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="center">No stock data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StockOverview;
