import React, { useEffect, useMemo, useRef, useState } from 'react';
import messageService from '../services/messageService';
import { Search, Send, Plus, Smile, Paperclip, Users, MessageCircle, CheckCheck, Check, Loader2, X } from 'lucide-react';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState('direct');
  const [conversationTitle, setConversationTitle] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchInitialData = async () => {
    try {
      setLoadingConversations(true);

      const [conversationsData, contactsData] = await Promise.all([
        messageService.getConversations(),
        messageService.getAvailableContacts(),
      ]);

      setConversations(conversationsData);
      setContacts(contactsData);

      if (conversationsData.length > 0) {
        handleSelectConversation(conversationsData[0]);
      }
    } catch (error) {
      console.error('Erreur chargement messagerie:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const handleSelectConversation = async (conversation) => {
    try {
      setSelectedConversation(conversation);
      setLoadingMessages(true);

      const data = await messageService.getConversationMessages(conversation.id);
      setMessages(data);

      await messageService.markConversationAsRead(conversation.id);

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversation.id ? { ...conv, unread_count: 0 } : conv
        )
      );
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    const content = messageInput.trim();
    if (!content || !selectedConversation || sending) return;

    try {
      setSending(true);
      const newMessage = await messageService.sendMessage(selectedConversation.id, content);

      setMessages((prev) => [...prev, newMessage]);
      setMessageInput('');

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id
            ? {
                ...conv,
                last_message: newMessage.content,
                last_message_time: newMessage.created_at,
              }
            : conv
        )
      );
    } catch (error) {
      console.error('Erreur envoi message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleCreateConversation = async (e) => {
    e.preventDefault();

    if (selectedParticipants.length === 0) return;
    if (createType === 'group' && !conversationTitle.trim()) return;

    try {
      const payload = {
        type: createType,
        title: createType === 'group' ? conversationTitle.trim() : '',
        participant_ids: selectedParticipants,
      };

      const newConversation = await messageService.createConversation(payload);

      setConversations((prev) => [newConversation, ...prev]);
      setIsCreateModalOpen(false);
      setCreateType('direct');
      setConversationTitle('');
      setSelectedParticipants([]);
      await handleSelectConversation(newConversation);
    } catch (error) {
      console.error('Erreur création conversation:', error);
    }
  };

  const filteredConversations = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return conversations;

    return conversations.filter((conv) => {
      const title = (conv.display_name || '').toLowerCase();
      const preview = (conv.last_message || '').toLowerCase();
      return title.includes(q) || preview.includes(q);
    });
  }, [conversations, searchTerm]);

  const toggleParticipant = (id) => {
    setSelectedParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatConversationTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    const now = new Date();

    const sameDay = date.toDateString() === now.toDateString();
    if (sameDay) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  const formatMessageTime = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getConversationInitials = (name) => {
    if (!name) return 'MS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="h-full min-h-0 flex bg-[#0B0B0F] text-white overflow-hidden">
      {/* LISTE CONVERSATIONS */}
      <section className="w-full md:w-[380px] lg:w-[420px] border-r border-white/5 bg-[#131317] flex flex-col shrink-0">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight">Messagerie</h1>
              <p className="text-xs text-gray-400 uppercase tracking-widest">Coach & Athlètes</p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-11 h-11 rounded-xl bg-[#FF6A00] hover:bg-orange-600 transition-colors flex items-center justify-center shadow-lg shadow-[#FF6A00]/20"
              title="Nouvelle conversation"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1E1E1E] border border-[#2D2D2D] rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-[#FF6A00] transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loadingConversations ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="animate-spin text-[#FF6A00]" size={28} />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <MessageCircle className="text-gray-600 mb-4" size={42} />
              <p className="text-gray-400 font-medium">Aucune conversation trouvée</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = selectedConversation?.id === conv.id;

              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-[#1E1E1E] border-[#FF6A00]/40'
                      : 'bg-transparent border-transparent hover:bg-[#1A1A1E]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF9E00] flex items-center justify-center text-white font-bold text-sm">
                        {conv.is_group ? <Users size={18} /> : getConversationInitials(conv.display_name)}
                      </div>
                      {!conv.is_group && conv.is_online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#131317]"></span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <h3 className="font-bold truncate">{conv.display_name}</h3>
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold shrink-0">
                          {formatConversationTime(conv.last_message_time)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-gray-400 truncate">
                          {conv.last_message || 'Aucun message'}
                        </p>

                        {conv.unread_count > 0 && (
                          <span className="w-5 h-5 rounded-full bg-[#FF6A00] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* FENÊTRE DE CHAT */}
      <section className="hidden md:flex flex-1 flex-col min-w-0 bg-[#0B0B0F]">
        {!selectedConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <MessageCircle className="text-gray-700 mb-4" size={56} />
            <h2 className="text-xl font-bold text-white">Sélectionnez une conversation</h2>
            <p className="text-gray-500 mt-2">Choisissez un chat pour afficher les messages.</p>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <header className="h-20 border-b border-white/5 px-6 flex items-center justify-between shrink-0 bg-[#0B0B0F]">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF9E00] flex items-center justify-center text-white font-bold shrink-0">
                  {selectedConversation.is_group ? (
                    <Users size={18} />
                  ) : (
                    getConversationInitials(selectedConversation.display_name)
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="font-black text-lg truncate">{selectedConversation.display_name}</h2>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">
                    {selectedConversation.is_group
                      ? 'Conversation de groupe'
                      : selectedConversation.subtitle || 'Conversation directe'}
                  </p>
                </div>
              </div>
            </header>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              {loadingMessages ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="animate-spin text-[#FF6A00]" size={30} />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <MessageCircle className="text-gray-700 mb-4" size={44} />
                  <p className="text-gray-400 font-medium">Aucun message pour le moment</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.is_own_message;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[78%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                        {!isOwn && (
                          <span className="text-[11px] text-gray-500 mb-1 font-bold">
                            {msg.sender_name}
                          </span>
                        )}

                        <div
                          className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                            isOwn
                              ? 'bg-[#FF6A00] text-white rounded-br-md'
                              : 'bg-[#1E1E1E] text-white rounded-bl-md border border-[#2D2D2D]'
                          }`}
                        >
                          {msg.content}
                        </div>

                        <div className="flex items-center gap-1 mt-2 px-1">
                          <span className="text-[10px] text-gray-500 font-bold">
                            {formatMessageTime(msg.created_at)}
                          </span>

                          {isOwn && (
                            <>
                              {msg.is_read ? (
                                <CheckCheck size={14} className="text-[#FF6A00]" />
                              ) : (
                                <Check size={14} className="text-gray-500" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              <div ref={messagesEndRef}></div>
            </div>

            {/* INPUT */}
            <div className="p-5 border-t border-white/5 bg-[#0B0B0F] shrink-0">
              <div className="flex items-end gap-3">
                <div className="flex-1 bg-[#1E1E1E] border border-[#2D2D2D] rounded-2xl px-3 py-2 flex items-end gap-2">
                  <button
                    type="button"
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-[#2D2D2D] transition-colors"
                  >
                    <Paperclip size={18} />
                  </button>

                  <textarea
                    rows={1}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Tapez votre message..."
                    className="flex-1 bg-transparent border-none outline-none resize-none text-white placeholder-gray-500 py-2 max-h-32"
                  />

                  <button
                    type="button"
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-[#2D2D2D] transition-colors"
                  >
                    <Smile size={18} />
                  </button>
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sending}
                  className="w-14 h-14 rounded-2xl bg-[#FF6A00] hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-lg shadow-[#FF6A00]/20 transition-all"
                >
                  {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* MODAL CREATION */}
      <div
        className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${
          isCreateModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsCreateModalOpen(false)}
        ></div>

        <div className="relative bg-[#16161A] border border-[#2D2D2D] rounded-3xl shadow-2xl w-full max-w-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white">Nouvelle conversation</h2>
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={22} />
            </button>
          </div>

          <form onSubmit={handleCreateConversation} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Type
              </label>
              <select
                value={createType}
                onChange={(e) => setCreateType(e.target.value)}
                className="w-full bg-[#0B0B0F] border border-[#2D2D2D] rounded-xl px-4 py-3 text-white outline-none focus:border-[#FF6A00]"
              >
                <option value="direct">Conversation directe</option>
                <option value="group">Conversation de groupe</option>
              </select>
            </div>

            {createType === 'group' && (
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Titre du groupe
                </label>
                <input
                  type="text"
                  value={conversationTitle}
                  onChange={(e) => setConversationTitle(e.target.value)}
                  placeholder="Ex: Groupe cardio lundi"
                  className="w-full bg-[#0B0B0F] border border-[#2D2D2D] rounded-xl px-4 py-3 text-white outline-none focus:border-[#FF6A00]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Participants
              </label>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {contacts.map((contact) => {
                  const checked = selectedParticipants.includes(contact.id);

                  return (
                    <button
                      type="button"
                      key={contact.id}
                      onClick={() => toggleParticipant(contact.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        checked
                          ? 'border-[#FF6A00] bg-[#FF6A00]/10'
                          : 'border-[#2D2D2D] bg-[#0B0B0F] hover:border-[#3D3D3D]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF9E00] flex items-center justify-center text-white font-bold text-sm">
                          {getConversationInitials(contact.name)}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-white">{contact.name}</p>
                          <p className="text-xs text-gray-400 uppercase tracking-wider">
                            {contact.role_label}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center ${
                          checked
                            ? 'bg-[#FF6A00] border-[#FF6A00]'
                            : 'border-gray-500'
                        }`}
                      >
                        {checked && <Check size={14} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF6A00] hover:bg-orange-600 text-white font-black py-4 rounded-2xl transition-colors disabled:opacity-50"
              disabled={
                selectedParticipants.length === 0 ||
                (createType === 'group' && !conversationTitle.trim())
              }
            >
              Créer la conversation
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Messages;