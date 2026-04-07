import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AppIcon from "../../../components/common/AppIcon";
import "../../../styles/items-grid-view.css";

function ItemsGridView({ items = [], onDeleteItem }) {
  const navigate = useNavigate();
  const [hoveredItemId, setHoveredItemId] = useState(null);

  return (
    <div className="items-grid">
      {items.length > 0 ? (
        items.map((item) => (
          <div
            key={item.id}
            className="item-card"
            onClick={() => navigate(`/app/items/${item.id}`)}
            style={{ position: "relative" }}
          >
            <div className="item-card-image-container">
              <div className="item-card-image-placeholder">
                <AppIcon name="box" size="2x" color="#95a5a6" />
              </div>
            </div>

            <div className="item-card-content">
              <h3 className="item-card-name">{item.name}</h3>
              
              <div className="item-card-type">
                <span
                  className="type-badge"
                  style={{
                    backgroundColor:
                      item.type === "Goods" ? "#e3f2fd" : "#f3e5f5",
                    color: item.type === "Goods" ? "#1976d2" : "#7b1fa2",
                  }}
                >
                  {item.type}
                </span>
              </div>

              <div className="item-card-meta">
                <div className="meta-item">
                  <span className="meta-label">Unit</span>
                  <span className="meta-value">{item.unit}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">GST</span>
                  <span className="meta-value">{item.gstPercentage}%</span>
                </div>
              </div>

              <div className="item-card-price">
                <div className="price-item">
                  <span className="price-label">Selling Price</span>
                  <span className="price-value">₹{item.sellingPrice}</span>
                </div>
                {item.openingStock !== null && (
                  <div className="price-item">
                    <span className="price-label">Stock</span>
                    <span className="price-value">{item.openingStock}</span>
                  </div>
                )}
              </div>

              <div className="item-card-footer">
                <small className="last-updated">
                  Updated: {new Date(item.lastUpdated).toLocaleDateString("en-IN")}
                </small>
              </div>
            </div>

            <button
              className="btn-delete-icon"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteItem(item.id, item.name);
              }}
              onMouseEnter={() => setHoveredItemId(item.id)}
              onMouseLeave={() => setHoveredItemId(null)}
              style={{
                position: "absolute",
                bottom: "12px",
                right: "12px",
                background: "none",
                border: "none",
                color: "#f44336",
                cursor: "pointer",
                fontSize: "18px",
                padding: "4px 8px",
                transition: "all 0.3s ease",
                transform: hoveredItemId === item.id ? "scale(1.2)" : "scale(1)",
                opacity: hoveredItemId === item.id ? "1" : "0.7",
              }}
              title="Delete item"
            >
              <AppIcon name="trash" />
            </button>
          </div>
        ))
      ) : (
        <div className="no-items-grid">No items found</div>
      )}
    </div>
  );
}

export default ItemsGridView;
