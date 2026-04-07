import api from "./api";

const BUSINESS_ID = 1; //temporary untill login/business context is added

export const getAllSalesInvoices = () =>
    api.get("/sales", {
        headers: {
            "X-Business-Id": BUSINESS_ID,
        },
    });

export const getSalesInvoiceById = (id) =>
    api.get(`/sales/${id}`, {
        headers: {
            "X-Business-Id": BUSINESS_ID,
        },  
    });

export const createSalesInvoice = (invoiceData) =>
    api.post("/sales", invoiceData, {
        headers: {
            "X-Business-Id": BUSINESS_ID,
        },
    });

export const updateSalesInvoice = (id, invoiceData) =>
    api.put(`/sales/${id}`, invoiceData, {
        headers: {
            "X-Business-Id": BUSINESS_ID,
        },
    });

export const deleteSalesInvoice = (id) =>
    api.delete(`/sales/${id}`, {
        headers: {
            "X-Business-Id": BUSINESS_ID,
        },
    });