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

  sendMessage: async (conversationId, payload) => {
    const formData = new FormData();

    formData.append('content', payload.content || '');

    if (payload.files && payload.files.length > 0) {
      payload.files.forEach((item) => {
        // IMPORTANT : on envoie le vrai File
        if (item?.file instanceof File) {
          formData.append('files', item.file);
        }
      });
    }

    const response = await api.post(
      `/messages/conversations/${conversationId}/messages/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

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

  getConversationDetails: async (conversationId) => {
    const response = await api.get(`/messages/conversations/${conversationId}/`);
    return response.data;
  },

  renameConversation: async (conversationId, title) => {
    const response = await api.patch(`/messages/conversations/${conversationId}/`, { title });
    return response.data;
  },

  deleteConversation: async (conversationId) => {
    const response = await api.delete(`/messages/conversations/${conversationId}/`);
    return response.data;
  },

  removeConversationMember: async (conversationId, userId) => {
    const response = await api.delete(`/messages/conversations/${conversationId}/members/${userId}/`);
    return response.data;
  },

  addConversationMembers: async (conversationId, participantIds) => {
    const response = await api.post(`/messages/conversations/${conversationId}/members/`, {
      participant_ids: participantIds,
    });
    return response.data;
  },
};

export default messageService;