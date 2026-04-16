import { useState, useRef } from "react";
import AppIcon from "../../components/common/AppIcon";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../../styles/sales-summary.css";

function SalesSummaryReport() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showReport, setShowReport] = useState(false);
  const reportRef = useRef(null);

  // Sample data
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
    },
  ];

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

  // Apply filters
  const getFilteredSalesData = () => {
    let filtered = [...salesData];

    if (fromDate) {
      const fromDateObj = new Date(fromDate);
      filtered = filtered.filter((sale) => {
        const saleDate = new Date(sale.date.split("-").reverse().join("-"));
        return saleDate >= fromDateObj;
      });
    }

    if (toDate) {
      const toDateObj = new Date(toDate);
      toDateObj.setDate(toDateObj.getDate() + 1);
      filtered = filtered.filter((sale) => {
        const saleDate = new Date(sale.date.split("-").reverse().join("-"));
        return saleDate <= toDateObj;
      });
    }

    return filtered;
  };

  const filteredSalesData = getFilteredSalesData();

  // Calculate totals
  const totalTaxableValue = filteredSalesData.reduce((sum, item) => sum + item.taxableValue, 0);
  const totalGST = filteredSalesData.reduce((sum, item) => sum + item.gst, 0);
  const totalAmount = filteredSalesData.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalInvoices = filteredSalesData.length;

  // Quick select buttons
  const handleQuickSelect = (range) => {
    const dateRange = getDateRange(range);
    if (dateRange) {
      setFromDate(dateRange.start.toISOString().split("T")[0]);
      setToDate(dateRange.end.toISOString().split("T")[0]);
    }
  };

  // Export to PDF
  const handleExportPDF = async () => {
    if (fromDate === "" || toDate === "") {
      alert("Please select both From Date and To Date to generate report");
      return;
    }
    if (filteredSalesData.length === 0) {
      alert("No data available for selected date range");
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
    if (fromDate === "" || toDate === "") {
      alert("Please select both From Date and To Date to generate report");
      return;
    }
    if (filteredSalesData.length === 0) {
      alert("No data available for selected date range");
      return;
    }
    alert("Excel export will be implemented next");
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
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">To Date <span className="required">*</span></label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-actions">
            <button 
              className="btn-primary" 
              onClick={() => setShowReport(fromDate !== "" && toDate !== "")}
              disabled={fromDate === "" || toDate === ""}
            >
              Generate Report
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => {
                setFromDate("");
                setToDate("");
                setShowReport(false);
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      {showReport && (
        <div className="sales-actions">
          <button className="btn-export" onClick={handleExportPDF}>
            <AppIcon name="exportPdf" /> Export PDF
          </button>
          <button className="btn-export" onClick={handleExportExcel}>
            <AppIcon name="exportExcel" /> Export Excel
          </button>
        </div>
      )}

      {/* REPORT VIEW */}
      {showReport && (
        <div className="report-wrapper" ref={reportRef}>
          {/* REPORT HEADER */}
          <div className="report-header-section">
            <div className="report-left">
              <h3 className="business-name">{businessDetails.name}</h3>
              <p className="business-detail">{businessDetails.addressLine1}</p>
              <p className="business-detail">{businessDetails.city}, {businessDetails.state}, {businessDetails.country}</p>
              <p className="business-detail">GSTIN: {businessDetails.gstin}</p>
            </div>
            <div className="report-right">
              <h2 className="report-title">Sales Summary</h2>
            </div>
          </div>

          {/* REPORT TABLE */}
          <div className="report-table-wrapper">
            <table className="sales-report-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Invoice Date</th>
                  <th>Customer Name</th>
                  <th>Customer GSTIN</th>
                  <th>Taxable Value</th>
                  <th>GST Amount</th>
                  <th>Invoice Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredSalesData.map((row) => (
                  <tr key={row.id}>
                    <td>{row.invoiceNo}</td>
                    <td>{row.date}</td>
                    <td>{row.customer}</td>
                    <td>{row.customerGSTIN}</td>
                    <td className="amount">₹{row.taxableValue.toLocaleString()}</td>
                    <td className="amount">₹{row.gst.toLocaleString()}</td>
                    <td className="amount">₹{row.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SUMMARY */}
          <div className="report-summary">
            <div className="summary-item">
              <span className="summary-label">Total Invoices:</span>
              <span className="summary-value">{totalInvoices}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Taxable Value:</span>
              <span className="summary-value">₹{totalTaxableValue.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total GST:</span>
              <span className="summary-value">₹{totalGST.toLocaleString()}</span>
            </div>
            <div className="summary-item grand-total">
              <span className="summary-label">Grand Total:</span>
              <span className="summary-value">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesSummaryReport;
