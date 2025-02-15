// src/services/chatService.js
import axios from '../utils/axios_chatapi';

export const sendMessage = async (messageData, token) => {
  console.log(messageData)
  const response = await axios.post('/rqa', messageData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getSessionList = async (email, token) => {
  const response = await axios.post('/getsessionlist', { email }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};