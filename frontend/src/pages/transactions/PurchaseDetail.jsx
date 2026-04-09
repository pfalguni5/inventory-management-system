import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppIcon from "../../components/common/AppIcon"; // Adjust path if needed
import "../../styles/item-detail.css";
import { getPurchaseInvoiceById, deletePurchaseInvoice } from "../../services/purchaseService";
import { getAllParties } from "../../services/partyService";
import { getAllItems } from "../../services/itemService";

function PurchaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [purchase, setPurchase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteHovered, setDeleteHovered] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [purchaseRes, partyRes, itemRes] = await Promise.all([
          getPurchaseInvoiceById(id),
          getAllParties(),
          getAllItems()
        ]);

        const data = purchaseRes.data;
        const supplier = partyRes.data.find(p => p.id === data.partyId);
        
        // Transform items with calculated amounts
        const transformedItems = data.items.map(item => {
          const masterItem = itemRes.data.find(i => i.id === item.itemId);
          
          const qty = item.quantity || 0;
          const rate = item.rate || 0;
          const gstRate = item.gstRate || 0;
          
          // Calculate item amount: (qty * rate) + GST
          const itemSubtotal = qty * rate;
          const itemGst = itemSubtotal * (gstRate / 100);
          const itemTotal = itemSubtotal + itemGst;
          
          return {
            id: item.id,
            name: masterItem ? masterItem.name : `Item #${item.itemId}`,
            unit: item.unit,
            qty: qty,
            rate: rate,
            gstRate: gstRate,
            total: itemTotal
          };
        });
        
        // Calculate summary totals
        const subtotal = transformedItems.reduce(
          (sum, item) => sum + (item.qty * item.rate),
          0
        );
        const totalGst = transformedItems.reduce(
          (sum, item) => sum + (item.qty * item.rate * (item.gstRate / 100)),
          0
        );
        const grandTotal = subtotal + totalGst;
        
        const transformed = {
          id: data.id,
          invoiceNumber: data.billNumber,
          date: data.billDate,
          dueDate: data.dueDate,
          supplier: supplier ? supplier.name : `Supplier #${data.partyId}`,
          status: data.status,
          paymentType: data.paymentType,
          amountPaid: data.amountPaid,
          balance: data.balance,
          subtotal: subtotal,
          totalTax: totalGst,
          grandTotal: grandTotal,
          items: transformedItems
        };

        setPurchase(transformed);
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${purchase.invoiceNumber}?`)) return;
    
    try {
      await deletePurchaseInvoice(purchase.id);
      alert("Purchase invoice deleted");
      navigate("/app/purchase");
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
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

  if (isLoading) return <div>Loading...</div>;
  if (!purchase) return <div>Purchase Invoice Not Found</div>;

  const statusBadge = getStatusBadge(purchase.status);

  return (
    <div className="detail-container">
      <div className="detail-header">
        <div>
          <button className="btn-back" onClick={() => navigate("/app/purchase")}>
            <AppIcon name="back" /> Back
          </button>
          <h2 className="page-title">{purchase.invoiceNumber}</h2>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-edit-top" onClick={() => navigate(`/app/purchase/edit/${purchase.id}`)}>
            <AppIcon name="edit" /> Edit
            </button>
            <button className="btn-delete" 
                    onClick={handleDelete}
                    onMouseEnter={() => setDeleteHovered(true)}
                    onMouseLeave={() => setDeleteHovered(false)}
                    style={{
                      backgroundColor: "#f44336",
                      color: "white",
                      transition: "all 0.3s ease",
                      transform: deleteHovered ? "scale(1.05)" : "scale(1)",
                      boxShadow: deleteHovered ? "0 4px 12px rgba(244, 67, 54, 0.4)" : "none",
                    }}>
            <AppIcon name="trash" /> Delete
            </button>
        </div>
      </div>

      <div className="detail-card">
        <div className="detail-section">
          <h3 className="section-title">Invoice Details</h3>
          <div className="detail-grid">
            <div className="detail-row">
              <label>Invoice Number</label>
              <span>{purchase.invoiceNumber}</span>
            </div>
            <div className="detail-row">
              <label>Bill Date</label>
              <span>{new Date(purchase.date).toLocaleDateString("en-IN")}</span>
            </div>
            <div className="detail-row">
              <label>Supplier</label>
              <span>{purchase.supplier}</span>
            </div>
            <div className="detail-row">
              <label>Status</label>
              <span>
                <span className="status-badge" style={{ backgroundColor: statusBadge.bg, color: statusBadge.color, padding: "4px 8px", borderRadius: "4px" }}>
                  {statusBadge.text}
                </span>
              </span>
            </div>
            <div className="detail-row">
              <label>Payment Type</label>
              <span>{purchase.paymentType}</span>
            </div>
            <div className="detail-row">
              <label>Amount Paid</label>
              <span>{formatCurrency(purchase.amountPaid)}</span>
            </div>
            <div className="detail-row">
              <label>Balance</label>
              <span>{formatCurrency(purchase.balance)}</span>
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <div className="detail-section">
          <h3 className="section-title">Items</h3>
          <div className="table-container" style={{ marginTop: "15px" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Rate</th>
                  <th>GST %</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {purchase.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.qty}</td>
                    <td>{item.unit}</td>
                    <td>{formatCurrency(item.rate)}</td>
                    <td>{item.gstRate}%</td>
                    <td>{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="divider"></div>

        <div className="detail-section">
          <h3 className="section-title">Summary</h3>
          <div className="detail-grid">
            <div className="detail-row">
              <label>Subtotal</label>
              <span>{formatCurrency(purchase.subtotal)}</span>
            </div>
            <div className="detail-row">
              <label>GST Amount</label>
              <span>{formatCurrency(purchase.totalTax)}</span>
            </div>
            <div className="detail-row">
              <label>Grand Total</label>
              <span style={{ fontWeight: "bold", fontSize: "16px" }}>{formatCurrency(purchase.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PurchaseDetail;