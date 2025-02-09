// src/services/chatService.js
import axios from '../utils/axios';

export const sendMessage = async (messageData, token) => {
  const response = await axios.post('/chatapi/rqa/', messageData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getSessionList = async (email, token) => {
  const response = await axios.post('/chatapi/getsessionlist', { email }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};