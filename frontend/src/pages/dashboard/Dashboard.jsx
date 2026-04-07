import { Link, Outlet } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import "../../styles/layout.css";

function Dashboard() {
  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <div className="sidebar">
          <ul>
            <li><Link to="sales">Sales</Link></li>
            <li><Link to="purchase">Purchase</Link></li>
            <li><Link to="items">Items</Link></li>
            <li><Link to="parties">Parties</Link></li>
            <li><Link to="stock">Stock</Link></li>
            <li><Link to="reports">Reports</Link></li>
            <li><Link to="ewaybill">E-Way Bill</Link></li>
            <li><Link to="settings">Settings</Link></li>
          </ul>
        </div>

        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default Dashboard;
