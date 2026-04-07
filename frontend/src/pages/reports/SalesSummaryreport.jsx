import { useState } from "react";
import AppIcon from "../../components/common/AppIcon";
import "../../styles/sales-summary.css";

function SalesSummaryReport() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activeTab, setActiveTab] = useState("table");
  const [showReport, setShowReport] = useState(false);
  const [reportActiveTab, setReportActiveTab] = useState("details");

  // Assume GST is enabled (can come from business setup later)
  const isGSTEnabled = true;

  // Enhanced sample data with taxable value, GSTIN, status, and items detail
  const salesData = [
    {
      id: 1,
      date: "20-08-2024",
      invoiceNo: "SI-001",
      customer: "ABC Traders",
      customerGSTIN: "27AABCL7890A1Z0",
      taxableValue: 20000,
      gst: 3600,
      totalAmount: 23600,
      status: "Paid",
      items: 5,
      itemDetails: [
        { name: "Rice Premium", qty: 100, unit: "Kg", taxableValue: 10000, gst: 1800 },
        { name: "Wheat Flour", qty: 50, unit: "Kg", taxableValue: 5000, gst: 900 },
        { name: "Sugar", qty: 30, unit: "Kg", taxableValue: 3000, gst: 540 },
        { name: "Oil", qty: 20, unit: "Ltr", taxableValue: 1500, gst: 270 },
        { name: "Salt", qty: 10, unit: "Kg", taxableValue: 500, gst: 90 },
      ],
    },
    {
      id: 2,
      date: "21-08-2024",
      invoiceNo: "SI-002",
      customer: "XYZ Stores",
      customerGSTIN: "18AAXYZ1234B1Z0",
      taxableValue: 15000,
      gst: 2700,
      totalAmount: 17700,
      status: "Paid",
      items: 3,
      itemDetails: [
        { name: "Rice Premium", qty: 75, unit: "Kg", taxableValue: 7500, gst: 1350 },
        { name: "Oil", qty: 30, unit: "Ltr", taxableValue: 5000, gst: 900 },
        { name: "Spices Mix", qty: 15, unit: "Kg", taxableValue: 2500, gst: 450 },
      ],
    },
    {
      id: 3,
      date: "22-08-2024",
      invoiceNo: "SI-003",
      customer: "ABC Traders",
      customerGSTIN: "27AABCL7890A1Z0",
      taxableValue: 26000,
      gst: 4680,
      totalAmount: 30680,
      status: "Unpaid",
      items: 8,
      itemDetails: [
        { name: "Rice Premium", qty: 150, unit: "Kg", taxableValue: 15000, gst: 2700 },
        { name: "Wheat Flour", qty: 80, unit: "Kg", taxableValue: 8000, gst: 1440 },
        { name: "Oil", qty: 25, unit: "Ltr", taxableValue: 3000, gst: 540 },
      ],
    },
    {
      id: 4,
      date: "23-08-2024",
      invoiceNo: "SI-004",
      customer: "Global Supplies",
      customerGSTIN: "06AAPD7890K2Z0",
      taxableValue: 18000,
      gst: 3240,
      totalAmount: 21240,
      status: "Paid",
      items: 4,
      itemDetails: [
        { name: "Sugar", qty: 100, unit: "Kg", taxableValue: 9000, gst: 1620 },
        { name: "Salt", qty: 50, unit: "Kg", taxableValue: 5000, gst: 900 },
        { name: "Spices Mix", qty: 20, unit: "Kg", taxableValue: 4000, gst: 720 },
      ],
    },
    {
      id: 5,
      date: "24-08-2024",
      invoiceNo: "SI-005",
      customer: "Tech Solutions",
      customerGSTIN: "29AAPCS6890Q1Z0",
      taxableValue: 36000,
      gst: 6480,
      totalAmount: 42480,
      status: "Paid",
      items: 12,
      itemDetails: [
        { name: "Rice Premium", qty: 200, unit: "Kg", taxableValue: 20000, gst: 3600 },
        { name: "Oil", qty: 40, unit: "Ltr", taxableValue: 10000, gst: 1800 },
        { name: "Wheat Flour", qty: 60, unit: "Kg", taxableValue: 6000, gst: 1080 },
      ],
    },
  ];

  // Calculate totals
  const totalTaxableValue = salesData.reduce((sum, item) => sum + item.taxableValue, 0);
  const totalGST = salesData.reduce((sum, item) => sum + item.gst, 0);
  const totalAmount = salesData.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalInvoices = salesData.length;

  // Calculate item-wise summary
  const getItemWiseSummary = () => {
    const itemMap = {};
    salesData.forEach((invoice) => {
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
    <div className="sales-summary-container">
      {/* HEADER */}
      <div className="sales-summary-header">
        <div>
          <h1 className="sales-summary-title">Sales Summary Report</h1>
          <p className="sales-summary-subtitle">View and analyze your sales data</p>
        </div>
        <div className="sales-summary-badge"><AppIcon name="chart" /> Report</div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="sales-summary-grid">
        <div className="summary-card">
          <div className="summary-icon"><AppIcon name="money" /></div>
          <div className="summary-content">
            <p className="summary-label">Total Amount</p>
            <p className="summary-value">₹{totalAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon"><AppIcon name="chartLine" /></div>
          <div className="summary-content">
            <p className="summary-label">Total GST</p>
            <p className="summary-value">₹{totalGST.toLocaleString()}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon"><AppIcon name="clipboard" /></div>
          <div className="summary-content">
            <p className="summary-label">Total Invoices</p>
            <p className="summary-value">{totalInvoices}</p>
          </div>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div className="sales-filter-card">
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
      <div className="sales-actions">
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
      <div className="sales-tabs">
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
        <div className="sales-table-card">
          <div className="table-responsive">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Invoice No</th>
                  <th>Customer</th>
                  <th className="col-items">Items</th>
                  <th className="col-amount">Total Amount</th>
                  <th className="col-gst">GST</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((row) => (
                  <tr key={row.id}>
                    <td className="td-date">{row.date}</td>
                    <td className="td-invoice">{row.invoiceNo}</td>
                    <td className="td-customer">{row.customer}</td>
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
        <div className="sales-summary-view">
          <div className="summary-stat">
            <h3>Period Summary</h3>
            <div className="stat-rows">
              <div className="stat-row">
                <span>Number of Invoices:</span>
                <strong>{totalInvoices}</strong>
              </div>
              <div className="stat-row">
                <span>Total Sales Amount:</span>
                <strong>₹{totalAmount.toLocaleString()}</strong>
              </div>
              <div className="stat-row">
                <span>Total GST Collected:</span>
                <strong>₹{totalGST.toLocaleString()}</strong>
              </div>
              <div className="stat-row">
                <span>Average Invoice Value:</span>
                <strong>₹{Math.round(totalAmount / totalInvoices).toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div className="summary-stat">
            <h3>Customer Summary</h3>
            <div className="stat-rows">
              {[...new Set(salesData.map((item) => item.customer))].map((customer) => {
                const customerTotal = salesData
                  .filter((item) => item.customer === customer)
                  .reduce((sum, item) => sum + item.totalAmount, 0);
                return (
                  <div key={customer} className="stat-row">
                    <span>{customer}</span>
                    <strong>₹{customerTotal.toLocaleString()}</strong>
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
              <h1 className="report-title">Sales Report</h1>
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
              <div className="report-card-label">No. of Invoices</div>
              <div className="report-card-value">{totalInvoices}</div>
            </div>
            
            <div className="report-card">
              <div className="report-card-label">Total Sales (Before Tax)</div>
              <div className="report-card-value">₹{totalTaxableValue.toLocaleString()}</div>
            </div>
            
            {isGSTEnabled && (
              <div className="report-card">
                <div className="report-card-label">Total GST Collected</div>
                <div className="report-card-value">₹{totalGST.toLocaleString()}</div>
              </div>
            )}
            
            <div className="report-card">
              <div className="report-card-label">Total Sales (Gross)</div>
              <div className="report-card-value">₹{totalAmount.toLocaleString()}</div>
            </div>
          </div>

          {/* REPORT TABS */}
          <div className="report-tabs">
            <button
              className={`report-tab-button ${reportActiveTab === "details" ? "active" : ""}`}
              onClick={() => setReportActiveTab("details")}
            >
              <AppIcon name="clipboard" /> Invoice Details
            </button>
            <button
              className={`report-tab-button ${reportActiveTab === "itemwise" ? "active" : ""}`}
              onClick={() => setReportActiveTab("itemwise")}
            >
              <AppIcon name="inventory" /> Item-wise Summary
            </button>
          </div>

          {/* INVOICE DETAILS TAB */}
          {reportActiveTab === "details" && (
            <div className="report-table-section">
              <h2 className="report-section-title">Invoice Details</h2>
              <div className="report-table-wrapper">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Invoice Date</th>
                      <th>Invoice No.</th>
                      <th>Customer Name</th>
                      {isGSTEnabled && <th>Customer GSTIN</th>}
                      <th>Taxable Value</th>
                      {isGSTEnabled && <th>GST Amount</th>}
                      <th>Invoice Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.map((row) => (
                      <tr key={row.id}>
                        <td>{row.date}</td>
                        <td><strong>{row.invoiceNo}</strong></td>
                        <td>{row.customer}</td>
                        {isGSTEnabled && <td>{row.customerGSTIN}</td>}
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
                  <span className="summary-label">Total Invoices:</span>
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
              <h2 className="report-section-title">Item-wise Sales Summary</h2>
              <div className="report-table-wrapper">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Qty Sold</th>
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

export default SalesSummaryReport;
