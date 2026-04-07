import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import AppIcon from "../common/AppIcon";
import "./Sidebar.css";

function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  
  // Determine which groups should be expanded based on current route
  const isInMasters = location.pathname.startsWith("/app/items") || 
                      location.pathname.startsWith("/app/parties");
  const isInTransactions = location.pathname.startsWith("/app/sales") || 
                           location.pathname.startsWith("/app/purchase");
  const isInStock = location.pathname.startsWith("/app/stock");
  const isInReports = location.pathname.startsWith("/app/reports");
  
  // Sales sub-group expand logic
  const isInSales = location.pathname.startsWith("/app/sales");

  // Determine which group should be initially expanded based on current route
  const getInitialExpandedGroup = () => {
    if (isInMasters) return "masters";
    if (isInTransactions) return "transactions";
    if (isInStock) return "stock";
    if (isInReports) return "reports";
    return null;
  };

  // Single expanded group state (accordion behavior)
  const [expandedGroup, setExpandedGroup] = useState(getInitialExpandedGroup);
  
  // Sales sub-group state (independent expand/collapse)
  const [expandedSales, setExpandedSales] = useState(isInSales);

  // Auto-expand the correct group when navigating to a child route
  useEffect(() => {
    if (isInMasters) setExpandedGroup("masters");
    else if (isInTransactions) setExpandedGroup("transactions");
    else if (isInStock) setExpandedGroup("stock");
    else if (isInReports) setExpandedGroup("reports");
    
    // Auto-expand Sales sub-group when in sales routes
    if (isInSales) setExpandedSales(true);
  }, [isInMasters, isInTransactions, isInStock, isInReports, isInSales]);

  // Toggle group - accordion style (only one open at a time)
  const toggleGroup = (group) => {
    setExpandedGroup(prev => prev === group ? null : group);
  };

  // Helper to check if a group is expanded
  const isExpanded = (group) => expandedGroup === group;

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <nav className="sidebar-nav">
        {/* Dashboard - Single Link */}
        <NavLink 
          to="/app" 
          end 
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          onClick={() => setExpandedGroup(null)}
          title="Dashboard"
        >
          <span className="sidebar-icon"><AppIcon name="dashboard" /></span>
          <span className="sidebar-label">Dashboard</span>
        </NavLink>

        {/* Masters - Expand/Collapse Only (no parent navigation) */}
        <div className="sidebar-group">
          <button 
            className={`sidebar-group-header ${isExpanded("masters") ? "expanded" : ""}`}
            onClick={() => toggleGroup("masters")}
            title="Masters"
          >
            <span className="sidebar-icon"><AppIcon name="masters" /></span>
            <span className="sidebar-label">Masters</span>
            <span className="sidebar-arrow"><AppIcon name="angleRight" /></span>
          </button>
          {isOpen && (
            <div className={`sidebar-submenu ${isExpanded("masters") ? "open" : ""}`}>
              <NavLink 
                to="/app/items" 
                className={({ isActive }) => `sidebar-sublink ${isActive ? "active" : ""}`}
              >
                Items
              </NavLink>
              <NavLink 
                to="/app/parties" 
                className={({ isActive }) => `sidebar-sublink ${isActive ? "active" : ""}`}
              >
                Parties
              </NavLink>
            </div>
          )}
        </div>

        {/* Transactions - Expand/Collapse Only (no parent navigation) */}
        <div className="sidebar-group">
          <button 
            className={`sidebar-group-header ${isExpanded("transactions") ? "expanded" : ""}`}
            onClick={() => toggleGroup("transactions")}
            title="Transactions"
          >
            <span className="sidebar-icon"><AppIcon name="transactions" /></span>
            <span className="sidebar-label">Transactions</span>
            <span className="sidebar-arrow"><AppIcon name="angleRight" /></span>
          </button>
          {isOpen && (
            <div className={`sidebar-submenu ${isExpanded("transactions") ? "open" : ""}`}>
              
              {/* Sales with sub-items */}
              <div className="sidebar-subgroup">
                <button
                  className={`sidebar-subgroup-header ${expandedSales ? "expanded" : ""}`}
                  onClick={() => setExpandedSales(!expandedSales)}
                  title="Sales"
                >
                  <span className="sidebar-subgroup-label">Sales</span>
                  <span className="sidebar-arrow"><AppIcon name="angleRight" /></span>
                </button>
                {expandedSales && (
                  <div className={`sidebar-subgroup-menu ${expandedSales ? "open" : ""}`}>
                    <NavLink 
                      to="/app/sales/quotations" 
                      className={({ isActive }) => `sidebar-sublink ${isActive ? "active" : ""}`}
                    >
                      Quotations
                    </NavLink>
                    <NavLink 
                      to="/app/sales/invoices" 
                      className={({ isActive }) => `sidebar-sublink ${isActive ? "active" : ""}`}
                    >
                      Invoices
                    </NavLink>
                  </div>
                )}
              </div>
              
              <NavLink 
                to="/app/purchase" 
                className={({ isActive }) => `sidebar-sublink ${isActive ? "active" : ""}`}
              >
                Purchase
              </NavLink>
            </div>
          )}
        </div>

        {/* Stock - Parent Link + Arrow Expands */}
        <div className="sidebar-group">
          <div className={`sidebar-group-header has-link ${isExpanded("stock") ? "expanded" : ""}`}>
            <NavLink 
              to="/app/stock" 
              end
              className={({ isActive }) => `sidebar-parent-link ${isActive ? "active" : ""}`}
              title="Stock"
            >
              <span className="sidebar-icon"><AppIcon name="stock" /></span>
              <span className="sidebar-label">Stock</span>
            </NavLink>
            {isOpen && (
              <button 
                className="sidebar-expand-btn"
                onClick={(e) => { e.stopPropagation(); toggleGroup("stock"); }}
                aria-label="Toggle Stock submenu"
              >
                <span className="sidebar-arrow"><AppIcon name="angleRight" /></span>
              </button>
            )}
          </div>
          {isOpen && (
            <div className={`sidebar-submenu ${isExpanded("stock") ? "open" : ""}`}>
              <NavLink 
                to="/app/stock/opening" 
                className={({ isActive }) => `sidebar-sublink ${isActive ? "active" : ""}`}
              >
                Opening Stock
              </NavLink>
              <NavLink 
                to="/app/stock/adjustment" 
                className={({ isActive }) => `sidebar-sublink ${isActive ? "active" : ""}`}
              >
                Stock Adjustment
              </NavLink>
            </div>
          )}
        </div>

        {/* Reports - Parent Link + Arrow Expands */}
        <div className="sidebar-group">
          <div className={`sidebar-group-header has-link ${isExpanded("reports") ? "expanded" : ""}`}>
            <NavLink 
              to="/app/reports" 
              end
              className={({ isActive }) => `sidebar-parent-link ${isActive ? "active" : ""}`}
              title="Reports"
            >
              <span className="sidebar-icon"><AppIcon name="reports" /></span>
              <span className="sidebar-label">Reports</span>
            </NavLink>
            {isOpen && (
              <button 
                className="sidebar-expand-btn"
                onClick={(e) => { e.stopPropagation(); toggleGroup("reports"); }}
                aria-label="Toggle Reports submenu"
              >
                <span className="sidebar-arrow"><AppIcon name="angleRight" /></span>
              </button>
            )}
          </div>
          {isOpen && (
            <div className={`sidebar-submenu ${isExpanded("reports") ? "open" : ""}`}>
              <NavLink 
                to="/app/reports/sales-summary" 
                className={({ isActive }) => `sidebar-sublink ${isActive ? "active" : ""}`}
              >
                Sales Report
              </NavLink>
              <NavLink 
                to="/app/reports/purchase-summary" 
                className={({ isActive }) => `sidebar-sublink ${isActive ? "active" : ""}`}
              >
                Purchase Report
              </NavLink>
              <NavLink 
                to="/app/reports/stock-report" 
                className={({ isActive }) => `sidebar-sublink ${isActive ? "active" : ""}`}
              >
                Stock Report
              </NavLink>
              <NavLink 
                to="/app/reports/profit-loss" 
                className={({ isActive }) => `sidebar-sublink ${isActive ? "active" : ""}`}
              >
                Profit & Loss Report
              </NavLink>
        
              <NavLink 
                to="/app/reports/gstr1" 
                className={({ isActive }) => `sidebar-sublink ${isActive ? "active" : ""}`}
              >
                GSTR-1
              </NavLink>
              <NavLink 
                to="/app/reports/gstr3b" 
                className={({ isActive }) => `sidebar-sublink ${isActive ? "active" : ""}`}
              >
                GSTR-3B
              </NavLink>
              <NavLink 
                to="/app/reports/gstr2a" 
                className={({ isActive }) => `sidebar-sublink ${isActive ? "active" : ""}`}
              >
                GSTR-2A/2B
              </NavLink>

              <NavLink 
                to="/app/reports/gstr-9" 
                className={({ isActive }) => `sidebar-sublink ${isActive ? "active" : ""}`}
              >
                GSTR-9
              </NavLink>

              <NavLink
                to="/app/reports/gstr-9c"
                className={({ isActive }) => `sidebar-sublink ${isActive ? "active" : ""}`}
              >
                GSTR-9C
              </NavLink>
            </div>
          )}
        </div>

        {/* E-Way Bill - Single Link */}
        <NavLink 
          to="/app/e-way-bills" 
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          onClick={() => setExpandedGroup(null)}
          title="E-Way Bill"
        >
          <span className="sidebar-icon"><AppIcon name="ewaybill" /></span>
          <span className="sidebar-label">E-Way Bill</span>
        </NavLink>

        {/* Settings - Single Link */}
        <NavLink 
          to="/app/settings" 
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          onClick={() => setExpandedGroup(null)}
          title="Settings"
        >
          <span className="sidebar-icon"><AppIcon name="settings" /></span>
          <span className="sidebar-label">Settings</span>
        </NavLink>

        <NavLink
          to="/app/profile"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          onClick={() => setExpandedGroup(null)}
          title="Profile"
        >
          <span className="sidebar-icon"><AppIcon name="profile" /></span>
          <span className="sidebar-label">Profile</span>
        </NavLink>
      </nav>

      {/* Toggle Button at Bottom */}
      <button
        className="sidebar-toggle-btn"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar collapse"
        title={isOpen ? "Collapse" : "Expand"}
      >
        <span className="toggle-icon">{isOpen ? "≪" : "»"}</span>
      </button>
    </div>
  );
}

export default Sidebar;
