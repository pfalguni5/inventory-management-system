import { useParams, useNavigate } from "react-router-dom";
import {useState, useEffect} from "react";
import AppIcon from "../../../components/common/AppIcon";
import "../../../styles/item-detail.css";
import { getItemById, deleteItem } from "../../../services/itemService";
import { getStockByItem } from "../../../services/StockService";

function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [currentStock, setCurrentStock] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteHovered, setDeleteHovered] = useState(false);

  useEffect(() => { 
    const fetchItemDetails = async () => {
      setIsLoading(true);
      try {
        const response = await getItemById(id);
        const backendItem = response.data;

        const transformedItem = {
          id: backendItem.id,
          name: backendItem.name,
          description: backendItem.description,
        sku: backendItem.sku,
        type: backendItem.type && backendItem.type.toLowerCase() === "goods" ? "Goods" : "Service",
        unit: backendItem.unit,
        minLevel: backendItem.lowStockAlert,
        hsnCode: backendItem.hsn,
        sacCode: backendItem.hsn,
        gstPercentage: backendItem.gstRate,
        costPrice: backendItem.purchasePrice,
        mrp: backendItem.mrpPrice,
        sellingPrice: backendItem.salePrice,
        purchasePrice: backendItem.purchasePrice,
        minSalesPrice: backendItem.salePrice,
        costValuePrice: backendItem.purchasePrice,
        salesDiscount: backendItem.saleDiscountPercent,
        salesDiscountAmount: backendItem.saleDiscountAmount,
        purchaseDiscount: backendItem.purchaseDiscountPercent,
        purchaseDiscountAmount: backendItem.purchaseDiscountAmount,
        openingStock: backendItem.type && backendItem.type.toLowerCase() === "goods" ? backendItem.openingStock : null,
        lastUpdated: backendItem.updatedAt,
      };

      setItem(transformedItem);

      // Fetch actual stock from Stock module for Goods items
      if (transformedItem.type === "Goods") {
        try {
          const stockResponse = await getStockByItem(backendItem.id);
          if (stockResponse && stockResponse.quantity !== null && stockResponse.quantity !== undefined) {
            setCurrentStock(stockResponse.quantity);
          }
        } catch (err) {
          console.error("Error fetching stock:", err);
        }
      }
      } catch (error) {
        console.error("Error fetching item details:", error);
      } finally {
        setIsLoading(false);
      } 
    };

    fetchItemDetails();
  }, [id]);

    const handleDeleteItem = async () => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${item.name}"?`);

    if (!confirmDelete) return;

    try {
      await deleteItem(item.id);
      alert("Item deleted successfully");
      navigate("/app/items");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert(
        error.response?.data?.message ||
        "Failed to delete item"
      );
    }
  };

  if (isLoading) {
    return (
      <div>
        <h2 className="page-title">Loading item details ....</h2>
      </div>
    );
  }


  if (!item) {
    return (
      <div>
        <h2 className="page-title">Item Not Found</h2>
        <button className="btn-primary" onClick={() => navigate("/app/items")}>
          Back to Items
        </button>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <div className="detail-header">
        <div>
          <button className="btn-back" onClick={() => navigate("/app/items")}>
            <AppIcon name="back" /> Back
          </button>
          <h2 className="page-title">{item.name}</h2>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn-edit-top" 
                  onClick={() => navigate(`/app/items/edit/${item.id}`)}>
            <AppIcon name="edit" /> Edit
          </button>
          <button className="btn-delete" 
                  onClick={handleDeleteItem}
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
          <h3 className="section-title">Item Details</h3>
          <div className="detail-grid">
            <div className="detail-row">
              <label>Item Name</label>
              <span>{item.name}</span>
            </div>
            <div className="detail-row">
              <label>SKU</label>
              <span>{item.sku}</span>
            </div>
            <div className="detail-row">
              <label>Description</label>
              <span>{item.description}</span>
            </div>
            <div className="detail-row">
              <label>Item Type</label>
              <span>
                <span
                  className="type-badge"
                  style={{
                    backgroundColor:
                      item.type === "Goods" ? "#e3f2fd" : "#f3e5f5",
                    color: item.type === "Goods" ? "#1976d2" : "#7b1fa2",
                    padding: "4px 12px",
                    borderRadius: "4px",
                    display: "inline-block",
                  }}
                >
                  {item.type}
                </span>
              </span>
            </div>
            <div className="detail-row">
              <label>Unit</label>
              <span>{item.unit}</span>
            </div>
            <div className="detail-row">
              <label>{item.type === "Goods" ? "HSN Code" : "SAC Code"}</label>
              <span>{item.type === "Goods" ? item.hsnCode : item.sacCode}</span>
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <div className="detail-section">
          <h3 className="section-title">GST & Pricing</h3>
          <div className="detail-grid">
            <div className="detail-row">
              <label>GST Rate (%)</label>
              <span>{item.gstPercentage}%</span>
            </div>
            <div className="detail-row">
              <label>Purchase Price</label>
              <span>₹{(item.purchasePrice ?? 0).toLocaleString("en-IN")}</span>
            </div>
            <div className="detail-row">
              <label>MRP</label>
              <span>₹{item.mrp.toLocaleString('en-IN')}</span>
            </div>
            <div className="detail-row">
              <label>Selling Price</label>
              <span>₹{item.sellingPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <div className="detail-section">
          <h3 className="section-title">Discounts</h3>
          <div className="detail-grid">
            <div className="detail-row">
              <label>Sales Discount</label>
              <span>{item.salesDiscount}%</span>
            </div>
            <div className="detail-row">
              <label>Sales Discount Amount</label>
              <span>₹{(item.salesDiscountAmount ?? 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="detail-row">
              <label>Purchase Discount</label>
              <span>{item.purchaseDiscount}%</span>
            </div>
            <div className="detail-row">
              <label>Purchase Discount Amount</label>
              <span>₹{(item.purchaseDiscountAmount ?? 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {item.openingStock !== null && (
          <>
            <div className="divider"></div>
            <div className="detail-section">
              <h3 className="section-title">Stock Information</h3>
              <div className="detail-grid">
                <div className="detail-row">
                  <label>Current Stock</label>
                  <span>{currentStock !== null ? currentStock : item.openingStock} {item.unit}</span>
                </div>
                <div className="detail-row">
                  <label>Minimum Level</label>
                  <span>{item.minLevel} {item.unit}</span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="divider"></div>

        <div className="detail-section">
          <div className="detail-grid">
            <div className="detail-row">
              <label>Last Updated</label>
              <span>
                {new Date(item.lastUpdated).toLocaleDateString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;
