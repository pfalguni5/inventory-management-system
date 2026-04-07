import api from './api';

//BUSINESS
export const getBusiness = () => api.get('/business');
export const updateBusiness = (data) => api.put('/business', data);

//SUBSCRIPTION
export const getSubscription = () => api.get('/subscription');
export const createSubscription = (data) => api.post('/subscription', data);

//BILLING
export const saveBillingDetails = (data) => api.post('/billing', data);
export const getBillingDetails = () => api.get('/billing');