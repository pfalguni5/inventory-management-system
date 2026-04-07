import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppIcon from "../../components/common/AppIcon"; // Adjust path if needed
import { getAllPurchaseInvoices, deletePurchaseInvoice } from "../../services/purchaseService";
import { getAllParties } from "../../services/partyService";

function PurchaseList() {
  const navigate = useNavigate();
  
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredPurchaseId, setHoveredPurchaseId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [purchaseRes, partyRes] = await Promise.all([
          getAllPurchaseInvoices(),
          getAllParties()
        ]);

        // Create a map for Party ID -> Name
        const partyMap = {};
        partyRes.data.forEach(p => {
          partyMap[p.id] = p.name;
        });

        const transformed = purchaseRes.data.map(p => ({
          id: p.id,
          invoiceNumber: p.billNumber,
          date: p.billDate,
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

  const getStatusBadge = (status) => {
    const statusStyles = {
      paid: { bg: "#d4edda", color: "#155724", text: "Paid" },
      pending: { bg: "#fff3cd", color: "#856404", text: "Pending" },
      partial: { bg: "#fff3cd", color: "#856404", text: "Partial" },
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
            ) : purchases.length > 0 ? (
              purchases.map((purchase) => {
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
                  No purchase invoices found
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