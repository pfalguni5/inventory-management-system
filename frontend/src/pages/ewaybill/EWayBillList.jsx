import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppIcon from "../../components/common/AppIcon";
import "../../styles/global.css";
import api from "../../services/api";

// Helper to determine e-way bill status based on validity date
function getEWayBillStatus(validUntil, backendStatus) {
  if (backendStatus) {
    const s = String(backendStatus).toUpperCase();
    if (s === "ACTIVE") return "Active";
    if (s === "EXPIRED") return "Expired";
    if (s === "CANCELLED") return "Cancelled";
  }

  const now = new Date();
  const expiry = validUntil ? new Date(validUntil) : null;
  if (!expiry || isNaN(expiry)) return "Unknown";
  return now < expiry ? "Active" : "Expired";
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Get remaining days
function getRemainingDays(validUntil, backendDaysRemaining) {
  if (backendDaysRemaining !== undefined && backendDaysRemaining !== null) {
    const n = Number(backendDaysRemaining);
    return Number.isFinite(n) ? Math.max(0, Math.ceil(n)) : 0;
  }

  if (!validUntil) return 0;
  const now = new Date();
  const expiry = new Date(validUntil);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

// Format currency
function formatCurrency(amount) {
  const num = amount === null || amount === undefined ? 0 : Number(amount);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(num) ? num : 0);
}

// Get icon name based on transport mode
function getTransportIconName(mode) {
  const m = (mode || "").toString().toUpperCase();
  const icons = {
    ROAD: "vehicle",
    RAIL: "train",
    AIR: "airplane",
    SHIP: "ship",
  };
  return icons[m] || "ewaybill";
}

function EWayBillList() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);

  // pagination (optional)
  const [page, setPage] = useState(0);
  const [size] = useState(50);
  const [hasMore, setHasMore] = useState(false);

  const fetchBills = useCallback(async (pageToLoad = 0) => {
    try {
      const response = await api.get(`/eway-bills?page=${pageToLoad}&size=${size}`);

      const data = response.data;
      const content = Array.isArray(data?.content) ? data.content : [];

      const mapped = content.map((x) => ({
        id: x.id,
        ewayBillNumber: x.ewayBillNumber,
        generatedAt: x.createdAt,
        validUntil: x.validUntil,
        invoiceValue: x.totalInvoiceValue,
        modeOfTransport: x.transportMode,
        status: x.status,
        daysRemaining: x.daysRemaining,
      }));

      setBills(mapped);
      setPage(data?.number ?? pageToLoad);
      setHasMore(
        typeof data?.totalPages === "number"
          ? (data.number ?? pageToLoad) < data.totalPages - 1
          : false
      );

    } catch (error) {
      console.error(error);
      setBills([]);
    }
  }, [size]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (!alive) return;
        await fetchBills(0);
      } catch (e) {
        console.error(e);
        if (alive) setBills([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, [fetchBills]);

  const handleRowClick = (id) => {
    navigate(`/app/e-way-bills/${id}`);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      Active: { bg: "#d4edda", color: "#155724", border: "#c3e6cb" },
      Expired: { bg: "#f8d7da", color: "#721c24", border: "#f5c6cb" },
      Cancelled: { bg: "#fff3cd", color: "#856404", border: "#ffeeba" },
      Unknown: { bg: "#e2e3e5", color: "#383d41", border: "#d6d8db" },
    };
    return statusStyles[status] || statusStyles.Unknown;
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
      <h2 className="page-title">E-Way Bills</h2>
      <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>
        View and manage prepared e-way bills
      </p>

      <div className="list-header">
        <button
          className="btn-new"
          onClick={() => navigate("/app/e-way-bills/new")}
        >
          + Create New E-Way Bill
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
        {bills.length > 0 ? (
          bills.map((ewb) => {
            const status = getEWayBillStatus(ewb.validUntil, ewb.status);
            const statusBadge = getStatusBadge(status);
            const remainingDays = getRemainingDays(ewb.validUntil, ewb.daysRemaining);
            const iconName = getTransportIconName(ewb.modeOfTransport);

            return (
              <div
                key={ewb.id}
                onClick={() => handleRowClick(ewb.id)}
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "10px",
                  padding: "16px 18px",
                  cursor: "pointer",
                  display: "grid",
                  gridTemplateColumns: "48px 1fr auto",
                  gap: "16px",
                  alignItems: "center",
                  transition: "all 0.3s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)";
                  e.currentTarget.style.borderColor = "#007bff";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
                  e.currentTarget.style.borderColor = "#e0e0e0";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "48px",
                    height: "48px",
                    backgroundColor: "#f0f7ff",
                    borderRadius: "8px",
                    fontSize: "20px",
                  }}
                >
                  <AppIcon name={iconName} />
                </div>

                {/* Main Info */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>
                      {ewb.ewayBillNumber}
                    </div>
                    <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>
                      {formatDate(ewb.generatedAt)}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "14px",
                      fontSize: "12px",
                    }}
                  >
                    <div>
                      <div style={{ color: "#999", fontWeight: "600", textTransform: "uppercase", marginBottom: "2px" }}>
                        Value
                      </div>
                      <div style={{ color: "#007bff", fontWeight: "600" }}>
                        {formatCurrency(ewb.invoiceValue)}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: "#999", fontWeight: "600", textTransform: "uppercase", marginBottom: "2px" }}>
                        Mode
                      </div>
                      <div style={{ color: "#333", fontWeight: "500" }}>
                        {String(ewb.modeOfTransport || "-")
                          .toLowerCase()
                          .replace(/^\w/, (c) => c.toUpperCase())}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: "#999", fontWeight: "600", textTransform: "uppercase", marginBottom: "2px" }}>
                        Valid Until
                      </div>
                      <div style={{ color: "#333", fontWeight: "500" }}>
                        {formatDate(ewb.validUntil)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Content */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                  <span
                    style={{
                      backgroundColor: statusBadge.bg,
                      color: statusBadge.color,
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      border: `1px solid ${statusBadge.border}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {status}
                  </span>
                  <div style={{ fontSize: "12px", color: "#666", textAlign: "right" }}>
                    <span style={{ fontWeight: "600", color: "#1a1a1a" }}>{remainingDays}</span>{" "}
                    {remainingDays === 1 ? "day" : "days"} left
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "50px 40px",
              backgroundColor: "#f9f9f9",
              borderRadius: "10px",
              color: "#999",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>
              <AppIcon name="ewaybill" />
            </div>
            <div style={{ fontSize: "15px", fontWeight: "500" }}>No e-way bills found</div>
            <div style={{ fontSize: "13px", marginTop: "6px", color: "#aaa" }}>
              Create a new e-way bill to get started
            </div>
          </div>
        )}

        {hasMore && bills.length > 0 ? (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
            <button
              className="btn-new"
              style={{ background: "#fff", color: "#007bff", border: "1px solid #007bff" }}
              onClick={async () => {
                try {
                  await fetchBills(page + 1);
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              Load More
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default EWayBillList;