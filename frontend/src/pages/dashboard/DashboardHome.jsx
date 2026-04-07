import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardHome.css";

/**
 * Dashboard (UI-first)
 * - Uses dummy data for activities + chart
 * - KPIs are computed from dummy dataset (easy to replace with API later)
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("month"); // today | week | month
  const [activityTab, setActivityTab] = useState("recent"); // recent | pending

  // Dummy “monthly summary” data (6 months)
  const monthlyData = useMemo(
    () => [
      { month: "Sep", sales: 124000, purchases: 82000 },
      { month: "Oct", sales: 98000, purchases: 76000 },
      { month: "Nov", sales: 156000, purchases: 93000 },
      { month: "Dec", sales: 143500, purchases: 101000 },
      { month: "Jan", sales: 169000, purchases: 112000 },
      { month: "Feb", sales: 135700, purchases: 90500 },
    ],
    []
  );

  // Dummy KPI values (you can replace with API data later)
  const kpi = useMemo(() => {
    // Example: compute "this month" from last entry
    const last = monthlyData[monthlyData.length - 1];
    const lowStockItems = 3;
    const gstCollected = Math.round(last.sales * 0.18 * 0.35); // demo logic

    if (period === "today") {
      return {
        sales: 2400,
        purchases: 1200,
        lowStock: 1,
        gst: 180,
        label: "Today",
      };
    }
    if (period === "week") {
      return {
        sales: 35600,
        purchases: 21400,
        lowStock: 2,
        gst: 2200,
        label: "This Week",
      };
    }
    return {
      sales: last.sales,
      purchases: last.purchases,
      lowStock: lowStockItems,
      gst: gstCollected,
      label: "This Month",
    };
  }, [monthlyData, period]);

  const quickActions = useMemo(
    () => [
      { label: "Create Sales Invoice", desc: "Generate a new invoice", to: "/app/sales" },
      { label: "Add Purchase Entry", desc: "Record supplier purchase", to: "/app/purchase" },
      { label: "Add Item", desc: "Create product/service", to: "/app/items" },
      { label: "Add Party", desc: "Add customer/supplier", to: "/app/parties" },
      { label: "View Reports", desc: "Export PDF/Excel reports", to: "/app/reports" },
    ],
    []
  );

  const recentActivities = useMemo(
    () => [
      {
        type: "item",
        title: `Item "Jeans" added`,
        meta: "By John Doe",
        time: "06/02/2026 03:50 PM",
      },
      {
        type: "party",
        title: `Party "XYZ Stores" added`,
        meta: "By John Doe",
        time: "06/02/2026 03:35 PM",
      },
      {
        type: "sale",
        title: `Invoice SI-006 created`,
        meta: "Customer: ABC Traders",
        time: "06/02/2026 02:10 PM",
      },
      {
        type: "purchase",
        title: `Purchase PI-003 recorded`,
        meta: "Supplier: Om Distributors",
        time: "06/02/2026 01:25 PM",
      },
      {
        type: "stock",
        title: `Stock adjusted for "Sugar"`,
        meta: "Reason: damaged goods",
        time: "05/02/2026 06:05 PM",
      },
      {
        type: "report",
        title: `Sales Summary exported`,
        meta: "PDF",
        time: "05/02/2026 04:18 PM",
      },
    ],
    []
  );

  const pendingActions = useMemo(
    () => [
      {
        type: "warning",
        title: "3 items are low in stock",
        meta: "Review stock report and reorder",
        actionLabel: "Open Stock",
        onAction: () => navigate("/app/stock"),
      },
      {
        type: "info",
        title: "Opening stock not updated for new items",
        meta: "Add opening stock to keep inventory accurate",
        actionLabel: "Opening Stock",
        onAction: () => navigate("/app/stock/opening"),
      },
      {
        type: "info",
        title: "Generate this month's reports",
        meta: "Sales/Purchase summaries are ready to export",
        actionLabel: "Open Reports",
        onAction: () => navigate("/app/reports"),
      },
    ],
    [navigate]
  );

  return (
    <div className="dash">
      {/* Header */}
      <div className="dashHeader">
        <div>
          <h1 className="dashTitle">Dashboard</h1>
          <p className="dashSubTitle">Quick overview of your business activity</p>
        </div>

        <div className="dashControls">
          <label className="dashSelectLabel">
            Period
            <select
              className="dashSelect"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </label>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpiRow">
        <KpiCard title={`${kpi.label} Sales`} value={formatINR(kpi.sales)} hint="Total sales amount" />
        <KpiCard
          title={`${kpi.label} Purchases`}
          value={formatINR(kpi.purchases)}
          hint="Total purchases amount"
        />
        <KpiCard title="Low Stock Items" value={String(kpi.lowStock)} hint="Items below threshold" />
        <KpiCard title={`${kpi.label} GST`} value={formatINR(kpi.gst)} hint="Estimated GST collected" />
      </div>

      {/* Middle Row */}
      <div className="dashGrid2">
        {/* Monthly chart */}
        <div className="card">
          <div className="cardHeader">
            <div>
              <h3 className="cardTitle">Monthly Summary</h3>
              <p className="cardSubtitle">Sales vs Purchases (last 6 months)</p>
            </div>
            <button className="btnLink" onClick={() => navigate("/app/reports")}>
              View reports
            </button>
          </div>

          <MiniBarChart data={monthlyData} />
        </div>

        {/* Quick actions */}
        <div className="card">
          <div className="cardHeader">
            <div>
              <h3 className="cardTitle">Quick Actions</h3>
              <p className="cardSubtitle">Common tasks to get things done</p>
            </div>
          </div>

          <div className="quickActions">
            {quickActions.map((a) => (
              <button
                key={a.label}
                className="quickAction"
                onClick={() => navigate(a.to)}
                type="button"
              >
                <div className="quickActionTitle">{a.label}</div>
                <div className="quickActionDesc">{a.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activities */}
      <div className="card">
        <div className="cardHeader">
          <div>
            <h3 className="cardTitle">Activity</h3>
            <p className="cardSubtitle">Recent updates and pending actions</p>
          </div>

          <div className="tabs">
            <button
              className={`tab ${activityTab === "recent" ? "active" : ""}`}
              onClick={() => setActivityTab("recent")}
              type="button"
            >
              Recent Activities
            </button>
            <button
              className={`tab ${activityTab === "pending" ? "active" : ""}`}
              onClick={() => setActivityTab("pending")}
              type="button"
            >
              Pending Actions
            </button>
          </div>
        </div>

        <div className="cardBody">
          <div className={`activityContent ${activityTab}`} key={activityTab}>
            {activityTab === "recent" ? (
              <Timeline items={recentActivities} />
            ) : (
              <PendingList items={pendingActions} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, hint }) {
  return (
    <div className="kpiCard">
      <div className="kpiTitle">{title}</div>
      <div className="kpiValue">{value}</div>
      <div className="kpiHint">{hint}</div>
    </div>
  );
}

function MiniBarChart({ data }) {
  const max = useMemo(() => Math.max(...data.flatMap((d) => [d.sales, d.purchases])), [data]);

  return (
    <div className="miniChart">
      {data.map((d) => {
        const salesPct = Math.round((d.sales / max) * 100);
        const purchasePct = Math.round((d.purchases / max) * 100);

        return (
          <div key={d.month} className="miniChartCol">
            <div className="miniChartBars">
              <div className="bar barPurch" style={{ height: `${purchasePct}%` }} title={`Purchases: ₹${d.purchases}`} />
              <div className="bar barSales" style={{ height: `${salesPct}%` }} title={`Sales: ₹${d.sales}`} />
            </div>
            <div className="miniChartLabel">{d.month}</div>
          </div>
        );
      })}

      <div className="miniChartLegend">
        <span className="legendItem">
          <span className="legendDot purch" /> Purchases
        </span>
        <span className="legendItem">
          <span className="legendDot sales" /> Sales
        </span>
      </div>
    </div>
  );
}

function Timeline({ items }) {
  return (
    <div className="timeline">
      {items.map((it, idx) => (
        <div key={`${it.title}-${idx}`} className="timelineItem">
          <div className={`timelineIcon ${iconClass(it.type)}`} aria-hidden="true" />
          <div className="timelineContent">
            <div className="timelineTitle">
              {it.title} <span className="timelineMeta">{it.meta}</span>
            </div>
            <div className="timelineTime">{it.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PendingList({ items }) {
  return (
    <div className="pendingList">
      {items.map((it, idx) => (
        <div key={`${it.title}-${idx}`} className="pendingItem">
          <div className={`pendingBadge ${it.type}`}>{it.type === "warning" ? "!" : "i"}</div>
          <div className="pendingContent">
            <div className="pendingTitle">{it.title}</div>
            <div className="pendingMeta">{it.meta}</div>
          </div>
          {it.actionLabel ? (
            <button className="btnSmall" onClick={it.onAction} type="button">
              {it.actionLabel}
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function iconClass(type) {
  switch (type) {
    case "item":
      return "tItem";
    case "party":
      return "tParty";
    case "sale":
      return "tSale";
    case "purchase":
      return "tPurchase";
    case "stock":
      return "tStock";
    case "report":
      return "tReport";
    default:
      return "tDefault";
  }
}

function formatINR(n) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₹ ${n}`;
  }
}