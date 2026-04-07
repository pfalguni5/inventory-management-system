import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AppIcon from "../../components/common/AppIcon";
import "../../styles/item-detail.css";
import { getSalesInvoiceById, deleteSalesInvoice } from "../../services/salesService";
import { getAllParties } from "../../services/partyService";
import { getAllItems } from "../../services/itemService";

function SalesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteHovered, setDeleteHovered] = useState(false);

    useEffect(() => {
    const fetchSalesDetail = async () => {
      setIsLoading(true);
      try {
        const [invoiceResponse, partiesResponse, itemsResponse] = await Promise.all([
          getSalesInvoiceById(id),
          getAllParties(),
          getAllItems(),
        ]);

        const invoice = invoiceResponse.data;
        const parties = partiesResponse.data;
        const itemsMaster = itemsResponse.data;

        const party = parties.find((p) => p.id === invoice.partyId);

        const transformedSale = {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          date: invoice.invoiceDate,
          dueDate: invoice.dueDate,
          customer: party ? party.name : `Party #${invoice.partyId}`,
          paymentType: invoice.paymentType || "-",
          amountPaid: invoice.amountPaid || 0,
          balance: invoice.balance || 0,
          items: (invoice.items || []).map((itemLine) => {
            const matchedItem = itemsMaster.find((i) => i.id === itemLine.itemId);

            return {
              name: matchedItem ? matchedItem.name : `Item #${itemLine.itemId}`,
              type:
                matchedItem?.type?.toLowerCase() === "goods"
                  ? "Goods"
                  : "Service",
              hsnCode: matchedItem?.hsn || "-",
              qty: itemLine.quantity,
              unit: itemLine.unit,
              rate: itemLine.rate,
              discountAmount: itemLine.discount || 0,
              gst: itemLine.gstRate,
              amount: itemLine.total,
            };
          }),
          subtotal: invoice.subtotal || 0,
          totalDiscount: invoice.totalDiscount || 0,
          taxableValue:
            (invoice.subtotal || 0) - (invoice.totalDiscount || 0),
          gstAmount: invoice.totalTax || 0,
          total: invoice.grandTotal || 0,
          status:
            invoice.status === "paid"
              ? "Completed"
              : invoice.status === "partial"
              ? "Partial"
              : invoice.status === "cancelled"
              ? "Cancelled"
              : "Pending",
        };

        setSale(transformedSale);
      } catch (error) {
        console.error("Error fetching sales invoice detail:", error);
        setSale(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesDetail();
  }, [id]);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      Completed: { bg: "#d4edda", color: "#155724" },
      Partial: { bg: "#d1ecf1", color: "#0c5460" },
      Pending: { bg: "#fff3cd", color: "#856404" },
      Cancelled: { bg: "#f8d7da", color: "#721c24" },
    };
    return statusStyles[status] || statusStyles.Pending;
  };

  const handleDeleteInvoice = async () => {
    const confirmDelete = window.confirm(`Are you sure you want to delete invoice "${sale.invoiceNumber}"?`);

    if (!confirmDelete) return;

    try {
      await deleteSalesInvoice(sale.id);
      alert("Sales invoice deleted successfully");
      navigate("/app/sales");
    } catch (error) {
      console.error("Error deleting sales invoice:", error);
      alert(
        error.response?.data?.message ||
        "Failed to delete sales invoice"
      );
    }
  };

  if (isLoading) {
    return (
      <div>
        <h2 className="page-title">Loading invoice details...</h2>
      </div>
    );
  }

  if (!sale) {
    return (
      <div>
        <h2 className="page-title">Invoice Not Found</h2>
        <button className="btn-primary" onClick={() => navigate("/app/sales")}>
          Back to Sales
        </button>
      </div>
    );
  }

  const statusBadge = getStatusBadge(sale.status);

  return (
    <div className="detail-container">
      <div className="detail-header">
        <div>
          <button className="btn-back" onClick={() => navigate("/app/sales")}>
            <AppIcon name="back" /> Back
          </button>
          <h2 className="page-title">{sale.invoiceNumber}</h2>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn-edit-top" onClick={() => navigate(`/app/sales/edit/${sale.id}`)}>
            <AppIcon name="edit" /> Edit
          </button>
          <button className="btn-delete" 
                  onClick={handleDeleteInvoice}
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
              <span>{sale.invoiceNumber}</span>
            </div>
            <div className="detail-row">
              <label>Invoice Date</label>
              <span>{new Date(sale.date).toLocaleDateString("en-IN")}</span>
            </div>
            <div className="detail-row">
              <label>Due Date</label>
              <span>
                {sale.dueDate ? new Date(sale.dueDate).toLocaleDateString("en-IN") : "-"}
              </span>
            </div>
            <div className="detail-row">
              <label>Customer</label>
              <span>{sale.customer}</span>
            </div>
            <div className="detail-row">
              <label>Payment Type</label>
              <span>{sale.paymentType}</span>
            </div>
            <div className="detail-row">
              <label>Amount Paid</label>
              <span>{formatCurrency(sale.amountPaid)}</span>
            </div>
            <div className="detail-row">
              <label>Balance</label>
              <span>{formatCurrency(sale.balance)}</span>
            </div>
            <div className="detail-row">
              <label>Status</label>
              <span>
                <span
                  className="status-badge"
                  style={{
                    backgroundColor: statusBadge.bg,
                    color: statusBadge.color,
                    padding: "4px 12px",
                    borderRadius: "4px",
                    display: "inline-block",
                  }}
                >
                  {sale.status}
                </span>
              </span>
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
                  <th>HSN Code</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Rate</th>
                  <th>Discount</th>
                  <th>GST %</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.hsnCode}</td>
                    <td>{item.qty}</td>
                    <td>{item.unit}</td>
                    <td>{formatCurrency(item.rate)}</td>
                    <td>{formatCurrency(item.discountAmount)}</td>
                    <td>{item.gst}%</td>
                    <td>{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="divider"></div>

        <div className="detail-grid">
          <div className="detail-row">
            <label>Subtotal</label>
            <span>{formatCurrency(sale.subtotal)}</span>
          </div>
          <div className="detail-row">
            <label>Total Discount</label>
            <span>{formatCurrency(sale.totalDiscount)}</span>
          </div>
          <div className="detail-row">
            <label>Subtotal (Taxable Value)</label>
            <span>{formatCurrency(sale.taxableValue)}</span>
          </div>
          <div className="detail-row">
            <label>Total GST</label>
            <span>{formatCurrency(sale.gstAmount)}</span>
          </div>
          <div className="detail-row">
            <label>Grand Total</label>
            <span style={{ fontWeight: "bold", fontSize: "16px" }}>
              {formatCurrency(sale.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesDetail;
