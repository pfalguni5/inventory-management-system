import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllSalesInvoices, deleteSalesInvoice } from "../../services/salesService";
import { getAllParties } from "../../services/partyService";
import AppIcon from "../../components/common/AppIcon";

function SalesList() {
  const navigate = useNavigate();
  
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredInvoiceId, setHoveredInvoiceId] = useState(null);

    useEffect(() => {
    const fetchSalesData = async () => {
      setIsLoading(true);
      try {
        const [salesResponse, partiesResponse] = await Promise.all([
          getAllSalesInvoices(),
          getAllParties(),
        ]);

        const partiesMap = {};
        partiesResponse.data.forEach((party) => {
          partiesMap[party.id] = party.name;
        });

        const transformedSales = salesResponse.data.map((invoice) => ({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          date: invoice.invoiceDate,
          customer: partiesMap[invoice.partyId] || `Party #${invoice.partyId}`,
          items: invoice.items ? invoice.items.length : 0,
          total: invoice.grandTotal || 0,
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
            ) : sales.length > 0 ? (
              sales.map((sale) => {
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
