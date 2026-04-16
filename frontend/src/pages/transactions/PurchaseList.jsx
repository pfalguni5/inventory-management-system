import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppIcon from "../../components/common/AppIcon"; // Adjust path if needed
import { getAllPurchaseInvoices, deletePurchaseInvoice } from "../../services/purchaseService";
import { getAllParties } from "../../services/partyService";

function PurchaseList() {
  const navigate = useNavigate();
  
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredPurchaseId, setHoveredPurchaseId] = useState(null);

  // Filter states
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterDateRange, setFilterDateRange] = useState("all");
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [filterMaxAmount, setFilterMaxAmount] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [purchaseRes, partyRes] = await Promise.all([
          getAllPurchaseInvoices(),
          getAllParties()
        ]);

        // Create a map for Party ID -> Name and filter for suppliers
        const partyMap = {};
        const allSuppliers = [];
        
        partyRes.data.forEach(p => {
          partyMap[p.id] = p.name;
          
          // Filter: only include SUPPLIER and BOTH types, exclude CUSTOMER
          const type = (p.type || "").toUpperCase().trim();
          if (type === "SUPPLIER" || type === "BOTH") {
            allSuppliers.push({
              id: p.id,
              name: p.name
            });
          }
        });

        setSuppliers(allSuppliers);

        const transformed = purchaseRes.data.map(p => ({
          id: p.id,
          invoiceNumber: p.billNumber,
          date: p.billDate,
          partyId: p.partyId,
          supplier: partyMap[p.partyId] || `Supplier #${p.partyId}`,
          total: p.grandTotal,
          status: p.status // 'pending', 'partial', 'paid'
        }));

        setPurchases(transformed);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load purchase invoices");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
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
  const getFilteredPurchases = () => {
    let filtered = [...purchases];

    // Filter by status
    if (filterStatus !== "All") {
      filtered = filtered.filter((purchase) => {
        const purchaseStatus = purchase.status === "paid" ? "Paid" : 
                               purchase.status === "pending" ? "Pending" : 
                               purchase.status === "partial" ? "Partial" : 
                               purchase.status === "cancelled" ? "Cancelled" : "Pending";
        return purchaseStatus === filterStatus;
      });
    }

    // Filter by supplier
    if (filterSupplier) {
      filtered = filtered.filter((purchase) => purchase.partyId === parseInt(filterSupplier));
    }

    // Filter by date range
    if (filterDateRange !== "all") {
      const { start, end } = getDateRange(filterDateRange);
      filtered = filtered.filter((purchase) => {
        const purchaseDate = new Date(purchase.date);
        return purchaseDate >= start && purchaseDate < end;
      });
    }

    // Filter by amount range
    if (filterMinAmount !== "") {
      const minAmount = parseFloat(filterMinAmount);
      filtered = filtered.filter((purchase) => purchase.total >= minAmount);
    }

    if (filterMaxAmount !== "") {
      const maxAmount = parseFloat(filterMaxAmount);
      filtered = filtered.filter((purchase) => purchase.total <= maxAmount);
    }

    return filtered;
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      paid: { bg: "#d4edda", color: "#155724", text: "Paid" },
      pending: { bg: "#fff3cd", color: "#856404", text: "Pending" },
      partial: { bg: "#d1ecf1", color: "#0c5460", text: "Partial" },
      cancelled: { bg: "#f8d7da", color: "#721c24", text: "Cancelled" },
    };
    return statusStyles[status] || statusStyles.pending;
  };

  const handleRowClick = (id) => {
    navigate(`/app/purchase/${id}`);
  };

  const handleDelete = async (e, id, billNumber) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete Purchase Invoice ${billNumber}?`)) {
      return;
    }

    try {
      await deletePurchaseInvoice(id);
      setPurchases(purchases.filter(p => p.id !== id));
      alert("Purchase invoice deleted successfully");
    } catch (error) {
      console.error("Delete failed", error);
      alert(error.response?.data?.message || "Failed to delete purchase invoice");
    }
  };

  return (
    <div>
      <h2 className="page-title">Purchase Invoices</h2>

      <div className="list-header">
        <button className="btn-new" onClick={() => navigate("/app/purchase/new")}>
          + New Purchase Entry
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
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Supplier Filter */}
        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "12px" }}>
            Supplier
          </label>
          <select
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "13px"
            }}
          >
            <option value="">All Suppliers</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
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
              <th>Date</th>
              <th>Supplier</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="no-data">Loading purchases...</td>
              </tr>
            ) : getFilteredPurchases().length > 0 ? (
              getFilteredPurchases().map((purchase) => {
                const statusBadge = getStatusBadge(purchase.status);
                return (
                  <tr 
                    key={purchase.id}
                    onClick={() => handleRowClick(purchase.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="invoice-number">{purchase.invoiceNumber}</td>
                    <td>{new Date(purchase.date).toLocaleDateString("en-IN")}</td>
                    <td>{purchase.supplier}</td>
                    <td className="amount" style={{ fontSize: "14px" }}>{formatCurrency(purchase.total)}</td>
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
                    <td>
                      <button 
                        className="btn-delete-icon"
                        onClick={(e) => handleDelete(e, purchase.id, purchase.invoiceNumber)}
                        onMouseEnter={() => setHoveredPurchaseId(purchase.id)}
                        onMouseLeave={() => setHoveredPurchaseId(null)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#f44336",
                          cursor: "pointer",
                          fontSize: "18px",
                          padding: "4px 8px",
                          transition: "all 0.3s ease",
                          transform: hoveredPurchaseId === purchase.id ? "scale(1.2)" : "scale(1)",
                          opacity: hoveredPurchaseId === purchase.id ? "1" : "0.7",
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
                <td colSpan="6" className="no-data">
                  {purchases.length === 0 ? "No purchase invoices found" : "No results match your filters"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PurchaseList;