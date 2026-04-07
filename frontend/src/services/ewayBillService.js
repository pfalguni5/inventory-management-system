import api from './api';

export const createEWayBill = (data) => 
    api.post(`/eway-bills`, data);

export const getAllEWayBills = (page = 0, size = 50) =>
    api.get(`/eway-bills?page=${page}&size=${size}`);

export const getEWayBillById = (id) => 
    api.get(`/eway-bills/${id}`);

export const updateEWayBill = (id, data) =>
    api.put(`/eway-bills/${id}`, data);

export const deleteEWayBill = (id) =>
    api.delete(`/eway-bills/${id}`);

export const updateVehicle = (id, data) =>
    api.patch(`/eway-bills/${id}/vehicle`, data);

export const extendValidity = (id, data) =>
    api.patch(`/eway-bills/${id}/extend-validity`, data);

export const cancelEWayBill = (id) =>
    api.patch(`/eway-bills/${id}/cancel`);