import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppIcon from "../../components/common/AppIcon";
import ShareReportsModal from "../../components/reports/ShareReportsModal";
import "../../styles/reports.css";

function ReportsHome() {
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);

  // assume this comes from business setup later
  const isGSTEnabled = true;

  const gstReports = [
    {
      title: "GSTR-1",
      description: "Outward supplies (Sales)",
      iconName: "export",
      path: "/app/reports/gstr1",
    },
    {
      title: "GSTR-3B",
      description: "Monthly GST summary",
      iconName: "chart",
      path: "/app/reports/gstr3b",
    },
    {
      title: "GSTR-2A / 2B",
      description: "Purchase reference report",
      iconName: "import",
      path: "/app/reports/gstr2a",
    },
    {
      title: "GSTR-9",
      description: "Annual GST return (Yearly summary)",
      iconName: "document",
      path: "/app/reports/gstr-9",
    },
    {
      title: "GSTR-9C",
      description: "Annual reconciliation statement",
      iconName: "document",
      path: "/app/reports/gstr-9c",
    },
  ];

  const businessReports = [
    {
      title: "Sales Summary",
      description: "Total sales for selected period",
      iconName: "invoice",
      path: "/app/reports/sales-summary",
    },
    {
      title: "Purchase Summary",
      description: "Total purchases for selected period",
      iconName: "purchase",
      path: "/app/reports/purchase-summary",
    },
    {
      title: "Stock Report",
      description: "Item-wise stock balance",
      iconName: "inventory",
      path: "/app/reports/stock-report",
    },
    {
      title: "Profit & Loss",
      description: "Income statement and profitability analysis",
      iconName: "chartLine",
      path: "/app/reports/profit-loss",
    },
  ];

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div>
          <h1 className="reports-title">Reports</h1>
          <p className="reports-subtitle">View detailed business and compliance reports</p>
        </div>
        <button
          className="btn-share-ca"
          onClick={() => setShowShareModal(true)}
        >
          <AppIcon name="share" /> Share Reports to CA
        </button>
      </div>

      {/* GST REPORTS */}
      {isGSTEnabled && (
        <div className="reports-section">
          <div className="reports-section-header">
          <h2 className="reports-section-title"><AppIcon name="gstReport" /> GST Reports</h2>
          <p className="reports-section-desc">Government GST compliance forms and reports</p>
        </div>

          <div className="reports-grid">
            {gstReports.map((report) => (
              <div
                key={report.path}
                className="report-card gst-report"
                onClick={() => navigate(report.path)}
                role="button"
                tabIndex="0"
              >
                <div className="report-icon"><AppIcon name={report.iconName} /></div>
                <h3 className="report-title">{report.title}</h3>
                <p className="report-description">{report.description}</p>
                <div className="report-arrow"><AppIcon name="arrowRight" /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BUSINESS REPORTS */}
      <div className="reports-section">
        <div className="reports-section-header">
          <h2 className="reports-section-title"><AppIcon name="chartLine" /> Business Reports</h2>
          <p className="reports-section-desc">Operational and financial reports for your business</p>
        </div>

        <div className="reports-grid">
          {businessReports.map((report) => (
            <div
              key={report.path}
              className="report-card business-report"
              onClick={() => navigate(report.path)}
              role="button"
              tabIndex="0"
            >
              <div className="report-icon"><AppIcon name={report.iconName} /></div>
              <h3 className="report-title">{report.title}</h3>
              <p className="report-description">{report.description}</p>
              <div className="report-arrow"><AppIcon name="arrowRight" /></div>
            </div>
          ))}
        </div>
      </div>

      {/* Share Reports Modal */}
      <ShareReportsModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </div>
  );
}

export default ReportsHome;
