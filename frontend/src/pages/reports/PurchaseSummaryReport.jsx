import { useState } from "react";
import AppIcon from "../../components/common/AppIcon";
import "../../styles/purchase-summary.css";

function PurchaseSummaryReport() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activeTab, setActiveTab] = useState("table");
  const [showReport, setShowReport] = useState(false);
  const [reportActiveTab, setReportActiveTab] = useState("details");

  // Assume GST is enabled (can come from business setup later)
  const isGSTEnabled = true;

  // Enhanced sample data with taxable value, GSTIN, status, and items detail
  const purchaseData = [
    {
      id: 1,
      date: "18-08-2024",
      invoiceNo: "PI-101",
      supplier: "Rice Suppliers",
      supplierGSTIN: "27ABCDE1234F1Z0",
      taxableValue: 9600,
      gst: 1728,
      totalAmount: 11328,
      status: "Paid",
      items: 3,
      itemDetails: [
        { name: "Rice Grade A", qty: 100, unit: "Kg", taxableValue: 5000, gst: 900 },
        { name: "Rice Grade B", qty: 50, unit: "Kg", taxableValue: 3000, gst: 540 },
        { name: "Basmati Rice", qty: 30, unit: "Kg", taxableValue: 1600, gst: 288 },
      ],
    },
    {
      id: 2,
      date: "19-08-2024",
      invoiceNo: "PI-102",
      supplier: "Sugar Traders",
      supplierGSTIN: "18AAXYZ7890B1Z0",
      taxableValue: 7600,
      gst: 1368,
      totalAmount: 8968,
      status: "Paid",
      items: 2,
      itemDetails: [
        { name: "Sugar White", qty: 80, unit: "Kg", taxableValue: 4000, gst: 720 },
        { name: "Sugar Brown", qty: 40, unit: "Kg", taxableValue: 3600, gst: 648 },
      ],
    },
    {
      id: 3,
      date: "20-08-2024",
      invoiceNo: "PI-103",
      supplier: "Oil Mills",
      supplierGSTIN: "06AAPD5678C1Z0",
      taxableValue: 22400,
      gst: 4032,
      totalAmount: 26432,
      status: "Unpaid",
      items: 6,
      itemDetails: [
        { name: "Coconut Oil", qty: 100, unit: "Ltr", taxableValue: 10000, gst: 1800 },
        { name: "Mustard Oil", qty: 80, unit: "Ltr", taxableValue: 8000, gst: 1440 },
        { name: "Sunflower Oil", qty: 50, unit: "Ltr", taxableValue: 4400, gst: 792 },
      ],
    },
    {
      id: 4,
      date: "21-08-2024",
      invoiceNo: "PI-104",
      supplier: "Rice Suppliers",
      supplierGSTIN: "27ABCDE1234F1Z0",
      taxableValue: 12400,
      gst: 2232,
      totalAmount: 14632,
      status: "Paid",
      items: 4,
      itemDetails: [
        { name: "Rice Grade A", qty: 150, unit: "Kg", taxableValue: 7500, gst: 1350 },
        { name: "Basmati Rice", qty: 60, unit: "Kg", taxableValue: 3200, gst: 576 },
        { name: "Arborio Rice", qty: 40, unit: "Kg", taxableValue: 1700, gst: 306 },
      ],
    },
    {
      id: 5,
      date: "22-08-2024",
      invoiceNo: "PI-105",
      supplier: "Spice Trading Co",
      supplierGSTIN: "29AAPCS9876D1Z0",
      taxableValue: 17600,
      gst: 3168,
      totalAmount: 20768,
      status: "Paid",
      items: 5,
      itemDetails: [
        { name: "Turmeric Powder", qty: 50, unit: "Kg", taxableValue: 5000, gst: 900 },
        { name: "Chili Powder", qty: 40, unit: "Kg", taxableValue: 4000, gst: 720 },
        { name: "Coriander Powder", qty: 30, unit: "Kg", taxableValue: 3600, gst: 648 },
        { name: "Mixed Spices", qty: 20, unit: "Kg", taxableValue: 5000, gst: 900 },
      ],
    },
  ];

  // Calculate totals
  const totalTaxableValue = purchaseData.reduce((sum, item) => sum + item.taxableValue, 0);
  const totalGST = purchaseData.reduce((sum, item) => sum + item.gst, 0);
  const totalAmount = purchaseData.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalInvoices = purchaseData.length;

  // Calculate item-wise summary
  const getItemWiseSummary = () => {
    const itemMap = {};
    purchaseData.forEach((invoice) => {
      invoice.itemDetails.forEach((item) => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = {
            name: item.name,
            totalQty: 0,
            totalTaxableValue: 0,
            totalGST: 0,
            unit: item.unit,
          };
        }
        itemMap[item.name].totalQty += item.qty;
        itemMap[item.name].totalTaxableValue += item.taxableValue;
        itemMap[item.name].totalGST += item.gst;
      });
    });
    return Object.values(itemMap);
  };

  const itemWiseSummary = getItemWiseSummary();

  // Get business details (assume from business setup)
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
    <div className="purchase-summary-container">
      {/* HEADER */}
      <div className="purchase-summary-header">
        <div>
          <h1 className="purchase-summary-title">Purchase Summary Report</h1>
          <p className="purchase-summary-subtitle">View and analyze your purchase data</p>
        </div>
        <div className="purchase-summary-badge"><AppIcon name="chart" /> Report</div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="purchase-summary-grid">
        <div className="summary-card">
          <div className="summary-icon"><AppIcon name="money" /></div>
          <div className="summary-content">
            <p className="summary-label">Total Amount</p>
            <p className="summary-value">₹{totalAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon"><AppIcon name="chart" /></div>
          <div className="summary-content">
            <p className="summary-label">Total GST</p>
            <p className="summary-value">₹{totalGST.toLocaleString()}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon"><AppIcon name="receipt" /></div>
          <div className="summary-content">
            <p className="summary-label">Total Invoices</p>
            <p className="summary-value">{totalInvoices}</p>
          </div>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div className="purchase-filter-card">
        <div className="filter-header">
          <h2 className="filter-title"><AppIcon name="search" /> Filter Data</h2>
        </div>

        <div className="filter-row">
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

          <div className="filter-actions">
            <button className="btn-primary">Apply Filters</button>
            <button className="btn-secondary">Reset</button>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="purchase-actions">
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

      {/* TABS */}
      <div className="purchase-tabs">
        <button
          className={`tab-button ${activeTab === "table" ? "active" : ""}`}
          onClick={() => setActiveTab("table")}
        >
          <AppIcon name="table" /> Table View
        </button>
        <button
          className={`tab-button ${activeTab === "summary" ? "active" : ""}`}
          onClick={() => setActiveTab("summary")}
        >
          <AppIcon name="chart" /> Summary
        </button>
      </div>

      {/* TABLE VIEW */}
      {activeTab === "table" && (
        <div className="purchase-table-card">
          <div className="table-responsive">
            <table className="purchase-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Invoice No</th>
                  <th>Supplier</th>
                  <th className="col-items">Items</th>
                  <th className="col-amount">Total Amount</th>
                  <th className="col-gst">GST</th>
                </tr>
              </thead>
              <tbody>
                {purchaseData.map((row) => (
                  <tr key={row.id}>
                    <td className="td-date">{row.date}</td>
                    <td className="td-invoice">{row.invoiceNo}</td>
                    <td className="td-supplier">{row.supplier}</td>
                    <td className="td-items">
                      <span className="badge-items">{row.items}</span>
                    </td>
                    <td className="td-amount">₹{row.totalAmount.toLocaleString()}</td>
                    <td className="td-gst">₹{row.gst.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER */}
          <div className="table-footer">
            <div className="footer-stat">
              <span className="footer-label">Total Records:</span>
              <span className="footer-value">{totalInvoices}</span>
            </div>
            <div className="footer-stat">
              <span className="footer-label">Total Amount:</span>
              <span className="footer-value">₹{totalAmount.toLocaleString()}</span>
            </div>
            <div className="footer-stat">
              <span className="footer-label">Total GST:</span>
              <span className="footer-value">₹{totalGST.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* SUMMARY VIEW */}
      {activeTab === "summary" && (
        <div className="purchase-summary-view">
          <div className="summary-stat">
            <h3>Period Summary</h3>
            <div className="stat-rows">
              <div className="stat-row">
                <span>Number of Invoices:</span>
                <strong>{totalInvoices}</strong>
              </div>
              <div className="stat-row">
                <span>Total Purchase Amount:</span>
                <strong>₹{totalAmount.toLocaleString()}</strong>
              </div>
              <div className="stat-row">
                <span>Total GST Paid:</span>
                <strong>₹{totalGST.toLocaleString()}</strong>
              </div>
              <div className="stat-row">
                <span>Average Invoice Value:</span>
                <strong>₹{Math.round(totalAmount / totalInvoices).toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div className="summary-stat">
            <h3>Supplier Summary</h3>
            <div className="stat-rows">
              {[...new Set(purchaseData.map((item) => item.supplier))].map((supplier) => {
                const supplierTotal = purchaseData
                  .filter((item) => item.supplier === supplier)
                  .reduce((sum, item) => sum + item.totalAmount, 0);
                return (
                  <div key={supplier} className="stat-row">
                    <span>{supplier}</span>
                    <strong>₹{supplierTotal.toLocaleString()}</strong>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========== BUSINESS REPORT VIEW (READ-ONLY) ========== */}
      {showReport && (
        <div className="report-container">
          {/* REPORT HEADER */}
          <div className="report-header">
            <div className="report-header-content">
              <h1 className="report-title">Purchase Report</h1>
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
              <div className="report-card-label">No. of Purchases</div>
              <div className="report-card-value">{totalInvoices}</div>
            </div>
            
            <div className="report-card">
              <div className="report-card-label">Total Purchase Value (Before Tax)</div>
              <div className="report-card-value">₹{totalTaxableValue.toLocaleString()}</div>
            </div>
            
            {isGSTEnabled && (
              <div className="report-card">
                <div className="report-card-label">Total GST on Purchases</div>
                <div className="report-card-value">₹{totalGST.toLocaleString()}</div>
              </div>
            )}
            
            <div className="report-card">
              <div className="report-card-label">Total Purchase Amount (Gross)</div>
              <div className="report-card-value">₹{totalAmount.toLocaleString()}</div>
            </div>
          </div>

          {/* REPORT TABS */}
          <div className="report-tabs">
            <button
              className={`report-tab-button ${reportActiveTab === "details" ? "active" : ""}`}
              onClick={() => setReportActiveTab("details")}
            >
              <AppIcon name="clipboard" /> Purchase Details
            </button>
            <button
              className={`report-tab-button ${reportActiveTab === "itemwise" ? "active" : ""}`}
              onClick={() => setReportActiveTab("itemwise")}
            >
              <AppIcon name="inventory" /> Item-wise Summary
            </button>
          </div>

          {/* PURCHASE DETAILS TAB */}
          {reportActiveTab === "details" && (
            <div className="report-table-section">
              <h2 className="report-section-title">Purchase Details</h2>
              <div className="report-table-wrapper">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Purchase Date</th>
                      <th>Supplier Name</th>
                      {isGSTEnabled && <th>Supplier GSTIN</th>}
                      <th>Invoice No.</th>
                      <th>Taxable Value</th>
                      {isGSTEnabled && <th>GST Amount</th>}
                      <th>Purchase Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseData.map((row) => (
                      <tr key={row.id}>
                        <td>{row.date}</td>
                        <td>{row.supplier}</td>
                        {isGSTEnabled && <td>{row.supplierGSTIN}</td>}
                        <td><strong>{row.invoiceNo}</strong></td>
                        <td className="amount">₹{row.taxableValue.toLocaleString()}</td>
                        {isGSTEnabled && <td className="amount">₹{row.gst.toLocaleString()}</td>}
                        <td className="amount"><strong>₹{row.totalAmount.toLocaleString()}</strong></td>
                        <td>
                          <span className={`status-badge status-${row.status.toLowerCase()}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* TABLE SUMMARY */}
              <div className="report-table-summary">
                <div className="summary-row">
                  <span className="summary-label">Total Purchases:</span>
                  <span className="summary-value">{totalInvoices}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Total Taxable Value:</span>
                  <span className="summary-value">₹{totalTaxableValue.toLocaleString()}</span>
                </div>
                {isGSTEnabled && (
                  <div className="summary-row">
                    <span className="summary-label">Total GST:</span>
                    <span className="summary-value">₹{totalGST.toLocaleString()}</span>
                  </div>
                )}
                <div className="summary-row grand-total">
                  <span className="summary-label">Grand Total:</span>
                  <span className="summary-value">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* ITEM-WISE SUMMARY TAB */}
          {reportActiveTab === "itemwise" && (
            <div className="report-table-section">
              <h2 className="report-section-title">Item-wise Purchase Summary</h2>
              <div className="report-table-wrapper">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Qty Purchased</th>
                      <th>Unit</th>
                      <th>Taxable Value</th>
                      {isGSTEnabled && <th>GST</th>}
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemWiseSummary.map((item, index) => (
                      <tr key={index}>
                        <td><strong>{item.name}</strong></td>
                        <td className="quantity">{item.totalQty}</td>
                        <td>{item.unit}</td>
                        <td className="amount">₹{item.totalTaxableValue.toLocaleString()}</td>
                        {isGSTEnabled && <td className="amount">₹{item.totalGST.toLocaleString()}</td>}
                        <td className="amount"><strong>₹{(item.totalTaxableValue + item.totalGST).toLocaleString()}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ITEM-WISE SUMMARY */}
              <div className="report-table-summary">
                <div className="summary-row">
                  <span className="summary-label">Total Taxable Value:</span>
                  <span className="summary-value">₹{totalTaxableValue.toLocaleString()}</span>
                </div>
                {isGSTEnabled && (
                  <div className="summary-row">
                    <span className="summary-label">Total GST:</span>
                    <span className="summary-value">₹{totalGST.toLocaleString()}</span>
                  </div>
                )}
                <div className="summary-row grand-total">
                  <span className="summary-label">Grand Total:</span>
                  <span className="summary-value">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* REPORT FOOTER */}
          <div className="report-footer">
            <p>This is a read-only report. Please verify the data before exporting.</p>
            <p className="report-footer-date">Printed: {new Date().toLocaleString('en-IN')}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PurchaseSummaryReport;
