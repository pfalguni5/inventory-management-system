import api from "./api";

const BUSINESS_ID = 1;

export const getAllPurchaseInvoices = () => 
    api.get("/purchases", {
        headers: {"X-Business-Id": BUSINESS_ID}
    });

export const getPurchaseInvoiceById = (id) =>
    api.get(`/purchases/${id}`, {
        headers: {"X-Business-Id": BUSINESS_ID}
    });

export const createPurchaseInvoice = (data) =>
    api.post("/purchases", data, {
        headers: {"X-Business-Id": BUSINESS_ID}
    });

export const updatePurchaseInvoice = (id, data) =>
    api.put(`/purchases/${id}`, data, {
        headers: {"X-Business-Id": BUSINESS_ID}
    });

export const deletePurchaseInvoice = (id) =>
    api.delete(`/purchases/${id}`, {
        headers: {"X-Business-Id": BUSINESS_ID}
    });

