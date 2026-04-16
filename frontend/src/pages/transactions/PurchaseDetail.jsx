import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppIcon from "../../components/common/AppIcon";
import "../../styles/item-detail.css";
import { getPurchaseInvoiceById, deletePurchaseInvoice } from "../../services/purchaseService";
import { getAllParties } from "../../services/partyService";
import { getAllItems } from "../../services/itemService";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function PurchaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteHovered, setDeleteHovered] = useState(false);
  const [shareHovered, setShareHovered] = useState(false);
  const [exportHovered, setExportHovered] = useState(false);
  const invoiceRef = useRef(null);
  const [supplier, setSupplier] = useState(null);

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
        const supplierData = partyRes.data.find(p => p.id === data.partyId);
        setSupplier(supplierData);

        // Transform items with calculated amounts
        const transformedItems = (data.items || []).map((item) => {
          const masterItem = itemRes.data.find(i => i.id === item.itemId);

          const qty = item.quantity || 0;
          const rate = item.rate || 0;
          const discount = item.discount || 0;
          const gstRate = item.gstRate || 0;

          const itemSubtotal = qty * rate;
          const taxableBase = itemSubtotal - discount;
          const itemGst = taxableBase * (gstRate / 100);
          const itemTotal = taxableBase + itemGst;

          return {
            name: masterItem ? masterItem.name : `Item #${item.itemId}`,
            description: masterItem?.description || "-",
            hsnCode: masterItem?.hsn || "-",
            qty: qty,
            unit: item.unit,
            rate: rate,
            discountAmount: discount,
            gst: gstRate,
            amount: itemTotal,
          };
        });

        const subtotal = transformedItems.reduce(
          (sum, item) => sum + item.qty * item.rate,
          0
        );
        const totalDiscount = transformedItems.reduce(
          (sum, item) => sum + item.discountAmount,
          0
        );
        const taxableValue = subtotal - totalDiscount;
        const gstAmount = transformedItems.reduce((sum, item) => {
          const taxableBase = item.qty * item.rate - item.discountAmount;
          return sum + taxableBase * (item.gst / 100);
        }, 0);

        const grandTotal = data.grandTotal || (taxableValue + gstAmount);

        const transformed = {
          id: data.id,
          invoiceNumber: data.billNumber,
          date: data.billDate,
          dueDate: data.dueDate,
          paymentType: data.paymentType || "-",
          amountPaid: data.amountPaid || 0,
          balance: data.balance || 0,
          status: data.status || "pending",
          items: transformedItems,
          subtotal: data.subtotal || subtotal,
          totalDiscount: data.totalDiscount || totalDiscount,
          taxableValue: data.subtotal - data.totalDiscount || taxableValue,
          gstAmount: data.totalTax || gstAmount,
          total: grandTotal,
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

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

  const handleShareInvoice = () => {
    const shareText = `Purchase Invoice ${purchase.invoiceNumber} - ${purchase.invoiceNumber} - ₹${formatCurrency(purchase.total)}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Invoice ${purchase.invoiceNumber}`,
        text: shareText,
      }).catch(err => console.log("Error sharing:", err));
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Invoice details copied to clipboard!");
    }
  };

  const handleExportPDF = async () => {
    if (!invoiceRef.current) return;

    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 5;
      const availWidth = pdfWidth - 2 * margin;
      const availHeight = pdfHeight - 2 * margin;

      const ratio = Math.min(availWidth / imgWidth, availHeight / imgHeight);
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;

      const xPos = (pdfWidth - finalWidth) / 2;
      const yPos = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, 'JPEG', xPos, yPos, finalWidth, finalHeight);
      pdf.save(`Purchase_Invoice_${purchase.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to export PDF');
    }
  };

  if (isLoading) {
    return (
      <div>
        <h2 className="page-title">Loading invoice details...</h2>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div>
        <h2 className="page-title">Purchase Invoice Not Found</h2>
        <button className="btn-primary" onClick={() => navigate("/app/purchase")}>
          Back to Purchase
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Control buttons */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {/* Left buttons */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn-back" onClick={() => navigate("/app/purchase")}>
            <AppIcon name="back" /> Back
          </button>
          <button className="btn-edit-top" onClick={() => navigate(`/app/purchase/edit/${purchase.id}`)}>
            <AppIcon name="edit" /> Edit
          </button>
          <button
            className="btn-delete"
            onClick={handleDelete}
            onMouseEnter={() => setDeleteHovered(true)}
            onMouseLeave={() => setDeleteHovered(false)}
            style={{
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              transform: deleteHovered ? "scale(1.05)" : "scale(1)",
              boxShadow: deleteHovered ? "0 4px 12px rgba(244, 67, 54, 0.4)" : "none",
            }}
          >
            <AppIcon name="trash" /> Delete
          </button>
        </div>
      </div>

      {/* INVOICE CONTAINER WITH BUTTONS */}
      <div style={{ position: "relative", width: "210mm", margin: "0 auto" }}>
        {/* Buttons above invoice (right side) */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginBottom: "20px" }}>
          <button 
            onClick={handleShareInvoice}
            onMouseEnter={() => setShareHovered(true)}
            onMouseLeave={() => setShareHovered(false)}
            style={{
              backgroundColor: shareHovered ? "#0c3d66" : "#1a3a52",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontSize: "13px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transform: shareHovered ? "translateY(-2px)" : "translateY(0)",
              boxShadow: shareHovered ? "0 4px 12px rgba(26, 58, 82, 0.4)" : "none"
            }}>
            <AppIcon name="share" size={14} /> Share
          </button>
          <button 
            onClick={handleExportPDF}
            onMouseEnter={() => setExportHovered(true)}
            onMouseLeave={() => setExportHovered(false)}
            style={{
              backgroundColor: exportHovered ? "#0c3d66" : "#1a3a52",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontSize: "13px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transform: exportHovered ? "translateY(-2px)" : "translateY(0)",
              boxShadow: exportHovered ? "0 4px 12px rgba(26, 58, 82, 0.4)" : "none"
            }}>
            <AppIcon name="download" size={14} /> Export PDF
          </button>
        </div>

      {/* INVOICE */}
      <div
        ref={invoiceRef}
        style={{
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

        {/* SECTION 1: HEADER WITH COMPANY INFO AND TITLE */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderBottom: "2px solid #1a3a52",
          minHeight: "120px"
        }}>
          {/* Company Info (Left) */}
          <div style={{ padding: "20px" }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "bold", color: "#1a3a52" }}>
              Your Company Name
            </h3>
            <p style={{ margin: "4px 0", fontSize: "12px", color: "#666", lineHeight: "1.4" }}>
              Address Line 1<br />
              City, State 12345<br />
              Country
            </p>
          </div>
          {/* Invoice Title (Right) */}
          <div style={{ padding: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <h1 style={{ margin: "0", fontSize: "35px", fontWeight: "bold", color: "#0066cc", letterSpacing: "2px" }}>
              PURCHASE INVOICE
            </h1>
          </div>
        </div>

        {/* SECTION 2: INVOICE DETAILS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderBottom: "2px solid #1a3a52"
        }}>
          {/* Left Column */}
          <div style={{ padding: "15px 20px", borderRight: "2px solid #1a3a52", fontSize: "12px" }}>
            <div style={{ marginBottom: "8px" }}>
              <span style={{ fontWeight: "bold", display: "inline-block", width: "80px" }}>Invoice#</span>
              <span>{purchase.invoiceNumber}</span>
            </div>
            <div style={{ marginBottom: "8px" }}>
              <span style={{ fontWeight: "bold", display: "inline-block", width: "80px" }}>Invoice Date</span>
              <span>{formatDate(purchase.date)}</span>
            </div>
            <div style={{ marginBottom: "8px" }}>
              <span style={{ fontWeight: "bold", display: "inline-block", width: "80px" }}>Payment Type</span>
              <span>{purchase.paymentType}</span>
            </div>
            <div>
              <span style={{ fontWeight: "bold", display: "inline-block", width: "80px" }}>Due Date</span>
              <span>{formatDate(purchase.dueDate)}</span>
            </div>
          </div>
          {/* Right Column */}
          <div style={{ padding: "15px 20px", fontSize: "12px" }}></div>
        </div>

        {/* SECTION 3: BILL FROM AND BILL TO HEADERS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderBottom: "2px solid #1a3a52",
          borderTop: "1px solid #999",
          backgroundColor: "#f5f5f5"
        }}>
          {/* Bill From Header */}
          <div style={{ padding: "10px 20px", borderRight: "2px solid #1a3a52" }}>
            <h4 style={{ margin: "0", fontSize: "13px", fontWeight: "bold", color: "#1a3a52" }}>
              Bill From
            </h4>
          </div>
          {/* Bill To Header */}
          <div style={{ padding: "10px 20px" }}>
            <h4 style={{ margin: "0", fontSize: "13px", fontWeight: "bold", color: "#1a3a52" }}>
              Bill To
            </h4>
          </div>
        </div>

        {/* SECTION 3B: BILL FROM AND BILL TO CONTENT */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderBottom: "2px solid #1a3a52"
        }}>
          {/* Bill From (Supplier) */}
          <div style={{ padding: "20px", borderRight: "2px solid #1a3a52" }}>
            <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#333" }}>
              <p style={{ margin: "0 0 4px 0", fontWeight: "bold", fontSize: "14px" }}>{supplier?.name || "Supplier"}</p>
              {supplier && (
                <>
                  <p style={{ margin: "0 0 2px 0" }}>{supplier.addressLine1 || "-"}</p>
                  <p style={{ margin: "0 0 2px 0" }}>{supplier.city || "-"}</p>
                  <p style={{ margin: "0 0 2px 0" }}>{supplier.state || "-"} {supplier.pincode || ""}</p>
                  <p style={{ margin: "0", color: "#666" }}>{supplier.country || "-"}</p>
                </>
              )}
            </div>
          </div>
          {/* Bill To (Your Company) */}
          <div style={{ padding: "20px" }}>
            <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#333" }}>
              <p style={{ margin: "0 0 4px 0", fontWeight: "bold", fontSize: "14px" }}>Your Company Name</p>
              <p style={{ margin: "0 0 2px 0" }}>Address Line 1</p>
              <p style={{ margin: "0 0 2px 0" }}>City</p>
              <p style={{ margin: "0 0 2px 0" }}>State 12345</p>
              <p style={{ margin: "0", color: "#666" }}>Country</p>
            </div>
          </div>
        </div>

        {/* SECTION 4: ITEMS TABLE */}
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
              {purchase.items.map((item, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "14px", textAlign: "left", borderRight: "1px solid #eee" }}>{index + 1}</td>
                  <td style={{ padding: "14px", borderRight: "1px solid #eee" }}>
                    <div style={{ fontWeight: "bold" }}>{item.name}</div>
                    {item.description && item.description !== "-" && (
                      <div style={{ fontSize: "11px", color: "#666", marginTop: "2px", marginBottom: "4px" }}>
                        {item.description}
                      </div>
                    )}
                    <div style={{ fontSize: "11px", color: "#666" }}>HSN: {item.hsnCode}</div>
                  </td>
                  <td style={{ padding: "14px", textAlign: "center", borderRight: "1px solid #eee" }}>{item.qty}</td>
                  <td style={{ padding: "14px", textAlign: "center", borderRight: "1px solid #eee" }}>{item.unit}</td>
                  <td style={{ padding: "14px", textAlign: "right", borderRight: "1px solid #eee" }}>{formatCurrency(item.rate)}</td>
                  <td style={{ padding: "14px", textAlign: "right", borderRight: "1px solid #eee" }}>{formatCurrency(item.discountAmount)}</td>
                  <td style={{ padding: "14px", textAlign: "center", borderRight: "1px solid #eee" }}>{item.gst}%</td>
                  <td style={{ padding: "14px", textAlign: "right" }}>{formatCurrency(item.amount)}</td>
                </tr>
              ))}
              {/* Subtotal Row */}
              <tr style={{ backgroundColor: "#f9f9f9", fontWeight: "bold", borderTop: "2px solid #1a3a52" }}>
                <td colSpan="7" style={{ padding: "14px", textAlign: "right", borderRight: "1px solid #1a3a52" }}>
                  Subtotal
                </td>
                <td style={{ padding: "14px", textAlign: "right" }}>
                  {formatCurrency(purchase.subtotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 5: TOTALS AND NOTE */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: "150px",
          paddingBottom: "0"
        }}>
          {/* Left: Note */}
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: "0 0 12px 0", fontSize: "12px", fontWeight: "bold", color: "#1a3a52" }}>
                For discrepancies, inform within 48 hours.
              </p>
              <div style={{ fontSize: "11px", lineHeight: "1.6", color: "#666" }}>
                <p style={{ margin: "0 0 4px 0", fontWeight: "bold", color: "#1a3a52" }}>Terms & Conditions</p>
                <p style={{ margin: "0" }}>Returns/replacements will be accepted only as per Company's return policy and within agreed timelines.</p>
              </div>
            </div>
          </div>

          {/* Right: Totals */}
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "flex-end", borderLeft: "2px solid #1a3a52", borderBottom: "2px solid #1a3a52" }}>
            <div style={{ fontSize: "13px" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "8px"
              }}>
                <span>Subtotal (Taxable Value)</span>
                <span style={{ textAlign: "right" }}>{formatCurrency(purchase.taxableValue)}</span>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "8px"
              }}>
                <span>Total Discount</span>
                <span style={{ textAlign: "right" }}>−{formatCurrency(purchase.totalDiscount)}</span>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "12px",
                paddingBottom: "8px",
                borderBottom: "1px solid #ddd"
              }}>
                <span>Total GST</span>
                <span style={{ textAlign: "right" }}>{formatCurrency(purchase.gstAmount)}</span>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                backgroundColor: "#e3f2fd",
                padding: "8px",
                marginBottom: "8px",
                fontWeight: "bold",
                fontSize: "13px"
              }}>
                <span>Grand Total</span>
                <span style={{ textAlign: "right", color: "#0066cc" }}>{formatCurrency(purchase.total)}</span>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                backgroundColor: "#e3f2fd",
                padding: "8px",
                fontWeight: "bold",
                fontSize: "13px"
              }}>
                <span>Balance Due</span>
                <span style={{ textAlign: "right", color: "#0066cc" }}>{formatCurrency(purchase.balance)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default PurchaseDetail;