import { useState } from "react";
import AppIcon from "../../components/common/AppIcon";
import "../../styles/gstr3b-report.css";

function GSTR3BReport() {
  const [month, setMonth] = useState("");
  const [showReport, setShowReport] = useState(false);

  // Sample data for GSTR-3B
  const gstr3bData = {
    month: "August 2024",
    // Outward Supplies (Sales)
    outwardTaxableValue: 500000,
    outwardCGST: 30000,
    outwardSGST: 30000,
    outwardIGST: 30000,
    outwardTotalGST: 90000,
    // ITC (Purchases)
    purchasTaxableValue: 250000,
    purchaseCGST: 15000,
    purchaseSGST: 15000,
    purchaseIGST: 15000,
    purchaseTotalGST: 45000,
  };

  // Calculate Net Tax
  const netIGST = gstr3bData.outwardIGST - gstr3bData.purchaseIGST;
  const netCGST = gstr3bData.outwardCGST - gstr3bData.purchaseCGST;
  const netSGST = gstr3bData.outwardSGST - gstr3bData.purchaseSGST;
  const netTaxPayable = netIGST + netCGST + netSGST;

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
    <div className="gstr3b-container">
      {/* HEADER */}
      <div className="gstr3b-header">
        <div>
          <h1 className="gstr3b-title">GSTR-3B Report</h1>
          <p className="gstr3b-subtitle">Monthly GST summary and reconciliation</p>
        </div>
        <div className="gstr3b-badge"><AppIcon name="gstReport" /> GST Form</div>
      </div>

      {/* FILTER SECTION */}
      <div className="gstr3b-filter-card">
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
      <div className="gstr3b-actions">
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

      {/* REPORT VIEW */}
      {showReport && (
        <div className="gstr3b-report-view">
          <div className="report-header">
            <h1 className="report-title">GSTR-3B Report</h1>
            <p className="report-date">Generated on: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
          </div>

          {/* REPORT SUMMARY CARDS */}
          <div className="report-summary-cards">
            <div className="summary-card-item">
              <span className="card-label">Outward Taxable Supplies</span>
              <span className="card-value">₹{gstr3bData.outwardTaxableValue.toLocaleString()}</span>
            </div>
            <div className="summary-card-item">
              <span className="card-label">Total GST Payable</span>
              <span className="card-value">₹{gstr3bData.outwardTotalGST.toLocaleString()}</span>
            </div>
            <div className="summary-card-item">
              <span className="card-label">ITC Available (Purchases)</span>
              <span className="card-value">₹{gstr3bData.purchaseTotalGST.toLocaleString()}</span>
            </div>
            <div className="summary-card-item">
              <span className="card-label">Net Tax Payable</span>
              <span className="card-value">₹{netTaxPayable.toLocaleString()}</span>
            </div>
          </div>

          {/* REPORT TABLE */}
          <div className="gstr3b-report-table">
            {/* A) OUTWARD SUPPLIES */}
            <div className="table-section">
              <h3 className="section-title">A) Outward Supplies (Sales)</h3>
              <div className="table-responsive">
                <table className="report-table">
                  <tbody>
                    <tr className="data-row">
                      <td className="label">Taxable Value</td>
                      <td className="value">₹{gstr3bData.outwardTaxableValue.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">IGST</td>
                      <td className="value">₹{gstr3bData.outwardIGST.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">CGST</td>
                      <td className="value">₹{gstr3bData.outwardCGST.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">SGST</td>
                      <td className="value">₹{gstr3bData.outwardSGST.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* B) ITC PURCHASES */}
            <div className="table-section">
              <h3 className="section-title">B) ITC (Purchases)</h3>
              <div className="table-responsive">
                <table className="report-table">
                  <tbody>
                    <tr className="data-row">
                      <td className="label">Taxable Value</td>
                      <td className="value">₹{gstr3bData.purchasTaxableValue.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">IGST</td>
                      <td className="value">₹{gstr3bData.purchaseIGST.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">CGST</td>
                      <td className="value">₹{gstr3bData.purchaseCGST.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">SGST</td>
                      <td className="value">₹{gstr3bData.purchaseSGST.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* C) NET TAX */}
            <div className="table-section">
              <h3 className="section-title">C) Net Tax Payable</h3>
              <div className="table-responsive">
                <table className="report-table net-tax-table">
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
                    <tr className="total-row">
                      <td className="label">Total Net GST Payable</td>
                      <td className="value">₹{netTaxPayable.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GSTR3BReport;
