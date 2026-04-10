import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppIcon from "../../components/common/AppIcon";
import {
  getEWayBillById,
  updateVehicle,
  extendValidity,
  cancelEWayBill,
  deleteEWayBill,
} from "../../services/ewayBillService";
import { getAllSalesInvoices } from "../../services/salesService";
import { getAllItems } from "../../services/itemService";
import ExtendValidityModal from "./ExtendValidityModal";
import UpdateVehicleModal from "./UpdateVehicleModal";
import CancelBillModal from "./CancelBillModal";
import "../../styles/global.css";
import "../../styles/ewaybill-detail.css";

// Helper for title casing strings
const toTitleCase = (str) => {
  if (!str) return "-";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

function EWayBillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showUpdateVehicleModal, setShowUpdateVehicleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [shareHovered, setShareHovered] = useState(false);
  const [exportHovered, setExportHovered] = useState(false);

  useEffect(() => {
    const fetchBill = async () => {
      setIsLoading(true);
      try {
        const [billResponse, itemsMasterResponse, allInvoicesResponse] = await Promise.all([
          getEWayBillById(id),
          getAllItems(),
          getAllSalesInvoices(),
        ]);
        
        const bill = billResponse.data;
        setBill(bill);

        // Find the invoice by invoice number
        if (bill.invoiceNumber) {
          try {
            const allInvoices = allInvoicesResponse.data;
            const matchedInvoice = allInvoices.find((inv) => inv.invoiceNumber === bill.invoiceNumber);

            if (matchedInvoice) {
              const itemsMaster = itemsMasterResponse.data;

              // Transform invoice items with master item data
              const transformedItems = (matchedInvoice.items || []).map((itemLine) => {
                const matchedItem = itemsMaster.find((i) => i.id === itemLine.itemId);

                const rate = itemLine.rate || 0;
                const qty = itemLine.quantity || 0;
                const discount = itemLine.discount || 0;
                const gstRate = itemLine.gstRate || 0;

                // Calculate item amount
                const itemSubtotal = qty * rate;
                const taxableBase = itemSubtotal - discount;
                const itemGst = taxableBase * (gstRate / 100);
                const itemTotal = taxableBase + itemGst;

                return {
                  itemName: matchedItem ? matchedItem.name : `Item #${itemLine.itemId}`,
                  description: matchedItem?.description || "-",
                  hsnCode: matchedItem?.hsn || "-",
                  quantity: qty,
                  unit: itemLine.unit,
                  rate: rate,
                  discountAmount: discount,
                  gstRate: gstRate,
                  amount: itemTotal,
                };
              });

              setInvoiceItems(transformedItems);
            } else {
              console.warn("No invoice found with number:", bill.invoiceNumber);
              setInvoiceItems([]);
            }
          } catch (error) {
            console.error("Error fetching invoice items:", error);
            setInvoiceItems([]);
          }
        }
      } catch (error) {
        console.error("Error fetching e-way bill:", error);
        setBill(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBill();
  }, [id]);

  const handleExtendValidity = async (additionalKm) => {
    try {
      // Backend expects total distance to calculate new validity date
      const newTotalDistance = (bill.distanceKm || 0) + additionalKm;

      const payload = {
        distanceKm: newTotalDistance,
      };

      const response = await extendValidity(id, payload);
      setBill(response.data);
      setShowExtendModal(false);
      alert(`Validity extended! New distance: ${newTotalDistance} KM`);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to extend validity");
    }
  };

  const handleUpdateVehicle = async (newVehicleNumber) => {
    try {
      const payload = {
        vehicleNumber: newVehicleNumber,
        transportMode: bill.transportMode,
      };

      const response = await updateVehicle(id, payload);
      setBill(response.data);
      setShowUpdateVehicleModal(false);
      alert("Vehicle updated successfully");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update vehicle");
    }
  };

  const handleCancelBill = async (reason) => {
    try {
      await cancelEWayBill(id);
      // Refresh bill data to see CANCELLED status
      const response = await getEWayBillById(id);
      setBill(response.data);
      setShowCancelModal(false);
      alert("E-Way Bill cancelled successfully");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to cancel bill");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this e-way bill?")) return;
    try {
      await deleteEWayBill(id);
      alert("E-Way Bill deleted");
      navigate("/app/e-way-bills");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete");
    }
  };

  const handleShareInvoice = async () => {
    const billDetails = `E-Way Bill: ${bill.ewayBillNumber}\nStatus: ${bill.status}\nFrom: ${bill.sellerBusinessName}\nTo: ${bill.buyerName}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "E-Way Bill",
          text: billDetails,
        });
      } catch (error) {
        console.error("Share error:", error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(billDetails);
      alert("E-Way Bill details copied to clipboard");
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (isLoading) return <div style={{ padding: "24px", textAlign: "center" }}>Loading...</div>;
  if (!bill) return <div style={{ padding: "24px", color: "red" }}>E-Way Bill not found</div>;

  const isActive = bill.status === "ACTIVE";

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      {/* Header with Back and Delete Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <button onClick={() => navigate("/app/e-way-bills")} style={{ padding: "8px 16px", backgroundColor: "#6c757d", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
          ← Back to List
        </button>
        <button onClick={handleDelete} style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
          <AppIcon name="trash" size={14} /> Delete
        </button>
      </div>

      {/* Share and Export Buttons */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", width: "210mm", margin: "0 auto 20px auto", marginBottom: "20px" }}>
        <button
          onMouseEnter={() => setShareHovered(true)}
          onMouseLeave={() => setShareHovered(false)}
          onClick={handleShareInvoice}
          style={{
            padding: "10px 20px",
            backgroundColor: shareHovered ? "#0c3d66" : "#1a3a52",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
            transition: "all 0.3s ease",
            transform: shareHovered ? "translateY(-2px)" : "translateY(0)",
            boxShadow: shareHovered ? "0 4px 12px rgba(0, 0, 0, 0.15)" : "0 2px 4px rgba(0, 0, 0, 0.1)"
          }}
        >
          Share
        </button>
        <button
          onMouseEnter={() => setExportHovered(true)}
          onMouseLeave={() => setExportHovered(false)}
          onClick={handleExportPDF}
          style={{
            padding: "10px 20px",
            backgroundColor: exportHovered ? "#0c3d66" : "#1a3a52",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
            transition: "all 0.3s ease",
            transform: exportHovered ? "translateY(-2px)" : "translateY(0)",
            boxShadow: exportHovered ? "0 4px 12px rgba(0, 0, 0, 0.15)" : "0 2px 4px rgba(0, 0, 0, 0.1)"
          }}
        >
          Export as PDF
        </button>
      </div>

      {/* A4 DOCUMENT */}
      <div style={{
        backgroundColor: "white",
        border: "2px solid #1a3a52",
        borderRadius: "0px",
        width: "210mm",
        height: "297mm",
        margin: "0 auto",
        padding: "0",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column"
      }}>
        
        {/* SECTION 1: HEADER - E-Way Bill Title */}
        <div style={{
          padding: "20px",
          minHeight: "80px",
          display: "flex",
          alignItems: "center",
          borderBottom: "2px solid #1a3a52"
        }}>
          <h1 style={{ margin: "0", fontSize: "35px", fontWeight: "bold", color: "#0066cc", letterSpacing: "2px" }}>
            E-Way Bill
          </h1>
        </div>

        {/* SECTION 2: E-WAY BILL DETAILS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderBottom: "2px solid #1a3a52"
        }}>
          {/* Left Column */}
          <div style={{ padding: "15px 20px", borderRight: "2px solid #1a3a52", fontSize: "12px" }}>
            <div style={{ marginBottom: "8px" }}>
              <span style={{ fontWeight: "bold", display: "inline-block", width: "100px" }}>E-Way Bill No</span>
              <span>{bill.ewayBillNumber}</span>
            </div>
            <div style={{ marginBottom: "8px" }}>
              <span style={{ fontWeight: "bold", display: "inline-block", width: "100px" }}>Generated Date</span>
              <span>{formatDateTime(bill.createdAt)}</span>
            </div>
          </div>
          {/* Right Column */}
          <div style={{ padding: "15px 20px", fontSize: "12px" }}>
            <div style={{ marginBottom: "8px" }}>
              <span style={{ fontWeight: "bold", display: "inline-block", width: "100px" }}>Valid From</span>
              <span>{formatDateTime(bill.validFrom)}</span>
            </div>
            <div style={{ marginBottom: "8px" }}>
              <span style={{ fontWeight: "bold", display: "inline-block", width: "100px" }}>Valid Until</span>
              <span>{formatDateTime(bill.validUntil)}</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: ADDRESS DETAILS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderBottom: "2px solid #1a3a52"
        }}>
          {/* From (Seller) */}
          <div style={{ padding: "20px", borderRight: "2px solid #1a3a52" }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "13px", fontWeight: "bold", color: "#1a3a52" }}>
              FROM (SELLER)
            </h4>
            <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#333" }}>
              <p style={{ margin: "0 0 4px 0", fontWeight: "bold", fontSize: "14px" }}>{bill.sellerBusinessName || "-"}</p>
              <p style={{ margin: "0 0 2px 0" }}>GSTIN: {bill.sellerGstin || "-"}</p>
              <p style={{ margin: "0", color: "#666" }}>State: {bill.sellerState || "-"}</p>
            </div>
          </div>
          {/* To (Buyer) */}
          <div style={{ padding: "20px" }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "13px", fontWeight: "bold", color: "#1a3a52" }}>
              TO (BUYER)
            </h4>
            <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#333" }}>
              <p style={{ margin: "0 0 4px 0", fontWeight: "bold", fontSize: "14px" }}>{bill.buyerName || "-"}</p>
              <p style={{ margin: "0 0 2px 0" }}>GSTIN: {bill.buyerGstin || "-"}</p>
              <p style={{ margin: "0", color: "#666" }}>State: {bill.buyerState || "-"}</p>
            </div>
          </div>
        </div>

        {/* SECTION 4: GOODS DETAILS TABLE */}
        <div style={{ borderBottom: "2px solid #1a3a52", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#0c3d66", color: "white" }}>
                <th style={{ padding: "14px", textAlign: "left", borderRight: "1px solid #1a3a52", width: "5%" }}>#</th>
                <th style={{ padding: "14px", textAlign: "left", borderRight: "1px solid #1a3a52" }}>Item & Description</th>
                <th style={{ padding: "14px", textAlign: "center", borderRight: "1px solid #1a3a52", width: "8%" }}>Qty</th>
                <th style={{ padding: "14px", textAlign: "center", borderRight: "1px solid #1a3a52", width: "8%" }}>Unit</th>
                <th style={{ padding: "14px", textAlign: "right", borderRight: "1px solid #1a3a52", width: "10%" }}>Rate</th>
                <th style={{ padding: "14px", textAlign: "right", borderRight: "1px solid #1a3a52", width: "10%" }}>Discount</th>
                <th style={{ padding: "14px", textAlign: "center", borderRight: "1px solid #1a3a52", width: "8%" }}>GST %</th>
                <th style={{ padding: "14px", textAlign: "right", width: "12%" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.length > 0 ? (
                invoiceItems.map((item, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "14px", textAlign: "left", borderRight: "1px solid #eee" }}>{index + 1}</td>
                    <td style={{ padding: "14px", borderRight: "1px solid #eee" }}>
                      <div style={{ fontWeight: "bold" }}>{item.itemName}</div>
                      {item.description && item.description !== "-" && (
                        <div style={{ fontSize: "11px", color: "#666", marginTop: "2px", marginBottom: "4px" }}>
                          {item.description}
                        </div>
                      )}
                      <div style={{ fontSize: "11px", color: "#666" }}>HSN: {item.hsnCode || "-"}</div>
                    </td>
                    <td style={{ padding: "14px", textAlign: "center", borderRight: "1px solid #eee" }}>{item.quantity}</td>
                    <td style={{ padding: "14px", textAlign: "center", borderRight: "1px solid #eee" }}>{item.unit}</td>
                    <td style={{ padding: "14px", textAlign: "right", borderRight: "1px solid #eee" }}>{formatCurrency(item.rate)}</td>
                    <td style={{ padding: "14px", textAlign: "right", borderRight: "1px solid #eee" }}>{formatCurrency(item.discountAmount)}</td>
                    <td style={{ padding: "14px", textAlign: "center", borderRight: "1px solid #eee" }}>{item.gstRate}%</td>
                    <td style={{ padding: "14px", textAlign: "right" }}>{formatCurrency(item.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr style={{ borderBottom: "1px solid #ddd" }}>
                  <td colSpan="8" style={{ padding: "14px", textAlign: "center", color: "#999" }}>
                    No items
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* SECTION 4B: TOTALS */}
        <div style={{ borderBottom: "2px solid #1a3a52", backgroundColor: "#f9f9f9" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "150px" }}>
            {/* Left Column - Subtotal & Total Discount */}
            <div style={{ padding: "20px", borderRight: "2px solid #1a3a52" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", fontSize: "13px" }}>
                {/* Subtotal */}
                <div style={{ textAlign: "left" }}>Subtotal:</div>
                <div style={{ textAlign: "right", fontWeight: "600" }}>
                  {formatCurrency(
                    invoiceItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
                  )}
                </div>

                {/* Total Discount */}
                <div style={{ textAlign: "left" }}>Total Discount:</div>
                <div style={{ textAlign: "right", fontWeight: "600" }}>
                  {formatCurrency(
                    invoiceItems.reduce((sum, item) => sum + item.discountAmount, 0)
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Column - Taxable Value, Total GST, Grand Total */}
            <div style={{ padding: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", fontSize: "13px" }}>
                {/* Taxable Value */}
                <div style={{ textAlign: "left", fontWeight: "bold" }}>
                  Taxable Value:
                </div>
                <div style={{ textAlign: "right", fontWeight: "bold" }}>
                  {formatCurrency(
                    invoiceItems.reduce((sum, item) => {
                      const taxableBase = item.quantity * item.rate - item.discountAmount;
                      return sum + taxableBase;
                    }, 0)
                  )}
                </div>

                {/* Total GST */}
                <div style={{ textAlign: "left" }}>Total GST:</div>
                <div style={{ textAlign: "right", fontWeight: "600" }}>
                  {formatCurrency(
                    invoiceItems.reduce((sum, item) => {
                      const taxableBase = item.quantity * item.rate - item.discountAmount;
                      const itemGst = taxableBase * (item.gstRate / 100);
                      return sum + itemGst;
                    }, 0)
                  )}
                </div>

                {/* Grand Total */}
                <div style={{ textAlign: "left", fontWeight: "bold", fontSize: "14px", paddingTop: "8px", borderTop: "2px solid #1a3a52" }}>
                  Grand Total:
                </div>
                <div style={{ textAlign: "right", fontWeight: "bold", fontSize: "14px", paddingTop: "8px", borderTop: "2px solid #1a3a52" }}>
                  {formatCurrency(
                    invoiceItems.reduce((sum, item) => sum + item.amount, 0)
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: VEHICLE & TRANSPORT DETAILS */}
        <div style={{ flex: "1", padding: "20px", borderTop: "1px solid #ddd" }}>
          <h4 style={{ margin: "0 0 16px 0", fontSize: "17px", fontWeight: "bold", color: "#1a3a52" }}>
            VEHICLE & TRANSPORT DETAILS
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", fontSize: "14px" }}>
            {/* Left Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <p style={{ margin: "0 0 3px 0", fontSize: "13px", fontWeight: "bold", color: "#1a3a52" }}>Mode of Transport</p>
                <p style={{ margin: "0", fontSize: "14px", color: "#333" }}>{toTitleCase(bill.transportMode)}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 3px 0", fontSize: "13px", fontWeight: "bold", color: "#1a3a52" }}>Distance (KM)</p>
                <p style={{ margin: "0", fontSize: "14px", color: "#333" }}>{bill.distanceKm}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 3px 0", fontSize: "13px", fontWeight: "bold", color: "#1a3a52" }}>Vehicle Number</p>
                <p style={{ margin: "0", fontSize: "14px", color: "#333" }}>{bill.vehicleNumber}</p>
              </div>
            </div>
            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <p style={{ margin: "0 0 3px 0", fontSize: "13px", fontWeight: "bold", color: "#1a3a52" }}>Transporter Name</p>
                <p style={{ margin: "0", fontSize: "14px", color: "#333" }}>{bill.transporterName || "-"}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 3px 0", fontSize: "13px", fontWeight: "bold", color: "#1a3a52" }}>Transporter ID</p>
                <p style={{ margin: "0", fontSize: "14px", color: "#333" }}>{bill.transporterId || "-"}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 3px 0", fontSize: "13px", fontWeight: "bold", color: "#1a3a52" }}>Document No & Date</p>
                <p style={{ margin: "0", fontSize: "14px", color: "#333" }}>
                  {bill.transporterDocumentNo || "-"} {bill.transporterDocumentDate ? `(${formatDate(bill.transporterDocumentDate)})` : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      {isActive && (
        <div style={{ padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px", display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "20px" }}>
          <button onClick={() => setShowExtendModal(true)} style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
            Extend Validity
          </button>
          <button onClick={() => setShowUpdateVehicleModal(true)} style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
            Update Vehicle
          </button>
          <button onClick={() => setShowCancelModal(true)} style={{ padding: "10px 20px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600", marginLeft: "auto" }}>
            Cancel Bill
          </button>
        </div>
      )}

      {/* Modals */}
      <ExtendValidityModal
        isOpen={showExtendModal}
        onClose={() => setShowExtendModal(false)}
        onConfirm={handleExtendValidity}
        currentDistance={bill.distanceKm}
      />
      <UpdateVehicleModal
        isOpen={showUpdateVehicleModal}
        onClose={() => setShowUpdateVehicleModal(false)}
        onConfirm={handleUpdateVehicle}
        currentVehicleNumber={bill.vehicleNumber}
      />
      <CancelBillModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelBill}
        billNumber={bill.ewayBillNumber}
      />
    </div>
  );
}

export default EWayBillDetail;