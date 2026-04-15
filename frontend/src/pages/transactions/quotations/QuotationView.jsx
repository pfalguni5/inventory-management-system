import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppIcon from "../../../components/common/AppIcon";
import "../../../styles/quotation-view.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";

import { 
  getQuotationById, 
  convertQuotationToInvoice, 
  updateQuotationStatus 
} from "../../../services/quotationService";
import { getAllParties } from "../../../services/partyService";

const QuotationView = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const quotationDocRef = useRef(null);

  const [quotation, setQuotation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [partyDetails, setPartyDetails] = useState(null);

  useEffect(() => {
    const fetchQuotationDetails = async () => {
      setIsLoading(true);
      try {
        const [quotationResponse, partyResponse] = await Promise.all([
          getQuotationById(id),
          getAllParties(),
        ]);

        const backendQuotation = quotationResponse.data;
        const parties = partyResponse.data;

        const matchingParty = parties.find((party) => party.id === backendQuotation.partyId);
        setPartyDetails(matchingParty);

        const transformedQuotation = {
          id: backendQuotation.id,
          number: backendQuotation.quotationNumber,
          customer: matchingParty ? matchingParty.name : `Party #${backendQuotation.partyId}`,
          quotationDate: backendQuotation.quotationDate,
          validTill: backendQuotation.validUntil,
          paymentTerms: backendQuotation.paymentTerms || "",
          deliveryTime: backendQuotation.deliveryTime || "",
          shippingCharges: backendQuotation.shippingCharges || 0,
          notes: backendQuotation.notes || "",
          status:
            backendQuotation.status === "DRAFT"
              ? "Draft"
              : backendQuotation.status === "APPROVED"
              ? "Accepted"
              : backendQuotation.status === "REJECTED"
              ? "Rejected"
              : backendQuotation.status === "CONVERTED"
              ? "Converted"
              : backendQuotation.status,
          items: (backendQuotation.items || []).map((item, index) => ({
            srNo: index + 1,
            itemName: item.itemName,
            description: item.description || "",
            hsnCode: item.hsnCode || item.hsnSac || "-",
            qty: item.quantity,
            unit: item.unit || "",
            rate: item.rate,
            discount: item.discountAmount || 0,
            gstPercent: item.gstRate || 0,
            amount: item.amount || 0,
          })),
          subtotal: backendQuotation.subtotal || 0,
          totalDiscount:
            (backendQuotation.items || []).reduce(
              (sum, item) => sum + (Number(item.discountAmount) || 0),
              0
            ),
          totalGST: backendQuotation.taxAmount || 0,
          grandTotal: backendQuotation.totalAmount || 0,
          linkedInvoice:
            backendQuotation.status === "CONVERTED"
              ? "Converted to Invoice"
              : null,
        };

        setQuotation(transformedQuotation);
      } catch (error) {
        console.error("Error fetching quotation details:", error);
        setQuotation(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotationDetails();
  }, [id]);

  if(isLoading) {
    return (
      <div className="quotation-view-container">
        <h2 className="page-title">Loading quotation details...</h2>
      </div>
    );
  }

  if(!quotation) {
    return (
      <div className="quotation-view-container">
        <h2 className="page-title">Quotation Not Found</h2>
        <button className="btn btn-secondary" onClick={() => navigate("/app/sales/quotations")}>
          Back to Quotations
        </button>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    try {
      const element = quotationDocRef.current;
      
      if (!element) {
        alert("Unable to generate PDF. Please try again.");
        return;
      }

      // Capture the element as a canvas image
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Get image from canvas
      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 5; // 5mm margins

      // Calculate image dimensions to fit A4 with margins
      const availWidth = pageWidth - (margin * 2);
      const availHeight = pageHeight - (margin * 2);

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(availWidth / imgWidth, availHeight / imgHeight);

      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      const xPos = margin + (availWidth - finalWidth) / 2;
      const yPos = margin;

      // Add image to PDF
      pdf.addImage(imgData, 'JPEG', xPos, yPos, finalWidth, finalHeight);

      // Download
      pdf.save(`Quotation_${quotation.number}.pdf`);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    alert("Share quotation " + quotation.number);
  };

  const handleConvertToInvoice = async () => {
    try {
      const response = await convertQuotationToInvoice(quotation.id);
      const invoiceId = response.data;

      setQuotation({
        ...quotation,
        status: "Converted",
        linkedInvoice: `Invoice ID: ${invoiceId}`,
      });

      alert(`Quotation converted to Invoice ID: ${invoiceId}`);
    } catch (error) {
      console.error("Error converting quotation:", error);
      alert(
        error.response?.data?.message ||
        "Failed to convert quotation"
      );
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="quotation-view-container">
      {/* ACTION BUTTONS */}
      <div className="quotation-actions-bar">
        <button className="btn btn-secondary" onClick={handleDownloadPDF}>
          <AppIcon name="download" /> Download PDF
        </button>
        <button className="btn btn-secondary" onClick={handlePrint}>
          <AppIcon name="print" /> Print
        </button>
        <button className="btn btn-secondary" onClick={handleShare}>
          <AppIcon name="share" /> Share
        </button>
      </div>

      {/* A4 QUOTATION DOCUMENT */}
      <div className="quotation-document" ref={quotationDocRef}>
        {/* SECTION 1: Header */}
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
              Address Line 1<br/>
              City, State 123456<br/>
              Country
            </p>
          </div>
          {/* Quotation Title (Right) */}
          <div style={{ padding: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <h1 style={{ margin: "0", fontSize: "35px", fontWeight: "bold", color: "#0066cc", letterSpacing: "2px" }}>
              QUOTATION
            </h1>
          </div>
        </div>

        {/* SECTION 2: Party Details and Quotation Info */}
        <div className="quotation-section section-party" style={{ borderBottom: "2px solid #1a3a52" }}>
          <div className="party-left" style={{ borderRight: "2px solid #1a3a52" }}>
            <div className="party-label">Quotation For:</div>
            <div className="party-details">
              <div className="party-name">{quotation.customer}</div>
              <div className="party-address">
                {partyDetails?.addressLine1}<br/>
                {partyDetails?.city}, {partyDetails?.state} {partyDetails?.pincode}<br/>
                {partyDetails?.country}
              </div>
            </div>
          </div>
          <div className="party-right">
            <div className="info-row">
              <span className="info-label">Date:</span>
              <span className="info-value">{formatDate(quotation.quotationDate)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Quotation #:</span>
              <span className="info-value">{quotation.number}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Valid Till:</span>
              <span className="info-value">{formatDate(quotation.validTill)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Delivery Time:</span>
              <span className="info-value">{quotation.deliveryTime || "—"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Payment Term:</span>
              <span className="info-value">{quotation.paymentTerms || "—"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Shipping Charges:</span>
              <span className="info-value">{formatCurrency(quotation.shippingCharges)}</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: Items Table */}
        <div className="quotation-section section-items" style={{ borderBottom: "2px solid #1a3a52", overflow: "hidden" }}>
          <table className="quotation-items-table">
            <thead>
              <tr>
                <th className="col-srno">Sr No</th>
                <th className="col-item">Item & Description</th>
                <th className="col-qty">Qty</th>
                <th className="col-unit">Unit</th>
                <th className="col-rate">Rate</th>
                <th className="col-discount">Discount</th>
                <th className="col-gst">GST %</th>
                <th className="col-amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items.map((item) => (
                <tr key={item.srNo}>
                  <td className="col-srno">{item.srNo}</td>
                  <td className="col-item">
                    <div style={{ fontWeight: "bold" }}>{item.itemName}</div>
                    {item.description && item.description.trim() !== "" && (
                      <div style={{ fontSize: "11px", color: "#666", marginTop: "2px", marginBottom: "4px" }}>
                        {item.description}
                      </div>
                    )}
                    <div style={{ fontSize: "11px", color: "#666" }}>HSN: {item.hsnCode || "-"}</div>
                  </td>
                  <td className="col-qty">{item.qty}</td>
                  <td className="col-unit">{item.unit}</td>
                  <td className="col-rate text-right">{formatCurrency(item.rate)}</td>
                  <td className="col-discount text-right">{formatCurrency(item.discount)}</td>
                  <td className="col-gst text-center">{item.gstPercent}%</td>
                  <td className="col-amount text-right">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
              {/* Subtotal Row */}
              <tr style={{ backgroundColor: "#f9f9f9", fontWeight: "bold", borderTop: "2px solid #1a3a52" }}>
                <td colSpan="7" style={{ padding: "14px", textAlign: "right", borderRight: "1px solid #1a3a52" }}>
                  Subtotal
                </td>
                <td style={{ padding: "14px", textAlign: "right" }}>
                  {formatCurrency(quotation.subtotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 4: Totals and Notes */}
        <div className="quotation-section section-totals" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: "150px",
          paddingBottom: "0"
        }}>
          {/* Left: Notes */}
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div className="quotation-note">
                <div className="note-title">Important Note</div>
                <div className="note-text">
                  This quotation is not a contract or a bill. It is our best guess at the total price for service and goods described above.
                </div>
                <div className="thank-you-note">
                  Looking forward to working with you!
                </div>
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
                <span>Subtotal</span>
                <span style={{ textAlign: "right" }}>{formatCurrency(quotation.subtotal)}</span>
              </div>
              
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "8px"
              }}>
                <span>Total Discount</span>
                <span style={{ textAlign: "right" }}>−{formatCurrency(quotation.totalDiscount)}</span>
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
                <span style={{ textAlign: "right" }}>{formatCurrency(quotation.totalGST)}</span>
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
                <span>Grand Total</span>
                <span style={{ textAlign: "right", color: "#0066cc" }}>{formatCurrency(quotation.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATUS CONTROLS CARD (Outside the quotation document) */}
      <div className="quotation-card status-controls-card">
        <h2 className="section-title">Status Management</h2>
        <div className="status-controls">
          <button
            className="btn btn-secondary"
            onClick={async () => {
              try {
                await updateQuotationStatus(quotation.id, "APPROVED");
                setQuotation({
                  ...quotation,
                  status: "Accepted"
                });
                alert("Quotation marked as Accepted");
              } catch (error) {
                alert(error.response?.data?.message || "Failed to update status");
              }
            }}
            disabled={
              quotation.status === "Accepted" ||
              quotation.status === "Rejected" ||
              quotation.status === "Converted"
            }
          >
            <AppIcon name="check" /> Mark Accepted
          </button>

          <button
            className="btn btn-secondary"
            onClick={async () => {
              try {
                await updateQuotationStatus(quotation.id, "REJECTED");
                setQuotation({
                  ...quotation,
                  status: "Rejected"
                });
                alert("Quotation marked as Rejected");
              } catch (error) {
                alert(error.response?.data?.message || "Failed to update status");
              }
            }}
            disabled={
              quotation.status === "Rejected" ||
              quotation.status === "Accepted" ||
              quotation.status === "Converted"
            }
          >
            <AppIcon name="close" /> Mark Rejected
          </button>
        </div>
      </div>

      {/* CONVERT TO INVOICE CARD (Outside the quotation document) */}
      <div className="quotation-card convert-card">
        <h2 className="section-title">Convert to Invoice</h2>
        {quotation.linkedInvoice ? (
          <div className="linked-invoice-info">
            <p className="linked-invoice-status">
              ✓ Linked Invoice: <strong>{quotation.linkedInvoice}</strong>
            </p>
            <p className="linked-invoice-note">
              This quotation has been converted to a sales invoice. You can view it in the
              Sales Invoices section.
            </p>
          </div>
        ) : (
          <p className="convert-info-text">
            Convert this quotation to a sales invoice. This action is only available for
            accepted quotations.
          </p>
        )}
        <button
          className="btn btn-success"
          onClick={handleConvertToInvoice}
          disabled={quotation.status !== "Accepted" || quotation.linkedInvoice}
        >
          <AppIcon name="document" /> Convert to Invoice
        </button>
      </div>
    </div>
  );
};

export default QuotationView;
