// Font Awesome Icon Mappings
// Centralized icon definitions for the entire application

import {
  faGauge,
  faDatabase,
  faBoxOpen,
  faUsers,
  faRightLeft,
  faFileInvoiceDollar,
  faCartShopping,
  faWarehouse,
  faBoxesStacked,
  faSliders,
  faChartColumn,
  faFileLines,
  faTruck,
  faGear,
  faPlus,
  faArrowLeft,
  faDownload,
  faFilePdf,
  faFileExcel,
  faFilter,
  faMagnifyingGlass,
  faBell,
  faUser,
  faPenToSquare,
  faCheck,
  faXmark,
  faBuilding,
  faClipboardList,
  faBox,
  faBullseye,
  faTriangleExclamation,
  faCircleCheck,
  faCircleXmark,
  faNoteSticky,
  faFileExport,
  faFileImport,
  faMoneyBillWave,
  faIndianRupeeSign,
  faReceipt,
  faChartLine,
  faTable,
  faChartPie,
  faBars,
  faArrowRight,
  faSave,
  faArrowUp,
  faArrowDown,
  faHardDrive,
  faFileInvoice,
  faAngleRight,
  faChevronDown,
  faLocationDot,
  faCar,
  faRightFromBracket,
  faGrip,
  faList,
  faTrain,
  faPlane,
  faShip,
  faTrash,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

// Icon name to Font Awesome icon mapping
export const ICONS = {
  // Navigation / Sidebar
  dashboard: faGauge,
  masters: faDatabase,
  items: faBoxOpen,
  parties: faUsers,
  transactions: faRightLeft,
  sales: faFileInvoiceDollar,
  purchase: faCartShopping,
  stock: faWarehouse,
  openingStock: faBoxesStacked,
  stockAdjustment: faSliders,
  reports: faChartColumn,
  gstReport: faFileLines,
  ewaybill: faTruck,
  settings: faGear,
  
  // Actions
  add: faPlus,
  back: faArrowLeft,
  edit: faPenToSquare,
  delete: faTrash,
  trash: faTrash,
  save: faSave,
  check: faCheck,
  close: faXmark,
  cancel: faXmark,
  search: faMagnifyingGlass,
  filter: faFilter,
  
  // Export / Import
  download: faDownload,
  exportPdf: faFilePdf,
  exportExcel: faFileExcel,
  export: faFileExport,
  import: faFileImport,
  
  // UI Elements
  notification: faBell,
  user: faUser,
  profile: faUser,
  menu: faBars,
  arrowRight: faArrowRight,
  arrowUp: faArrowUp,
  arrowDown: faArrowDown,
  angleRight: faAngleRight,
  chevronDown: faChevronDown,
  
  // Business
  business: faBuilding,
  clipboard: faClipboardList,
  box: faBox,
  package: faBox,
  warehouse: faWarehouse,
  inventory: faBoxesStacked,
  target: faBullseye,
  subscription: faBullseye,
  
  // Status
  warning: faTriangleExclamation,
  success: faCircleCheck,
  checkCircle: faCircleCheck,
  error: faCircleXmark,
  
  // Location & Transport
  address: faLocationDot,
  location: faLocationDot,
  vehicle: faCar,
  car: faCar,
  transport: faTruck,
  truck: faTruck,
  train: faTrain,
  plane: faPlane,
  airplane: faPlane,
  ship: faShip,
  
  // Auth
  logout: faRightFromBracket,
  
  // Password
  eye: faEye,
  eyeOff: faEyeSlash,
  
  // Reports & Documents
  notes: faNoteSticky,
  instructions: faNoteSticky,
  document: faFileLines,
  invoice: faFileInvoice,
  receipt: faReceipt,
  
  // Financial
  money: faMoneyBillWave,
  rupee: faIndianRupeeSign,
  currency: faIndianRupeeSign,
  
  // Charts
  chart: faChartColumn,
  chartLine: faChartLine,
  chartPie: faChartPie,
  table: faTable,
  
  // Layout Views
  grid: faGrip,
  list: faList,
  
  // Storage
  storage: faHardDrive,
};

export default ICONS;
