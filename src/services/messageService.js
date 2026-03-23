import api from './api';

const messageService = {
  getConversations: async () => {
    const response = await api.get('/messages/conversations/');
    return response.data;
  },

  getConversationMessages: async (conversationId) => {
    const response = await api.get(`/messages/conversations/${conversationId}/messages/`);
    return response.data;
  },

  sendMessage: async (conversationId, content) => {
    const response = await api.post(`/messages/conversations/${conversationId}/messages/`, {
      content,
    });
    return response.data;
  },

  createConversation: async (payload) => {
    const response = await api.post('/messages/conversations/', payload);
    return response.data;
  },

  markConversationAsRead: async (conversationId) => {
    const response = await api.post(`/messages/conversations/${conversationId}/read/`);
    return response.data;
  },

  getAvailableContacts: async () => {
    const response = await api.get('/messages/contacts/');
    return response.data;
  },
};

export default messageService;