// src/services/chatService.js
import axios from '../utils/axios_chatapi';

export const sendMessage = async (messageData, token) => {
  const response = await axios.post('/rqa', messageData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getSessionList = async (email, token) => {
  try {
    console.log('Sending getSessionList request with:', {
      email,
      token: token ? 'Token exists' : 'No token',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const response = await axios.post('/getsessionlist', { email }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error('getSessionList error:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers
    });
    throw error;
  }
};

