import { useState } from "react";
import AppIcon from "../../components/common/AppIcon";
import "../../styles/gstr9-report.css";

function ProfitLossReport() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showReport, setShowReport] = useState(false);

  // Sample data for Profit & Loss Statement
  const profitLossData = {
    period: "01 Jan 2024 - 31 Dec 2024",
    income: {
      totalSalesInvoices: 48,
      grossSalesValue: 7500000,
      salesReturnValue: 250000,
      netSalesRevenue: 7250000,
    },
    cogs: {
      openingStock: 500000,
      purchases: 3500000,
      purchaseReturn: 100000,
      closingStock: 600000,
      cogs: 3300000,
    },
    grossProfit: {
      amount: 3950000,
      percentageOfSales: 54.48,
    },
    operatingExpenses: {
      salaries: 300000,
      rentAndUtilities: 150000,
      depreciation: 50000,
      officeExpenses: 100000,
      totalOperatingExpenses: 600000,
    },
    ebitda: {
      amount: 3350000,
      percentageOfSales: 46.21,
    },
    otherIncomeExpense: {
      interestIncome: 25000,
      interestExpense: 100000,
      otherIncome: 50000,
      otherExpense: 25000,
      netOtherExpense: 50000,
    },
    netProfit: {
      amount: 3300000,
      percentageOfSales: 45.52,
    },
  };

  const handleExportExcel = () => {
    alert("Excel export functionality will be implemented");
  };

  const handleExportPDF = () => {
    alert("PDF export functionality will be implemented");
  };

  const handleShareToCA = () => {
    alert("Share to CA functionality will be implemented");
  };

  return (
    <div className="gstr9-container">
      {/* HEADER */}
      <div className="gstr9-header">
        <div>
          <h1 className="gstr9-title">Profit & Loss Report</h1>
          <p className="gstr9-subtitle">Income statement and profitability analysis</p>
        </div>
        <div className="gstr9-badge"><AppIcon name="chartLine" /> Financial Report</div>
      </div>

      {/* FILTER SECTION */}
      <div className="gstr9-filter-card">
        <div className="filter-header">
          <h2 className="filter-title"><AppIcon name="search" /> Filter Data</h2>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">From Date *</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">To Date *</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-actions">
            <button className="btn-primary">Apply Filter</button>
            <button className="btn-secondary">Reset</button>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="gstr9-actions">
        <button className="btn-view-report" onClick={() => setShowReport(!showReport)}>
          {showReport ? "Hide Report" : "View Report"}
        </button>
        <button className="btn-export" onClick={handleExportExcel}>
          <AppIcon name="exportExcel" /> Export Excel
        </button>
        <button className="btn-export" onClick={handleExportPDF}>
          <AppIcon name="exportPdf" /> Export PDF
        </button>
        <button className="btn-export" onClick={handleShareToCA}>
          <AppIcon name="share" /> Share to CA
        </button>
      </div>

      {/* REPORT VIEW */}
      {showReport && (
        <div className="gstr9-report-view">
          <div className="report-header">
            <h1 className="report-title">Profit & Loss Statement</h1>
            <p className="report-date">Period: {profitLossData.period} | Generated on: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
          </div>

          {/* SUMMARY CARDS */}
          <div className="gstr9-summary-cards">
            <div className="summary-card-item">
              <span className="card-label">Net Sales Revenue</span>
              <span className="card-value">₹{profitLossData.income.netSalesRevenue.toLocaleString()}</span>
            </div>
            <div className="summary-card-item">
              <span className="card-label">Gross Profit</span>
              <span className="card-value">₹{profitLossData.grossProfit.amount.toLocaleString()}</span>
            </div>
            <div className="summary-card-item">
              <span className="card-label">Net Profit</span>
              <span className="card-value">₹{profitLossData.netProfit.amount.toLocaleString()}</span>
            </div>
            <div className="summary-card-item">
              <span className="card-label">Net Profit Margin</span>
              <span className="card-value">{profitLossData.netProfit.percentageOfSales.toFixed(2)}%</span>
            </div>
          </div>

          {/* PROFIT & LOSS STATEMENT */}
          <div className="tab-content">
            {/* INCOME SECTION */}
            <div className="report-section">
              <h3 className="section-title">Income (Sales)</h3>
              <div className="table-responsive">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="data-row">
                      <td className="label">Total Sales Invoices</td>
                      <td className="value">{profitLossData.income.totalSalesInvoices}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">Gross Sales Value</td>
                      <td className="value">₹{profitLossData.income.grossSalesValue.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">Sales Return / Discount</td>
                      <td className="value">-₹{profitLossData.income.salesReturnValue.toLocaleString()}</td>
                    </tr>
                    <tr className="highlight-row">
                      <td className="label">Net Sales Revenue</td>
                      <td className="value">₹{profitLossData.income.netSalesRevenue.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* COST OF GOODS SOLD SECTION */}
            <div className="report-section">
              <h3 className="section-title">Cost of Goods Sold (COGS)</h3>
              <div className="table-responsive">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="data-row">
                      <td className="label">Opening Stock</td>
                      <td className="value">₹{profitLossData.cogs.openingStock.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">Add: Purchases</td>
                      <td className="value">₹{profitLossData.cogs.purchases.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">Less: Purchase Return</td>
                      <td className="value">-₹{profitLossData.cogs.purchaseReturn.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">Less: Closing Stock</td>
                      <td className="value">-₹{profitLossData.cogs.closingStock.toLocaleString()}</td>
                    </tr>
                    <tr className="highlight-row">
                      <td className="label">Cost of Goods Sold</td>
                      <td className="value">₹{profitLossData.cogs.cogs.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* GROSS PROFIT SECTION */}
            <div className="report-section highlight-section">
              <h3 className="section-title">Gross Profit</h3>
              <div className="table-responsive">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="data-row">
                      <td className="label">Net Sales Revenue</td>
                      <td className="value">₹{profitLossData.income.netSalesRevenue.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">Less: Cost of Goods Sold</td>
                      <td className="value">-₹{profitLossData.cogs.cogs.toLocaleString()}</td>
                    </tr>
                    <tr className="highlight-row">
                      <td className="label">Gross Profit</td>
                      <td className="value">₹{profitLossData.grossProfit.amount.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">Gross Profit %</td>
                      <td className="value">{profitLossData.grossProfit.percentageOfSales.toFixed(2)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* OPERATING EXPENSES SECTION */}
            <div className="report-section">
              <h3 className="section-title">Operating Expenses</h3>
              <div className="table-responsive">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="data-row">
                      <td className="label">Salaries & Wages</td>
                      <td className="value">₹{profitLossData.operatingExpenses.salaries.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">Rent & Utilities</td>
                      <td className="value">₹{profitLossData.operatingExpenses.rentAndUtilities.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">Depreciation</td>
                      <td className="value">₹{profitLossData.operatingExpenses.depreciation.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">Office Expenses</td>
                      <td className="value">₹{profitLossData.operatingExpenses.officeExpenses.toLocaleString()}</td>
                    </tr>
                    <tr className="highlight-row">
                      <td className="label">Total Operating Expenses</td>
                      <td className="value">₹{profitLossData.operatingExpenses.totalOperatingExpenses.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* EBITDA SECTION */}
            <div className="report-section">
              <h3 className="section-title">EBITDA (Earnings Before Interest, Tax, Depreciation & Amortization)</h3>
              <div className="table-responsive">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="data-row">
                      <td className="label">Gross Profit</td>
                      <td className="value">₹{profitLossData.grossProfit.amount.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">Less: Operating Expenses</td>
                      <td className="value">-₹{profitLossData.operatingExpenses.totalOperatingExpenses.toLocaleString()}</td>
                    </tr>
                    <tr className="highlight-row">
                      <td className="label">EBITDA</td>
                      <td className="value">₹{profitLossData.ebitda.amount.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">EBITDA %</td>
                      <td className="value">{profitLossData.ebitda.percentageOfSales.toFixed(2)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* OTHER INCOME & EXPENSE SECTION */}
            <div className="report-section">
              <h3 className="section-title">Other Income & Expense</h3>
              <div className="table-responsive">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="data-row">
                      <td className="label">Interest Income</td>
                      <td className="value">₹{profitLossData.otherIncomeExpense.interestIncome.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">Interest Expense</td>
                      <td className="value">-₹{profitLossData.otherIncomeExpense.interestExpense.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">Other Income</td>
                      <td className="value">₹{profitLossData.otherIncomeExpense.otherIncome.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">Other Expense</td>
                      <td className="value">-₹{profitLossData.otherIncomeExpense.otherExpense.toLocaleString()}</td>
                    </tr>
                    <tr className="highlight-row">
                      <td className="label">Net Other Expense</td>
                      <td className="value">-₹{profitLossData.otherIncomeExpense.netOtherExpense.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* NET PROFIT SECTION */}
            <div className="report-section highlight-section">
              <h3 className="section-title">Net Profit</h3>
              <div className="table-responsive">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="data-row">
                      <td className="label">EBITDA</td>
                      <td className="value">₹{profitLossData.ebitda.amount.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">Less: Other Expense (Net)</td>
                      <td className="value">-₹{profitLossData.otherIncomeExpense.netOtherExpense.toLocaleString()}</td>
                    </tr>
                    <tr className="highlight-row">
                      <td className="label">Net Profit (Before Tax)</td>
                      <td className="value">₹{profitLossData.netProfit.amount.toLocaleString()}</td>
                    </tr>
                    <tr className="data-row">
                      <td className="label">Net Profit %</td>
                      <td className="value">{profitLossData.netProfit.percentageOfSales.toFixed(2)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfitLossReport;
