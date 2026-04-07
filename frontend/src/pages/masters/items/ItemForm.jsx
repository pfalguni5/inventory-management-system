import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../../styles/item-form.css";
import { createItem, getItemById, updateItem } from "../../../services/itemService";
import { getStockByItem } from "../../../services/StockService";

function ItemForm() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const formContainerRef = useRef(null);
  
  const [itemType, setItemType] = useState("Goods");
  const [gstEnabled] = useState(true);
  const [stockEnabled] = useState(true);
  const [selectedAction, setSelectedAction] = useState("Add");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
  name: "",
  type: "Goods",
  unit: "",
  category: "",
  brand: "",
  description: "",
  sku: "",
  hsn: "",
  gstRate: "",
  mrpPrice: "",
  salePrice: "",
  purchasePrice: "",
  saleDiscountPercent: "",
  saleDiscountAmount: "",
  purchaseDiscountPercent: "",
  purchaseDiscountAmount: "",
  openingStock: "",
  lowStockAlert: "",
  isActive: true,
  isFavorite: false,
});

  

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

   // Fetch item data in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchItemData = async () => {
      setIsLoading(true);
      try {
        const response = await getItemById(id);
        const item = response.data;

        const mappedFormData = {
          name: item.name || "",
          type: item.type === "goods" ? "Goods" : "Service",
          unit: item.unit || "",
          category: item.category || "",
          brand: item.brand || "",
          description: item.description || "",
          sku: item.sku || "",
          hsn: item.hsn || "",
          gstRate: item.gstRate ?? "",
          mrpPrice: item.mrpPrice ?? "",
          salePrice: item.salePrice ?? "",
          purchasePrice: item.purchasePrice ?? "",
          saleDiscountPercent: item.saleDiscountPercent ?? "",
          saleDiscountAmount: item.saleDiscountAmount ?? "",
          purchaseDiscountPercent: item.purchaseDiscountPercent ?? "",
          purchaseDiscountAmount: item.purchaseDiscountAmount ?? "",
          openingStock: item.openingStock ?? "",
          lowStockAlert: item.lowStockAlert ?? "",
          isActive: item.isActive ?? true,
          isFavorite: item.isFavorite ?? false,
        };

        setFormData(mappedFormData);
        setItemType(mappedFormData.type);

        // Fetch actual stock from Stock module for Goods items
        if (item.type === "goods") {
          try {
            const stockResponse = await getStockByItem(item.id);
            if (stockResponse && stockResponse.quantity !== null && stockResponse.quantity !== undefined) {
              setFormData((prev) => ({
                ...prev,
                openingStock: stockResponse.quantity.toString(),
              }));
            }
          } catch (err) {
            console.error("Error fetching stock:", err);
          }
        }
      } catch (error) {
        console.error("Error fetching item for edit:", error);
        alert("Failed to load item details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItemData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => {
    const updatedFormData = {
      ...prev,
      [name]: value,
    };

    // Auto-calculate sales discount amount when sales discount percent changes
    if (name === "saleDiscountPercent") {
      const salePrice = parseFloat(updatedFormData.salePrice) || 0;
      const discountPercent = parseFloat(value) || 0;
      const discountAmount = (salePrice * discountPercent) / 100;
      updatedFormData.saleDiscountAmount = discountAmount.toFixed(2);
    }

    // Auto-calculate purchase discount amount when purchase discount percent changes
    if (name === "purchaseDiscountPercent") {
      const purchasePrice = parseFloat(updatedFormData.purchasePrice) || 0;
      const discountPercent = parseFloat(value) || 0;
      const discountAmount = (purchasePrice * discountPercent) / 100;
      updatedFormData.purchaseDiscountAmount = discountAmount.toFixed(2);
    }

    return updatedFormData;
  });

  setErrors((prev) => ({
    ...prev,
    [name]: "",
  }));

  if (name === "type") {
    setItemType(value);
  }
};

  const handleActionSelect = (action) => {
    setSelectedAction(action);
    setDropdownOpen(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if(!formData.name.trim()) {
      newErrors.name = "Item name is required";
    }

    if(!formData.type) {
      newErrors.type = "Item type is required";
    }

    if(formData.gstRate !== "" && (Number(formData.gstRate) < 0 || Number(formData.gstRate) > 100)){
      newErrors.gstRate = "GST rate must be between 0 and 100";
    }

    if (formData.mrpPrice !== "" && Number(formData.mrpPrice) < 0) {
    newErrors.mrpPrice = "MRP cannot be negative";
    }

    if (formData.salePrice !== "" && Number(formData.salePrice) < 0) {
      newErrors.salePrice = "Selling price cannot be negative";
    }

    if (formData.purchasePrice !== "" && Number(formData.purchasePrice) < 0) {
      newErrors.purchasePrice = "Purchase price cannot be negative";
    }

    if (
      formData.saleDiscountPercent !== "" &&
      (Number(formData.saleDiscountPercent) < 0 || Number(formData.saleDiscountPercent) > 100)
    ) {
      newErrors.saleDiscountPercent = "Sales discount % must be between 0 and 100";
    }

    if (
      formData.purchaseDiscountPercent !== "" &&
      (Number(formData.purchaseDiscountPercent) < 0 || Number(formData.purchaseDiscountPercent) > 100)
    ) {
      newErrors.purchaseDiscountPercent = "Purchase discount % must be between 0 and 100";
    }

    if (formData.saleDiscountAmount !== "" && Number(formData.saleDiscountAmount) < 0) {
      newErrors.saleDiscountAmount = "Sales discount amount cannot be negative";
    }

    if (formData.purchaseDiscountAmount !== "" && Number(formData.purchaseDiscountAmount) < 0) {
      newErrors.purchaseDiscountAmount = "Purchase discount amount cannot be negative";
    }

    if (formData.type === "Goods") {
      if (formData.openingStock !== "" && Number(formData.openingStock) < 0) {
        newErrors.openingStock = "Opening stock cannot be negative";
      }

      if (formData.lowStockAlert !== "" && Number(formData.lowStockAlert) < 0) {
        newErrors.lowStockAlert = "Minimum level cannot be negative";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSaveItem = async (e) => {
  e.preventDefault();
  if(!validateForm()){
    return;
  }
  setIsLoading(true);

  try {
    const payload = {
      ...formData,
      type: formData.type.toLowerCase(),
      gstRate: formData.gstRate ? Number(formData.gstRate) : 0,
      mrpPrice: formData.mrpPrice ? Number(formData.mrpPrice) : 0,
      salePrice: formData.salePrice ? Number(formData.salePrice) : 0,
      purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : 0,
      saleDiscountPercent: formData.saleDiscountPercent
        ? Number(formData.saleDiscountPercent)
        : 0,
      saleDiscountAmount: formData.saleDiscountAmount
        ? Number(formData.saleDiscountAmount)
        : 0,
      purchaseDiscountPercent: formData.purchaseDiscountPercent
        ? Number(formData.purchaseDiscountPercent)
        : 0,
      purchaseDiscountAmount: formData.purchaseDiscountAmount
        ? Number(formData.purchaseDiscountAmount)
        : 0,
      openingStock:
        formData.type === "Goods"
          ? formData.openingStock
            ? Number(formData.openingStock)
            : 0
          : 0,
      lowStockAlert:
        formData.type === "Goods"
          ? formData.lowStockAlert
            ? Number(formData.lowStockAlert)
            : 0
          : 0,
    };

    if (isEditMode) {
      await updateItem(id, payload);
      alert("Item updated successfully!");
      navigate(`/app/items/${id}`);
    } else {
      await createItem(payload);
      alert("Item added successfully!");

      if (selectedAction === "Add") {
        navigate("/app/items");
      } else if (selectedAction === "Add & New") {
        setFormData({
          name: "",
          type: "Goods",
          unit: "",
          category: "",
          brand: "",
          description: "",
          sku: "",
          hsn: "",
          gstRate: "",
          mrpPrice: "",
          salePrice: "",
          purchasePrice: "",
          saleDiscountPercent: "",
          saleDiscountAmount: "",
          purchaseDiscountPercent: "",
          purchaseDiscountAmount: "",
          openingStock: "",
          lowStockAlert: "",
          isActive: true,
          isFavorite: false,
        });

        setItemType("Goods");
        setSelectedAction("Add");

        if (formContainerRef.current) {
          formContainerRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    }
  } catch (error) {
    console.error("Error saving item:", error);
    alert(
      error.response?.data?.message ||
      "Failed to save item. Please check the form and try again."
    );
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="item-form-container" ref={formContainerRef}>

      <div className="item-form-header">
        <h2 className="item-form-title">{isEditMode ? "Edit Item" : "Add Item"}</h2>
        <p className="item-form-subtitle">
          {isEditMode ? "Update item details" : "Create a new product or service item"}
        </p>
      </div>

      <form className="card item-form-card" onSubmit={handleSaveItem}>
        <div className="item-form-grid">
          {/* Item Name */}
          <div className="form-group">
            <label>Item Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter item name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <small className="error-text">{errors.name}</small>}
          </div>

          {/* Item Type */}
          <div className="form-group">
            <label>Item Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option>Goods</option>
              <option>Service</option>
            </select>
            {errors.type && <small className="error-text">{errors.type}</small>}
          </div>

          {/* Unit */}
          <div className="form-group">
            <label>Unit</label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
            >
            {itemType === "Service" ? (
              <>
                <option>hour</option>
                <option>day</option>
                <option>month</option>
              </>
            ) : (
              <>
                <option>kg</option>
                <option>gram</option>
                <option>liter</option>
                <option>ml</option>
                <option>ton</option>
                <option>pcs</option>
                <option>box</option>
                <option>packet</option>
                <option>carton</option>
                <option>bag</option>
                <option>mtr</option>
                <option>foot</option>
              </>
            )}
          </select>
          </div>

        </div>

        {/* Category and Brand */}
        <div className="item-form-grid" style={{ marginTop: "16px" }}>
          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option>Select category</option>
              <option>Electronics</option>
              <option>Clothing</option>
              <option>Food & Beverages</option>
              <option>Home & Garden</option>
              <option>Grocery</option>
            </select>
          </div>

          <div className="form-group">
            <label>Brand</label>
            <input
              type="text"
              name="brand"
              placeholder="Enter brand name"
              value={formData.brand}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Description */}
        <div className="form-group" style={{ marginTop: "16px" }}>
          <label>Description</label>
          <textarea 
          rows="3"
          name="description"
          placeholder="Enter item description"
          value={formData.description}
          onChange={handleChange}
          />
        </div>

        {/* SKU */}
        <div className="form-group">
          <label>SKU</label>
          <input type="text" 
          name="sku"
          placeholder="Enter SKU code"
          value={formData.sku}
          onChange={handleChange}
        />
        </div>

        <div style={{ borderBottom: "1px solid #e0e0e0", margin: "24px 0" }}></div>

        {/* GST Section */}
        {gstEnabled && (
          <>
            <h4>GST Details</h4>

            <div className="item-form-grid" style={{ marginTop: "12px" }}>
              <div className="form-group">
                <label>{itemType === "Goods" ? "HSN Code" : "SAC Code"}</label>
                <input 
                  name="hsn"
                  placeholder={itemType === "Goods" ? "Enter HSN code" : "Enter SAC code"}
                  value={formData.hsn}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>GST Rate (%)</label>
                <input 
                  name="gstRate"
                  type="number"
                  placeholder="Enter GST rate (e.g., 18)"
                  value={formData.gstRate}
                  onChange={handleChange}
                />
                {errors.gstRate && <small className="error-text">{errors.gstRate}</small>}
              </div>
            </div>
            
            <div style={{ borderBottom: "1px solid #e0e0e0", margin: "20px 0" }}></div>
          </>
        )}

        {/* Pricing */}
        <h4>Pricing</h4>

        <div className="item-form-grid" style={{ marginTop: "12px" }}>
          <div className="form-group">
            <label>MRP</label>
            <input type="number" 
            name="mrpPrice"
            placeholder="Maximum Retail Price"
            value={formData.mrpPrice}
            onChange={handleChange}
          />
          {errors.mrpPrice && <small className="error-text">{errors.mrpPrice}</small>}
          </div>

          <div className="form-group">
            <label>Selling Price</label>
            <input type="number" 
            name="salePrice"
            placeholder="Sale price per unit"
            value={formData.salePrice}
            onChange={handleChange}
          />
          {errors.salePrice && <small className="error-text">{errors.salePrice}</small>}
          </div>

          <div className="form-group pricing-row2">
            <label>Purchase Price</label>
            <input type="number" 
            name="purchasePrice"
            placeholder="Cost price per unit"
            value={formData.purchasePrice}
            onChange={handleChange}
          />
          {errors.purchasePrice && <small className="error-text">{errors.purchasePrice}</small>}
          </div>
        </div>

        <div style={{ borderBottom: "1px solid #e0e0e0", margin: "20px 0" }}></div>

        {/* Discount Section */}
        <h4>Discount</h4>

        <div className="item-form-grid" style={{ marginTop: "12px" }}>
          <div className="form-group">
            <label>Sales Discount</label>
            <input type="number" 
            name="saleDiscountPercent"
            placeholder="Enter sales discount %"
            value={formData.saleDiscountPercent}
            onChange={handleChange}
             />
             {errors.saleDiscountPercent && <small className="error-text">{errors.saleDiscountPercent}</small>}
          </div>

          <div className="form-group">
            <label>Sales Discount Amount</label>
            <input type="number" 
            name="saleDiscountAmount"
            placeholder="Enter sales discount amount"
            value={formData.saleDiscountAmount}
            onChange={handleChange}
             />
             {errors.saleDiscountAmount && <small className="error-text">{errors.saleDiscountAmount}</small>}
          </div>

          <div className="form-group pricing-row2">
            <label>Purchase Discount</label>
            <input type="number" 
            name="purchaseDiscountPercent"
            placeholder="Enter purchase discount %"
            value={formData.purchaseDiscountPercent}
            onChange={handleChange}
             />
            {errors.purchaseDiscountPercent && <small className="error-text">{errors.purchaseDiscountPercent}</small>}
          </div>

          <div className="form-group pricing-row2">
            <label>Purchase Discount Amount</label>
            <input type="number" 
            name="purchaseDiscountAmount"
            placeholder="Enter purchase discount amount"
            value={formData.purchaseDiscountAmount}
            onChange={handleChange}
             />
            {errors.purchaseDiscountAmount && <small className="error-text">{errors.purchaseDiscountAmount}</small>}
          </div>
        </div>

        <div style={{ borderBottom: "1px solid #e0e0e0", margin: "20px 0" }}></div>

        {/* Stock Section */}
        {itemType === "Goods" && stockEnabled && (
          <>
            <h4>Stock Details</h4>
            <div className="item-form-grid" style={{ marginTop: "12px" }}>
              <div className="form-group">
                <label>Opening Stock</label>
                <input type="number" 
                name="openingStock"
                placeholder="Enter opening stock quantity"
                value={formData.openingStock}
                onChange={handleChange}
              />
              {errors.openingStock && <small className="error-text">{errors.openingStock}</small>}
              </div>

              <div className="form-group">
                <label>Min Level</label>
                <input type="number" 
                name="lowStockAlert"
                placeholder="Enter minimum stock level"
                value={formData.lowStockAlert}
                onChange={handleChange}
              />
              {errors.lowStockAlert && <small className="error-text">{errors.lowStockAlert}</small>}
              </div>
            </div>
          </>
        )}

        {/* Split Button Dropdown */}
                {/* Submit Button */}
        <div className="split-button-wrapper" ref={dropdownRef}>
          <button
            type="submit"
            className="split-button-main"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : isEditMode ? "Update" : selectedAction}
          </button>

          {!isEditMode && (
            <>
              <button
                type="button"
                className="split-button-arrow"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                disabled={isLoading}
                aria-label="Toggle action menu"
              >
                ▼
              </button>

              {dropdownOpen && (
                <div className="split-button-dropdown">
                  <button
                    type="button"
                    className={`dropdown-item ${selectedAction === "Add" ? "active" : ""}`}
                    onClick={() => handleActionSelect("Add")}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    className={`dropdown-item ${selectedAction === "Add & New" ? "active" : ""}`}
                    onClick={() => handleActionSelect("Add & New")}
                  >
                    Add & New
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
}

export default ItemForm;
