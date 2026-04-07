import { useState } from "react";
import AppIcon from "../../components/common/AppIcon";
import "../../styles/gstr9-report.css";

function Gstr9Report() {
  const [financialYear, setFinancialYear] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const [showReport, setShowReport] = useState(false);

  // Sample data for GSTR-9 (Annual)
  const gstr9Data = {
    fy: "2024-25",
    outwardSupplies: {
      invoiceCount: 456,
      taxableValue: 5000000,
      igst: 450000,
      cgst: 300000,
      sgst: 300000,
      cess: 50000,
      totalGST: 1100000,
    },
    inwardSupplies: {
      invoiceCount: 234,
      taxableValue: 2500000,
      igst: 225000,
      cgst: 150000,
      sgst: 150000,
      cess: 25000,
      totalGST: 550000,
    },
    itcSummary: {
      itcIGST: 210000,
      itcCGST: 140000,
      itcSGST: 140000,
      itcCESS: 20000,
      totalITC: 510000,
    },
    taxPaidSummary: {
      igst: 450000,
      cgst: 300000,
      sgst: 300000,
      cess: 50000,
      totalTaxPayable: 1100000,
    },
  };

  // Calculate Net Tax Payable
  const netIGST = gstr9Data.outwardSupplies.igst - gstr9Data.itcSummary.itcIGST;
  const netCGST = gstr9Data.outwardSupplies.cgst - gstr9Data.itcSummary.itcCGST;
  const netSGST = gstr9Data.outwardSupplies.sgst - gstr9Data.itcSummary.itcSGST;
  const netCESS = gstr9Data.outwardSupplies.cess - gstr9Data.itcSummary.itcCESS;
  const netTaxPayable = netIGST + netCGST + netSGST + netCESS;

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
    <div className="gstr9-container">
      {/* HEADER */}
      <div className="gstr9-header">
        <div>
          <h1 className="gstr9-title">GSTR-9 Report</h1>
          <p className="gstr9-subtitle">Annual GST return and yearly summary</p>
        </div>
        <div className="gstr9-badge"><AppIcon name="gstReport" /> GST Form</div>
      </div>

      {/* FILTER SECTION */}
      <div className="gstr9-filter-card">
        <div className="filter-header">
          <h2 className="filter-title"><AppIcon name="search" /> Filter Data</h2>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Financial Year *</label>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="filter-input"
            >
              <option value="">Select Financial Year</option>
              <option value="2023-24">2023-24 (Apr 2023 - Mar 2024)</option>
              <option value="2024-25">2024-25 (Apr 2024 - Mar 2025)</option>
              <option value="2025-26">2025-26 (Apr 2025 - Mar 2026)</option>
            </select>
          </div>

          <div className="filter-actions">
            <button className="btn-primary">Apply Filter</button>
            <button className="btn-secondary">Reset</button>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="gstr9-actions">
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
          <AppIcon name="share" /> Share to CA
        </button>
      </div>

      {/* REPORT VIEW */}
      {showReport && (
        <div className="gstr9-report-view">
          <div className="report-header">
            <h1 className="report-title">GSTR-9 Annual Return Report</h1>
            <p className="report-date">Financial Year: {gstr9Data.fy} | Generated on: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
          </div>

          {/* SUMMARY CARDS */}
          <div className="gstr9-summary-cards">
            <div className="summary-card-item">
              <span className="card-label">Total Invoices (Sales)</span>
              <span className="card-value">{gstr9Data.outwardSupplies.invoiceCount}</span>
            </div>
            <div className="summary-card-item">
              <span className="card-label">Total Invoices (Purchases)</span>
              <span className="card-value">{gstr9Data.inwardSupplies.invoiceCount}</span>
            </div>
            <div className="summary-card-item">
              <span className="card-label">Total Tax Payable</span>
              <span className="card-value">₹{gstr9Data.taxPaidSummary.totalTaxPayable.toLocaleString()}</span>
            </div>
            <div className="summary-card-item">
              <span className="card-label">Net Tax Payable (After ITC)</span>
              <span className="card-value">₹{netTaxPayable.toLocaleString()}</span>
            </div>
          </div>

          {/* TABS */}
          <div className="gstr9-tabs">
            <button
              className={`tab-button ${activeTab === "summary" ? "active" : ""}`}
              onClick={() => setActiveTab("summary")}
            >
              <AppIcon name="chart" /> Summary
            </button>
            <button
              className={`tab-button ${activeTab === "outward" ? "active" : ""}`}
              onClick={() => setActiveTab("outward")}
            >
              <AppIcon name="export" /> Outward Supplies
            </button>
            <button
              className={`tab-button ${activeTab === "inward" ? "active" : ""}`}
              onClick={() => setActiveTab("inward")}
            >
              <AppIcon name="import" /> Inward Supplies
            </button>
            <button
              className={`tab-button ${activeTab === "itc" ? "active" : ""}`}
              onClick={() => setActiveTab("itc")}
            >
              <AppIcon name="receipt" /> ITC Summary
            </button>
          </div>

          {/* TAB CONTENT */}
          {activeTab === "summary" && (
            <div className="tab-content">
              {/* Outward Supplies Section */}
              <div className="report-section">
                <h3 className="section-title">Outward Supplies (Sales) - Yearly</h3>
                <div className="table-responsive">
                  <table className="report-table">
                    <tbody>
                      <tr className="data-row">
                        <td className="label">Total Invoices</td>
                        <td className="value">{gstr9Data.outwardSupplies.invoiceCount}</td>
                      </tr>
                      <tr className="data-row">
                        <td className="label">Total Taxable Value</td>
                        <td className="value">₹{gstr9Data.outwardSupplies.taxableValue.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td className="label">IGST</td>
                        <td className="value">₹{gstr9Data.outwardSupplies.igst.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td className="label">CGST</td>
                        <td className="value">₹{gstr9Data.outwardSupplies.cgst.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td className="label">SGST</td>
                        <td className="value">₹{gstr9Data.outwardSupplies.sgst.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td className="label">CESS</td>
                        <td className="value">₹{gstr9Data.outwardSupplies.cess.toLocaleString()}</td>
                      </tr>
                      <tr className="header-row">
                        <td className="label">Total GST</td>
                        <td className="value">₹{gstr9Data.outwardSupplies.totalGST.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Inward Supplies Section */}
              <div className="report-section">
                <h3 className="section-title">Inward Supplies (Purchases) - Yearly</h3>
                <div className="table-responsive">
                  <table className="report-table">
                    <tbody>
                      <tr className="data-row">
                        <td className="label">Total Invoices</td>
                        <td className="value">{gstr9Data.inwardSupplies.invoiceCount}</td>
                      </tr>
                      <tr className="data-row">
                        <td className="label">Total Taxable Value</td>
                        <td className="value">₹{gstr9Data.inwardSupplies.taxableValue.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td className="label">IGST</td>
                        <td className="value">₹{gstr9Data.inwardSupplies.igst.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td className="label">CGST</td>
                        <td className="value">₹{gstr9Data.inwardSupplies.cgst.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td className="label">SGST</td>
                        <td className="value">₹{gstr9Data.inwardSupplies.sgst.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td className="label">CESS</td>
                        <td className="value">₹{gstr9Data.inwardSupplies.cess.toLocaleString()}</td>
                      </tr>
                      <tr className="header-row">
                        <td className="label">Total GST</td>
                        <td className="value">₹{gstr9Data.inwardSupplies.totalGST.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tax Paid Summary */}
              <div className="report-section">
                <h3 className="section-title">Tax Paid Summary</h3>
                <div className="table-responsive">
                  <table className="report-table">
                    <tbody>
                      <tr className="data-row">
                        <td className="label">IGST Payable</td>
                        <td className="value">₹{gstr9Data.taxPaidSummary.igst.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td className="label">CGST Payable</td>
                        <td className="value">₹{gstr9Data.taxPaidSummary.cgst.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td className="label">SGST Payable</td>
                        <td className="value">₹{gstr9Data.taxPaidSummary.sgst.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td className="label">CESS Payable</td>
                        <td className="value">₹{gstr9Data.taxPaidSummary.cess.toLocaleString()}</td>
                      </tr>
                      <tr className="header-row">
                        <td className="label">Total Tax Payable</td>
                        <td className="value">₹{gstr9Data.taxPaidSummary.totalTaxPayable.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ITC Summary */}
              <div className="report-section">
                <h3 className="section-title">ITC Summary</h3>
                <div className="table-responsive">
                  <table className="report-table">
                    <tbody>
                      <tr className="data-row">
                        <td className="label">ITC - IGST Available</td>
                        <td className="value">₹{gstr9Data.itcSummary.itcIGST.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td className="label">ITC - CGST Available</td>
                        <td className="value">₹{gstr9Data.itcSummary.itcCGST.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td className="label">ITC - SGST Available</td>
                        <td className="value">₹{gstr9Data.itcSummary.itcSGST.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td className="label">ITC - CESS Available</td>
                        <td className="value">₹{gstr9Data.itcSummary.itcCESS.toLocaleString()}</td>
                      </tr>
                      <tr className="header-row">
                        <td className="label">Total ITC Available</td>
                        <td className="value">₹{gstr9Data.itcSummary.totalITC.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Net Tax Payable */}
              <div className="report-section highlight-section">
                <h3 className="section-title">Net Tax Payable (After ITC)</h3>
                <div className="table-responsive">
                  <table className="report-table">
                    <tbody>
                      <tr className="data-row">
                        <td className="label">Net IGST</td>
                        <td className="value">₹{netIGST.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td className="label">Net CGST</td>
                        <td className="value">₹{netCGST.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td className="label">Net SGST</td>
                        <td className="value">₹{netSGST.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td className="label">Net CESS</td>
                        <td className="value">₹{netCESS.toLocaleString()}</td>
                      </tr>
                      <tr className="highlight-row">
                        <td className="label">Total Net Tax Payable</td>
                        <td className="value">₹{netTaxPayable.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "outward" && (
            <div className="tab-content">
              <div className="report-section">
                <h3 className="section-title">Outward Supplies Details - Yearly</h3>
                <div className="table-responsive">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Metric</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="data-row">
                        <td>Total Invoices</td>
                        <td>{gstr9Data.outwardSupplies.invoiceCount}</td>
                      </tr>
                      <tr className="data-row">
                        <td>Total Taxable Value</td>
                        <td>₹{gstr9Data.outwardSupplies.taxableValue.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td>IGST</td>
                        <td>₹{gstr9Data.outwardSupplies.igst.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td>CGST</td>
                        <td>₹{gstr9Data.outwardSupplies.cgst.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td>SGST</td>
                        <td>₹{gstr9Data.outwardSupplies.sgst.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td>CESS</td>
                        <td>₹{gstr9Data.outwardSupplies.cess.toLocaleString()}</td>
                      </tr>
                      <tr className="header-row">
                        <td>Total GST</td>
                        <td>₹{gstr9Data.outwardSupplies.totalGST.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "inward" && (
            <div className="tab-content">
              <div className="report-section">
                <h3 className="section-title">Inward Supplies Details - Yearly</h3>
                <div className="table-responsive">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Metric</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="data-row">
                        <td>Total Invoices</td>
                        <td>{gstr9Data.inwardSupplies.invoiceCount}</td>
                      </tr>
                      <tr className="data-row">
                        <td>Total Taxable Value</td>
                        <td>₹{gstr9Data.inwardSupplies.taxableValue.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td>IGST</td>
                        <td>₹{gstr9Data.inwardSupplies.igst.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td>CGST</td>
                        <td>₹{gstr9Data.inwardSupplies.cgst.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td>SGST</td>
                        <td>₹{gstr9Data.inwardSupplies.sgst.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td>CESS</td>
                        <td>₹{gstr9Data.inwardSupplies.cess.toLocaleString()}</td>
                      </tr>
                      <tr className="header-row">
                        <td>Total GST</td>
                        <td>₹{gstr9Data.inwardSupplies.totalGST.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "itc" && (
            <div className="tab-content">
              <div className="report-section">
                <h3 className="section-title">ITC Summary - Yearly</h3>
                <div className="table-responsive">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>ITC Type</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="data-row">
                        <td>ITC - IGST</td>
                        <td>₹{gstr9Data.itcSummary.itcIGST.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td>ITC - CGST</td>
                        <td>₹{gstr9Data.itcSummary.itcCGST.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td>ITC - SGST</td>
                        <td>₹{gstr9Data.itcSummary.itcSGST.toLocaleString()}</td>
                      </tr>
                      <tr className="data-row">
                        <td>ITC - CESS</td>
                        <td>₹{gstr9Data.itcSummary.itcCESS.toLocaleString()}</td>
                      </tr>
                      <tr className="header-row">
                        <td>Total ITC Available</td>
                        <td>₹{gstr9Data.itcSummary.totalITC.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Gstr9Report;
