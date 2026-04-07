import api from "./api";

// ======================================
// GET ALL STOCK
// ======================================
export const getAllStock = async () => {
  try {
    const response = await api.get("/stock");
    return response.data;
  } catch (error) {
    console.error("Error fetching all stock:", error);
    throw error;
  }
};

// ======================================
// GET STOCK BY ITEM ID
// ======================================
export const getStockByItem = async (itemId) => {
  try {
    const response = await api.get(`/stock/${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching stock for item ${itemId}:`, error);
    throw error;
  }
};

// ======================================
// GET LOW STOCK ITEMS
// ======================================
export const getLowStockItems = async () => {
  try {
    const response = await api.get("/stock/low-stock");
    return response.data;
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    throw error;
  }
};

// ======================================
// ADJUST STOCK (CREATE / UPDATE)
// ======================================
export const adjustStock = async (payload) => {
  try {
    const response = await api.post("/stock/adjust", payload);
    return response.data;
  } catch (error) {
    console.error("Error adjusting stock:", error);
    throw error;
  }
};

// ======================================
// GET STOCK MOVEMENTS
// ======================================
export const getStockMovements = async (itemId) => {
  try {
    const response = await api.get(`/stock/${itemId}/movements`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching movements for item ${itemId}:`, error);
    throw error;
  }
};

