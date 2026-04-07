import { useState, useEffect } from "react";
import "../../styles/share-reports-modal.css";

const AVAILABLE_REPORTS = [
  { id: "gstr1", label: "GSTR-1", description: "Outward supplies (Sales)" },
  { id: "gstr3b", label: "GSTR-3B", description: "Monthly GST summary" },
  { id: "gstr2a", label: "GSTR-2A / 2B", description: "Purchase reference report" },
  { id: "gstr9", label: "GSTR-9", description: "Annual GST return (Yearly summary)" },
  { id: "gstr9c", label: "GSTR-9C", description: "Annual reconciliation statement" },
  { id: "sales-summary", label: "Sales Summary", description: "Total sales for selected period" },
  { id: "purchase-summary", label: "Purchase Summary", description: "Total purchases for selected period" },
  { id: "stock-report", label: "Stock Report", description: "Item-wise stock balance" },
  { id: "profit-loss", label: "Profit & Loss", description: "Income statement and profitability analysis" },
];

function ShareReportsModal({ isOpen, onClose }) {
  const [selectedReports, setSelectedReports] = useState([]);
  const [format, setFormat] = useState("pdf");
  const [selectAll, setSelectAll] = useState(false);

  // Handle Escape key press
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const handleReportToggle = (reportId) => {
    setSelectedReports((prev) => {
      const updated = prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId];
      
      // Update selectAll checkbox if needed
      if (updated.length === 0) {
        setSelectAll(false);
      } else if (updated.length === AVAILABLE_REPORTS.length) {
        setSelectAll(true);
      }
      
      return updated;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedReports([]);
      setSelectAll(false);
    } else {
      setSelectedReports(AVAILABLE_REPORTS.map((r) => r.id));
      setSelectAll(true);
    }
  };

  const handleSend = () => {
    if (selectedReports.length === 0) return;

    // Simulate sharing (will be connected to backend later)
    console.log("Sharing reports to CA:", {
      reports: selectedReports,
      format: format,
      timestamp: new Date().toISOString(),
    });

    // Show success message
    alert(`Reports shared with CA!\nSelected: ${selectedReports.length} report(s)\nFormat: ${format.toUpperCase()}`);
    
    // Close modal and reset
    onClose();
    setSelectedReports([]);
    setSelectAll(false);
    setFormat("pdf");
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="share-modal-backdrop" onClick={handleBackdropClick}>
      <div className="share-modal-container">
        {/* Modal Header */}
        <div className="share-modal-header">
          <h2 className="share-modal-title">Share Reports to CA</h2>
          <button
            className="share-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="share-modal-body">
          {/* Select All Section */}
          <div className="share-modal-section">
            <div className="select-all-container">
              <input
                type="checkbox"
                id="selectAll"
                checked={selectAll}
                onChange={handleSelectAll}
                className="report-checkbox"
              />
              <label htmlFor="selectAll" className="select-all-label">
                Select All Reports
              </label>
            </div>
          </div>

          {/* Reports List */}
          <div className="share-modal-section">
            <h3 className="section-subtitle">Available Reports</h3>
            <div className="reports-list">
              {AVAILABLE_REPORTS.map((report) => (
                <div key={report.id} className="report-item">
                  <input
                    type="checkbox"
                    id={`report-${report.id}`}
                    checked={selectedReports.includes(report.id)}
                    onChange={() => handleReportToggle(report.id)}
                    className="report-checkbox"
                  />
                  <label htmlFor={`report-${report.id}`} className="report-label">
                    <div className="report-label-content">
                      <span className="report-label-title">{report.label}</span>
                      <span className="report-label-desc">{report.description}</span>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div className="share-modal-section">
            <label className="format-label">Export Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="format-select"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="share-modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-send"
            onClick={handleSend}
            disabled={selectedReports.length === 0}
          >
            Send ({selectedReports.length})
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareReportsModal;
