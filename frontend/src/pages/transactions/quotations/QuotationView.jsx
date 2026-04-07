import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppIcon from "../../../components/common/AppIcon";
import "../../../styles/quotation-view.css";
import { 
  getQuotationById, 
  convertQuotationToInvoice, 
  updateQuotationStatus 
} from "../../../services/quotationService";
import { getAllParties } from "../../../services/partyService";

const QuotationView = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [quotation, setQuotation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
            id: index + 1,
            itemName: item.itemName,
            qty: item.quantity,
            rate: item.rate,
            discount: item.discountPercent || 0,
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


  const handleDownloadPDF = () => {
    alert("PDF download initiated for Quotation " + quotation.number);
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

  const getStatusStyle = (status) => {
    const styles = {
      Draft: "draft",
      Sent: "sent",
      Accepted: "accepted",
      Rejected: "rejected",
      Converted: "converted",
      Expired: "expired",
    };
    return styles[status] || "draft";
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
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="quotation-view-container">
      {/* HEADER */}
      <div className="quotation-view-header">
        <div className="header-title-section">
          <h1 className="page-title">Quotation Details</h1>
          <div className="header-meta">
            <span className="quotation-number">{quotation.number}</span>
            <span className={`status-badge ${getStatusStyle(quotation.status)}`}>
              {quotation.status}
            </span>
          </div>
        </div>
        <div className="header-actions">
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
      </div>

      {/* QUICK INFO */}
      <div className="quotation-quick-info">
        <div className="info-item">
          <span className="info-label">Customer</span>
          <span className="info-value">{quotation.customer}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Quotation Date</span>
          <span className="info-value">{formatDate(quotation.quotationDate)}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Valid Till</span>
          <span className="info-value">{formatDate(quotation.validTill)}</span>
        </div>
      </div>

      {/* QUOTATION TERMS SECTION */}
      <div className="quotation-card">
        <h2 className="section-title">Quotation Terms</h2>
        <div className="terms-grid">
          <div className="term-item">
            <span className="term-label">Payment Term</span>
            <span className="term-value">{quotation.paymentTerms || "—"}</span>
          </div>
          <div className="term-item">
            <span className="term-label">Delivery Time</span>
            <span className="term-value">{quotation.deliveryTime || "—"}</span>
          </div>
          <div className="term-item">
            <span className="term-label">Shipping Charges</span>
            <span className="term-value">{formatCurrency(quotation.shippingCharges)}</span>
          </div>
        </div>
        {quotation.notes && (
          <div className="notes-section">
            <span className="notes-label">Notes</span>
            <p className="notes-value">{quotation.notes}</p>
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="quotation-content">
        {/* ITEMS CARD */}
        <div className="quotation-card">
          <h2 className="section-title">Items</h2>
          <div className="items-table-wrapper">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Item / Service</th>
                  <th className="col-qty">Qty</th>
                  <th className="col-rate">Rate</th>
                  <th className="col-discount">Discount %</th>
                  <th className="col-gst">GST %</th>
                  <th className="col-amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                {quotation.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.itemName}</td>
                    <td className="col-qty">{item.qty}</td>
                    <td className="col-rate text-right">{formatCurrency(item.rate)}</td>
                    <td className="col-discount">{item.discount}%</td>
                    <td className="col-gst">{item.gstPercent}%</td>
                    <td className="col-amount text-right">
                      <strong>{formatCurrency(item.amount)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TOTALS CARD */}
        <div className="quotation-totals">
          <div className="totals-box">
            <div className="total-row">
              <span className="total-label">Subtotal (Taxable)</span>
              <span className="total-value">{formatCurrency(quotation.subtotal)}</span>
            </div>
            <div className="total-row">
              <span className="total-label">Discount Amount</span>
              <span className="total-value">-{formatCurrency(quotation.totalDiscount)}</span>
            </div>
            <div className="total-row">
              <span className="total-label">Tax Amount (GST)</span>
              <span className="total-value">{formatCurrency(quotation.totalGST)}</span>
            </div>
            <div className="total-row grand-total">
              <span className="total-label">Grand Total</span>
              <span className="total-value">{formatCurrency(quotation.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* STATUS CONTROLS CARD */}
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

        {/* CONVERT TO INVOICE CARD */}
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
    </div>
  );
};

export default QuotationView;
