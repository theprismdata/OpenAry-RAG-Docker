import axios from '../utils/axios';

export const api = {
  // Auth APIs
  login: (credentials) => axios.post('/login', credentials),
  
  // Chat APIs
  sendMessage: (data) => axios.post('/chatapi/rqa/', data),
  getSessionList: (email) => axios.post('/chatapi/getsessionlist', { email }),
  
  // 기타 API 엔드포인트들을 여기에 추가
};

export default api;