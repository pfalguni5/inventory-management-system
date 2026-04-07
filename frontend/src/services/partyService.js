import api from "./api";

export const getAllParties = () => api.get("/parties");

export const getPartyById = (id) => api.get(`/parties/${id}`);

export const createParty = (partyData) => api.post("/parties", partyData);

export const updateParty = (id, partyData) => api.put(`/parties/${id}`, partyData);

export const patchParty = (id, partyData) => api.patch(`/parties/${id}`, partyData);

export const deleteParty = (id) => api.delete(`/parties/${id}`);