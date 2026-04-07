import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AppIcon from "../../../components/common/AppIcon";
import "../../../styles/items-list-view.css";

function ItemsListView({ items = [], onDeleteItem }) {
  const navigate = useNavigate();
  const [hoveredItemId, setHoveredItemId] = useState(null);

  return (
    <div className="items-list">
      {items.length > 0 ? (
        items.map((item) => (
          <div
            key={item.id}
            className="item-list-row"
            onClick={() => navigate(`/app/items/${item.id}`)}
          >
            {/* Left: Icon */}
            <div className="item-list-left">
              <div className="item-list-icon">
                <AppIcon name="box" size="lg" color="#95a5a6" />
              </div>
            </div>

            {/* Center: Name, Type & Details */}
            <div className="item-list-body">
              <div className="item-list-title">
                <h4 className="item-list-name">{item.name}</h4>
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
              
              <div className="item-list-meta">
                <div className="meta-chip">
                  <span className="meta-label">Unit</span>
                  <span className="meta-val">{item.unit}</span>
                </div>
                <div className="meta-chip">
                  <span className="meta-label">GST</span>
                  <span className="meta-val">{item.gstPercentage}%</span>
                </div>
                <div className="meta-chip">
                  <span className="meta-label">Price</span>
                  <span className="meta-val">₹{item.sellingPrice}</span>
                </div>
                {item.openingStock !== null && (
                  <div className="meta-chip">
                    <span className="meta-label">Stock</span>
                    <span className="meta-val">{item.openingStock}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Action Icon */}
            <div className="item-list-right">
              <button
                className="btn-delete-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteItem(item.id, item.name);
                }}
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#f44336",
                  cursor: "pointer",
                  fontSize: "18px",
                  padding: "4px 8px",
                  marginRight: "8px",
                  transition: "all 0.3s ease",
                  transform: hoveredItemId === item.id ? "scale(1.2)" : "scale(1)",
                  opacity: hoveredItemId === item.id ? "1" : "0.7",
                }}
                title="Delete item"
              >
                <AppIcon name="trash" />
              </button>
              <AppIcon name="angleRight" size="lg" color="#95a5a6" />
            </div>
          </div>
        ))
      ) : (
        <div className="no-items-list">No items found</div>
      )}
    </div>
  );
}

export default ItemsListView;
