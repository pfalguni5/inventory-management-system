import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppIcon from "../../../components/common/AppIcon";
import "../../../styles/quotation.css";
import { getAllQuotations, deleteQuotation } from "../../../services/quotationService";
import { getAllParties } from "../../../services/partyService";

function QuotationList() {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [allQuotations, setAllQuotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState("All");
  const [hoveredQuotationId, setHoveredQuotationId] = useState(null);

    useEffect(() => {
    const fetchQuotationData = async () => {
      setIsLoading(true);
      try {
        const [quotationResponse, partyResponse] = await Promise.all([
          getAllQuotations(),
          getAllParties(),
        ]);

        const partiesMap = {};
        partyResponse.data.forEach((party) => {
          partiesMap[party.id] = party.name;
        });

        const transformedQuotations = quotationResponse.data.map((quotation) => ({
          id: quotation.id,
          quotationNo: quotation.quotationNumber,
          date: quotation.quotationDate,
          validTill: quotation.validUntil,
          customer: partiesMap[quotation.partyId] || `Party #${quotation.partyId}`,
          totalAmount: quotation.totalAmount || 0,
          status:
            quotation.status === "DRAFT"
              ? "Draft"
              : quotation.status === "APPROVED"
              ? "Accepted"
              : quotation.status === "REJECTED"
              ? "Rejected"
              : quotation.status === "CONVERTED"
              ? "Converted"
              : quotation.status,
        }));

        setAllQuotations(transformedQuotations);
      } catch (error) {
        console.error("Error fetching quotations:", error);
        alert(
          error.response?.data?.message ||
          "Failed to fetch quotations"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotationData();
  }, []);


  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date helper
  const formatDate = (dateStr) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateStr).toLocaleDateString("en-IN", options);
  };

  const normalizeDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
  };

  // Get status badge styling
  const getStatusStyle = (status) => {
    const styles = {
      Draft: { bg: "#e8f0ff", color: "#0066cc", text: "Draft" },
      Sent: { bg: "#fff4e6", color: "#cc8800", text: "Sent" },
      Accepted: { bg: "#d4edda", color: "#155724", text: "Accepted" },
      Rejected: { bg: "#f8d7da", color: "#721c24", text: "Rejected" },
      Converted: { bg: "#d1ecf1", color: "#0c5460", text: "Converted" },
      Expired: { bg: "#f5f5f5", color: "#666", text: "Expired" },
    };
    return styles[status] || styles.Draft;
  };

  // Filter quotations
    const filteredQuotations = allQuotations.filter((q) => {
    const quotationDate = normalizeDate(q.date);
    const from = normalizeDate(appliedFromDate);
    const to = normalizeDate(appliedToDate);
  
    const matchesSearch =
      q.quotationNo.toLowerCase().includes(appliedSearchTerm.toLowerCase()) ||
      q.customer.toLowerCase().includes(appliedSearchTerm.toLowerCase());

    const matchesStatus =
      appliedStatusFilter === "All" || q.status === appliedStatusFilter;

    const matchesFromDate = !from || quotationDate >= from;
    const matchesToDate = !to || quotationDate <= to;

    return matchesSearch && matchesStatus && matchesFromDate && matchesToDate;
  });

  const handleApplyFilters = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setAppliedStatusFilter(statusFilter);
    // Filter logic is already applied in the filteredQuotations
    console.log("Filters applied");
  };

  const handleReset = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setStatusFilter("All");

    setAppliedSearchTerm("");
    setAppliedFromDate("");
    setAppliedToDate("");
    setAppliedStatusFilter("All");
  };

  const handleRowClick = (id) => {
    navigate(`/app/sales/quotations/${id}`);
  };

    const handleDeleteQuotation = async (id, quotationNo) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete quotation "${quotationNo}"?`
    );

    if (!confirmDelete) return;

    try {
      await deleteQuotation(id);

      setAllQuotations((prevQuotations) =>
        prevQuotations.filter((q) => q.id !== id)
      );

      alert("Quotation deleted successfully");
    } catch (error) {
      console.error("Error deleting quotation:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);

      const errorData = error.response?.data;

      const errorMessage =
        errorData?.message ||
        errorData?.error ||
        errorData?.details ||
        (typeof errorData === "string" ? errorData : null) ||
        "Failed to delete quotation";

      alert(errorMessage);
    }
  };

  return (
    <div className="quotation-list-container">
      {/* HEADER */}
      <div className="quotation-header">
        <div>
          <h1 className="page-title">Quotations</h1>
          <p className="page-subtitle">Create and manage sales quotations</p>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="quotation-action-bar">
        <button
          className="btn-primary btn-create-quotation"
          onClick={() => navigate("/app/sales/quotations/new")}
        >
          <AppIcon name="plus" /> Add New Quotation
        </button>
      </div>

      {/* FILTER CARD */}
      <div className="quotation-filter-card">
        <div className="filter-header">
          <h2 className="filter-title">
            <AppIcon name="search" /> Filter Quotations
          </h2>
          <p className="filter-helper-text">Use any filter(s) below to apply filter</p>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Search</label>
            <input
              type="text"
              placeholder="Search by quotation no or customer"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
              title={searchTerm || "Search by quotation no or customer"}
            />
          </div>

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

          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-input"
            >
              <option>All</option>
              <option>Draft</option>
              <option>Sent</option>
              <option>Accepted</option>
              <option>Rejected</option>
              <option>Converted</option>
              <option>Expired</option>
            </select>
          </div>

          <div className="filter-actions">
            <button className="btn-primary" onClick={handleApplyFilters}>
              Apply Filters
            </button>
            <button className="btn-secondary" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* QUOTATIONS TABLE */}
      <div className="quotation-table-card">
        <div className="table-header">
          <h3 className="table-title">
            Quotations ({filteredQuotations.length})
          </h3>
        </div>

        <div className="table-responsive">
          <table className="quotation-table">
            <thead>
              <tr>
                <th>Quotation No.</th>
                <th>Date</th>
                <th>Valid Till</th>
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
                            {isLoading ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    Loading quotations...
                  </td>
                </tr>
              ) : filteredQuotations.length > 0 ? (
                filteredQuotations.map((quotation) => {
                  const statusStyle = getStatusStyle(quotation.status);
                  return (
                    <tr
                      key={quotation.id}
                      onClick={() => handleRowClick(quotation.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <td className="quotation-no">
                        <strong>{quotation.quotationNo}</strong>
                      </td>
                      <td>{formatDate(quotation.date)}</td>
                      <td>{formatDate(quotation.validTill)}</td>
                      <td>{quotation.customer}</td>
                      <td className="amount" style={{ fontSize: "14px" }}>
                        {formatCurrency(quotation.totalAmount)}
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                          }}
                        >
                          {statusStyle.text}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          disabled={quotation.status === "Converted"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuotation(quotation.id, quotation.quotationNo);
                          }}
                          style={{
                            backgroundColor: "transparent",
                            border: "none",
                            color: hoveredQuotationId === quotation.id ? "#dc3545" : "#999",
                            fontSize: "18px",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            opacity: hoveredQuotationId === quotation.id ? 1 : 0.7,
                            transform: hoveredQuotationId === quotation.id ? "scale(1.2)" : "scale(1)",
                            padding: "4px 8px",
                          }}
                          onMouseEnter={() => setHoveredQuotationId(quotation.id)}
                          onMouseLeave={() => setHoveredQuotationId(null)}
                          title="Delete quotation"
                        >
                          <AppIcon name="trash" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    No quotations found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER */}
        <div className="table-footer">
          <div className="footer-stat">
            <span className="footer-label">Total Quotations:</span>
            <span className="footer-value">{filteredQuotations.length}</span>
          </div>
          <div className="footer-stat">
            <span className="footer-label">Total Amount:</span>
            <span className="footer-value">
              {formatCurrency(
                filteredQuotations.reduce((sum, q) => sum + q.totalAmount, 0)
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuotationList;

