import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllSalesInvoices, deleteSalesInvoice } from "../../services/salesService";
import { getAllParties } from "../../services/partyService";
import AppIcon from "../../components/common/AppIcon";

function SalesList() {
  const navigate = useNavigate();
  
  const [sales, setSales] = useState([]);
  const [parties, setParties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredInvoiceId, setHoveredInvoiceId] = useState(null);

  // Filter states
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCustomer, setFilterCustomer] = useState("");
  const [filterDateRange, setFilterDateRange] = useState("all");
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [filterMaxAmount, setFilterMaxAmount] = useState("");

    useEffect(() => {
    const fetchSalesData = async () => {
      setIsLoading(true);
      try {
        const [salesResponse, partiesResponse] = await Promise.all([
          getAllSalesInvoices(),
          getAllParties(),
        ]);

        const partiesMap = {};
        const allParties = [];
        
        partiesResponse.data.forEach((party) => {
          partiesMap[party.id] = party.name;
          
          // Filter: only include CUSTOMER and BOTH types, exclude SUPPLIER
          const type = (party.type || "").toUpperCase().trim();
          if (type === "CUSTOMER" || type === "BOTH") {
            allParties.push({
              id: party.id,
              name: party.name
            });
          }
        });

        setParties(allParties);

        const transformedSales = salesResponse.data.map((invoice) => ({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          date: invoice.invoiceDate,
          partyId: invoice.partyId,
          customer: partiesMap[invoice.partyId] || `Party #${invoice.partyId}`,
          items: invoice.items ? invoice.items.length : 0,
          total: invoice.grandTotal || invoice.subtotal || 0,
          status:
            invoice.status === "paid"
              ? "Completed"
              : invoice.status === "partial"
              ? "Partial"
              : invoice.status === "cancelled"
              ? "Cancelled"
              : "Pending",
        }));

        setSales(transformedSales);
      } catch (error) {
        console.error("Error fetching sales invoices:", error);
        alert(error.response?.data?.message || "Failed to fetch sales invoices");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to get date range
  const getDateRange = (range) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let startDate = new Date(today);

    switch (range) {
      case "today":
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case "week":
        startDate.setDate(today.getDate() - today.getDay());
        return { start: startDate, end: new Date() };
      case "month":
        startDate.setDate(1);
        return { start: startDate, end: new Date() };
      case "30days":
        startDate.setDate(today.getDate() - 30);
        return { start: startDate, end: new Date() };
      default:
        return { start: null, end: null };
    }
  };

  // Apply all filters
  const getFilteredSales = () => {
    let filtered = [...sales];

    // Filter by status
    if (filterStatus !== "All") {
      filtered = filtered.filter((sale) => sale.status === filterStatus);
    }

    // Filter by customer
    if (filterCustomer) {
      filtered = filtered.filter((sale) => sale.partyId === parseInt(filterCustomer));
    }

    // Filter by date range
    if (filterDateRange !== "all") {
      const { start, end } = getDateRange(filterDateRange);
      filtered = filtered.filter((sale) => {
        const saleDate = new Date(sale.date);
        return saleDate >= start && saleDate < end;
      });
    }

    // Filter by amount range
    if (filterMinAmount !== "") {
      const minAmount = parseFloat(filterMinAmount);
      filtered = filtered.filter((sale) => sale.total >= minAmount);
    }

    if (filterMaxAmount !== "") {
      const maxAmount = parseFloat(filterMaxAmount);
      filtered = filtered.filter((sale) => sale.total <= maxAmount);
    }

    return filtered;
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      Completed: { bg: "#d4edda", color: "#155724", text: "Completed" },
      Partial: { bg:"#d1ecf1", color: "#0c5460", text: "Partial" },
      Pending: { bg: "#fff3cd", color: "#856404", text: "Pending" },
      Cancelled: { bg: "#f8d7da", color: "#721c24", text: "Cancelled" },
    };
    return statusStyles[status] || statusStyles.Pending;
  };

  const handleRowClick = (id) => {
    navigate(`/app/sales/${id}`);
  };

  const handleDeleteInvoice = async (invoiceId, invoiceNumber) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete invoice "${invoiceNumber}"?`);

    if (!confirmDelete) return;

    try {
      await deleteSalesInvoice(invoiceId);

      setSales((prevSales) => prevSales.filter((sale) => sale.id !== invoiceId));

      alert("Sales invoice deleted successfully");
    } catch (error) {
      console.error("Error deleting sales invoice:", error);
      alert(
        error.response?.data?.message ||
        "Failed to delete sales invoice"
      );
    }
  };

  return (
    <div>
      <h2 className="page-title">Sales Invoices</h2>

      <div className="list-header">
        <button className="btn-new" onClick={() => navigate("/app/sales/new")}>
          + New Sales Invoice
        </button>
      </div>

      {/* FILTERS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "15px",
        marginBottom: "20px",
        padding: "15px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px"
      }}>
        {/* Status Filter */}
        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "12px" }}>
            Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "13px"
            }}
          >
            <option value="All">All</option>
            <option value="Completed">Completed</option>
            <option value="Partial">Partial</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* Customer Filter */}
        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "12px" }}>
            Customer
          </label>
          <select
            value={filterCustomer}
            onChange={(e) => setFilterCustomer(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "13px"
            }}
          >
            <option value="">All Customers</option>
            {parties.map((party) => (
              <option key={party.id} value={party.id}>
                {party.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "12px" }}>
            Date Range
          </label>
          <select
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "13px"
            }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {/* Amount Range - Min */}
        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "12px" }}>
            Min Amount (₹)
          </label>
          <input
            type="number"
            value={filterMinAmount}
            onChange={(e) => setFilterMinAmount(e.target.value)}
            placeholder="0"
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "13px",
              boxSizing: "border-box"
            }}
          />
        </div>

        {/* Amount Range - Max */}
        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "12px" }}>
            Max Amount (₹)
          </label>
          <input
            type="number"
            value={filterMaxAmount}
            onChange={(e) => setFilterMaxAmount(e.target.value)}
            placeholder="No limit"
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "13px",
              boxSizing: "border-box"
            }}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th style={{ width: "60px", textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className="no-data">
                  Loading sales invoices...
                </td>
              </tr>
            ) : getFilteredSales().length > 0 ? (
              getFilteredSales().map((sale) => {
                const statusBadge = getStatusBadge(sale.status);
                return (
                  <tr 
                    key={sale.id}
                    onClick={() => handleRowClick(sale.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="invoice-number">{sale.invoiceNumber}</td>
                    <td>{sale.customer}</td>
                    <td className="amount" style={{ fontSize: "14px" }}>{formatCurrency(sale.total)}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: statusBadge.bg,
                          color: statusBadge.color,
                        }}
                      >
                        {statusBadge.text}
                      </span>
                    </td>
                    <td className="center" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn-delete-icon"
                        onClick={() => handleDeleteInvoice(sale.id, sale.invoiceNumber)}
                        onMouseEnter={() => setHoveredInvoiceId(sale.id)}
                        onMouseLeave={() => setHoveredInvoiceId(null)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#f44336",
                          cursor: "pointer",
                          fontSize: "18px",
                          padding: "4px 8px",
                          transition: "all 0.3s ease",
                          transform: hoveredInvoiceId === sale.id ? "scale(1.2)" : "scale(1)",
                          opacity: hoveredInvoiceId === sale.id ? "1" : "0.7",
                        }}
                        title="Delete invoice"
                      >
                        <AppIcon name="trash" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  No sales invoices found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SalesList;
