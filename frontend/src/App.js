import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoutes";
import AppLayout from "./components/layout/AppLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import SalesInvoice from "./pages/transactions/SalesInvoice";
import SalesDetail from "./pages/transactions/SalesDetail";
import PurchaseEntry from "./pages/transactions/PurchaseEntry";
import PurchaseDetail from "./pages/transactions/PurchaseDetail";
import Settings from "./pages/settings/Settings";
import SalesList from "./pages/transactions/SalesList";
import PurchaseList from "./pages/transactions/PurchaseList";
import ItemsList from "./pages/masters/items/ItemsList";
import ItemForm from "./pages/masters/items/ItemForm";
import ItemDetail from "./pages/masters/items/ItemDetail";
import BusinessSetup from "./pages/business/BusinessSetup";
import PartiesList from "./pages/masters/parties/PartiesList";
import PartyForm from "./pages/masters/parties/PartyForm";
import PartyDetail from "./pages/masters/parties/PartyDetail";
import StockOverview from "./pages/stock/StockOverview";
import OpeningStock from "./pages/stock/OpeningStock";
import StockAdjustment from "./pages/stock/StockAdjustment";
import EWayBillForm from "./pages/ewaybill/EWayBillForm";
import EWayBillList from "./pages/ewaybill/EWayBillList";
// eslint-disable-next-line no-unused-vars
import EWayBillDetail from "./pages/ewaybill/EWayBillDetail";
import ReportsHome from "./pages/reports/ReportsHome";
import SalesSummaryReport from "./pages/reports/SalesSummaryreport";
import PurchaseSummaryReport from "./pages/reports/PurchaseSummaryReport";
import StockReport from "./pages/reports/StockReport";
import ProfitLossReport from "./pages/reports/ProfitLossReport";
import GSTR1Report from "./pages/reports/GSTR1Report";
import GSTR3BReport from "./pages/reports/GSTR3BReport";
import GSTR2BReport from "./pages/reports/GSTR2BReport";
import Gstr9Report from "./pages/reports/Gstr9Report";
import Gstr9cReport from "./pages/reports/Gstr9cReport";
import Profile from "./pages/Profile/Profile";
import QuotationList from "./pages/transactions/quotations/QuotationList";
import CreateQuotation from "./pages/transactions/quotations/CreateQuotation";
import QuotationView from "./pages/transactions/quotations/QuotationView";
import PricingPage from "./pages/settings/PricingPage";
import CheckoutPage from "./pages/settings/CheckoutPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN (NO NAVBAR, NO SIDEBAR) */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* APP AFTER LOGIN */}
        <Route path="/business-setup" element={<BusinessSetup />} />

        {/* Dashboard */}
        <Route path="/app" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardHome />} />

          <Route path="sales" element={<SalesList />} />
          <Route path="sales/new" element={<SalesInvoice />} />
          <Route path="sales/:id" element={<SalesDetail />} />
          <Route path="sales/edit/:id" element={<SalesInvoice />} />
          
          {/* Quotations */}
          <Route path="sales/quotations" element={<QuotationList />} />
          <Route path="sales/quotations/new" element={<CreateQuotation />} />
          <Route path="sales/quotations/:id" element={<QuotationView />} />
          
          {/* Invoices - Redirect to main sales list */}
          <Route path="sales/invoices" element={<SalesList />} />

          <Route path="purchase" element={<PurchaseList />} />
          <Route path="purchase/new" element={<PurchaseEntry />} />
          <Route path="purchase/:id" element={<PurchaseDetail />} />
          <Route path="purchase/edit/:id" element={<PurchaseEntry />} />

          <Route path="items" element={<ItemsList />} />
          <Route path="items/new" element={<ItemForm />} />
          <Route path="items/:id" element={<ItemDetail />} />
          <Route path="items/edit/:id" element={<ItemForm />} />

          <Route path="parties" element={<PartiesList />} />
          <Route path="parties/new" element={<PartyForm />} />
          <Route path="parties/:id" element={<PartyDetail />} />
          <Route path="parties/edit/:id" element={<PartyForm />} />

          <Route path="stock" element={<StockOverview />} />
          <Route path="stock/opening" element={<OpeningStock />} />
          <Route path="stock/adjustment" element={<StockAdjustment />} />

          <Route path="reports" element={<ReportsHome />} />
          <Route path="reports/sales-summary" element={<SalesSummaryReport />} />
          <Route path="reports/purchase-summary" element={<PurchaseSummaryReport />} />
          <Route path="reports/stock-report" element={<StockReport />} />
          <Route path="reports/profit-loss" element={<ProfitLossReport />} />
          <Route path="reports/gstr1" element={<GSTR1Report />} />
          <Route path="reports/gstr3b" element={<GSTR3BReport />} />
          <Route path="reports/gstr2a" element={<GSTR2BReport />} />
          <Route path="reports/gstr-9" element={<Gstr9Report />} />
          <Route path="reports/gstr-9c" element={<Gstr9cReport />} />

          <Route path="e-way-bills" element={<EWayBillList />} />
          <Route path="e-way-bills/new" element={<EWayBillForm />} />
          <Route path="e-way-bills/:id" element={<EWayBillDetail />} />

          <Route path="settings" element={<Settings />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="profile" element={<Profile />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;

