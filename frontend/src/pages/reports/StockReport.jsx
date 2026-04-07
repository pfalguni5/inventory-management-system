import { useState } from "react";
import AppIcon from "../../components/common/AppIcon";
import "../../styles/stock-report.css";

function StockReport() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // Enhanced sample data with purchase prices and adjustments
  const stockData = [
    {
      id: 1,
      itemName: "Rice",
      sku: "RICE-001",
      unit: "Kg",
      openingStock: 100,
      purchasedQty: 50,
      soldQty: 30,
      adjustments: 0,
      closingStock: 120,
      purchasePrice: 50,
      reorderLevel: 50,
      minLevel: 25,
    },
    {
      id: 2,
      itemName: "Sugar",
      sku: "SUGAR-001",
      unit: "Kg",
      openingStock: 80,
      purchasedQty: 20,
      soldQty: 40,
      adjustments: 0,
      closingStock: 60,
      purchasePrice: 45,
      reorderLevel: 40,
      minLevel: 20,
    },
    {
      id: 3,
      itemName: "Oil",
      sku: "OIL-001",
      unit: "Liter",
      openingStock: 150,
      purchasedQty: 100,
      soldQty: 80,
      adjustments: 0,
      closingStock: 170,
      purchasePrice: 200,
      reorderLevel: 60,
      minLevel: 30,
    },
    {
      id: 4,
      itemName: "Wheat Flour",
      sku: "WHEAT-001",
      unit: "Kg",
      openingStock: 45,
      purchasedQty: 30,
      soldQty: 20,
      adjustments: 0,
      closingStock: 55,
      purchasePrice: 35,
      reorderLevel: 50,
      minLevel: 25,
    },
    {
      id: 5,
      itemName: "Salt",
      sku: "SALT-001",
      unit: "Kg",
      openingStock: 200,
      purchasedQty: 100,
      soldQty: 120,
      adjustments: 0,
      closingStock: 180,
      purchasePrice: 25,
      reorderLevel: 80,
      minLevel: 40,
    },
    {
      id: 6,
      itemName: "Pulses",
      sku: "PULSE-001",
      unit: "Kg",
      openingStock: 60,
      purchasedQty: 20,
      soldQty: 35,
      adjustments: 0,
      closingStock: 45,
      purchasePrice: 80,
      reorderLevel: 50,
      minLevel: 25,
    },
    {
      id: 7,
      itemName: "Spices Mix",
      sku: "SPICE-001",
      unit: "Kg",
      openingStock: 25,
      purchasedQty: 10,
      soldQty: 20,
      adjustments: 0,
      closingStock: 15,
      purchasePrice: 120,
      reorderLevel: 30,
      minLevel: 20,
    },
  ];

  // Calculate report metrics
  const totalInventoryValue = stockData.reduce((sum, item) => sum + (item.closingStock * item.purchasePrice), 0);
  const lowStockCount = stockData.filter((item) => item.closingStock <= item.reorderLevel).length;
  const averageStockValue = totalInventoryValue / stockData.length;
  const totalItems = stockData.length;

  // Calculate totals for old UI
  const totalOpening = stockData.reduce((sum, item) => sum + item.openingStock, 0);
  const totalInward = stockData.reduce((sum, item) => sum + item.purchasedQty, 0);
  const totalOutward = stockData.reduce((sum, item) => sum + item.soldQty, 0);
  const totalClosing = stockData.reduce((sum, item) => sum + item.closingStock, 0);

  // Filter low stock items
  const displayData = filterLowStock
    ? stockData.filter((item) => item.closingStock <= item.reorderLevel)
    : stockData;

  // Get business details
  const businessDetails = {
    name: "Your Business Name",
    gstin: "27AABCL7890A1Z0",
    address: "123 Business Street, City",
  };

  const handleExportExcel = () => {
    alert("Excel export functionality will be implemented");
  };

  const handleExportPDF = () => {
    alert("PDF export functionality will be implemented");
  };

  const handleShareToCA = () => {
    alert("Share to CA functionality will be implemented");
  };

  return (
    <div className="stock-report-container">
      {/* HEADER */}
      <div className="stock-report-header">
        <div>
          <h1 className="stock-report-title">Stock Report</h1>
          <p className="stock-report-subtitle">Item-wise inventory balance and movements</p>
        </div>
        <div className="stock-report-badge"><AppIcon name="inventory" /> Inventory</div>
      </div>

      {/* KEY METRICS */}
      <div className="stock-metrics-grid">
        <div className="metric-card">
          <div className="metric-icon"><AppIcon name="chart" /></div>
          <div className="metric-content">
            <p className="metric-label">Opening Stock</p>
            <p className="metric-value">{totalOpening.toLocaleString()}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon"><AppIcon name="arrowUp" /></div>
          <div className="metric-content">
            <p className="metric-label">Total Inward</p>
            <p className="metric-value">{totalInward.toLocaleString()}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon"><AppIcon name="arrowDown" /></div>
          <div className="metric-content">
            <p className="metric-label">Total Outward</p>
            <p className="metric-value">{totalOutward.toLocaleString()}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon"><AppIcon name="storage" /></div>
          <div className="metric-content">
            <p className="metric-label">Closing Stock</p>
            <p className="metric-value">{totalClosing.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* FILTER & ACTIONS */}
      <div className="stock-filter-section">
        <div className="stock-filter-card">
          <div className="filter-header">
            <h2 className="filter-title"><AppIcon name="search" /> Filter & Sort</h2>
          </div>

          <div className="filter-content">
            <div className="filter-group">
              <label className="filter-label">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
                <option value="name">Item Name</option>
                <option value="stock">Stock Level</option>
                <option value="sku">SKU</option>
              </select>
            </div>

            <div className="filter-checkbox">
              <input
                type="checkbox"
                id="lowStock"
                checked={filterLowStock}
                onChange={(e) => setFilterLowStock(e.target.checked)}
              />
              <label htmlFor="lowStock">Show only low stock items</label>
            </div>

            <div className="filter-actions">
              <button className="btn-primary">Apply Filters</button>
              <button className="btn-secondary">Reset</button>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="stock-actions">
          <button className="btn-view-report" onClick={() => setShowReport(!showReport)}>
            {showReport ? "Hide Report" : "View Report"}
          </button>
          <button className="btn-export" onClick={handleExportExcel}>
            <AppIcon name="exportExcel" /> Export Excel
          </button>
          <button className="btn-export" onClick={handleExportPDF}>
            <AppIcon name="exportPdf" /> Export PDF
          </button>
          <button className="btn-export" onClick={handleShareToCA}>
            Share to CA
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="stock-table-card">
        <div className="table-header">
          <h3 className="table-title">Item Stock Details</h3>
          <span className="table-count">{displayData.length} Items</span>
        </div>

        <div className="table-responsive">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Unit</th>
                <th>Opening Stock</th>
                <th>Purchased Qty</th>
                <th>Sold Qty</th>
                <th>Adjustments</th>
                <th>Closing Stock</th>
                <th>Stock Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((item) => {
                const status =
                  item.closingStock <= item.minLevel
                    ? "critical"
                    : item.closingStock <= item.reorderLevel
                    ? "low"
                    : "normal";
                const statusLabel =
                  status === "critical" ? "Critical" : status === "low" ? "Low Stock" : "Normal";
                const stockValue = item.closingStock * item.purchasePrice;

                return (
                  <tr key={item.id}>
                    <td className="td-itemname">{item.itemName}</td>
                    <td className="td-unit">{item.unit}</td>
                    <td className="td-number">{item.openingStock.toLocaleString()}</td>
                    <td className="td-inward">+{item.purchasedQty.toLocaleString()}</td>
                    <td className="td-outward">-{item.soldQty.toLocaleString()}</td>
                    <td className="td-adjustment">{item.adjustments >= 0 ? "+" : ""}{item.adjustments.toLocaleString()}</td>
                    <td className="td-closing">
                      <strong>{item.closingStock.toLocaleString()}</strong>
                    </td>
                    <td className="td-value">₹{stockValue.toLocaleString()}</td>
                    <td className="td-status">
                      <span className={`status-badge status-${status}`}>{statusLabel}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER */}
        <div className="table-footer">
          <div className="footer-stat">
            <span className="footer-label">Total Opening:</span>
            <span className="footer-value">{totalOpening.toLocaleString()}</span>
          </div>
          <div className="footer-stat">
            <span className="footer-label">Total Purchased:</span>
            <span className="footer-value">+{totalInward.toLocaleString()}</span>
          </div>
          <div className="footer-stat">
            <span className="footer-label">Total Sold:</span>
            <span className="footer-value">-{totalOutward.toLocaleString()}</span>
          </div>
          <div className="footer-stat">
            <span className="footer-label">Total Closing:</span>
            <span className="footer-value">{totalClosing.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ========== BUSINESS REPORT VIEW (READ-ONLY) ========== */}
      {showReport && (
        <div className="report-container">
          {/* REPORT HEADER */}
          <div className="report-header">
            <div className="report-header-content">
              <h1 className="report-title">Stock Report</h1>
              <p className="report-business-name">{businessDetails.name}</p>
              <p className="report-business-gstin">GSTIN: {businessDetails.gstin}</p>
              <p className="report-address">{businessDetails.address}</p>
            </div>
            <div className="report-meta">
              <p className="report-generated">Report Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
              {fromDate && toDate && (
                <p className="report-period">Period: {fromDate} to {toDate}</p>
              )}
            </div>
          </div>

          {/* REPORT SUMMARY CARDS */}
          <div className="report-summary-cards">
            <div className="report-card">
              <div className="report-card-label">Total Items in Inventory</div>
              <div className="report-card-value">{totalItems}</div>
            </div>
            
            <div className="report-card">
              <div className="report-card-label">Average Stock Value</div>
              <div className="report-card-value">₹{Math.round(averageStockValue).toLocaleString()}</div>
            </div>
            
            <div className="report-card">
              <div className="report-card-label">Low Stock Items Count</div>
              <div className="report-card-value">{lowStockCount}</div>
            </div>
            
            <div className="report-card">
              <div className="report-card-label">Total Inventory Value</div>
              <div className="report-card-value">₹{totalInventoryValue.toLocaleString()}</div>
            </div>
          </div>

          {/* REPORT TABLE SECTION */}
          <div className="report-table-section">
            <h2 className="report-section-title">Item Stock Details</h2>
            <div className="report-table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Unit</th>
                    <th>Opening Stock</th>
                    <th>Purchased Qty</th>
                    <th>Sold Qty</th>
                    <th>Adjustments</th>
                    <th>Closing Stock</th>
                    <th>Stock Value</th>
                  </tr>
                </thead>
                <tbody>
                  {stockData.map((item) => {
                    const stockValue = item.closingStock * item.purchasePrice;
                    return (
                      <tr key={item.id}>
                        <td><strong>{item.itemName}</strong></td>
                        <td>{item.unit}</td>
                        <td className="amount">{item.openingStock.toLocaleString()}</td>
                        <td className="amount">+{item.purchasedQty.toLocaleString()}</td>
                        <td className="amount">-{item.soldQty.toLocaleString()}</td>
                        <td className="amount">{item.adjustments >= 0 ? "+" : ""}{item.adjustments.toLocaleString()}</td>
                        <td className="amount"><strong>{item.closingStock.toLocaleString()}</strong></td>
                        <td className="amount">₹{stockValue.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* TABLE SUMMARY */}
            <div className="report-table-summary">
              <div className="summary-row">
                <span className="summary-label">Total Opening Stock:</span>
                <span className="summary-value">{totalOpening.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Total Purchased:</span>
                <span className="summary-value">{totalInward.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Total Sold:</span>
                <span className="summary-value">{totalOutward.toLocaleString()}</span>
              </div>
              <div className="summary-row grand-total">
                <span className="summary-label">Total Closing Stock:</span>
                <span className="summary-value">{totalClosing.toLocaleString()}</span>
              </div>
              <div className="summary-row grand-total">
                <span className="summary-label">Total Inventory Value:</span>
                <span className="summary-value">₹{totalInventoryValue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* REPORT FOOTER */}
          <div className="report-footer">
            <p>This is a read-only report. Please verify the data before exporting.</p>
            <p className="report-footer-date">Printed: {new Date().toLocaleString('en-IN')}</p>
          </div>
        </div>
      )}

      {/* INFO SECTION */}
      <div className="stock-info-section">
        <div className="info-card">
          <h3 className="info-title"><AppIcon name="clipboard" /> Stock Status Guide</h3>
          <div className="info-items">
            <div className="info-item">
              <span className="status-badge status-normal">Normal</span>
              <span>Stock above reorder level</span>
            </div>
            <div className="info-item">
              <span className="status-badge status-low">Low Stock</span>
              <span>Stock between minimum and reorder level</span>
            </div>
            <div className="info-item">
              <span className="status-badge status-critical">Critical</span>
              <span>Stock below minimum level - immediate action needed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockReport;
