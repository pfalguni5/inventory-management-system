import { useState } from "react";
import AppIcon from "../../components/common/AppIcon";
import "../../styles/gstr9-report.css";

function Gstr9cReport() {
  const [financialYear, setFinancialYear] = useState("");
  const [showReport, setShowReport] = useState(false);

  // Sample data for GSTR-9C (Reconciliation Statement)
  const gstr9cData = {
    fy: "2024-25",
    turnoverReconciliation: {
      booksTotal: 7500000,
      gstReturnTotal: 7450000,
      difference: 50000,
      percentageDiff: 0.67,
    },
    taxReconciliation: {
      igstBooks: 450000,
      igstGSTReturn: 445000,
      igstDifference: 5000,
      cgstBooks: 300000,
      cgstGSTReturn: 298000,
      cgstDifference: 2000,
      sgstBooks: 300000,
      sgstGSTReturn: 298000,
      sgstDifference: 2000,
      cessBooks: 50000,
      cessGSTReturn: 50000,
      cessDifference: 0,
      totalTaxBooks: 1100000,
      totalTaxGSTReturn: 1091000,
      totalTaxDifference: 9000,
    },
    itcReconciliation: {
      itcBooks: 510000,
      itcGSTReturn: 508000,
      itcDifference: 2000,
      percentageDiff: 0.39,
    },
    certificationStatus: "Pending",
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
    <div className="gstr9-container">
      {/* HEADER */}
      <div className="gstr9-header">
        <div>
          <h1 className="gstr9-title">GSTR-9C Report</h1>
          <p className="gstr9-subtitle">Annual reconciliation statement</p>
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
            <h1 className="report-title">GSTR-9C Annual Reconciliation Statement</h1>
            <p className="report-date">Financial Year: {gstr9cData.fy} | Generated on: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
          </div>

          {/* SUMMARY CARDS */}
          <div className="gstr9-summary-cards">
            <div className="summary-card-item">
              <span className="card-label">Books Turnover</span>
              <span className="card-value">₹{gstr9cData.turnoverReconciliation.booksTotal.toLocaleString()}</span>
            </div>
            <div className="summary-card-item">
              <span className="card-label">GST Returns Turnover</span>
              <span className="card-value">₹{gstr9cData.turnoverReconciliation.gstReturnTotal.toLocaleString()}</span>
            </div>
            <div className="summary-card-item">
              <span className="card-label">Total Tax (Books)</span>
              <span className="card-value">₹{gstr9cData.taxReconciliation.totalTaxBooks.toLocaleString()}</span>
            </div>
            <div className="summary-card-item">
              <span className="card-label">ITC (Books)</span>
              <span className="card-value">₹{gstr9cData.itcReconciliation.itcBooks.toLocaleString()}</span>
            </div>
          </div>

          {/* RECONCILIATION SECTIONS */}
          <div className="tab-content">
            {/* Reconciliation of Turnover */}
            <div className="report-section">
              <h3 className="section-title">Reconciliation of Turnover (Books vs GST Returns)</h3>
              <div className="table-responsive">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Books Value</th>
                      <th>GST Return Value</th>
                      <th>Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="data-row">
                      <td className="label">Total Turnover</td>
                      <td className="value">₹{gstr9cData.turnoverReconciliation.booksTotal.toLocaleString()}</td>
                      <td className="value">₹{gstr9cData.turnoverReconciliation.gstReturnTotal.toLocaleString()}</td>
                      <td className="value">₹{gstr9cData.turnoverReconciliation.difference.toLocaleString()}</td>
                    </tr>
                    <tr className="highlight-row">
                      <td className="label">Difference %</td>
                      <td colSpan="3" className="value">{gstr9cData.turnoverReconciliation.percentageDiff.toFixed(2)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reconciliation of Tax */}
            <div className="report-section">
              <h3 className="section-title">Reconciliation of Tax (IGST/CGST/SGST/CESS)</h3>
              <div className="table-responsive">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Tax Type</th>
                      <th>Books Value</th>
                      <th>GST Return Value</th>
                      <th>Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="data-row">
                      <td className="label">IGST</td>
                      <td className="value">₹{gstr9cData.taxReconciliation.igstBooks.toLocaleString()}</td>
                      <td className="value">₹{gstr9cData.taxReconciliation.igstGSTReturn.toLocaleString()}</td>
                      <td className="value">₹{gstr9cData.taxReconciliation.igstDifference.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">CGST</td>
                      <td className="value">₹{gstr9cData.taxReconciliation.cgstBooks.toLocaleString()}</td>
                      <td className="value">₹{gstr9cData.taxReconciliation.cgstGSTReturn.toLocaleString()}</td>
                      <td className="value">₹{gstr9cData.taxReconciliation.cgstDifference.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">SGST</td>
                      <td className="value">₹{gstr9cData.taxReconciliation.sgstBooks.toLocaleString()}</td>
                      <td className="value">₹{gstr9cData.taxReconciliation.sgstGSTReturn.toLocaleString()}</td>
                      <td className="value">₹{gstr9cData.taxReconciliation.sgstDifference.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">CESS</td>
                      <td className="value">₹{gstr9cData.taxReconciliation.cessBooks.toLocaleString()}</td>
                      <td className="value">₹{gstr9cData.taxReconciliation.cessGSTReturn.toLocaleString()}</td>
                      <td className="value">₹{gstr9cData.taxReconciliation.cessDifference.toLocaleString()}</td>
                    </tr>
                    <tr className="highlight-row">
                      <td className="label">Total Tax</td>
                      <td className="value">₹{gstr9cData.taxReconciliation.totalTaxBooks.toLocaleString()}</td>
                      <td className="value">₹{gstr9cData.taxReconciliation.totalTaxGSTReturn.toLocaleString()}</td>
                      <td className="value">₹{gstr9cData.taxReconciliation.totalTaxDifference.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reconciliation of ITC */}
            <div className="report-section">
              <h3 className="section-title">Reconciliation of ITC (Books vs GST Returns)</h3>
              <div className="table-responsive">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Books Value</th>
                      <th>GST Return Value</th>
                      <th>Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="data-row">
                      <td className="label">Input Tax Credit (ITC)</td>
                      <td className="value">₹{gstr9cData.itcReconciliation.itcBooks.toLocaleString()}</td>
                      <td className="value">₹{gstr9cData.itcReconciliation.itcGSTReturn.toLocaleString()}</td>
                      <td className="value">₹{gstr9cData.itcReconciliation.itcDifference.toLocaleString()}</td>
                    </tr>
                    <tr className="highlight-row">
                      <td className="label">Difference %</td>
                      <td colSpan="3" className="value">{gstr9cData.itcReconciliation.percentageDiff.toFixed(2)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Auditor/CA Certification */}
            <div className="report-section">
              <h3 className="section-title">Auditor / CA Certification</h3>
              <div className="table-responsive">
                <table className="report-table">
                  <tbody>
                    <tr className="data-row">
                      <td className="label">Certification Status</td>
                      <td className="value">
                        <span className={`status-badge ${gstr9cData.certificationStatus.toLowerCase()}`}>
                          {gstr9cData.certificationStatus}
                        </span>
                      </td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">CA Name</td>
                      <td className="value">-</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">Certification Date</td>
                      <td className="value">-</td>
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

export default Gstr9cReport;
