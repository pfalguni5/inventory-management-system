import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useState } from "react";
import "../../styles/layout.css";

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="app-container">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="app-content" style={{ marginLeft: sidebarOpen ? "250px" : "80px" }}>
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default AppLayout;
