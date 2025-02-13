import axios from '../utils/axios';

export const api = {
  // Auth APIs
  login: (credentials) => axios.post('/login', credentials),
  
  // Chat APIs
  // sendMessage: (data) => axios.post('/rqa/', data),    
};

export default api;