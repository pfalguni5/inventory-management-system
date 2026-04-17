import { useState, useRef } from "react";
import AppIcon from "../../components/common/AppIcon";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import api from "../../services/api";
import "../../styles/sales-summary.css";

function SalesSummaryReport() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  // Business details
  const businessDetails = {
    name: "Your Business Name",
    addressLine1: "123 Business Street",
    city: "City",
    state: "State",
    country: "Country",
    gstin: "27AABCL7890A1Z0",
  };

  // Get date range
  const getDateRange = (range) => {
    const today = new Date();
    let start, end;

    switch (range) {
      case "day":
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        break;
      case "week":
        const weekStart = today.getDate() - today.getDay();
        start = new Date(today.getFullYear(), today.getMonth(), weekStart);
        end = new Date(today.getFullYear(), today.getMonth(), weekStart + 7);
        break;
      case "month":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        break;
      case "year":
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear() + 1, 0, 1);
        break;
      default:
        return null;
    }
    return { start, end };
  };

  // Quick select buttons
  const handleQuickSelect = (range) => {
    const dateRange = getDateRange(range);
    if (dateRange) {
      setFromDate(dateRange.start.toISOString().split("T")[0]);
      setToDate(dateRange.end.toISOString().split("T")[0]);
    }
  };

  // Fetch report data from API
  const fetchSalesReport = async () => {
    if (fromDate === "" || toDate === "") {
      setError("Please select both From Date and To Date");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post("/reports/sales-summary", {
        fromDate: fromDate,
        toDate: toDate,
      });

      setReportData(response.data);
      setShowReport(true);
    } catch (err) {
      console.error("Error fetching sales report:", err);
      setError(err.response?.data?.message || "Failed to fetch sales report");
      setShowReport(false);
    } finally {
      setLoading(false);
    }
  };

  // Generate report on button click
  const handleGenerateReport = () => {
    fetchSalesReport();
  };

  // Export to PDF
  const handleExportPDF = async () => {
    if (!reportData || reportData.rows.length === 0) {
      alert("No data available for export");
      return;
    }

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const imgWidth = 210 - 10; // A4 width with 5mm margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageHeight = 297 - 10; // A4 height with 5mm margins
      let heightLeft = imgHeight;
      let position = 5;

      pdf.addImage(imgData, "JPEG", 5, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 5;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 5, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Sales_Summary_Report_${fromDate}_to_${toDate}.pdf`);
    } catch (error) {
      console.error("PDF export error:", error);
      alert("Error generating PDF");
    }
  };

  // Export to Excel (placeholder for now)
  const handleExportExcel = () => {
    if (!reportData || reportData.rows.length === 0) {
      alert("No data available for export");
      return;
    }
    alert("Excel export will be implemented next");
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-");
  };


  return (
    <div className="sales-summary-container">
      {/* HEADER */}
      <div className="sales-summary-header">
        <div>
          <h1 className="sales-summary-title">Sales Summary Report</h1>
          <p className="sales-summary-subtitle">Generate and analyze your sales data for a specific period</p>
        </div>
        <div className="sales-summary-badge"><AppIcon name="chart" /> Report</div>
      </div>

      {/* FILTER SECTION */}
      <div className="sales-filter-card">
        <div className="filter-header">
          <h2 className="filter-title"><AppIcon name="search" /> Select Period</h2>
        </div>

        {/* Quick Select Buttons */}
        <div className="quick-select-buttons">
          <button className="quick-btn" onClick={() => handleQuickSelect("day")}>Today</button>
          <button className="quick-btn" onClick={() => handleQuickSelect("week")}>This Week</button>
          <button className="quick-btn" onClick={() => handleQuickSelect("month")}>This Month</button>
          <button className="quick-btn" onClick={() => handleQuickSelect("year")}>This Year</button>
        </div>

        {/* Date Range Inputs */}
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">From Date <span className="required">*</span></label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="filter-input"
              disabled={loading}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">To Date <span className="required">*</span></label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="filter-input"
              disabled={loading}
            />
          </div>

          <div className="filter-actions">
            <button 
              className="btn-primary" 
              onClick={handleGenerateReport}
              disabled={fromDate === "" || toDate === "" || loading}
            >
              {loading ? "Loading..." : "Generate Report"}
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => {
                setFromDate("");
                setToDate("");
                setShowReport(false);
                setReportData(null);
                setError(null);
              }}
              disabled={loading}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            marginTop: "12px",
            padding: "12px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: "4px",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      {showReport && reportData && (
        <div className="sales-actions">
          <button className="btn-export" onClick={handleExportPDF} disabled={loading}>
            <AppIcon name="exportPdf" /> Export PDF
          </button>
          <button className="btn-export" onClick={handleExportExcel} disabled={loading}>
            <AppIcon name="exportExcel" /> Export Excel
          </button>
        </div>
      )}

      {/* REPORT VIEW */}
      {showReport && reportData && (
        <div className="report-wrapper" ref={reportRef}>
          {/* REPORT HEADER */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            borderBottom: "2px solid #1a3a52",
            minHeight: "120px"
          }}>
            {/* Company Info (Left) */}
            <div style={{ padding: "20px" }}>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "bold", color: "#1a3a52" }}>
                {businessDetails.name}
              </h3>
              <p style={{ margin: "4px 0", fontSize: "12px", color: "#666", lineHeight: "1.4" }}>
                {businessDetails.addressLine1}<br/>
                {businessDetails.city}, {businessDetails.state}, {businessDetails.country}<br/>
                GSTIN: {businessDetails.gstin}
              </p>
            </div>
            {/* Title (Right) */}
            <div style={{ padding: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <h1 style={{ margin: "0", fontSize: "35px", fontWeight: "bold", color: "#0066cc", letterSpacing: "2px" }}>
                SALES SUMMARY
              </h1>
            </div>
          </div>

          {/* REPORT TABLE */}
          <div className="report-table-wrapper" style={{ marginTop: "30px" }}>
            <table className="sales-report-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Invoice Date</th>
                  <th>Customer Name</th>
                  <th>Customer GSTIN</th>
                  <th>Discount</th>
                  <th>Taxable Value</th>
                  <th>GST Amount</th>
                  <th>Invoice Total</th>
                </tr>
              </thead>
              <tbody>
                {reportData.rows && reportData.rows.map((row, index) => (
                  <tr key={index}>
                    <td>{row.invoiceNo}</td>
                    <td>{formatDate(row.invoiceDate)}</td>
                    <td>{row.customerName}</td>
                    <td>{row.customerGSTIN || "N/A"}</td>
                    <td className="amount">₹{Number(row.discount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="amount">₹{Number(row.taxableValue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="amount">₹{Number(row.gst).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="amount">₹{Number(row.totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SUMMARY */}
          <div className="report-summary">
            <div className="summary-item">
              <span className="summary-label">Total Invoices:</span>
              <span className="summary-value">{reportData.totalInvoices}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Discount:</span>
              <span className="summary-value">₹{Number(reportData.totalDiscount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Taxable Value:</span>
              <span className="summary-value">₹{Number(reportData.totalTaxableValue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total GST:</span>
              <span className="summary-value">₹{Number(reportData.totalGST).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="summary-item grand-total">
              <span className="summary-label">Grand Total:</span>
              <span className="summary-value">₹{Number(reportData.totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesSummaryReport;
