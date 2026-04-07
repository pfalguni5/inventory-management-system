import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppIcon from "../../../components/common/AppIcon";
import ItemsGridView from "./ItemsGridView";
import ItemsListView from "./ItemsListView";
import "../../../styles/items-list.css";
import { getAllItems, deleteItem } from "../../../services/itemService";

function ItemsList() {
  const navigate = useNavigate();
  const layoutDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  const [items, setItems] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [hoveredItemId, setHoveredItemId] = useState(null);

  useEffect(() => {
    const fetchItemsData = async () => {
      const businessId = localStorage.getItem("businessId");

      // 🚨 IMPORTANT: Don't call API if businessId not ready
      if (!businessId) return;

      setLoading(true);
      try {
        const response = await getAllItems();

        const transformedItems = response.data.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          sku: item.sku,
          type: item.type && item.type.toLowerCase() === "goods" ? "Goods" : "Service",
          unit: item.unit,
          hsnCode: item.hsnCode,
          sacCode: item.sacCode,
          gstPercentage: item.gstRate,
          costPrice: item.purchasePrice,
          mrp: item.mrp,
          sellingPrice: item.salePrice,
          purchasePrice: item.purchasePrice,
          salesDiscount: item.salesDiscountPercent,
          purchaseDiscount: item.purchaseDiscountPercent,
          openingStock: item.type === "goods" ? item.openingStock : null,
          minLevel: item.lowStockAlert,
          lastUpdated: item.updatedAt,
        }));

        setItems(transformedItems);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };

    // ✅ run initially
    fetchItemsData();

    // ✅ ALSO listen when business changes
    const handleBusinessChange = () => {
      fetchItemsData();
    };

    window.addEventListener("businessChanged", handleBusinessChange);

    return () => {
      window.removeEventListener("businessChanged", handleBusinessChange);
    };
  }, []);


  // Initialize layout from localStorage, default to 'table'
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem("itemsLayout");
    return saved ? saved : "table";
  });

  // Sort state
  const [sortBy, setSortBy] = useState(() => {
    const saved = localStorage.getItem("itemsSortBy");
    return saved ? saved : "updatedAt";
  });

  const [sortDir, setSortDir] = useState(() => {
    const saved = localStorage.getItem("itemsSortDir");
    return saved ? saved : "desc";
  });

  const [layoutDropdownOpen, setLayoutDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Persist layout choice to localStorage
  useEffect(() => {
    localStorage.setItem("itemsLayout", layout);
  }, [layout]);

  // Persist sort choices to localStorage
  useEffect(() => {
    localStorage.setItem("itemsSortBy", sortBy);
    localStorage.setItem("itemsSortDir", sortDir);
  }, [sortBy, sortDir]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (layoutDropdownRef.current && !layoutDropdownRef.current.contains(event.target)) {
        setLayoutDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setSortDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Client-side sorting function
  const sortItems = (itemsToSort) => {
    const sorted = [...itemsToSort];
    
    sorted.sort((a, b) => {
      let compareValue = 0;

      if (sortBy === "updatedAt") {
        const dateA = new Date(a.lastUpdated);
        const dateB = new Date(b.lastUpdated);
        compareValue = dateA - dateB;
      } else if (sortBy === "price") {
        compareValue = a.sellingPrice - b.sellingPrice;
      } else if (sortBy === "quantity") {
        const qtyA = a.openingStock ?? 0;
        const qtyB = b.openingStock ?? 0;
        compareValue = qtyA - qtyB;
      }

      return sortDir === "asc" ? compareValue : -compareValue;
    });

    return sorted;
  };

  // Filter items by search query, then sort
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedAndFilteredItems = sortItems(filteredItems);

  const handleLayoutSelect = (newLayout) => {
    setLayout(newLayout);
    setLayoutDropdownOpen(false);
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      // Toggle direction if same field clicked
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortDir("desc");
    }
  };

    const handleDeleteItem = async (itemId, itemName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${itemName}"?`);

    if (!confirmDelete) return;

    try {
      await deleteItem(itemId);

      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));

      alert("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert(
        error.response?.data?.message ||
        "Failed to delete item"
      );
    }
  };

  const layoutOptions = [
    { id: "grid", label: "Grid", icon: "grid" },
    { id: "list", label: "List", icon: "list" },
    { id: "table", label: "Table", icon: "table" },
  ];

  return (
    <div>
      <h2 className="page-title">Items Master</h2>

      <div className="list-header">
        <div className="header-left">
          <button className="btn-new" onClick={() => navigate("/app/items/new")}>
            + Add New Item
          </button>
        </div>

        <div className="header-right">
          {/* Search Bar */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <AppIcon name="search" className="search-icon" />
          </div>

          {/* Sort Dropdown */}
          <div className="sort-dropdown-wrapper" ref={sortDropdownRef}>
            <button
              className="sort-toggle-btn"
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              title="Sort items"
            >
              <AppIcon name="filter" size="lg" />
              <span className="sort-label">{sortDir === "asc" ? "↑" : "↓"}</span>
            </button>

            {sortDropdownOpen && (
              <div className="sort-dropdown-menu">
                <div className="sort-header">Sort By</div>
                {[
                  { id: "updatedAt", label: "Updated At" },
                  { id: "price", label: "Price" },
                  { id: "quantity", label: "Quantity" },
                ].map((option) => (
                  <button
                    key={option.id}
                    className={`sort-option ${
                      sortBy === option.id ? "active" : ""
                    }`}
                    onClick={() => handleSortChange(option.id)}
                  >
                    <span>{option.label}</span>
                    {sortBy === option.id && (
                      <span className="sort-direction">
                        {sortDir === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Layout Dropdown */}
          <div className="layout-dropdown-wrapper" ref={layoutDropdownRef}>
            <button
              className="layout-toggle-btn"
              onClick={() => setLayoutDropdownOpen(!layoutDropdownOpen)}
              title="Switch layout"
            >
              <AppIcon name={layout} size="lg" />
            </button>

            {layoutDropdownOpen && (
              <div className="layout-dropdown-menu">
                {layoutOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`layout-option ${
                      layout === option.id ? "active" : ""
                    }`}
                    onClick={() => handleLayoutSelect(option.id)}
                  >
                    <AppIcon name={option.icon} />
                    <span>{option.label}</span>
                    {layout === option.id && (
                      <AppIcon name="check" className="checkmark" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render based on layout */}
      {layout === "grid" && (
        <ItemsGridView
          items={sortedAndFilteredItems}
          onDeleteItem={handleDeleteItem}
        />
      )}

      {layout === "list" && (
        <ItemsListView
          items={sortedAndFilteredItems}
          onDeleteItem={handleDeleteItem}
        />
      )}
      {layout === "table" && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Type</th>
                <th>GST %</th>
                <th>Price (₹)</th>
                <th>Stock</th>
                <th>Last Updated</th>
                <th style={{ width: "60px", textAlign: "center" }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    Loading items...
                  </td>
                </tr>
              ) : sortedAndFilteredItems.length > 0 ? (
                sortedAndFilteredItems.map((item) => (
              <tr
                key={item.id}
                onClick={() => navigate(`/app/items/${item.id}`)}
                style={{ cursor: "pointer" }}
              >
                <td className="item-name">{item.name}</td>
                <td>
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
              </td>
              <td className="center">{item.gstPercentage}%</td>
              <td className="price">{item.sellingPrice}</td>
              <td className="center">{item.openingStock ?? "-"}</td>
              <td className="date">
                {item.lastUpdated
                  ? new Date(item.lastUpdated).toLocaleDateString("en-IN")
                  : "-"}
              </td>
              <td className="center" onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn-delete-icon"
                  onClick={() => handleDeleteItem(item.id, item.name)}
                  onMouseEnter={() => setHoveredItemId(item.id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                  style={{
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
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="7" className="no-data">
              No items found
            </td>
        </tr>
      )}
    </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ItemsList;
