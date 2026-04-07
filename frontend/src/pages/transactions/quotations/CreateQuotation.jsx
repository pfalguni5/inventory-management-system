import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppIcon from "../../../components/common/AppIcon";
import "../../../styles/create-quotation.css";
import { getAllParties, createParty } from "../../../services/partyService";
import { getAllItems, createItem } from "../../../services/itemService";
import { createQuotation } from "../../../services/quotationService";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

function validateEmail(email) {
  return /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(email);
}

function validateGSTIN(gstin) {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/.test(gstin);
}

function CreateQuotation() {
  const navigate = useNavigate();

  // State
  const [status] = useState("draft");
  const [formData, setFormData] = useState({
    customerName: "",
    quotationNumber: "QT-" + String(Math.floor(Math.random() * 1000) + 1).padStart(3, "0"),
    manualQuotationNumber: false,
    quotationDate: new Date().toISOString().split("T")[0],
    validTill: "",
    shippingCharges: 0,
    paymentTerm: "",
    deliveryTime: "",
    notes: "",
  });

  const [items, setItems] = useState([
    {
      id: 1,
      itemId: null,
      itemName: "",
      hsnCode: "",
      unit: "",
      qty: 1,
      rate: 0,
      discount: 0,
      gstPercent: 0,
    },
  ]);

  const [gstEnabled] = useState(true);

  // Bulk modal state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkItems, setBulkItems] = useState([]);
  const [nextBulkId, setNextBulkId] = useState(1);

  // Item creation modal state
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemFormData, setItemFormData] = useState({
    // Item Details
    itemName: "",
    itemType: "",
    uom: "",
    category: "",
    brand: "",
    description: "",
    sku: "",
    // GST Details
    hsnCode: "",
    gstRate: 0,
    // Pricing
    mrp: 0,
    sellingPrice: 0,
    purchasePrice: 0,
    // Discount
    salesDiscountPercent: 0,
    salesDiscountAmount: 0,
    purchaseDiscountPercent: 0,
    purchaseDiscountAmount: 0,
    // Stock Details
    openingStock: 0,
    minLevel: 0,
  });
  const [itemErrors, setItemErrors] = useState({});

  // Modal state
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [partyFormData, setPartyFormData] = useState({
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
  const [partyErrors, setPartyErrors] = useState({});

  const [customers, setCustomers] = useState([]);
  const [backendItems, setBackendItems] = useState([]);
  const [selectedPartyId, setSelectedPartyId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDropDownData = async () => {
      try{
        const [partiesResponse, itemsResponse] = await Promise.all([
          getAllParties(),
          getAllItems(),
        ]);

        const transformedParties = partiesResponse.data.map((party) => ({
          id: party.id,
          name: party.name,
          type: party.type,
        }));

        const transformedItems = itemsResponse.data.map((item) => ({
          id: item.id,
          name: item.name,
          hsnCode: item.hsn || "",
          unit: item.unit || "",
          rate: item.salePrice || 0,
          discountPercent: item.saleDiscountPercent || 0,
          gstRate: item.gstRate || 0,
        }));

        setCustomers(transformedParties);
        setBackendItems(transformedItems);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchDropDownData();
  }, []);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showPartyModal) {
        handleClosePartyModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPartyModal]);

  // Helper functions
  const calculateLineAmount = (rate, qty, discount) => {
    const subtotal = rate * qty;
    const discountAmount = (subtotal * discount) / 100;
    return subtotal - discountAmount;
  };

  const calculateDiscountAmount = (rate, qty, discount) => {
    const subtotal = rate * qty;
    return (subtotal * discount) / 100;
  };

  const calculateLineGST = (amount, gstPercent) => {
    return (amount * gstPercent) / 100;
  };

    const calculateTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalGST = 0;

    items.forEach((item) => {
      if (!item.itemName || item.itemName === "") return;

      const lineSubtotal = item.rate * item.qty;
      const lineDiscountAmount = calculateDiscountAmount(
        item.rate,
        item.qty,
        item.discount
      );
      const lineAmount = calculateLineAmount(
        item.rate,
        item.qty,
        item.discount
      );

      subtotal += lineSubtotal;
      totalDiscount += lineDiscountAmount;

      if (gstEnabled) {
        totalGST += calculateLineGST(lineAmount, item.gstPercent);
      }
    });

    const shipping = parseFloat(formData.shippingCharges) || 0;
    const grandTotal = subtotal - totalDiscount + totalGST + shipping;

    return { subtotal, totalDiscount, totalGST, grandTotal };
  };

  // Event handlers
  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

    const handleItemChange = (id, field, value) => {
    if (field === "itemName" && value === "create_new_item") {
      setShowItemModal(true);
      return;
    }

    const updatedItems = items.map((item) => {
      if (item.id === id) {
        let updatedItem = {
          ...item,
          [field]:
            field === "qty"
              ? parseFloat(value) || 0
              : field === "rate" ||
                field === "discount" ||
                field === "gstPercent"
              ? parseFloat(value) || 0
              : value,
        };

        if (field === "itemName" && value !== "") {
          const selectedBackendItem = backendItems.find(
            (bi) => bi.name === value
          );

          if (selectedBackendItem) {
            updatedItem.itemId = selectedBackendItem.id;
            updatedItem.hsnCode = selectedBackendItem.hsnCode;
            updatedItem.unit = selectedBackendItem.unit;
            updatedItem.rate = selectedBackendItem.rate;
            updatedItem.discount = selectedBackendItem.discountPercent;
            updatedItem.gstPercent = selectedBackendItem.gstRate;
          }
        }

        return updatedItem;
      }
      return item;
    });

    if (field === "itemName" && value !== "") {
      const lastItem = updatedItems[updatedItems.length - 1];
      const isCurrentItemLastRow = id === lastItem.id;

      if (isCurrentItemLastRow) {
        const newId = Math.max(...updatedItems.map((i) => i.id), 0) + 1;
        setItems([
          ...updatedItems,
          {
            id: newId,
            itemId: null,
            itemName: "",
            hsnCode: "",
            unit: "",
            qty: 1,
            rate: 0,
            discount: 0,
            gstPercent: 0,
          },
        ]);
      } else {
        setItems(updatedItems);
      }
    } else {
      setItems(updatedItems);
    }
  };

  const handleAddLine = () => {
    const newId = Math.max(...items.map((i) => i.id), 0) + 1;
    setItems([
      ...items,
      {
        id: newId,
        itemId: null,
        itemName: "",
        hsnCode: "",
        unit: "",
        qty: 1,
        rate: 0,
        discount: 0,
        gstPercent: 0,
      },
    ]);
  };

  const handleRemoveLine = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

    const buildPayload = () => {
    const validItems = items.filter(
      (item) => item.itemName && item.itemName !== "" && item.itemId
    );

    const itemPayload = validItems.map((item) => {
      const qty = parseFloat(item.qty) || 0;
      const rate = parseFloat(item.rate) || 0;
      const discountPercent = parseFloat(item.discount) || 0;
      const gstRate = parseFloat(item.gstPercent) || 0;

      const lineSubtotal = qty * rate;
      const discountAmount = (lineSubtotal * discountPercent) / 100;
      const taxableAmount = lineSubtotal - discountAmount;
      const taxAmount = (taxableAmount * gstRate) / 100;
      const amount = taxableAmount;

      return {
        itemId: item.itemId,
        itemName: item.itemName,
        description: "",
        quantity: qty,
        unit: item.unit,
        rate: rate,
        discountPercent: discountPercent,
        discountAmount: discountAmount,
        gstRate: gstRate,
        taxAmount: taxAmount,
        amount: amount,
        hsnCode: item.hsnCode,
      };
    });

    return {
      partyId: selectedPartyId,
      quotationDate: formData.quotationDate || null,
      validUntil: formData.validTill || null,
      discountAmount: 0,
      shippingCharges: parseFloat(formData.shippingCharges) || 0,
      notes: formData.notes || null,
      paymentTerms: formData.paymentTerm || null,
      deliveryTime: formData.deliveryTime || null,
      termsAndConditions: null,
      items: itemPayload,
    };
  };

  const handleSaveDraft = async () => {
    if (!selectedPartyId) {
      alert("Please select a customer");
      return;
    }

    const validItems = items.filter(
      (item) => item.itemName && item.itemName !== "" && item.itemId
    );

    if (validItems.length === 0) {
      alert("Please add at least one item");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      const response = await createQuotation(payload);
      const createdQuotation = response.data;
      alert("Quotation saved as draft successfully");
      navigate(`/app/sales/quotations/${createdQuotation.id}`);
    } catch (error) {
      console.error("Error saving quotation:", error);
      alert(
        error.response?.data?.message ||
        "Failed to save quotation. Please check the form."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal handlers
  const handleOpenPartyModal = () => {
    setShowPartyModal(true);
  };

  const handleClosePartyModal = () => {
    setShowPartyModal(false);
    setPartyFormData({
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
    setPartyErrors({});
  };

  const handlePartyFormChange = (field, value) => {
    if (field === "creditLimit" || field === "openingBalance") {
      setPartyFormData({ ...partyFormData, [field]: value === "" ? null : Number(value) });
    } else {
      setPartyFormData({ ...partyFormData, [field]: value });
    }
    if (partyErrors[field]) {
      setPartyErrors({ ...partyErrors, [field]: "" });
    }
  };

  const validatePartyForm = () => {
    const newErrors = {};
    if (!partyFormData.partyName.trim()) newErrors.partyName = "Party name is required";
    if (!partyFormData.partyType) newErrors.partyType = "Party type is required";
    if (!partyFormData.phone.trim()) newErrors.phone = "Phone is required";
    else if (!/^[0-9]{10}$/.test(partyFormData.phone)) newErrors.phone = "Phone must be 10 digits";
    if (!partyFormData.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(partyFormData.email)) newErrors.email = "Invalid email format";
    if (!partyFormData.addressLine1.trim()) newErrors.addressLine1 = "Address is required";
    if (!partyFormData.city.trim()) newErrors.city = "City is required";
    if (!partyFormData.state.trim()) newErrors.state = "State is required";
    if (!partyFormData.pincode.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^[0-9]{6}$/.test(partyFormData.pincode)) newErrors.pincode = "Pincode must be 6 digits";
    if (!partyFormData.country.trim()) newErrors.country = "Country is required";
    if (partyFormData.gstin) {
      if (partyFormData.gstin.length !== 15) newErrors.gstin = "GSTIN must be 15 characters";
      else if (!validateGSTIN(partyFormData.gstin)) newErrors.gstin = "Invalid GSTIN format";
    }
    setPartyErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Bulk modal helper functions
    const handleSelectItemForBulk = (backendItem) => {
    const existingItem = bulkItems.find((item) => item.name === backendItem.name);

    if (existingItem) {
      setBulkItems(
        bulkItems.map((item) =>
          item.name === backendItem.name
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      );
    } else {
      const newBulkItem = {
        id: nextBulkId,
        itemId: backendItem.id,
        name: backendItem.name,
        hsnCode: backendItem.hsnCode,
        unit: backendItem.unit,
        qty: 1,
        rate: backendItem.rate || 0,
        discountPercent: backendItem.discountPercent || 0,
        gstRate: backendItem.gstRate || 0,
      };
      setBulkItems([...bulkItems, newBulkItem]);
      setNextBulkId(nextBulkId + 1);
    }
  };

  const handleIncreaseQty = (id) => {
    setBulkItems(
      bulkItems.map((item) =>
        item.id === id
          ? { ...item, qty: item.qty + 1 }
          : item
      )
    );
  };

  const handleDecreaseQty = (id) => {
    setBulkItems(
      bulkItems.map((item) =>
        item.id === id && item.qty > 1
          ? { ...item, qty: item.qty - 1 }
          : item
      )
    );
  };

  const removeSelectedBulkItem = (id) => {
    setBulkItems(bulkItems.filter((item) => item.id !== id));
  };

    const handleBulkAddToQuotation = () => {
    const newItems = bulkItems.map((bulkItem) => ({
      id: Math.max(...items.map((i) => i.id), 0) + Math.random(),
      itemId: bulkItem.id,
      itemName: bulkItem.name,
      hsnCode: bulkItem.hsnCode,
      unit: bulkItem.unit,
      qty: bulkItem.qty,
      rate: bulkItem.rate,
      discount: bulkItem.discountPercent || 0,
      gstPercent: bulkItem.gstRate || 0,
    }));

    setItems([...items, ...newItems]);
    setShowBulkModal(false);
    setBulkItems([]);
    setNextBulkId(1);
  };

    const handleSaveParty = async () => {
    if (!validatePartyForm()) return;

    const payload = {
      name: partyFormData.partyName,
      type:
        partyFormData.partyType === "Customer"
          ? "CUSTOMER"
          : partyFormData.partyType === "Supplier"
          ? "SUPPLIER"
          : "BOTH",
      gstin: partyFormData.gstin || null,
      sinceDate: partyFormData.sinceDate || null,
      creditLimit:
        partyFormData.creditLimit !== null
          ? Number(partyFormData.creditLimit)
          : null,
      openingBalance:
        partyFormData.openingBalance !== null
          ? Number(partyFormData.openingBalance)
          : null,
      phone: partyFormData.phone || null,
      email: partyFormData.email || null,
      addressLine1: partyFormData.addressLine1 || null,
      city: partyFormData.city || null,
      state: partyFormData.state || null,
      pincode: partyFormData.pincode || null,
      country: partyFormData.country || null,
    };

    try {
      const response = await createParty(payload);
      const savedParty = response.data;

      const newParty = {
        id: savedParty.id,
        name: savedParty.name,
        type: savedParty.type,
      };

      setCustomers((prev) => [...prev, newParty]);
      setFormData({ ...formData, customerName: newParty.name });
      setSelectedPartyId(newParty.id);
      handleClosePartyModal();
      alert("Party created successfully");
    } catch (error) {
      console.error("Error creating party:", error);
      alert(
        error.response?.data?.message ||
        "Failed to create party"
      );
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
      salePrice: itemFormData.sellingPrice
        ? Number(itemFormData.sellingPrice)
        : 0,
      purchasePrice: itemFormData.purchasePrice
        ? Number(itemFormData.purchasePrice)
        : 0,
      mrpPrice: itemFormData.mrp ? Number(itemFormData.mrp) : 0,
      saleDiscountPercent: itemFormData.salesDiscountPercent
        ? Number(itemFormData.salesDiscountPercent)
        : 0,
      saleDiscountAmount: itemFormData.salesDiscountAmount
        ? Number(itemFormData.salesDiscountAmount)
        : 0,
      purchaseDiscountPercent: itemFormData.purchaseDiscountPercent
        ? Number(itemFormData.purchaseDiscountPercent)
        : 0,
      purchaseDiscountAmount: itemFormData.purchaseDiscountAmount
        ? Number(itemFormData.purchaseDiscountAmount)
        : 0,
      openingStock: itemFormData.openingStock
        ? Number(itemFormData.openingStock)
        : 0,
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
      alert(
        error.response?.data?.message ||
        "Failed to create item"
      );
    }
  };

  const { subtotal, totalDiscount, totalGST, grandTotal } = calculateTotals();

  return (
    <div className="create-quotation-container">
      {/* HEADER */}
      <div className="create-quotation-header">
        <div>
          <h1 className="page-title">Create Quotation</h1>
          <p className="page-subtitle">Prepare a quotation for your customer</p>
        </div>
        {status === "draft" && (
          <div className="status-badge draft">
            <AppIcon name="file" /> Draft
          </div>
        )}
      </div>

      {/* CUSTOMER & DATES SECTION */}
      <div className="quotation-card">
        <h2 className="section-title">Customer & Details</h2>

        <div className="form-row-2col">
          <div className="form-group">
            <label className="form-label">Customer Name *</label>
                        <select
              value={formData.customerName}
              onChange={(e) => {
                const selectedName = e.target.value;
                const selectedCustomer = customers.find(
                  (c) => c.name === selectedName
                );
                handleFormChange("customerName", selectedName);
                setSelectedPartyId(
                  selectedCustomer ? selectedCustomer.id : null
                );
              }}
              className="form-input form-select"
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <button type="button" className="add-new-link" onClick={handleOpenPartyModal}>
              + Add new party
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Quotation Number *</label>
            <div className="quotation-number-group">
              {!formData.manualQuotationNumber ? (
                <div className="auto-number-display">
                  <input
                    type="text"
                    value={formData.quotationNumber}
                    disabled
                    className="form-input"
                  />
                </div>
              ) : (
                <input
                  type="text"
                  value={formData.quotationNumber}
                  onChange={(e) =>
                    handleFormChange("quotationNumber", e.target.value)
                  }
                  placeholder="Enter quotation number"
                  className="form-input"
                />
              )}
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.manualQuotationNumber}
                  onChange={(e) =>
                    handleFormChange("manualQuotationNumber", e.target.checked)
                  }
                />
                <span className="checkbox-text">Manual</span>
              </label>
            </div>
          </div>
        </div>

        <div className="form-row-2col">
          <div className="form-group">
            <label className="form-label">Quotation Date *</label>
            <input
              type="date"
              value={formData.quotationDate}
              onChange={(e) =>
                handleFormChange("quotationDate", e.target.value)
              }
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Valid Till *</label>
            <input
              type="date"
              value={formData.validTill}
              onChange={(e) => handleFormChange("validTill", e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* QUOTATION TERMS SECTION */}
      <div className="quotation-card">
        <h2 className="section-title">Quotation Terms</h2>

        <div className="form-row-2col">
          <div className="form-group">
            <label className="form-label">Payment Term</label>
            <select
              value={formData.paymentTerm}
              onChange={(e) => handleFormChange("paymentTerm", e.target.value)}
              className="form-input form-select"
            >
              <option value="">Select Payment Term</option>
              <option value="100% advance">100% Advance</option>
              <option value="50% advance">50% Advance</option>
              <option value="credit 30 days">Credit 30 Days</option>
              <option value="credit 60 days">Credit 60 Days</option>
              <option value="credit 90 days">Credit 90 Days</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Time</label>
            <select
              value={formData.deliveryTime}
              onChange={(e) => handleFormChange("deliveryTime", e.target.value)}
              className="form-input form-select"
            >
              <option value="">Select Delivery Time</option>
              <option value="Immediate">Immediate</option>
              <option value="Within 2 days">Within 2 Days</option>
              <option value="Within 1 week">Within 1 Week</option>
              <option value="Within 2 weeks">Within 2 Weeks</option>
              <option value="Within 1 month">Within 1 Month</option>
            </select>
          </div>
        </div>

        <div className="form-row-2col">
          <div className="form-group">
            <label className="form-label">Shipping Charges (Optional)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.shippingCharges}
              onChange={(e) =>
                handleFormChange("shippingCharges", parseFloat(e.target.value) || 0)
              }
              placeholder="Enter shipping charges"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => handleFormChange("notes", e.target.value)}
              placeholder="Special instructions, customer remarks, etc."
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* ITEMS SECTION */}
      <div className="quotation-card">
        <div className="section-header">
          <h2 className="section-title">Quotation Items</h2>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn-add-line" onClick={() => setShowBulkModal(true)}>
              <AppIcon name="plus" /> Add Items in Bulk
            </button>
            <button className="btn-add-line" onClick={handleAddLine}>
              <AppIcon name="plus" /> Add Line
            </button>
          </div>
        </div>

        <div className="items-table-wrapper">
          <table className="items-table">
            <thead>
              <tr>
                <th>Item/Service</th>
                <th className="col-hsn">HSN Code</th>
                <th className="col-qty">Qty</th>
                <th className="col-unit">Unit</th>
                <th className="col-rate">Rate</th>
                <th className="col-discount">Discount %</th>
                <th className="col-discount-amt">Discount Amt</th>
                {gstEnabled && <th className="col-gst">GST %</th>}
                <th className="col-amount">Amount</th>
                <th className="col-delete"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const lineAmount = calculateLineAmount(
                  item.rate,
                  item.qty,
                  item.discount
                );
                const lineGST = gstEnabled
                  ? calculateLineGST(lineAmount, item.gstPercent)
                  : 0;
                const lineTotal = lineAmount + lineGST;

                return (
                  <tr key={item.id}>
                    <td>
                                            <select
                        value={item.itemName}
                        onChange={(e) =>
                          handleItemChange(item.id, "itemName", e.target.value)
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
                        value={item.hsnCode}
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
                        value={item.qty}
                        onChange={(e) =>
                          handleItemChange(item.id, "qty", e.target.value)
                        }
                        className="form-input small input-number"
                      />
                    </td>
                    <td className="col-unit">
                      <input
                        type="text"
                        value={item.unit}
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
                        value={item.rate}
                        onChange={(e) =>
                          handleItemChange(item.id, "rate", e.target.value)
                        }
                        className="form-input small input-number"
                      />
                    </td>
                    <td className="col-discount">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.discount}
                        onChange={(e) =>
                          handleItemChange(item.id, "discount", e.target.value)
                        }
                        className="form-input small input-number"
                      />
                    </td>
                    <td className="col-discount-amt amount">
                      ₹{calculateDiscountAmount(item.rate, item.qty, item.discount).toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    {gstEnabled && (
                      <td className="col-gst">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={item.gstPercent}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "gstPercent",
                              e.target.value
                            )
                          }
                          className="form-input small input-number"
                        />
                      </td>
                    )}
                    <td className="col-amount amount">
                      ₹{lineTotal.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="col-delete">
                      <button
                        className="btn-delete-item"
                        onClick={() => handleRemoveLine(item.id)}
                        style={{
                          color: "#999",
                          backgroundColor: "transparent",
                          border: "none",
                          padding: "4px 8px",
                          cursor: "pointer",
                          fontSize: "18px",
                          transition: "all 0.2s ease",
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
                        title="Delete item"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* TOTALS SECTION */}
      <div className="quotation-totals">
        <div className="totals-box">
          <div className="total-row">
            <span className="total-label">Subtotal</span>
            <span className="total-value">
              ₹{subtotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="total-row">
            <span className="total-label">Total Discount</span>
            <span className="total-value">
              -₹{totalDiscount.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="total-row">
            <span className="total-label">Subtotal (Taxable Value)</span>
            <span className="total-value">
              ₹{(subtotal - totalDiscount).toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {gstEnabled && (
            <div className="total-row">
              <span className="total-label">Total GST</span>
              <span className="total-value">
                ₹{totalGST.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          )}

          <div className="total-row grand-total">
            <span className="total-label">Grand Total</span>
            <span className="total-value">
              ₹{grandTotal.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
            <div className="quotation-actions">
        <button
          className="btn-secondary"
          onClick={() => navigate("/app/sales/quotations")}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          className="btn-primary"
          onClick={handleSaveDraft}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Draft"}
        </button>
      </div>

      {/* ADD ITEMS IN BULK MODAL */}
      {showBulkModal && (
        <div className="modal-overlay" onClick={() => { setShowBulkModal(false); setBulkItems([]); setNextBulkId(1); }}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()} style={{ width: "90%", maxWidth: "900px", height: "600px", display: "flex", flexDirection: "column" }}>
            <div className="modal-header">
              <h2 className="modal-title">Add Items in Bulk</h2>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkItems([]);
                  setNextBulkId(1);
                }}
                title="Close"
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flex: 1, gap: "20px", padding: "20px", overflow: "hidden", minHeight: 0 }}>
              {/* LEFT PANEL - ALL ITEMS */}
              <div style={{ flex: 1, paddingRight: "20px", borderRight: "1px solid #e5e7eb", overflowY: "auto" }}>
                <h4 style={{ marginTop: 0, marginBottom: "16px", color: "#1f2937", fontWeight: 600 }}>Available Items</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {backendItems.map((dummyItem) => {
                    const isSelected = bulkItems.find((item) => item.name === dummyItem.name);
                    return (
                      <div
                        key={dummyItem.id}
                        style={{
                          padding: "12px",
                          border: isSelected ? "2px solid #3b82f6" : "1px solid #d1d5db",
                          borderRadius: "4px",
                          cursor: "pointer",
                          backgroundColor: isSelected ? "#eff6ff" : "#fff",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = "#f9fafb";
                            e.currentTarget.style.borderColor = "#9ca3af";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = "#fff";
                            e.currentTarget.style.borderColor = "#d1d5db";
                          }
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#1f2937", fontSize: "14px", fontWeight: 500 }}>{dummyItem.name}</span>
                          <button
                            onClick={() => handleSelectItemForBulk(dummyItem)}
                            style={{
                              padding: "4px 12px",
                              fontSize: "12px",
                              fontWeight: 600,
                              border: "none",
                              backgroundColor: isSelected ? "#3b82f6" : "#e5e7eb",
                              color: isSelected ? "#fff" : "#374151",
                              borderRadius: "3px",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.target.style.backgroundColor = "#d1d5db";
                              } else {
                                e.target.style.backgroundColor = "#2563eb";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.target.style.backgroundColor = "#e5e7eb";
                              } else {
                                e.target.style.backgroundColor = "#3b82f6";
                              }
                            }}
                          >
                            {isSelected ? "✓ Added" : "+ Add"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT PANEL - SELECTED ITEMS */}
              <div style={{ flex: 1, paddingLeft: "20px", overflowY: "auto" }}>
                <h4 style={{ marginTop: 0, marginBottom: "16px", color: "#1f2937", fontWeight: 600 }}>Selected Items ({bulkItems.length})</h4>
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
                          backgroundColor: "#f9fafb",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <span style={{ color: "#1f2937", fontSize: "13px", fontWeight: 500 }}>{selectedItem.name}</span>
                          <button
                            onClick={() => removeSelectedBulkItem(selectedItem.id)}
                            style={{
                              color: "#999",
                              backgroundColor: "transparent",
                              border: "none",
                              padding: "4px 8px",
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
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "12px", color: "#6b7280", minWidth: "40px" }}>Qty:</span>
                          <button
                            onClick={() => handleDecreaseQty(selectedItem.id)}
                            style={{
                              color: "#374151",
                              backgroundColor: "#e5e7eb",
                              border: "none",
                              width: "28px",
                              height: "28px",
                              borderRadius: "3px",
                              cursor: "pointer",
                              fontSize: "20px",
                              fontWeight: "bold",
                              lineHeight: "1",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = "#d1d5db";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = "#e5e7eb";
                            }}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={selectedItem.qty}
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value) || 1;
                              setBulkItems(
                                bulkItems.map((item) =>
                                  item.id === selectedItem.id
                                    ? { ...item, qty: newQty }
                                    : item
                                )
                              );
                            }}
                            style={{
                              width: "50px",
                              padding: "4px 6px",
                              border: "1px solid #d1d5db",
                              borderRadius: "3px",
                              fontSize: "12px",
                              textAlign: "center",
                            }}
                          />
                          <button
                            onClick={() => handleIncreaseQty(selectedItem.id)}
                            style={{
                              color: "#374151",
                              backgroundColor: "#e5e7eb",
                              border: "none",
                              width: "28px",
                              height: "28px",
                              borderRadius: "3px",
                              cursor: "pointer",
                              fontSize: "20px",
                              fontWeight: "bold",
                              lineHeight: "1",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = "#d1d5db";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = "#e5e7eb";
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ borderTop: "1px solid #e5e7eb", padding: "16px 20px", display: "flex", gap: "12px", justifyContent: "center", flexShrink: 0 }}>
              <button
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
                onClick={handleBulkAddToQuotation}
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
                Add to Quotation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW PARTY MODAL */}
      {showPartyModal && (
        <div className="modal-overlay" onClick={handleClosePartyModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Party</h2>
              <button
                className="modal-close-btn"
                onClick={handleClosePartyModal}
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>

            <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
              {/* BASIC PARTY INFO SECTION */}
              <div className="modal-section">
                <h3 className="modal-section-title">Party Information</h3>
                
                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Party Name *</label>
                    <input
                      type="text"
                      value={partyFormData.partyName}
                      onChange={(e) =>
                        handlePartyFormChange("partyName", e.target.value)
                      }
                      placeholder="Enter party name"
                      className={`form-input ${partyErrors.partyName ? "input-error" : ""}`}
                    />
                    {partyErrors.partyName && (
                      <span className="error-text">{partyErrors.partyName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Party Type *</label>
                    <select
                      value={partyFormData.partyType}
                      onChange={(e) =>
                        handlePartyFormChange("partyType", e.target.value)
                      }
                      className={`form-input form-select ${
                        partyErrors.partyType ? "input-error" : ""
                      }`}
                    >
                      <option value="">Select type</option>
                      <option value="Customer">Customer</option>
                      <option value="Supplier">Supplier</option>
                    </select>
                    {partyErrors.partyType && (
                      <span className="error-text">{partyErrors.partyType}</span>
                    )}
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">GSTIN (Optional)</label>
                    <input
                      type="text"
                      value={partyFormData.gstin}
                      onChange={(e) =>
                        handlePartyFormChange("gstin", e.target.value.toUpperCase())
                      }
                      placeholder="Enter GSTIN (15 characters)"
                      maxLength={15}
                      className={`form-input ${partyErrors.gstin ? "input-error" : ""}`}
                    />
                    {partyErrors.gstin && (
                      <span className="error-text">{partyErrors.gstin}</span>
                    )}
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">
                      {partyFormData.partyType === "Customer" ? "Customer Since" : 
                       partyFormData.partyType === "Supplier" ? "Supplier Since" : "Since"}
                    </label>
                    <input
                      type="date"
                      value={partyFormData.sinceDate}
                      onChange={(e) =>
                        handlePartyFormChange("sinceDate", e.target.value)
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Credit Limit (Optional)</label>
                    <input
                      type="number"
                      value={partyFormData.creditLimit ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        handlePartyFormChange("creditLimit", val === "" ? null : Number(val));
                      }}
                      placeholder="Leave blank for no limit"
                      min="0"
                      step="0.01"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Opening Balance (Optional)</label>
                    <input
                      type="number"
                      value={partyFormData.openingBalance ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        handlePartyFormChange("openingBalance", val === "" ? null : Number(val));
                      }}
                      placeholder="Opening balance for party account"
                      min="0"
                      step="0.01"
                      className="form-input"
                    />
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
                      value={partyFormData.phone}
                      onChange={(e) =>
                        handlePartyFormChange("phone", e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="10-digit phone number"
                      maxLength={10}
                      className={`form-input ${partyErrors.phone ? "input-error" : ""}`}
                    />
                    {partyErrors.phone && (
                      <span className="error-text">{partyErrors.phone}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      value={partyFormData.email}
                      onChange={(e) =>
                        handlePartyFormChange("email", e.target.value)
                      }
                      placeholder="Enter email address"
                      className={`form-input ${partyErrors.email ? "input-error" : ""}`}
                    />
                    {partyErrors.email && (
                      <span className="error-text">{partyErrors.email}</span>
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
                      value={partyFormData.addressLine1}
                      onChange={(e) =>
                        handlePartyFormChange("addressLine1", e.target.value)
                      }
                      placeholder="Enter address"
                      className={`form-input ${
                        partyErrors.addressLine1 ? "input-error" : ""
                      }`}
                    />
                    {partyErrors.addressLine1 && (
                      <span className="error-text">{partyErrors.addressLine1}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      value={partyFormData.city}
                      onChange={(e) => handlePartyFormChange("city", e.target.value)}
                      placeholder="Enter city"
                      className={`form-input ${partyErrors.city ? "input-error" : ""}`}
                    />
                    {partyErrors.city && (
                      <span className="error-text">{partyErrors.city}</span>
                    )}
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <select
                      value={partyFormData.state}
                      onChange={(e) => handlePartyFormChange("state", e.target.value)}
                      className={`form-input form-select ${
                        partyErrors.state ? "input-error" : ""
                      }`}
                    >
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    {partyErrors.state && (
                      <span className="error-text">{partyErrors.state}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pincode *</label>
                    <input
                      type="text"
                      value={partyFormData.pincode}
                      onChange={(e) =>
                        handlePartyFormChange("pincode", e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="6-digit pincode"
                      maxLength={6}
                      className={`form-input ${partyErrors.pincode ? "input-error" : ""}`}
                    />
                    {partyErrors.pincode && (
                      <span className="error-text">{partyErrors.pincode}</span>
                    )}
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Country *</label>
                    <input
                      type="text"
                      value={partyFormData.country}
                      onChange={(e) =>
                        handlePartyFormChange("country", e.target.value)
                      }
                      className={`form-input ${
                        partyErrors.country ? "input-error" : ""
                      }`}
                    />
                    {partyErrors.country && (
                      <span className="error-text">{partyErrors.country}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleClosePartyModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveParty}
                >
                  Save Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW ITEM MODAL */}
      {showItemModal && (
        <div className="modal-overlay" onClick={handleCloseItemModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Item</h2>
              <button
                className="modal-close-btn"
                onClick={handleCloseItemModal}
                title="Close"
              >
                ✕
              </button>
            </div>

            <form className="modal-form" onSubmit={(e) => e.preventDefault()} style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {/* ITEM DETAILS SECTION */}
              <div className="modal-section">
                <h3 className="modal-section-title">Item Details</h3>
                
                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Item Name *</label>
                    <input
                      type="text"
                      value={itemFormData.itemName}
                      onChange={(e) =>
                        handleItemFormChange("itemName", e.target.value)
                      }
                      placeholder="Enter item name"
                      className={`form-input ${itemErrors.itemName ? "input-error" : ""}`}
                    />
                    {itemErrors.itemName && (
                      <span className="error-text">{itemErrors.itemName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Item Type *</label>
                    <select
                      value={itemFormData.itemType}
                      onChange={(e) =>
                        handleItemFormChange("itemType", e.target.value)
                      }
                      className={`form-input form-select ${
                        itemErrors.itemType ? "input-error" : ""
                      }`}
                    >
                      <option value="">Select type</option>
                      <option value="Goods">Goods</option>
                      <option value="Service">Service</option>
                    </select>
                    {itemErrors.itemType && (
                      <span className="error-text">{itemErrors.itemType}</span>
                    )}
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Unit of Measurement *</label>
                    <select
                      value={itemFormData.uom}
                      onChange={(e) =>
                        handleItemFormChange("uom", e.target.value)
                      }
                      className={`form-input form-select ${
                        itemErrors.uom ? "input-error" : ""
                      }`}
                    >
                      <option value="">Select UOM</option>
                      <option value="Kg">Kg</option>
                      <option value="Ltr">Ltr</option>
                      <option value="Pcs">Pcs</option>
                      <option value="Box">Box</option>
                      <option value="Bag">Bag</option>
                      <option value="Units">Units</option>
                    </select>
                    {itemErrors.uom && (
                      <span className="error-text">{itemErrors.uom}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">SKU *</label>
                    <input
                      type="text"
                      value={itemFormData.sku}
                      onChange={(e) =>
                        handleItemFormChange("sku", e.target.value)
                      }
                      placeholder="Enter SKU"
                      className={`form-input ${itemErrors.sku ? "input-error" : ""}`}
                    />
                    {itemErrors.sku && (
                      <span className="error-text">{itemErrors.sku}</span>
                    )}
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      value={itemFormData.category}
                      onChange={(e) =>
                        handleItemFormChange("category", e.target.value)
                      }
                      className="form-input form-select"
                    >
                      <option value="">Select category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Food & Beverages">Food & Beverages</option>
                      <option value="Home & Garden">Home & Garden</option>
                      <option value="Grocery">Grocery</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Brand</label>
                    <input
                      type="text"
                      value={itemFormData.brand}
                      onChange={(e) =>
                        handleItemFormChange("brand", e.target.value)
                      }
                      placeholder="Enter brand name"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      value={itemFormData.description}
                      onChange={(e) =>
                        handleItemFormChange("description", e.target.value)
                      }
                      placeholder="Enter item description"
                      className="form-input"
                      rows="2"
                      style={{ resize: "vertical" }}
                    />
                  </div>
                </div>
              </div>

              {/* GST DETAILS SECTION */}
              <div className="modal-section">
                <h3 className="modal-section-title">GST Details</h3>
                
                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">{itemFormData.itemType === "Goods" ? "HSN Code" : "SAC Code"} *</label>
                    <input
                      type="text"
                      value={itemFormData.hsnCode}
                      onChange={(e) =>
                        handleItemFormChange("hsnCode", e.target.value.replace(/\D/g, ""))
                      }
                      placeholder={itemFormData.itemType === "Goods" ? "8-digit HSN code" : "SAC code"}
                      maxLength={itemFormData.itemType === "Goods" ? 8 : undefined}
                      className={`form-input ${itemErrors.hsnCode ? "input-error" : ""}`}
                    />
                    {itemErrors.hsnCode && (
                      <span className="error-text">{itemErrors.hsnCode}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">GST Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={itemFormData.gstRate}
                      onChange={(e) =>
                        handleItemFormChange("gstRate", parseFloat(e.target.value) || 0)
                      }
                      placeholder="Enter GST rate"
                      className={`form-input ${itemErrors.gstRate ? "input-error" : ""}`}
                    />
                    {itemErrors.gstRate && (
                      <span className="error-text">{itemErrors.gstRate}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* PRICING SECTION */}
              <div className="modal-section">
                <h3 className="modal-section-title">Pricing</h3>
                
                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Selling Price (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemFormData.sellingPrice}
                      onChange={(e) =>
                        handleItemFormChange("sellingPrice", parseFloat(e.target.value) || 0)
                      }
                      placeholder="Selling price"
                      className={`form-input ${itemErrors.sellingPrice ? "input-error" : ""}`}
                    />
                    {itemErrors.sellingPrice && (
                      <span className="error-text">{itemErrors.sellingPrice}</span>
                    )}
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">MRP (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemFormData.mrp}
                      onChange={(e) =>
                        handleItemFormChange("mrp", parseFloat(e.target.value) || 0)
                      }
                      placeholder="Maximum Retail Price"
                      className={`form-input ${itemErrors.mrp ? "input-error" : ""}`}
                    />
                    {itemErrors.mrp && (
                      <span className="error-text">{itemErrors.mrp}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Purchase Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemFormData.purchasePrice}
                      onChange={(e) =>
                        handleItemFormChange("purchasePrice", parseFloat(e.target.value) || 0)
                      }
                      placeholder="Purchase price"
                      className="form-input"
                    />
                  </div>
                </div>


              </div>

              {/* DISCOUNT SECTION */}
              <div className="modal-section">
                <h3 className="modal-section-title">Discount</h3>
                
                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Sales Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={itemFormData.salesDiscountPercent}
                      onChange={(e) =>
                        handleItemFormChange("salesDiscountPercent", parseFloat(e.target.value) || 0)
                      }
                      placeholder="Sales discount percentage"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sales Discount Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemFormData.salesDiscountAmount}
                      onChange={(e) =>
                        handleItemFormChange("salesDiscountAmount", parseFloat(e.target.value) || 0)
                      }
                      placeholder="Sales discount amount"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Purchase Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={itemFormData.purchaseDiscountPercent}
                      onChange={(e) =>
                        handleItemFormChange("purchaseDiscountPercent", parseFloat(e.target.value) || 0)
                      }
                      placeholder="Purchase discount percentage"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Purchase Discount Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemFormData.purchaseDiscountAmount}
                      onChange={(e) =>
                        handleItemFormChange("purchaseDiscountAmount", parseFloat(e.target.value) || 0)
                      }
                      placeholder="Purchase discount amount"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* STOCK DETAILS SECTION */}
              <div className="modal-section">
                <h3 className="modal-section-title">Stock Details</h3>
                
                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Opening Stock</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemFormData.openingStock}
                      onChange={(e) =>
                        handleItemFormChange("openingStock", parseFloat(e.target.value) || 0)
                      }
                      placeholder="Opening stock quantity"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Minimum Level</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemFormData.minLevel}
                      onChange={(e) =>
                        handleItemFormChange("minLevel", parseFloat(e.target.value) || 0)
                      }
                      placeholder="Minimum stock level"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseItemModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveItem}
                >
                  Create Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateQuotation;
