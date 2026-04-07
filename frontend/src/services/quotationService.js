import api from './api';

export const getAllQuotations = () => api.get('/quotations');

export const getQuotationById = (id) => api.get(`/quotations/${id}`);

export const createQuotation = (quotationData) => api.post('/quotations', quotationData);

export const deleteQuotation = (id) => api.delete(`/quotations/${id}`);

export const convertQuotationToInvoice = (id) => api.post(`/quotations/${id}/convert`);

export const updateQuotationStatus = (id, status) => {
    api.patch(`/quotations/${id}/status`, { status });
}