import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/sales-invoice.css";
import "../../styles/invoice-items-table.css";
import "../../styles/bulk-add-items-modal.css";
import { getAllItems, createItem } from "../../services/itemService";
import { getAllParties, createParty} from "../../services/partyService";
import { createSalesInvoice, getSalesInvoiceById, updateSalesInvoice } from "../../services/salesService";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

function validateEmail(email) {
  return /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(email);
}

function validateGSTIN(gstin) {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/.test(gstin);
}

function SalesInvoice() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customers, setCustomers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal state
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerFormData, setCustomerFormData] = useState({
    partyName: "",
    partyType: "",
    gstin: "",
    sinceDate: "",
    creditLimit: null,
    openingBalance: null,
    phone: "",
    email: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [customerErrors, setCustomerErrors] = useState({});

  const [manualInvoiceNumber, setManualInvoiceNumber] = useState("");
  const [autoInvoiceNumber, setAutoInvoiceNumber] = useState("");
  const [manualInvoiceMode, setManualInvoiceMode] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [amountPaid, setAmountPaid] = useState("");

  // Invoice Items State
  const [lines, setLines] = useState([
    {
      id: 1,
      itemName: "",
      itemId: null,
      hsnSacCode: "",
      unit: "",
      qty: "",
      rate: "",
      discountAmount: "",
      gstPercent: "",
    },
  ]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkItems, setBulkItems] = useState([]);
  const [nextLineId, setNextLineId] = useState(2);
  const [nextBulkId, setNextBulkId] = useState(1);

  // Backend items state
  const [backendItems, setBackendItems] = useState([]);

  // Item creation modal state
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemFormData, setItemFormData] = useState({
    itemName: "",
    itemType: "",
    uom: "",
    category: "",
    brand: "",
    description: "",
    sku: "",
    hsnCode: "",
    gstRate: 0,
    mrp: 0,
    sellingPrice: 0,
    purchasePrice: 0,
    salesDiscountPercent: 0,
    salesDiscountAmount: 0,
    purchaseDiscountPercent: 0,
    purchaseDiscountAmount: 0,
    openingStock: 0,
    minLevel: 0,
  });
  const [itemErrors, setItemErrors] = useState({});

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const sequence = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
    setAutoInvoiceNumber(`SAL-${year}-${month}${day}-${sequence}`);

    const fetchDropdownData = async () => {
      try {
        const [itemsResponse, partiesResponse] = await Promise.all([
          getAllItems(),
          getAllParties(),
        ]);

        const items = itemsResponse.data.map((item) => ({
          id: item.id,
          name: item.name,
          hsnCode: item.hsn || "",
          unit: item.unit || "",
          rate: item.salePrice || 0,
          discountAmount: item.saleDiscountAmount || 0,
          gstRate: item.gstRate || 0,
        }));

        const parties = partiesResponse.data
          .filter((party) => party.type === "CUSTOMER" || party.type === "BOTH")
          .map((party) => ({
            id: party.id,
            name: party.name,
            creditLimit: party.creditLimit || null,
            outstanding: 0, // backend currently does not provide outstanding
          }));

        setBackendItems(items);
        setCustomers(parties);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchDropdownData();
  }, []);

    useEffect(() => {
    if (!isEditMode) return;
    if (customers.length === 0 || backendItems.length === 0) return;

    const fetchInvoiceForEdit = async () => {
      try {
        const response = await getSalesInvoiceById(id);
        const invoice = response.data;

        setSelectedCustomer(invoice.partyId ? String(invoice.partyId) : "");
        setAutoInvoiceNumber(invoice.invoiceNumber || "");
        setInvoiceDate(invoice.invoiceDate || "");
        setDueDate(invoice.dueDate || "");
        setPaymentType(invoice.paymentType || "");
        setAmountPaid(invoice.amountPaid || "");

        const mappedLines = (invoice.items || []).map((itemLine, index) => {
          const matchedItem = backendItems.find((item) => item.id === itemLine.itemId);

          return {
            id: index + 1,
            itemName: matchedItem ? matchedItem.name : "",
            itemId: itemLine.itemId,
            hsnSacCode: matchedItem?.hsnCode || "",
            unit: itemLine.unit || "",
            qty: itemLine.quantity || "",
            rate: itemLine.rate || "",
            discountAmount: itemLine.discount || "",
            gstPercent: itemLine.gstRate || "",
          };
        });

        mappedLines.push({
          id: mappedLines.length + 1,
          itemName: "",
          itemId: null,
          hsnSacCode: "",
          unit: "",
          qty: "",
          rate: "",
          discountPercent: "",
          discountAmount: "",
          gstPercent: "",
        });

        setLines(mappedLines);
        setNextLineId(mappedLines.length + 1);
      } catch (error) {
        console.error("Error fetching invoice for edit:", error);
        alert(error.response?.data?.message || "Failed to load invoice details");
      }
    };

    fetchInvoiceForEdit();
  }, [id, isEditMode, customers, backendItems]);

  // Handle Escape key to close modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (showCustomerModal) handleCloseCustomerModal();
        if (showItemModal) handleCloseItemModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCustomerModal, showItemModal]);

  // Modal handlers
  const handleOpenCustomerModal = () => {
    setShowCustomerModal(true);
  };

  const handleCloseCustomerModal = () => {
    setShowCustomerModal(false);
    setCustomerFormData({
      partyName: "",
      partyType: "",
      gstin: "",
      sinceDate: "",
      creditLimit: null,
      openingBalance: null,
      phone: "",
      email: "",
      addressLine1: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    });
    setCustomerErrors({});
  };

  const handleCustomerFormChange = (field, value) => {
    if (field === "creditLimit" || field === "openingBalance") {
      setCustomerFormData({ ...customerFormData, [field]: value === "" ? null : Number(value) });
    } else {
      setCustomerFormData({ ...customerFormData, [field]: value });
    }
    if (customerErrors[field]) {
      setCustomerErrors({ ...customerErrors, [field]: "" });
    }
  };

  const validateCustomerForm = () => {
    const newErrors = {};
    if (!customerFormData.partyName.trim()) newErrors.partyName = "Customer name is required";
    if (!customerFormData.partyType) newErrors.partyType = "Party type is required";
    if (!customerFormData.phone.trim()) newErrors.phone = "Phone is required";
    else if (!/^[0-9]{10}$/.test(customerFormData.phone)) newErrors.phone = "Phone must be 10 digits";
    if (!customerFormData.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(customerFormData.email)) newErrors.email = "Invalid email format";
    if (!customerFormData.addressLine1.trim()) newErrors.addressLine1 = "Address is required";
    if (!customerFormData.city.trim()) newErrors.city = "City is required";
    if (!customerFormData.state.trim()) newErrors.state = "State is required";
    if (!customerFormData.pincode.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^[0-9]{6}$/.test(customerFormData.pincode)) newErrors.pincode = "Pincode must be 6 digits";
    if (!customerFormData.country.trim()) newErrors.country = "Country is required";
    if (customerFormData.gstin) {
      if (customerFormData.gstin.length !== 15) newErrors.gstin = "GSTIN must be 15 characters";
      else if (!validateGSTIN(customerFormData.gstin)) newErrors.gstin = "Invalid GSTIN format";
    }
    setCustomerErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    const handleSaveCustomer = async () => {
    if (!validateCustomerForm()) return;

    const payload = {
      name: customerFormData.partyName,
      type:
        customerFormData.partyType === "Customer"
          ? "CUSTOMER"
          : customerFormData.partyType === "Supplier"
          ? "SUPPLIER"
          : "BOTH",
      gstin: customerFormData.gstin || null,
      sinceDate: customerFormData.sinceDate || null,
      creditLimit:
        customerFormData.creditLimit !== null
          ? Number(customerFormData.creditLimit)
          : null,
      openingBalance:
        customerFormData.openingBalance !== null
          ? Number(customerFormData.openingBalance)
          : null,
      phone: customerFormData.phone || null,
      email: customerFormData.email || null,
      addressLine1: customerFormData.addressLine1 || null,
      city: customerFormData.city || null,
      state: customerFormData.state || null,
      pincode: customerFormData.pincode || null,
      country: customerFormData.country || null,
    };

    try {
      const response = await createParty(payload);
      const savedCustomer = response.data;

      const newCustomer = {
        id: savedCustomer.id,
        name: savedCustomer.name,
        creditLimit: savedCustomer.creditLimit || null,
        outstanding: 0,
      };

      setCustomers((prev) => [...prev, newCustomer]);
      setSelectedCustomer(newCustomer.id.toString());
      handleCloseCustomerModal();
      alert("Customer created successfully");
    } catch (error) {
      console.error("Error creating customer:", error);
      alert(error.response?.data?.message || "Failed to create customer");
    }
  };

  // Item Modal Handlers
  const handleCloseItemModal = () => {
    setShowItemModal(false);
    setItemFormData({
      itemName: "",
      itemType: "",
      uom: "",
      category: "",
      brand: "",
      description: "",
      sku: "",
      hsnCode: "",
      gstRate: 0,
      mrp: 0,
      sellingPrice: 0,
      purchasePrice: 0,
      salesDiscountPercent: 0,
      salesDiscountAmount: 0,
      purchaseDiscountPercent: 0,
      purchaseDiscountAmount: 0,
      openingStock: 0,
      minLevel: 0,
    });
    setItemErrors({});
  };

  const handleItemFormChange = (field, value) => {
    setItemFormData({ ...itemFormData, [field]: value });
    if (itemErrors[field]) {
      setItemErrors({ ...itemErrors, [field]: "" });
    }
  };

  const validateItemForm = () => {
    const newErrors = {};
    if (!itemFormData.itemName.trim()) newErrors.itemName = "Item name is required";
    if (!itemFormData.itemType) newErrors.itemType = "Item type is required";
    if (!itemFormData.uom) newErrors.uom = "Unit of Measurement is required";
    if (!itemFormData.hsnCode.trim()) newErrors.hsnCode = "HSN Code is required";
    else if (!/^\d{8}$/.test(itemFormData.hsnCode)) newErrors.hsnCode = "HSN Code must be 8 digits";
    if (!itemFormData.sku.trim()) newErrors.sku = "SKU is required";
    if (itemFormData.gstRate < 0) newErrors.gstRate = "GST Rate cannot be negative";
    if (itemFormData.sellingPrice <= 0) newErrors.sellingPrice = "Selling Price must be greater than 0";
    if (itemFormData.mrp < 0) newErrors.mrp = "MRP cannot be negative";
    setItemErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveItem = async () => {
    if (!validateItemForm()) return;

    const payload = {
      name: itemFormData.itemName,
      type: itemFormData.itemType === "Service" ? "service" : "goods",
      unit: itemFormData.uom,
      category: itemFormData.category || null,
      brand: itemFormData.brand || null,
      description: itemFormData.description || null,
      sku: itemFormData.sku || null,
      hsn: itemFormData.hsnCode || null,
      gstRate: itemFormData.gstRate ? Number(itemFormData.gstRate) : 0,
      salePrice: itemFormData.sellingPrice ? Number(itemFormData.sellingPrice) : 0,
      purchasePrice: itemFormData.purchasePrice ? Number(itemFormData.purchasePrice) : 0,
      mrpPrice: itemFormData.mrp ? Number(itemFormData.mrp) : 0,
      saleDiscountPercent: itemFormData.salesDiscountPercent ? Number(itemFormData.salesDiscountPercent) : 0,
      saleDiscountAmount: itemFormData.salesDiscountAmount ? Number(itemFormData.salesDiscountAmount) : 0,
      purchaseDiscountPercent: itemFormData.purchaseDiscountPercent ? Number(itemFormData.purchaseDiscountPercent) : 0,
      purchaseDiscountAmount: itemFormData.purchaseDiscountAmount ? Number(itemFormData.purchaseDiscountAmount) : 0,
      openingStock: itemFormData.openingStock ? Number(itemFormData.openingStock) : 0,
      lowStockAlert: itemFormData.minLevel ? Number(itemFormData.minLevel) : 0,
    };

    try {
      const response = await createItem(payload);
      const savedItem = response.data;

      const newBackendItem = {
        id: savedItem.id,
        name: savedItem.name,
        hsnCode: savedItem.hsn || "",
        unit: savedItem.unit || "",
        rate: savedItem.salePrice || 0,
        discountPercent: savedItem.saleDiscountPercent || 0,
        gstRate: savedItem.gstRate || 0,
      };

      setBackendItems((prev) => [...prev, newBackendItem]);
      handleCloseItemModal();
      alert("Item created successfully");
    } catch (error) {
      console.error("Error creating item:", error);
      alert(error.response?.data?.message || "Failed to create item");
    }
  };

  // ===== INVOICE ITEMS FUNCTIONS =====

  // Handle item selection - auto-fill HSN code, unit, rate, GST and add new row
  const handleItemSelect = (lineId, selectedItemName) => {
  if (selectedItemName === "create_new_item") {
    setShowItemModal(true);

    const updatedLines = lines.map((line) => {
      if (line.id === lineId) {
        return {
          ...line,
          itemName: "",
          itemId: null,
        };
      }
      return line;
    });

    setLines(updatedLines);
    return;
  }

    const selectedItem = backendItems.find((item) => item.name === selectedItemName);
    if (!selectedItem) return;

    const hsnSacCode = selectedItem.hsnCode || "";

    const updatedLines = lines.map((line) => {
      if (line.id === lineId) {
        return {
          ...line,
          itemName: selectedItemName,
          itemId: selectedItem.id,
          hsnSacCode: hsnSacCode,
          unit: selectedItem.unit,
          rate: selectedItem.rate,
          gstPercent: selectedItem.gstRate,
          discountAmount: selectedItem.discountAmount || "",
        };
      }
      return line;
    });

    setLines(updatedLines);

    // Check if this is the last line (blank row) - if so, add a new row automatically
    const isLastLine = lineId === lines[lines.length - 1].id;
    if (isLastLine) {
      setTimeout(() => {
        addNewRow(updatedLines);
      }, 0);
    }
  };

  // Add new blank row
  const addNewRow = (currentLines = null) => {
    const baseLines = currentLines || lines;

    const newLine = {
      id: nextLineId,
      itemName: "",
      itemId: null,
      hsnSacCode: "",
      unit: "",
      qty: "",
      rate: "",
      discountAmount: "",
      gstPercent: "",
    };

    const updatedLines = [...baseLines, newLine];
    setLines(updatedLines);
    setNextLineId(nextLineId + 1);
  };

  // Remove a line
  const removeLine = (lineId) => {
    if (lines.length === 1) {
      alert("You must have at least one line item");
      return;
    }

    const updatedLines = lines.filter((line) => line.id !== lineId);

    const hasBlankRow = updatedLines.some((line) => line.itemName === "");
    if (!hasBlankRow) {
      updatedLines.push({
        id: nextLineId,
        itemName: "",
        itemId: null,
        hsnSacCode: "",
        unit: "",
        qty: "",
        rate: "",
        discountAmount: "",
        gstPercent: "",
      });
      setNextLineId(nextLineId + 1);
    }

    setLines(updatedLines);
  };

  const handleItemChange = (lineId, field, value) => {
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

  // Calculate amount for a line (qty * rate - discount amount)
  const calculateAmount = (qty, rate, discountAmount) => {
    if (!qty || !rate) return 0;
    const subtotal = parseFloat(qty) * parseFloat(rate);
    const discount = discountAmount ? parseFloat(discountAmount) : 0;
    return (subtotal - discount).toFixed(2);
  };

  // Calculate subtotal (before discount and GST)
  const calculateSubtotal = () => {
    return lines
      .reduce((sum, line) => {
        const lineSubtotal = parseFloat(line.qty || 0) * parseFloat(line.rate || 0);
        return sum + lineSubtotal;
      }, 0)
      .toFixed(2);
  };

  // Calculate total discount
  const calculateTotalDiscount = () => {
    return lines
      .reduce((sum, line) => {
        return sum + parseFloat(line.discountAmount || 0);
      }, 0)
      .toFixed(2);
  };

  // Calculate subtotal after discount (taxable value)
  const calculateTaxableValue = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const totalDiscount = parseFloat(calculateTotalDiscount());
    return (subtotal - totalDiscount).toFixed(2);
  };

  // Calculate total GST
  const calculateGST = () => {
    return lines
      .reduce((sum, line) => {
        const amount = calculateAmount(line.qty, line.rate, line.discountAmount);
        const gst = (parseFloat(amount || 0) * parseFloat(line.gstPercent || 0)) / 100;
        return sum + gst;
      }, 0)
      .toFixed(2);
  };

  // Calculate grand total (taxable value + GST)
  const calculateTotal = () => {
    const taxableValue = parseFloat(calculateTaxableValue());
    const gst = parseFloat(calculateGST());
    return (taxableValue + gst).toFixed(2);
  };

  // Add item to selected list from all items
  const handleSelectItemForBulk = (backendItem) => {
    const existingItem = bulkItems.find((item) => item.itemId === backendItem.id);
    
    if (existingItem) {
      const updatedItems = bulkItems.map((item) =>
        item.itemId === backendItem.id
          ? { ...item, qty: (parseInt(item.qty) || 1) + 1 }
          : item
      );
      setBulkItems(updatedItems);
    } else {
      const newItem = {
        id: nextBulkId,
        itemName: backendItem.name,
        itemId: backendItem.id,
        hsnSacCode: backendItem.hsnCode,
        unit: backendItem.unit,
        qty: 1,
        rate: backendItem.rate,
        discountAmount: backendItem.discountAmount || "",
        gstPercent: backendItem.gstRate,
      };
      setBulkItems([...bulkItems, newItem]);
      setNextBulkId(nextBulkId + 1);
    }
  };

  // Update quantity in bulk items
  const handleBulkQuantityChange = (itemId, newQty) => {
    const qty = parseInt(newQty) || 0;
    if (qty <= 0) return; // Don't allow zero or negative qty
    const updatedItems = bulkItems.map((item) =>
      item.id === itemId ? { ...item, qty } : item
    );
    setBulkItems(updatedItems);
  };

  // Increase quantity
  const handleIncreaseQty = (itemId) => {
    const item = bulkItems.find((i) => i.id === itemId);
    if (item) {
      handleBulkQuantityChange(itemId, item.qty + 1);
    }
  };

  // Decrease quantity
  const handleDecreaseQty = (itemId) => {
    const item = bulkItems.find((i) => i.id === itemId);
    if (item && item.qty > 1) {
      handleBulkQuantityChange(itemId, item.qty - 1);
    }
  };

  // Remove item from selected list
  const removeSelectedBulkItem = (itemId) => {
    setBulkItems(bulkItems.filter((item) => item.id !== itemId));
  };

  // Handle bulk add items to invoice
  const handleBulkAddItems = (validBulkItems) => {
    let updatedLines = [...lines];

    if (updatedLines[updatedLines.length - 1].itemName === "") {
      updatedLines.pop();
    }

    validBulkItems.forEach((item) => {
      updatedLines.push({
        id: nextLineId + updatedLines.length,
        itemName: item.itemName,
        itemId: item.itemId,
        hsnSacCode: item.hsnSacCode,
        unit: item.unit,
        qty: item.qty,
        rate: item.rate,
        discountAmount: item.discountAmount || "",
        gstPercent: item.gstPercent,
      });
    });

    updatedLines.push({
      id: nextLineId + updatedLines.length,
      itemName: "",
      itemId: null,
      hsnSacCode: "",
      unit: "",
      qty: "",
      rate: "",
      discountAmount: "",
      gstPercent: "",
    });

    setLines(updatedLines);
    setNextLineId(nextLineId + updatedLines.length);
    setShowBulkModal(false);
    
    // Reset bulk items
    setBulkItems([]);
    setNextBulkId(1);
  };

  // Handle add to invoice from bulk modal
  const handleBulkAddToInvoice = () => {
    const validItems = bulkItems.filter((item) => item.itemId && item.qty > 0);
    if (validItems.length === 0) {
      alert("Please select at least one item with a quantity greater than 0");
      return;
    }
    handleBulkAddItems(validItems);
    // Reset bulk items state
    setBulkItems([]);
    setNextBulkId(1);
  };

  // Check credit limit
  const getCreditLimitWarning = () => {
    if (!selectedCustomer) return null;

    const customer = customers.find((c) => c.id.toString() === selectedCustomer);
    if (!customer || !customer.creditLimit || customer.creditLimit <= 0) return null;

    const currentOutstanding = customer.outstanding || 0;
    const invoiceTotal = parseFloat(calculateTotal()) || 0;
    const newOutstanding = currentOutstanding + invoiceTotal;

    if (newOutstanding > customer.creditLimit) {
      return {
        creditLimit: customer.creditLimit,
        currentOutstanding,
        newOutstanding,
        exceedBy: newOutstanding - customer.creditLimit,
      };
    }
    return null;
  };

    const handleSaveInvoice = async () => {
    if (!selectedCustomer) {
      alert("Please select a customer");
      return;
    }

    if (!invoiceDate) {
      alert("Please select invoice date");
      return;
    }

    if (!paymentType) {
      alert("Please select payment type");
      return;
    }

    const validLines = lines.filter((line) => line.itemId && line.qty && line.rate);

    if (validLines.length === 0) {
      alert("Please add at least one valid item");
      return;
    }

    const payload = {
      partyId: Number(selectedCustomer),
      invoiceDate: invoiceDate,
      dueDate: dueDate || null,
      paymentType: paymentType.toUpperCase(),
      amountPaid: amountPaid ? Number(amountPaid) : 0,
      interState: false,
      items: validLines.map((line) => ({
        itemId: line.itemId,
        quantity: Number(line.qty),
        unit: line.unit || null,
        rate: Number(line.rate),
        discount: line.discountAmount ? Number(line.discountAmount) : 0,
        gstRate: line.gstPercent ? Number(line.gstPercent) : 0,
      })),
    };

    try {
      console.log("Sales Invoice Payload:", payload);
      setIsSubmitting(true);

      let response;

      if (isEditMode) {
        response = await updateSalesInvoice(id, payload);
        alert("Sales invoice updated successfully");
      } else {
        response = await createSalesInvoice(payload);
        alert("Sales invoice created successfully");
      }

      const savedInvoice = response.data;
      navigate(`/app/sales/${savedInvoice.id}`);
    }
    catch (error) {
      console.error("Error creating sales invoice:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);
      console.error("Error status:", error.response?.status);

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to create sales invoice"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="page-title">{isEditMode ? "Edit Sales Invoice" : "Sales Invoice"}</h2>

      <div className="card">
        <div className="form-group">
          <label>Customer *</label>
          <div className="customer-selector">
            <select
              value={selectedCustomer}
              onChange={(e) => {
                if (e.target.value === "new") {
                  handleOpenCustomerModal();
                } else {
                  setSelectedCustomer(e.target.value);
                }
              }}
              className="customer-dropdown"
            >
              <option value="">-- Select Customer --</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
              <option value="new">+ Add New Customer</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Invoice Number *</label>
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
            <input 
              type="date" 
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Due Date</label>
            <input 
              type="date" 
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="form-row-2col">
          <div className="form-group">
            <label>Payment Type</label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="form-input form-select"
            >
              <option value="">-- Select Payment Type --</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="bank-transfer">Bank Transfer</option>
              <option value="credit">Credit</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          <div className="form-group">
            <label>Amount Paid</label>
            <input 
              type="number" 
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <hr />

        {/* INVOICE ITEMS TABLE */}
        <div className="invoice-items-section">
          <h4>Items</h4>

          <div className="items-table-wrapper">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Item/Service</th>
                  <th className="col-hsn">HSN Code</th>
                  <th className="col-qty">Qty</th>
                  <th className="col-unit">Unit</th>
                  <th className="col-rate">Rate</th>
                  <th className="col-discount-amt">Discount</th>
                  <th className="col-gst">GST %</th>
                  <th className="col-amount">Amount</th>
                  <th className="col-delete"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id}>
                    <td>
                      <select
                        value={line.itemName}
                        onChange={(e) =>
                          handleItemChange(line.id, "itemName", e.target.value)
                        }
                        className="form-input form-select small"
                      >
                        <option value="">Select Item</option>
                        {backendItems.map((i) => (
                          <option key={i.id} value={i.name}>
                            {i.name}
                          </option>
                        ))}
                        <option
                          value="create_new_item"
                          style={{ fontWeight: "bold", color: "#3b82f6" }}
                        >
                          + Create New Item
                        </option>
                      </select>
                    </td>
                    <td className="col-hsn">
                      <input
                        type="text"
                        value={line.hsnSacCode}
                        disabled
                        className="form-input small"
                        style={{ backgroundColor: "#f3f4f6" }}
                      />
                    </td>
                    <td className="col-qty">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.qty}
                        onChange={(e) =>
                        handleItemChange(line.id, "qty", e.target.value)
                      }
                        className="form-input small input-number"
                      />
                    </td>
                    <td className="col-unit">
                      <input
                        type="text"
                        value={line.unit}
                        disabled
                        className="form-input small"
                        style={{ backgroundColor: "#f3f4f6" }}
                      />
                    </td>
                    <td className="col-rate">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.rate}
                        onChange={(e) =>
                          handleItemChange(line.id, "rate", e.target.value)
                        }
                        className="form-input small input-number"
                      />
                    </td>
                    <td className="col-discount-amt">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.discountAmount}
                        onChange={(e) =>
                          handleItemChange(line.id, "discountAmount", e.target.value)
                        }
                        className="form-input small input-number"
                      />
                    </td>
                    <td className="col-gst">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={line.gstPercent}
                        onChange={(e) =>
                          handleItemChange(line.id, "gstPercent", e.target.value)
                        }
                        className="form-input small input-number"
                      />
                    </td>
                    <td className="col-amount amount">
                      ₹{parseFloat(calculateAmount(line.qty, line.rate, line.discountAmount)).toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="col-delete">
                      <button
                        className="btn-delete-item"
                        onClick={() => removeLine(line.id)}
                        title="Delete item"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="items-actions">
            <button type="button" className="btn-add-row" onClick={() => addNewRow()}>
              + Add New Row
            </button>
            <button type="button" className="btn-bulk-add" onClick={() => setShowBulkModal(true)}>
              + Add Items in Bulk
            </button>
          </div>

        {/* TOTALS SECTION */}
        <div className="invoice-totals">
          <div className="totals-box">
            <div className="total-row">
              <span className="total-label">Subtotal</span>
              <span className="total-value">
                ₹{parseFloat(calculateSubtotal()).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="total-row">
              <span className="total-label">Total Discount</span>
              <span className="total-value">
                −₹{parseFloat(calculateTotalDiscount()).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="total-row">
              <span className="total-label">Subtotal (Taxable Value)</span>
              <span className="total-value">
                ₹{parseFloat(calculateTaxableValue()).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
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

          {/* CREDIT LIMIT WARNING */}
          {getCreditLimitWarning() && (
            <div style={{
              marginTop: "16px",
              padding: "12px 16px",
              backgroundColor: "#fff3cd",
              border: "1px solid #ffc107",
              borderRadius: "4px",
              color: "#856404",
              fontSize: "13px",
              lineHeight: "1.6",
            }}>
              <div style={{ fontWeight: "600", marginBottom: "8px" }}>
                ⚠ Warning: Credit Limit Exceeded
              </div>
              <div>
                This invoice will exceed the customer's credit limit.
              </div>
              <div style={{ marginTop: "8px", color: "#666" }}>
                <strong>Credit Limit:</strong> ₹{getCreditLimitWarning().creditLimit.toLocaleString("en-IN", { maximumFractionDigits: 2 })} · 
                <strong style={{ marginLeft: "16px" }}>Current Outstanding:</strong> ₹{getCreditLimitWarning().currentOutstanding.toLocaleString("en-IN", { maximumFractionDigits: 2 })} · 
                <strong style={{ marginLeft: "16px" }}>New Outstanding:</strong> ₹{getCreditLimitWarning().newOutstanding.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </div>
              <div style={{ marginTop: "8px", color: "#d32f2f", fontWeight: "600" }}>
                Exceeds by: ₹{getCreditLimitWarning().exceedBy.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </div>
            </div>
          )}
        </div>

        {/* BULK ADD ITEMS MODAL */}
        {showBulkModal && (
          <div className="bulk-modal-overlay" onClick={() => setShowBulkModal(false)}>
            <div className="bulk-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "900px" }}>
              <div className="bulk-modal-header">
                <h2>Add Items in Bulk</h2>
                <button className="bulk-modal-close" onClick={() => setShowBulkModal(false)} title="Close">
                  X
                </button>
              </div>

              <div className="bulk-modal-body" style={{ display: "flex", gap: "20px", minHeight: "400px" }}>
                {/* LEFT PANEL - ALL ITEMS */}
                <div style={{ flex: 1, borderRight: "1px solid #e5e7eb", paddingRight: "20px", overflowY: "auto", maxHeight: "400px" }}>
                  <h4 style={{ marginTop: 0, marginBottom: "16px", color: "#1f2937", fontWeight: 600 }}>
                    Available Items
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {backendItems.map((backendItem) => (
                      <div
                        key={backendItem.id}
                        style={{
                          padding: "12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          backgroundColor: "#f9fafb",
                          transition: "all 0.2s",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: "#1f2937", fontSize: "13px" }}>
                            {backendItem.name}
                          </div>
                          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                            ₹{backendItem.rate} / {backendItem.unit} • GST {backendItem.gstRate}% • Code: {backendItem.hsnCode}
                          </div>
                        </div>
                        <button
                          onClick={() => handleSelectItemForBulk(backendItem)}
                          style={{
                            padding: "6px 12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            border: "1px solid #3b82f6",
                            backgroundColor: "#eff6ff",
                            color: "#3b82f6",
                            borderRadius: "4px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            whiteSpace: "nowrap",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#3b82f6";
                            e.target.style.color = "#fff";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#eff6ff";
                            e.target.style.color = "#3b82f6";
                          }}
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT PANEL - SELECTED ITEMS */}
                <div style={{ flex: 1, paddingLeft: "20px", overflowY: "auto", maxHeight: "400px" }}>
                  <h4 style={{ marginTop: 0, marginBottom: "16px", color: "#1f2937", fontWeight: 600 }}>
                    Selected Items ({bulkItems.length})
                  </h4>
                  {bulkItems.length === 0 ? (
                    <div style={{
                      padding: "32px 16px",
                      textAlign: "center",
                      backgroundColor: "#f3f4f6",
                      borderRadius: "4px",
                      color: "#6b7280",
                      fontSize: "13px",
                    }}>
                      No items selected. Click "Add" on the left to select items.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {bulkItems.map((selectedItem) => (
                        <div
                          key={selectedItem.id}
                          style={{
                            padding: "12px",
                            border: "1px solid #e5e7eb",
                            borderRadius: "4px",
                            backgroundColor: "#fff",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: "#1f2937", fontSize: "13px" }}>
                              {selectedItem.itemName}
                            </div>
                            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                              ₹{selectedItem.rate} / {selectedItem.unit}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <button
                              onClick={() => handleDecreaseQty(selectedItem.id)}
                              style={{
                                width: "28px",
                                height: "28px",
                                padding: 0,
                                border: "1px solid #d1d5db",
                                borderRadius: "4px",
                                backgroundColor: "#fff",
                                cursor: "pointer",
                                fontSize: "20px",
                                fontWeight: "bold",
                                color: "#374151",
                                lineHeight: "1",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#f3f4f6";
                                e.target.style.borderColor = "#9ca3af";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "#fff";
                                e.target.style.borderColor = "#d1d5db";
                              }}
                            >
                              −
                            </button>
                            <input
                              type="number"
                              value={selectedItem.qty}
                              onChange={(e) => handleBulkQuantityChange(selectedItem.id, e.target.value)}
                              style={{
                                width: "50px",
                                padding: "6px 8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "4px",
                                fontSize: "13px",
                                textAlign: "center",
                                fontWeight: 600,
                              }}
                              min="1"
                            />
                            <button
                              onClick={() => handleIncreaseQty(selectedItem.id)}
                              style={{
                                width: "28px",
                                height: "28px",
                                padding: 0,
                                border: "1px solid #d1d5db",
                                borderRadius: "4px",
                                backgroundColor: "#fff",
                                cursor: "pointer",
                                fontSize: "20px",
                                fontWeight: "bold",
                                color: "#374151",
                                lineHeight: "1",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#f3f4f6";
                                e.target.style.borderColor = "#9ca3af";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "#fff";
                                e.target.style.borderColor = "#d1d5db";
                              }}
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeSelectedBulkItem(selectedItem.id)}
                              style={{
                                width: "28px",
                                height: "28px",
                                padding: 0,
                                border: "none",
                                borderRadius: "4px",
                                backgroundColor: "transparent",
                                color: "#999",
                                cursor: "pointer",
                                fontSize: "16px",
                                transition: "all 0.2s",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.color = "#dc3545";
                                e.target.style.backgroundColor = "#ffe0e0";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.color = "#999";
                                e.target.style.backgroundColor = "transparent";
                              }}
                              title="Remove item"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bulk-modal-footer" style={{ marginTop: "20px", borderTop: "1px solid #e5e7eb", paddingTop: "16px", display: "flex", gap: "12px", justifyContent: "center" }}>
                <button 
                  className="btn-cancel" 
                  onClick={() => {
                    setShowBulkModal(false);
                    setBulkItems([]);
                    setNextBulkId(1);
                  }}
                  style={{
                    padding: "8px 12px",
                    fontSize: "13px",
                    fontWeight: 600,
                    border: "1px solid #d1d5db",
                    backgroundColor: "#fff",
                    color: "#374151",
                    borderRadius: "4px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn-add-to-invoice" 
                  onClick={handleBulkAddToInvoice}
                  style={{
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: 600,
                    border: "1px solid #3b82f6",
                    backgroundColor: "#3b82f6",
                    color: "#fff",
                    borderRadius: "4px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#2563eb";
                    e.target.style.borderColor = "#2563eb";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#3b82f6";
                    e.target.style.borderColor = "#3b82f6";
                  }}
                >
                  Add to Invoice
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ITEM CREATION MODAL */}
        {showItemModal && (
          <div className="modal-overlay" onClick={handleCloseItemModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
              <div className="modal-header">
                <h2 className="modal-title">Create New Item</h2>
                <button className="modal-close-btn" onClick={handleCloseItemModal} title="Close (Esc)">✕</button>
              </div>

              <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Item Name *</label>
                    <input type="text" value={itemFormData.itemName} onChange={(e) => handleItemFormChange("itemName", e.target.value)} placeholder="Enter item name" className={`form-input ${itemErrors.itemName ? "input-error" : ""}`} />
                    {itemErrors.itemName && <span className="error-text">{itemErrors.itemName}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Item Type *</label>
                    <select value={itemFormData.itemType} onChange={(e) => handleItemFormChange("itemType", e.target.value)} className={`form-input form-select ${itemErrors.itemType ? "input-error" : ""}`}>
                      <option value="">Select type</option>
                      <option value="Goods">Goods</option>
                      <option value="Service">Service</option>
                    </select>
                    {itemErrors.itemType && <span className="error-text">{itemErrors.itemType}</span>}
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">UOM *</label>
                    <input type="text" value={itemFormData.uom} onChange={(e) => handleItemFormChange("uom", e.target.value)} placeholder="e.g., pcs, kg, ltr" className={`form-input ${itemErrors.uom ? "input-error" : ""}`} />
                    {itemErrors.uom && <span className="error-text">{itemErrors.uom}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">SKU *</label>
                    <input type="text" value={itemFormData.sku} onChange={(e) => handleItemFormChange("sku", e.target.value)} placeholder="Stock Keeping Unit" className={`form-input ${itemErrors.sku ? "input-error" : ""}`} />
                    {itemErrors.sku && <span className="error-text">{itemErrors.sku}</span>}
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">HSN Code *</label>
                    <input type="text" value={itemFormData.hsnCode} onChange={(e) => handleItemFormChange("hsnCode", e.target.value)} placeholder="8-digit HSN code" maxLength="8" className={`form-input ${itemErrors.hsnCode ? "input-error" : ""}`} />
                    {itemErrors.hsnCode && <span className="error-text">{itemErrors.hsnCode}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">GST Rate %</label>
                    <input type="number" value={itemFormData.gstRate} onChange={(e) => handleItemFormChange("gstRate", e.target.value)} min="0" step="0.01" className={`form-input ${itemErrors.gstRate ? "input-error" : ""}`} />
                    {itemErrors.gstRate && <span className="error-text">{itemErrors.gstRate}</span>}
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Selling Price *</label>
                    <input type="number" value={itemFormData.sellingPrice} onChange={(e) => handleItemFormChange("sellingPrice", e.target.value)} min="0" step="0.01" className={`form-input ${itemErrors.sellingPrice ? "input-error" : ""}`} />
                    {itemErrors.sellingPrice && <span className="error-text">{itemErrors.sellingPrice}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">MRP</label>
                    <input type="number" value={itemFormData.mrp} onChange={(e) => handleItemFormChange("mrp", e.target.value)} min="0" step="0.01" className={`form-input ${itemErrors.mrp ? "input-error" : ""}`} />
                    {itemErrors.mrp && <span className="error-text">{itemErrors.mrp}</span>}
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={handleCloseItemModal}>Cancel</button>
                  <button type="button" className="btn-primary" onClick={handleSaveItem}>Save Item</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            className="btn-save"
            style={{ padding: "8px 16px", fontSize: "13px" }}
            onClick={handleSaveInvoice}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : isEditMode ? "Update Invoice" : "Save Invoice"}
          </button>
          <button
            className="secondary"
            onClick={() => navigate("/app/e-way-bills/new")}
            style={{ padding: "8px 24px", fontSize: "14px" }}
            disabled={parseFloat(calculateTotal()) <= 50000}
          >
            Generate E-Way Bill
          </button>
        </div>
      </div>

      {/* E-Way Bill Button (always visible for now) */}

      {/* ADD NEW CUSTOMER MODAL */}
      {showCustomerModal && (
        <div className="modal-overlay" onClick={handleCloseCustomerModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Customer</h2>
              <button
                className="modal-close-btn"
                onClick={handleCloseCustomerModal}
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>

            <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
              {/* BASIC CUSTOMER INFO SECTION */}
              <div className="modal-section">
                <h3 className="modal-section-title">Customer Information</h3>
                
                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Customer Name *</label>
                    <input
                      type="text"
                      value={customerFormData.partyName}
                      onChange={(e) =>
                        handleCustomerFormChange("partyName", e.target.value)
                      }
                      placeholder="Enter customer name"
                      className={`form-input ${customerErrors.partyName ? "input-error" : ""}`}
                    />
                    {customerErrors.partyName && (
                      <span className="error-text">{customerErrors.partyName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Party Type *</label>
                    <select
                      value={customerFormData.partyType}
                      onChange={(e) =>
                        handleCustomerFormChange("partyType", e.target.value)
                      }
                      className={`form-input form-select ${
                        customerErrors.partyType ? "input-error" : ""
                      }`}
                    >
                      <option value="">Select type</option>
                      <option value="Customer">Customer</option>
                      <option value="Supplier">Supplier</option>
                    </select>
                    {customerErrors.partyType && (
                      <span className="error-text">{customerErrors.partyType}</span>
                    )}
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">GSTIN (Optional)</label>
                    <input
                      type="text"
                      value={customerFormData.gstin}
                      onChange={(e) =>
                        handleCustomerFormChange("gstin", e.target.value.toUpperCase())
                      }
                      placeholder="Enter GSTIN (15 characters)"
                      maxLength={15}
                      className={`form-input ${customerErrors.gstin ? "input-error" : ""}`}
                    />
                    {customerErrors.gstin && (
                      <span className="error-text">{customerErrors.gstin}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Credit Limit (Optional)</label>
                    <input 
                      type="number" 
                      name="creditLimit" 
                      min="0" 
                      step="0.01"
                      value={customerFormData.creditLimit ?? ""} 
                      onChange={(e) =>
                        handleCustomerFormChange("creditLimit", e.target.value)
                      }
                      placeholder="Leave blank for no limit"
                      className={`form-input ${customerErrors.creditLimit ? "input-error" : ""}`} 
                    />
                    {customerErrors.creditLimit && (
                      <span className="error-text">{customerErrors.creditLimit}</span>
                    )}
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">
                      {customerFormData.partyType === "Customer" ? "Customer Since" : 
                       customerFormData.partyType === "Supplier" ? "Supplier Since" : "Since"}
                    </label>
                    <input
                      type="date"
                      value={customerFormData.sinceDate}
                      onChange={(e) =>
                        handleCustomerFormChange("sinceDate", e.target.value)
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Opening Balance (Optional)</label>
                    <input 
                      type="number" 
                      name="openingBalance" 
                      min="0" 
                      step="0.01"
                      value={customerFormData.openingBalance ?? ""} 
                      onChange={(e) =>
                        handleCustomerFormChange("openingBalance", e.target.value)
                      }
                      placeholder="Opening balance for party account"
                      className={`form-input ${customerErrors.openingBalance ? "input-error" : ""}`} 
                    />
                    {customerErrors.openingBalance && (
                      <span className="error-text">{customerErrors.openingBalance}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* CONTACT DETAILS SECTION */}
              <div className="modal-section">
                <h3 className="modal-section-title">Contact Details</h3>
                
                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input
                      type="tel"
                      value={customerFormData.phone}
                      onChange={(e) =>
                        handleCustomerFormChange("phone", e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="10-digit phone number"
                      maxLength={10}
                      className={`form-input ${customerErrors.phone ? "input-error" : ""}`}
                    />
                    {customerErrors.phone && (
                      <span className="error-text">{customerErrors.phone}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      value={customerFormData.email}
                      onChange={(e) =>
                        handleCustomerFormChange("email", e.target.value)
                      }
                      placeholder="Enter email address"
                      className={`form-input ${customerErrors.email ? "input-error" : ""}`}
                    />
                    {customerErrors.email && (
                      <span className="error-text">{customerErrors.email}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ADDRESS SECTION */}
              <div className="modal-section">
                <h3 className="modal-section-title">Address</h3>
                
                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Address Line 1 *</label>
                    <input
                      type="text"
                      value={customerFormData.addressLine1}
                      onChange={(e) =>
                        handleCustomerFormChange("addressLine1", e.target.value)
                      }
                      placeholder="Enter address"
                      className={`form-input ${
                        customerErrors.addressLine1 ? "input-error" : ""
                      }`}
                    />
                    {customerErrors.addressLine1 && (
                      <span className="error-text">{customerErrors.addressLine1}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      value={customerFormData.city}
                      onChange={(e) => handleCustomerFormChange("city", e.target.value)}
                      placeholder="Enter city"
                      className={`form-input ${customerErrors.city ? "input-error" : ""}`}
                    />
                    {customerErrors.city && (
                      <span className="error-text">{customerErrors.city}</span>
                    )}
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <select
                      value={customerFormData.state}
                      onChange={(e) => handleCustomerFormChange("state", e.target.value)}
                      className={`form-input form-select ${
                        customerErrors.state ? "input-error" : ""
                      }`}
                    >
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    {customerErrors.state && (
                      <span className="error-text">{customerErrors.state}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pincode *</label>
                    <input
                      type="text"
                      value={customerFormData.pincode}
                      onChange={(e) =>
                        handleCustomerFormChange("pincode", e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="6-digit pincode"
                      maxLength={6}
                      className={`form-input ${customerErrors.pincode ? "input-error" : ""}`}
                    />
                    {customerErrors.pincode && (
                      <span className="error-text">{customerErrors.pincode}</span>
                    )}
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Country *</label>
                    <input
                      type="text"
                      value={customerFormData.country}
                      onChange={(e) =>
                        handleCustomerFormChange("country", e.target.value)
                      }
                      className={`form-input ${
                        customerErrors.country ? "input-error" : ""
                      }`}
                    />
                    {customerErrors.country && (
                      <span className="error-text">{customerErrors.country}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseCustomerModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveCustomer}
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesInvoice;
