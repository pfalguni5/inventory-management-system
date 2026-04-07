// Shared dummy data for E-Way Bills
// This allows both list and detail pages to access and update the same data

const initialEWayBills = [
  {
    id: 1,
    ewayBillNumber: "EWB-123456789",
    invoiceNumber: "SAL-2026-0203-001",
    invoiceDate: "2026-02-24",
    totalValue: 25000,
    customerName: "ABC Traders",
    modeOfTransport: "Road",
    distance: 150,
    generatedAt: "2026-02-24T10:00:00Z",
    validUntil: "2026-02-26T23:59:59Z",
    status: "Active",
    fromGSTIN: "27AABCU9603R1Z5",
    fromBusiness: "My Business",
    fromState: "Maharashtra",
    toGSTIN: "18AABCS1234H1Z0",
    toParty: "XYZ Enterprise",
    toState: "Karnataka",
    transporterID: "",
    transporterName: "Self",
    transportDocNo: "LR-001",
    transportDocDate: "2026-02-24",
    vehicleNumber: "MH12AB1234",
    cancelReason: null,
  },
  {
    id: 2,
    ewayBillNumber: "EWB-987654321",
    invoiceNumber: "SAL-2026-0202-023",
    invoiceDate: "2026-02-20",
    totalValue: 150000,
    customerName: "Global Imports",
    modeOfTransport: "Rail",
    distance: 500,
    generatedAt: "2026-02-20T14:30:00Z",
    validUntil: "2026-02-25T14:30:00Z",
    status: "Expired",
    fromGSTIN: "27AABCU9603R1Z5",
    fromBusiness: "My Business",
    fromState: "Maharashtra",
    toGSTIN: "12ABCDE1234F1Z7",
    toParty: "Rail Logistics",
    toState: "Tamil Nadu",
    transporterID: "RLY001",
    transporterName: "Indian Railways",
    transportDocNo: "RLR-2026-001",
    transportDocDate: "2026-02-20",
    vehicleNumber: "",
    cancelReason: null,
  },
  {
    id: 3,
    ewayBillNumber: "EWB-456789123",
    invoiceNumber: "SAL-2026-0202-045",
    invoiceDate: "2026-02-22",
    totalValue: 75000,
    customerName: "Tech Solutions",
    modeOfTransport: "Road",
    distance: 250,
    generatedAt: "2026-02-22T09:00:00Z",
    validUntil: "2026-02-28T09:00:00Z",
    status: "Active",
    fromGSTIN: "27AABCU9603R1Z5",
    fromBusiness: "My Business",
    fromState: "Maharashtra",
    toGSTIN: "29AABCS1234H1Z5",
    toParty: "Metro Supplies",
    toState: "Delhi",
    transporterID: "",
    transporterName: "Self",
    transportDocNo: "LR-002",
    transportDocDate: "2026-02-22",
    vehicleNumber: "KA04AB5678",
    cancelReason: null,
  },
  {
    id: 4,
    ewayBillNumber: "EWB-321654987",
    invoiceNumber: "SAL-2026-0201-067",
    invoiceDate: "2026-02-15",
    totalValue: 45000,
    customerName: "Air Freight Co",
    modeOfTransport: "Air",
    distance: 1200,
    generatedAt: "2026-02-15T11:00:00Z",
    validUntil: "2026-02-18T11:00:00Z",
    status: "Cancelled",
    fromGSTIN: "27AABCU9603R1Z5",
    fromBusiness: "My Business",
    fromState: "Maharashtra",
    toGSTIN: "33AABCS1234H1Z2",
    toParty: "Express Cargo",
    toState: "Karnataka",
    transporterID: "AI001",
    transporterName: "Air India",
    transportDocNo: "AWB-2026-5001",
    transportDocDate: "2026-02-15",
    vehicleNumber: "AI-BOM-2501",
    cancelReason: "Order cancelled by customer",
  },
  {
    id: 5,
    ewayBillNumber: "EWB-654321789",
    invoiceNumber: "SAL-2026-0203-089",
    invoiceDate: "2026-02-23",
    totalValue: 200000,
    customerName: "Maritime Traders",
    modeOfTransport: "Ship",
    distance: 2500,
    generatedAt: "2026-02-23T16:00:00Z",
    validUntil: "2026-03-05T16:00:00Z",
    status: "Active",
    fromGSTIN: "27AABCU9603R1Z5",
    fromBusiness: "My Business",
    fromState: "Maharashtra",
    toGSTIN: "06AABCS1234H1Z9",
    toParty: "Port Authority",
    toState: "Gujarat",
    transporterID: "SHIP001",
    transporterName: "Shipping Corp",
    transportDocNo: "BL-2026-123",
    transportDocDate: "2026-02-23",
    vehicleNumber: "SHIP-MAHE-001",
    cancelReason: null,
  },
];

// Store for managing e-way bills (can be replaced with context/Redux later)
class EWayBillStore {
  constructor() {
    this.bills = initialEWayBills;
    this.listeners = [];
  }

  getAllBills() {
    return this.bills;
  }

  getBillById(id) {
    return this.bills.find((bill) => bill.id === parseInt(id));
  }

  updateBill(id, updatedData) {
    const index = this.bills.findIndex((bill) => bill.id === parseInt(id));
    if (index !== -1) {
      this.bills[index] = { ...this.bills[index], ...updatedData };
      this.notifyListeners();
      return this.bills[index];
    }
    return null;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }
}

export const ewayBillStore = new EWayBillStore();
export default initialEWayBills;
