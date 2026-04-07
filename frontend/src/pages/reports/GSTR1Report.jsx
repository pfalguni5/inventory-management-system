import { useState } from "react";
import AppIcon from "../../components/common/AppIcon";
import "../../styles/gstr1-report.css";

function GSTR1Report() {
  const [month, setMonth] = useState("");
  const [activeTab, setActiveTab] = useState("invoice");
  const [showReport, setShowReport] = useState(false);

  // Sample data for GSTR-1
  const gstr1Data = [
    {
      id: 1,
      invoiceNo: "SI-001",
      date: "20-08-2024",
      customer: "ABC Traders",
      state: "KA",
      type: "B2B",
      taxableValue: 20000,
      cgst: 1800,
      sgst: 1800,
      igst: 0,
      totalGST: 3600,
      totalWithGST: 23600,
    },
    {
      id: 2,
      invoiceNo: "SI-002",
      date: "22-08-2024",
      customer: "XYZ Stores",
      state: "TN",
      type: "B2B",
      taxableValue: 35000,
      cgst: 3150,
      sgst: 3150,
      igst: 0,
      totalGST: 6300,
      totalWithGST: 41300,
    },
    {
      id: 3,
      invoiceNo: "SI-003",
      date: "25-08-2024",
      customer: "Global Supplies",
      state: "DL",
      type: "Exports",
      taxableValue: 50000,
      cgst: 0,
      sgst: 0,
      igst: 9000,
      totalGST: 9000,
      totalWithGST: 59000,
    },
    {
      id: 4,
      invoiceNo: "SI-004",
      date: "27-08-2024",
      customer: "Tech Solutions",
      state: "MH",
      type: "B2C",
      taxableValue: 45000,
      cgst: 4050,
      sgst: 4050,
      igst: 0,
      totalGST: 8100,
      totalWithGST: 53100,
    },
    {
      id: 5,
      invoiceNo: "SI-005",
      date: "28-08-2024",
      customer: "ABC Traders",
      state: "KA",
      type: "B2B",
      taxableValue: 28000,
      cgst: 2520,
      sgst: 2520,
      igst: 0,
      totalGST: 5040,
      totalWithGST: 33040,
    },
  ];

  // HSN/SAC Summary Data
  const hsnSacData = [
    {
      id: 1,
      hsnSac: "1001",
      itemName: "Rice",
      totalQty: 150,
      unit: "Kg",
      taxableValue: 45000,
      gstRate: 5,
      cgst: 2250,
      sgst: 2250,
      igst: 0,
    },
    {
      id: 2,
      hsnSac: "1002",
      itemName: "Wheat Flour",
      totalQty: 200,
      unit: "Kg",
      taxableValue: 40000,
      gstRate: 5,
      cgst: 2000,
      sgst: 2000,
      igst: 0,
    },
    {
      id: 3,
      hsnSac: "2101",
      itemName: "Premium Coffee",
      totalQty: 50,
      unit: "Kg",
      taxableValue: 38000,
      gstRate: 18,
      cgst: 3420,
      sgst: 3420,
      igst: 0,
    },
    {
      id: 4,
      hsnSac: "1005",
      itemName: "Spices Mix",
      totalQty: 100,
      unit: "Kg",
      taxableValue: 25000,
      gstRate: 5,
      cgst: 1250,
      sgst: 1250,
      igst: 0,
    },
    {
      id: 5,
      hsnSac: "9999",
      itemName: "Inter-state Supply",
      totalQty: 75,
      unit: "Units",
      taxableValue: 30000,
      gstRate: 18,
      cgst: 0,
      sgst: 0,
      igst: 5400,
    },
  ];

  // Calculate summary statistics
  const totalTaxableValue = gstr1Data.reduce((sum, item) => sum + item.taxableValue, 0);
  const totalCGST = gstr1Data.reduce((sum, item) => sum + item.cgst, 0);
  const totalSGST = gstr1Data.reduce((sum, item) => sum + item.sgst, 0);
  const totalIGST = gstr1Data.reduce((sum, item) => sum + item.igst, 0);
  const totalGST = gstr1Data.reduce((sum, item) => sum + item.totalGST, 0);
  const totalWithGST = gstr1Data.reduce((sum, item) => sum + item.totalWithGST, 0);

  // HSN/SAC Summary Calculations
  const totalHsnTaxableValue = hsnSacData.reduce((sum, item) => sum + item.taxableValue, 0);
  const totalHsnCGST = hsnSacData.reduce((sum, item) => sum + item.cgst, 0);
  const totalHsnSGST = hsnSacData.reduce((sum, item) => sum + item.sgst, 0);
  const totalHsnIGST = hsnSacData.reduce((sum, item) => sum + item.igst, 0);

  // B2B, B2C, Exports Calculations
  const b2bData = gstr1Data.filter((item) => item.type === "B2B");
  const b2cData = gstr1Data.filter((item) => item.type === "B2C");
  const exportsData = gstr1Data.filter((item) => item.type === "Exports");

  const b2bTaxableValue = b2bData.reduce((sum, item) => sum + item.taxableValue, 0);
  const b2bGST = b2bData.reduce((sum, item) => sum + item.totalGST, 0);
  const b2bTotal = b2bData.reduce((sum, item) => sum + item.totalWithGST, 0);

  const b2cTaxableValue = b2cData.reduce((sum, item) => sum + item.taxableValue, 0);
  const b2cGST = b2cData.reduce((sum, item) => sum + item.totalGST, 0);
  const b2cTotal = b2cData.reduce((sum, item) => sum + item.totalWithGST, 0);

  const exportsTaxableValue = exportsData.reduce((sum, item) => sum + item.taxableValue, 0);
  const exportsGST = exportsData.reduce((sum, item) => sum + item.totalGST, 0);
  const exportsTotal = exportsData.reduce((sum, item) => sum + item.totalWithGST, 0);

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
    <div className="gstr1-container">
      {/* HEADER */}
      <div className="gstr1-header">
        <div>
          <h1 className="gstr1-title">GSTR-1 Report</h1>
          <p className="gstr1-subtitle">Outward supplies summary and details</p>
        </div>
        <div className="gstr1-badge"><AppIcon name="gstReport" /> GST Form</div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="gstr1-summary-grid">
        <div className="summary-card">
          <div className="summary-icon"><AppIcon name="money" /></div>
          <div className="summary-content">
            <p className="summary-label">Taxable Value</p>
            <p className="summary-value">₹{totalTaxableValue.toLocaleString()}</p>
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
          <div className="summary-icon"><AppIcon name="rupee" /></div>
          <div className="summary-content">
            <p className="summary-label">Total With GST</p>
            <p className="summary-value">₹{totalWithGST.toLocaleString()}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon"><AppIcon name="receipt" /></div>
          <div className="summary-content">
            <p className="summary-label">Total Invoices</p>
            <p className="summary-value">{gstr1Data.length}</p>
          </div>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div className="gstr1-filter-card">
        <div className="filter-header">
          <h2 className="filter-title"><AppIcon name="search" /> Filter Data</h2>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Select Month & Year</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-actions">
            <button className="btn-primary">Apply Filter</button>
            <button className="btn-secondary">Reset</button>
          </div>
        </div>
      </div>

      {/* EXPORT BUTTONS */}
      <div className="gstr1-actions">
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
      <div className="gstr1-tabs">
        <button
          className={`tab-button ${activeTab === "invoice" ? "active" : ""}`}
          onClick={() => setActiveTab("invoice")}
        >
          <AppIcon name="clipboard" /> Invoice Details
        </button>
        <button
          className={`tab-button ${activeTab === "hsnsac" ? "active" : ""}`}
          onClick={() => setActiveTab("hsnsac")}
        >
          <AppIcon name="box" /> HSN/SAC Summary
        </button>
      </div>

      {/* GST SUMMARY VIEW */}
      {activeTab === "invoice" && (
        <div className="gstr1-table-card">
          <div className="table-header">
            <h3 className="table-title">Invoice Details</h3>
            <span className="table-count">{gstr1Data.length} Invoices</span>
          </div>

          <div className="table-responsive">
            <table className="gstr1-table">
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>State</th>
                  <th>Taxable Value</th>
                  <th>CGST</th>
                  <th>SGST</th>
                  <th>IGST</th>
                  <th>Total GST</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {gstr1Data.map((row) => (
                  <tr key={row.id}>
                    <td className="td-invoiceno">{row.invoiceNo}</td>
                    <td className="td-date">{row.date}</td>
                    <td className="td-customer">{row.customer}</td>
                    <td className="td-state">{row.state}</td>
                    <td className="td-amount">₹{row.taxableValue.toLocaleString()}</td>
                    <td className="td-cgst">₹{row.cgst.toLocaleString()}</td>
                    <td className="td-sgst">₹{row.sgst.toLocaleString()}</td>
                    <td className="td-igst">₹{row.igst.toLocaleString()}</td>
                    <td className="td-totalgst">₹{row.totalGST.toLocaleString()}</td>
                    <td className="td-totalamount">
                      <strong>₹{row.totalWithGST.toLocaleString()}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER */}
          <div className="table-footer">
            <div className="footer-stat">
              <span className="footer-label">Taxable Value:</span>
              <span className="footer-value">₹{totalTaxableValue.toLocaleString()}</span>
            </div>
            <div className="footer-stat">
              <span className="footer-label">Total GST:</span>
              <span className="footer-value">₹{totalGST.toLocaleString()}</span>
            </div>
            <div className="footer-stat">
              <span className="footer-label">Total:</span>
              <span className="footer-value">₹{totalWithGST.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* HSN/SAC SUMMARY TABLE */}
      {activeTab === "hsnsac" && (
        <div className="gstr1-table-card">
          <div className="table-header">
            <h3 className="table-title">HSN/SAC Summary</h3>
            <span className="table-count">{hsnSacData.length} HSN/SAC Categories</span>
          </div>

          <div className="table-responsive">
            <table className="gstr1-table">
              <thead>
                <tr>
                  <th>HSN/SAC</th>
                  <th>Item Name</th>
                  <th>Total Qty</th>
                  <th>Unit</th>
                  <th>Taxable Value</th>
                  <th>GST Rate</th>
                  <th>CGST</th>
                  <th>SGST</th>
                  <th>IGST</th>
                  <th>Total GST</th>
                </tr>
              </thead>
              <tbody>
                {hsnSacData.map((row) => (
                  <tr key={row.id}>
                    <td className="td-hsnsac">{row.hsnSac}</td>
                    <td className="td-itemname">{row.itemName}</td>
                    <td className="td-qty">{row.totalQty.toLocaleString()}</td>
                    <td className="td-unit">{row.unit}</td>
                    <td className="td-amount">₹{row.taxableValue.toLocaleString()}</td>
                    <td className="td-gstrate">{row.gstRate}%</td>
                    <td className="td-cgst">₹{row.cgst.toLocaleString()}</td>
                    <td className="td-sgst">₹{row.sgst.toLocaleString()}</td>
                    <td className="td-igst">₹{row.igst.toLocaleString()}</td>
                    <td className="td-totalgst">
                      <strong>₹{(row.cgst + row.sgst + row.igst).toLocaleString()}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER */}
          <div className="table-footer">
            <div className="footer-stat">
              <span className="footer-label">Taxable Value:</span>
              <span className="footer-value">₹{totalHsnTaxableValue.toLocaleString()}</span>
            </div>
            <div className="footer-stat">
              <span className="footer-label">Total CGST:</span>
              <span className="footer-value">₹{totalHsnCGST.toLocaleString()}</span>
            </div>
            <div className="footer-stat">
              <span className="footer-label">Total SGST:</span>
              <span className="footer-value">₹{totalHsnSGST.toLocaleString()}</span>
            </div>
            <div className="footer-stat">
              <span className="footer-label">Total IGST:</span>
              <span className="footer-value">₹{totalHsnIGST.toLocaleString()}</span>
            </div>
            <div className="footer-stat">
              <span className="footer-label">Total GST:</span>
              <span className="footer-value">₹{(totalHsnCGST + totalHsnSGST + totalHsnIGST).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* BUSINESS REPORT VIEW */}
      {showReport && (
        <div className="gstr1-report-view">
          <div className="report-header">
            <h1 className="report-title">GSTR-1 Report (Business View)</h1>
            <p className="report-subtitle"></p>
            <p className="report-date">Generated on: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
          </div>

          <div className="report-summary-section">
            <div className="report-summary-grid">
              <div className="report-summary-item">
                <span className="report-summary-label">Taxable Value:</span>
                <span className="report-summary-value">₹{totalTaxableValue.toLocaleString()}</span>
              </div>
              <div className="report-summary-item">
                <span className="report-summary-label">Total CGST:</span>
                <span className="report-summary-value">₹{totalCGST.toLocaleString()}</span>
              </div>
              <div className="report-summary-item">
                <span className="report-summary-label">Total SGST:</span>
                <span className="report-summary-value">₹{totalSGST.toLocaleString()}</span>
              </div>
              <div className="report-summary-item">
                <span className="report-summary-label">Total IGST:</span>
                <span className="report-summary-value">₹{totalIGST.toLocaleString()}</span>
              </div>
              <div className="report-summary-item highlight">
                <span className="report-summary-label">Total GST:</span>
                <span className="report-summary-value">₹{totalGST.toLocaleString()}</span>
              </div>
              <div className="report-summary-item highlight">
                <span className="report-summary-label">Total Invoice Value:</span>
                <span className="report-summary-value">₹{totalWithGST.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="report-breakdown-section">
            <h2 className="report-section-title">Intra-state vs Inter-state</h2>
            <div className="report-breakdown-grid">
              <div className="breakdown-item">
                <span className="breakdown-label">Intra-state (CGST + SGST):</span>
                <span className="breakdown-value">₹{(totalCGST + totalSGST).toLocaleString()}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Inter-state (IGST):</span>
                <span className="breakdown-value">₹{totalIGST.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="report-breakdown-section">
            <h2 className="report-section-title">Supply Type Summary</h2>
            
            <div className="report-breakdown-grid" style={{ marginBottom: "24px" }}>
              <div className="breakdown-item">
                <span className="breakdown-label">B2B Taxable Value:</span>
                <span className="breakdown-value">₹{b2bTaxableValue.toLocaleString()}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">B2B GST:</span>
                <span className="breakdown-value">₹{b2bGST.toLocaleString()}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">B2B Total:</span>
                <span className="breakdown-value">₹{b2bTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="report-breakdown-grid" style={{ marginBottom: "24px" }}>
              <div className="breakdown-item">
                <span className="breakdown-label">B2C Taxable Value:</span>
                <span className="breakdown-value">₹{b2cTaxableValue.toLocaleString()}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">B2C GST:</span>
                <span className="breakdown-value">₹{b2cGST.toLocaleString()}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">B2C Total:</span>
                <span className="breakdown-value">₹{b2cTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="report-breakdown-grid">
              <div className="breakdown-item">
                <span className="breakdown-label">Exports Taxable Value:</span>
                <span className="breakdown-value">₹{exportsTaxableValue.toLocaleString()}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Exports GST:</span>
                <span className="breakdown-value">₹{exportsGST.toLocaleString()}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Exports Total:</span>
                <span className="breakdown-value">₹{exportsTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="report-table-section">
            <h2 className="report-section-title">Invoice Details</h2>
            <div className="table-responsive">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>State</th>
                    <th>Taxable Value</th>
                    <th>CGST</th>
                    <th>SGST</th>
                    <th>IGST</th>
                    <th>Total GST</th>
                    <th>Invoice Total</th>
                  </tr>
                </thead>
                <tbody>
                  {gstr1Data.map((row) => (
                    <tr key={row.id}>
                      <td>{row.invoiceNo}</td>
                      <td>{row.date}</td>
                      <td>{row.customer}</td>
                      <td>{row.state}</td>
                      <td className="amount">₹{row.taxableValue.toLocaleString()}</td>
                      <td className="amount">₹{row.cgst.toLocaleString()}</td>
                      <td className="amount">₹{row.sgst.toLocaleString()}</td>
                      <td className="amount">₹{row.igst.toLocaleString()}</td>
                      <td className="amount">₹{row.totalGST.toLocaleString()}</td>
                      <td className="amount"><strong>₹{row.totalWithGST.toLocaleString()}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GSTR1Report;
