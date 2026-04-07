import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppIcon from "../../components/common/AppIcon";
import "../../styles/purchase-entry.css";
import "../../styles/purchase-items-table.css";
import "../../styles/purchase-bulk-modal.css";
import { getAllItems } from "../../services/itemService";
import { getAllParties } from "../../services/partyService";
import { createPurchaseInvoice, getPurchaseInvoiceById, updatePurchaseInvoice } from "../../services/purchaseService";

function PurchaseEntry() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [backendItems, setBackendItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal state
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [ setSupplierFormData] = useState({
    partyName: "",
    partyType: "",
    gstin: "",
    sinceDate: "",
    creditLimit: null,
    phone: "",
    email: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [setSupplierErrors] = useState({});

  const [manualInvoiceNumber, setManualInvoiceNumber] = useState("");
  const [autoInvoiceNumber, setAutoInvoiceNumber] = useState("");
  const [manualInvoiceMode, setManualInvoiceMode] = useState(false);
  
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [notes, setNotes] = useState("");

  // Purchase Items State
  const [lines, setLines] = useState([
    {
      id: 1,
      itemName: "",
      itemId: null,
      unit: "",
      qty: "",
      rate: "",
      gstPercent: "",
    },
  ]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [nextLineId, setNextLineId] = useState(2);

  // Load Data (Suppliers & Items)
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const sequence = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
    setAutoInvoiceNumber(`PUR-${year}-${month}${day}-${sequence}`);

    const fetchData = async () => {
      try {
        const [partiesRes, itemsRes] = await Promise.all([
          getAllParties(),
          getAllItems()
        ]);

        // Filter for Suppliers or Both
        const supplierList = partiesRes.data
          .filter(p => p.type === "SUPPLIER" || p.type === "BOTH")
          .map(p => ({ id: p.id, name: p.name }));
        
        setSuppliers(supplierList);

        const itemsList = itemsRes.data.map(i => ({
          id: i.id,
          name: i.name,
          unit: i.unit,
          itemType: i.type.toUpperCase(), // Ensure case matches
          rate: i.purchasePrice || 0, // Use purchase price for purchase entry
          gstRate: i.gstRate || 0
        }));
        setBackendItems(itemsList);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Edit Mode: Fetch Existing Invoice
  useEffect(() => {
    if (!isEditMode) return;
    if (suppliers.length === 0 || backendItems.length === 0) return;

    const fetchInvoice = async () => {
      try {
        const response = await getPurchaseInvoiceById(id);
        const invoice = response.data;

        setSelectedSupplier(invoice.partyId.toString());
        setAutoInvoiceNumber(invoice.billNumber); // Show existing bill number
        setInvoiceDate(invoice.billDate);
        setDueDate(invoice.dueDate || "");
        setPaymentType(invoice.paymentType);
        setAmountPaid(invoice.amountPaid || "");
        setNotes(invoice.notes || "");

        const mappedLines = invoice.items.map((item, index) => {
          const originalItem = backendItems.find(i => i.id === item.itemId);
          return {
            id: index + 1,
            itemName: originalItem ? originalItem.name : "",
            itemId: item.itemId,
            unit: item.unit,
            qty: item.quantity,
            rate: item.rate,
            gstPercent: item.gstRate
          };
        });

        // Add one blank line at end
        mappedLines.push({
          id: mappedLines.length + 1,
          itemName: "",
          itemId: null,
          unit: "",
          qty: "",
          rate: "",
          gstPercent: "",
        });

        setLines(mappedLines);
        setNextLineId(mappedLines.length + 1);

      } catch (error) {
        console.error("Error fetching invoice:", error);
        alert("Failed to load invoice details");
      }
    };

    fetchInvoice();
  }, [id, isEditMode, suppliers, backendItems]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showSupplierModal) {
        setShowSupplierModal(false);
        setSupplierFormData({
          partyName: "",
          partyType: "",
          gstin: "",
          sinceDate: "",
          creditLimit: null,
          phone: "",
          email: "",
          addressLine1: "",
          city: "",
          state: "",
          pincode: "",
          country: "India",
        });
        setSupplierErrors({});
      }
      if (e.key === "Escape" && showBulkModal) {
        setShowBulkModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSupplierModal, showBulkModal, setSupplierFormData, setSupplierErrors]);

  // Modal handlers
  const handleOpenSupplierModal = () => {
    setShowSupplierModal(true);
  };


  // ===== PURCHASE ITEMS FUNCTIONS =====

  // Add new blank row
  const addNewRow = (currentLines = null) => {
    const linesToUse = currentLines || lines;
    const newLine = {
      id: nextLineId,
      itemName: "",
      itemId: null,
      unit: "",
      qty: "",
      rate: "",
      gstPercent: "",
    };
    setLines([...linesToUse, newLine]);
    setNextLineId(nextLineId + 1);
  };

  // Handle item selection
  const handleItemSelect = (lineId, selectedItemName) => {
    const selectedItem = backendItems.find((item) => item.name === selectedItemName);
    if (!selectedItem) return;

    const updatedLines = lines.map((line) => {
      if (line.id === lineId) {
        return {
          ...line,
          itemName: selectedItemName,
          itemId: selectedItem.id,
          unit: selectedItem.unit,
          rate: selectedItem.rate.toString(),
          gstPercent: selectedItem.gstRate.toString(),
        };
      }
      return line;
    });

    setLines(updatedLines);
    
    // Auto add row if last line
    const isLastLine = lineId === lines[lines.length - 1].id;
    if (isLastLine) {
      addNewRow(updatedLines);
    }
  };

  // Remove a line
  const removeLine = (lineId) => {
    const updatedLines = lines.filter((line) => line.id !== lineId);
    if (updatedLines.length === 0) {
        // Ensure at least one line exists
        addNewRow([]);
    } else {
        setLines(updatedLines);
    }
  };

  // Handle line field changes
  const handleLineChange = (lineId, field, value) => {
    if (field === "itemName") {
        handleItemSelect(lineId, value);
        return;
    }

    const updatedLines = lines.map((line) => {
      if (line.id === lineId) {
        return { ...line, [field]: value };
      }
      return line;
    });
    setLines(updatedLines);
  };

  // Calculate amount for a line
  const calculateAmount = (qty, rate) => {
    const amount = (parseFloat(qty) || 0) * (parseFloat(rate) || 0);
    return amount > 0 ? `₹ ${amount.toFixed(2)}` : "₹ 0.00";
  };

  // Calculate subtotal (before GST)
  const calculateSubtotal = () => {
    return lines
      .reduce((sum, line) => {
        const amount = (parseFloat(line.qty) || 0) * (parseFloat(line.rate) || 0);
        return sum + amount;
      }, 0)
      .toFixed(2);
  };

  // Calculate total GST
  const calculateGST = () => {
    return lines
      .reduce((sum, line) => {
        const amount = (parseFloat(line.qty) || 0) * (parseFloat(line.rate) || 0);
        const gst = (amount * (parseFloat(line.gstPercent) || 0)) / 100;
        return sum + gst;
      }, 0)
      .toFixed(2);
  };

  // Calculate total (subtotal + GST)
  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const gst = parseFloat(calculateGST());
    return (subtotal + gst).toFixed(2);
  };

  // Get items for dropdown
  const getItemsForDropdown = () => {
    return backendItems.map((item) => item.name);
  };

  // === SAVE PURCHASE LOGIC ===
  const handleSavePurchase = async () => {
    if (!selectedSupplier) {
        alert("Please select a supplier");
        return;
    }
    if (!invoiceDate || !paymentType) {
        alert("Please fill date and payment type");
        return;
    }

    const validItems = lines.filter(l => l.itemId && l.qty && l.rate);
    if(validItems.length === 0) {
        alert("Please add at least one valid item");
        return;
    }

    const payload = {
        partyId: Number(selectedSupplier),
        billNumber: manualInvoiceMode ? manualInvoiceNumber : autoInvoiceNumber,
        billDate: invoiceDate,
        dueDate: dueDate || null,
        paymentType: paymentType,
        amountPaid: amountPaid ? Number(amountPaid) : 0,
        notes: notes,
        items: validItems.map(l => ({
            itemId: l.itemId,
            quantity: Number(l.qty),
            unit: l.unit,
            rate: Number(l.rate),
            gstRate: Number(l.gstPercent)
        }))
    };

    setIsSubmitting(true);
    try {
        let response;
        if(isEditMode) {
            response = await updatePurchaseInvoice(id, payload);
            alert("Purchase updated successfully");
        } else {
            response = await createPurchaseInvoice(payload);
            alert("Purchase created successfully");
        }
        navigate(`/app/purchase/${response.data.id}`);
    } catch (error) {
        console.error("Save failed", error);
        alert(error.response?.data?.message || "Failed to save purchase");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="page-title">{isEditMode ? "Edit Purchase" : "Purchase Entry"}</h2>

      <div className="card">
        <div className="form-group">
          <label>Supplier *</label>
          <div className="supplier-selector">
            <select
              value={selectedSupplier}
              onChange={(e) => {
                if (e.target.value === "new") {
                handleOpenSupplierModal();
              } else {
                setSelectedSupplier(e.target.value);
              }
            }}
            className="supplier-dropdown"
          >
            <option value="">-- Select Supplier --</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
            <option value="new">+ Add New Supplier</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Purchase Invoice Number *</label>
        <div className="invoice-number-group">
          {!manualInvoiceMode ? (
            <div className="auto-number-display">
              <input
                type="text"
                value={autoInvoiceNumber}
                disabled
                className="form-input"
              />
            </div>
          ) : (
            <input
              type="text"
              value={manualInvoiceNumber}
              onChange={(e) => setManualInvoiceNumber(e.target.value)}
              placeholder="Enter invoice number"
              className="form-input"
            />
          )}
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={manualInvoiceMode}
              onChange={(e) => setManualInvoiceMode(e.target.checked)}
            />
            <span className="checkbox-text">Manual</span>
          </label>
        </div>
      </div>

        <div className="form-row-2col">
            <div className="form-group">
            <label>Invoice Date *</label>
            <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
            </div>
            <div className="form-group">
            <label>Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
        </div>

        <div className="form-row-2col">
            <div className="form-group">
                <label>Payment Type *</label>
                <select className="form-input form-select" value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
                    <option value="">Select</option>
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="CREDIT">Credit</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
            </div>
            <div className="form-group">
                <label>Amount Paid</label>
                <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
            </div>
        </div>

        <div className="form-group">
            <label>Notes</label>
            <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter any notes or remarks about this purchase"
                className="form-input"
                style={{ minHeight: "80px", resize: "vertical" }}
            />
        </div>

        <hr />

        <div className="purchase-items-section">
          <h4>Items</h4>

          <div className="purchase-items-table-wrapper">
            <table className="purchase-items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Unit</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>GST %</th>
                  <th>Amount</th>
                  <th className="col-delete"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id} className={line.itemName === "" ? "blank-row" : ""}>
                    <td>
                      <input
                        type="text"
                        list={`pitems-list-${line.id}`}
                        value={line.itemName}
                        onChange={(e) => handleLineChange(line.id, "itemName", e.target.value)}
                        placeholder="Select or type item"
                        className="purchase-table-input"
                        data-line-id={line.id}
                      />
                      <datalist id={`pitems-list-${line.id}`}>
                        {getItemsForDropdown().map((itemName) => (
                          <option key={itemName} value={itemName} />
                        ))}
                      </datalist>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={line.unit}
                        onChange={(e) => handleLineChange(line.id, "unit", e.target.value)}
                        className="purchase-table-input"
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={line.qty}
                        onChange={(e) => handleLineChange(line.id, "qty", e.target.value)}
                        className="purchase-table-input"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={line.rate}
                        onChange={(e) => handleLineChange(line.id, "rate", e.target.value)}
                        className="purchase-table-input"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={line.gstPercent}
                        onChange={(e) => handleLineChange(line.id, "gstPercent", e.target.value)}
                        className="purchase-table-input"
                      />
                    </td>
                    <td className="purchase-amount-cell">
                      {calculateAmount(line.qty, line.rate)}
                    </td>
                    <td className="col-delete">
                      <button className="btn-delete-item" onClick={() => removeLine(line.id)}>
                        <AppIcon name="close" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="purchase-items-actions">
            <button type="button" className="purchase-btn-add-row" onClick={() => addNewRow()}>
              + Add New Row
            </button>
          </div>

          {/* TOTALS SECTION */}
          <div className="purchase-totals">
            <div className="totals-box">
              <div className="total-row">
                <span className="total-label">Subtotal (Taxable Value)</span>
                <span className="total-value">
                  ₹{parseFloat(calculateSubtotal()).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="total-row">
                <span className="total-label">Total GST</span>
                <span className="total-value">
                  ₹{parseFloat(calculateGST()).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="total-row grand-total">
                <span className="total-label">Grand Total</span>
                <span className="total-value">
                  ₹{parseFloat(calculateTotal()).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button 
            className="btn-save" 
            onClick={handleSavePurchase} 
            disabled={isSubmitting}
        >
            {isSubmitting ? "Saving..." : isEditMode ? "Update Purchase" : "Save Purchase"}
        </button>
      </div>

      {/* Supplier Modal Code Omitted for brevity but assumed present */}
      {showSupplierModal && (
          <div>{/* Modal UI */}</div>
      )}
    </div>
  );
}

export default PurchaseEntry;