import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import messageService from '../services/messageService';
import {
  Search,
  Send,
  Plus,
  Smile,
  Paperclip,
  Users,
  MessageCircle,
  CheckCheck,
  Check,
  Loader2,
  X,
  MoreVertical,
  Trash2,
  UserMinus,
  Info,
  Image as ImageIcon,
  FileText,
  Pencil,
  UserPlus,
} from 'lucide-react';

const EMOJIS = ['😀', '😂', '😊', '😍', '🔥', '💪', '👏', '🎯', '✅', '🚀', '❤️', '🙌'];

const Messages = () => {
  const location = useLocation();
  const isAthleteSpace = location.pathname.startsWith('/athlete/');

  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationDetails, setConversationDetails] = useState(null);
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

  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showConversationMenu, setShowConversationMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [renamingTitle, setRenamingTitle] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
  const [selectedMembersToAdd, setSelectedMembersToAdd] = useState([]);
  const [addingMembers, setAddingMembers] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const theme = isAthleteSpace
    ? {
        page: 'bg-[#121212] text-white',
        leftPanel: 'bg-[#1E1E1E] border-[#2D2D2D]',
        rightPanel: 'bg-[#121212]',
        card: 'bg-[#1E1E1E] border-[#2D2D2D]',
        cardAlt: 'bg-[#2D2D2D]',
        textSoft: 'text-gray-400',
        textMuted: 'text-gray-500',
        input: 'bg-[#2D2D2D] border-[#3D3D3D] text-white placeholder-gray-500',
        headerBorder: 'border-[#2D2D2D]',
        activeConv: 'bg-[#2A2A2E] border-[#FF6B00]/40',
        hoverConv: 'hover:bg-[#25252A]',
        sentBubble: 'bg-[#FF6B00] text-white',
        receivedBubble: 'bg-[#1E1E1E] border border-[#2D2D2D] text-white',
        panel: 'bg-[#1E1E1E] border-[#2D2D2D]',
        secondaryBtn: 'bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white',
      }
    : {
        page: 'bg-[#0B0B0E] text-[#FCF8FE]',
        leftPanel: 'bg-[#131317] border-[#2A2A32]',
        rightPanel: 'bg-[#0B0B0E]',
        card: 'bg-[#131317] border-[#2A2A32]',
        cardAlt: 'bg-[#1F1F25]',
        textSoft: 'text-[#ACAAB0]',
        textMuted: 'text-[#ACAAB0]',
        input: 'bg-[#1F1F25] border-[#2A2A32] text-[#FCF8FE] placeholder-[#ACAAB0]',
        headerBorder: 'border-[#2A2A32]',
        activeConv: 'bg-[#FF6A00]/10 border-[#FF6A00]/40',
        hoverConv: 'hover:bg-[#1F1F25]',
        sentBubble: 'bg-[#FF6A00] text-white',
        receivedBubble: 'bg-[#131317] border border-[#2A2A32] text-[#FCF8FE]',
        panel: 'bg-[#131317] border-[#2A2A32]',
        secondaryBtn: 'bg-[#1F1F25] hover:bg-[#2A2A32] text-[#FCF8FE]',
      };

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
      setShowConversationMenu(false);
      setIsInfoPanelOpen(false);
      setSelectedFiles([]);
      setShowEmojiPicker(false);
      setSelectedMembersToAdd([]);

      const [messagesData, detailsData] = await Promise.all([
        messageService.getConversationMessages(conversation.id),
        safeGetConversationDetails(conversation.id, conversation),
      ]);

      setMessages(messagesData);
      setConversationDetails(detailsData);
      setRenamingTitle(detailsData?.display_name || conversation.display_name || '');

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversation.id
            ? {
                ...conv,
                can_manage_group:
                  typeof detailsData?.can_manage_group === 'boolean'
                    ? detailsData.can_manage_group
                    : conv.can_manage_group,
              }
            : conv
        )
      );

      await messageService.markConversationAsRead(conversation.id);

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversation.id ? { ...conv, unread_count: 0 } : conv
        )
      );
    } catch (error) {
      console.error('Erreur chargement conversation:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const safeGetConversationDetails = async (conversationId, fallbackConversation) => {
    try {
      return await messageService.getConversationDetails(conversationId);
    } catch (error) {
      return {
        ...fallbackConversation,
        members: fallbackConversation.members || [],
        can_manage_group: fallbackConversation.can_manage_group || false,
      };
    }
  };

  const refreshConversationDetails = async (conversationId) => {
    if (!conversationId) return;
    try {
      const details = await messageService.getConversationDetails(conversationId);
      setConversationDetails(details);
      setSelectedConversation((prev) =>
        prev ? { ...prev, display_name: details.display_name, can_manage_group: details.can_manage_group } : prev
      );
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                display_name: details.display_name,
                can_manage_group: details.can_manage_group,
              }
            : conv
        )
      );
    } catch (error) {
      console.error('Erreur refresh détails conversation:', error);
    }
  };

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && selectedFiles.length === 0) || !selectedConversation || sending) {
      return;
    }

    try {
      setSending(true);

      const response = await messageService.sendMessage(selectedConversation.id, {
        content: messageInput.trim(),
        files: selectedFiles,
      });

      const newMessages = Array.isArray(response) ? response : [response];
      setMessages((prev) => [...prev, ...newMessages]);
      setMessageInput('');
      setSelectedFiles([]);

      const latest = newMessages[newMessages.length - 1];

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id
            ? {
                ...conv,
                last_message: latest.content || (latest.attachments?.length ? 'Pièce jointe' : ''),
                last_message_time: latest.created_at,
              }
            : conv
        )
      );
    } catch (error) {
      console.error('Erreur envoi message:', error);
      alert("Erreur lors de l'envoi du message.");
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
      alert(error?.response?.data?.detail || "Erreur lors de la création de la conversation.");
    }
  };

  const handleRenameConversation = async () => {
    if (!selectedConversation || !renamingTitle.trim()) return;

    try {
      const updated = await messageService.renameConversation(
        selectedConversation.id,
        renamingTitle.trim()
      );

      setSelectedConversation((prev) =>
        prev ? { ...prev, display_name: updated.display_name || renamingTitle.trim() } : prev
      );

      setConversationDetails((prev) =>
        prev
          ? {
              ...prev,
              display_name: updated.display_name || renamingTitle.trim(),
              title: renamingTitle.trim(),
            }
          : prev
      );

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id
            ? {
                ...conv,
                display_name: updated.display_name || renamingTitle.trim(),
                title: renamingTitle.trim(),
              }
            : conv
        )
      );

      setIsRenaming(false);
    } catch (error) {
      console.error('Erreur renommage conversation:', error);
      alert(error?.response?.data?.detail || "Impossible de renommer la conversation.");
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedConversation) return;

    const confirmed = window.confirm('Supprimer cette conversation ?');
    if (!confirmed) return;

    try {
      await messageService.deleteConversation(selectedConversation.id);

      const updatedConversations = conversations.filter(
        (conv) => conv.id !== selectedConversation.id
      );

      setConversations(updatedConversations);
      setSelectedConversation(null);
      setConversationDetails(null);
      setMessages([]);
      setIsInfoPanelOpen(false);
      setShowConversationMenu(false);

      if (updatedConversations.length > 0) {
        await handleSelectConversation(updatedConversations[0]);
      }
    } catch (error) {
      console.error('Erreur suppression conversation:', error);
      alert(error?.response?.data?.detail || "Impossible de supprimer la conversation.");
    }
  };

  const handleRemoveMember = async (member) => {
    if (!selectedConversation) return;

    const confirmed = window.confirm(`Retirer ${member.name} du groupe ?`);
    if (!confirmed) return;

    try {
      await messageService.removeConversationMember(selectedConversation.id, member.id);

      setConversationDetails((prev) =>
        prev
          ? {
              ...prev,
              members: (prev.members || []).filter((m) => m.id !== member.id),
            }
          : prev
      );
    } catch (error) {
      console.error('Erreur retrait membre:', error);
      alert(error?.response?.data?.detail || "Impossible de retirer ce membre.");
    }
  };

  const handleAddMembers = async () => {
    if (!selectedConversation || selectedMembersToAdd.length === 0) return;

    try {
      setAddingMembers(true);

      const updated = await messageService.addConversationMembers(
        selectedConversation.id,
        selectedMembersToAdd
      );

      setConversationDetails(updated);
      setSelectedConversation((prev) =>
        prev ? { ...prev, display_name: updated.display_name, can_manage_group: updated.can_manage_group } : prev
      );
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id
            ? {
                ...conv,
                display_name: updated.display_name,
                can_manage_group: updated.can_manage_group,
              }
            : conv
        )
      );

      setSelectedMembersToAdd([]);
      setIsAddMembersModalOpen(false);
    } catch (error) {
      console.error('Erreur ajout membres:', error);
      alert(error?.response?.data?.detail || "Impossible d'ajouter ces membres.");
    } finally {
      setAddingMembers(false);
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

  const availableMembersToAdd = useMemo(() => {
    if (!selectedConversation?.is_group) return [];
    const existingIds = new Set((conversationDetails?.members || []).map((m) => m.id));
    return contacts.filter((contact) => !existingIds.has(contact.id));
  }, [contacts, conversationDetails, selectedConversation]);

  const toggleParticipant = (id) => {
    setSelectedParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleMemberToAdd = (id) => {
    setSelectedMembersToAdd((prev) =>
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

    if (date.toDateString() === now.toDateString()) {
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

  const getInitials = (name) => {
    if (!name) return 'MS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleFilesSelected = (event) => {
    const files = Array.from(event.target.files || []);
    const mapped = files.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));

    setSelectedFiles((prev) => [...prev, ...mapped]);
    event.target.value = '';
  };

  const removeSelectedFile = (fileId) => {
    setSelectedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove?.preview) URL.revokeObjectURL(fileToRemove.preview);
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const appendEmoji = (emoji) => {
    setMessageInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const renderAttachmentPreview = (attachment) => {
    if (attachment.preview) {
      return (
        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
          <img src={attachment.preview} alt={attachment.name} className="w-full h-full object-cover" />
        </div>
      );
    }

    return (
      <div className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center text-center p-2 ${theme.cardAlt}`}>
        {attachment.type?.startsWith('image/') ? <ImageIcon size={18} /> : <FileText size={18} />}
        <span className="text-[10px] mt-1 line-clamp-2">{attachment.name}</span>
      </div>
    );
  };

  return (
    <div className={`h-full min-h-0 flex overflow-hidden rounded-2xl border ${theme.headerBorder} ${theme.page}`}>
      {/* COLONNE GAUCHE */}
      <section className={`w-full md:w-[360px] lg:w-[390px] border-r ${theme.leftPanel} flex flex-col shrink-0`}>
        <div className={`p-5 border-b ${theme.headerBorder}`}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight">Messagerie</h1>
              <p className={`text-xs uppercase tracking-widest font-bold ${theme.textMuted}`}>
                Conversations
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-11 h-11 rounded-xl bg-[#FF6A00] hover:bg-orange-600 transition-colors flex items-center justify-center shadow-lg shadow-[#FF6A00]/20 text-white"
              title="Nouvelle conversation"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textMuted}`} size={18} />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full border rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-[#FF6A00] transition-colors ${theme.input}`}
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
              <MessageCircle className={theme.textMuted} size={42} />
              <p className={`font-medium mt-4 ${theme.textSoft}`}>Aucune conversation trouvée</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = selectedConversation?.id === conv.id;

              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    isActive ? theme.activeConv : `border-transparent ${theme.hoverConv}`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF9E00] flex items-center justify-center text-white font-bold text-sm">
                        {conv.is_group ? <Users size={18} /> : getInitials(conv.display_name)}
                      </div>

                      {!conv.is_group && conv.is_online && (
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 ${isAthleteSpace ? 'border-[#1E1E1E]' : 'border-white'}`}></span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <h3 className="font-bold truncate">{conv.display_name}</h3>
                        <span className={`text-[10px] uppercase tracking-wider font-bold shrink-0 ${theme.textMuted}`}>
                          {formatConversationTime(conv.last_message_time)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${theme.textSoft}`}>
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

      {/* COLONNE CENTRE */}
      <section className={`hidden md:flex flex-1 flex-col min-w-0 ${theme.rightPanel}`}>
        {!selectedConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <MessageCircle className={theme.textMuted} size={56} />
            <h2 className="text-xl font-bold mt-4">Sélectionnez une conversation</h2>
            <p className={`mt-2 ${theme.textSoft}`}>Choisissez un chat pour afficher les messages.</p>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <header className={`h-20 border-b ${theme.headerBorder} px-6 flex items-center justify-between shrink-0 ${theme.card}`}>
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF9E00] flex items-center justify-center text-white font-bold shrink-0">
                  {selectedConversation.is_group ? <Users size={18} /> : getInitials(selectedConversation.display_name)}
                </div>

                <div className="min-w-0">
                  <h2 className="font-black text-lg truncate">
                    {conversationDetails?.display_name || selectedConversation.display_name}
                  </h2>
                  <p className={`text-xs uppercase tracking-widest font-bold ${theme.textMuted}`}>
                    {selectedConversation.is_group
                      ? `${conversationDetails?.members?.length || 0} membres`
                      : conversationDetails?.subtitle || selectedConversation.subtitle || 'Conversation directe'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 relative">
                <button
                  onClick={() => setIsInfoPanelOpen((prev) => !prev)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${theme.secondaryBtn}`}
                  title="Infos conversation"
                >
                  <Info size={18} />
                </button>

                <button
                  onClick={() => setShowConversationMenu((prev) => !prev)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${theme.secondaryBtn}`}
                  title="Actions"
                >
                  <MoreVertical size={18} />
                </button>

                {showConversationMenu && (
                  <div className={`absolute top-12 right-0 w-56 rounded-2xl border shadow-2xl z-20 overflow-hidden ${theme.panel}`}>
                    <button
                      onClick={() => {
                        setIsInfoPanelOpen(true);
                        setShowConversationMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm ${theme.hoverConv}`}
                    >
                      <Info size={16} />
                      Détails de la conversation
                    </button>

                    {selectedConversation.is_group && selectedConversation.can_manage_group && (
                      <>
                        <button
                          onClick={() => {
                            setIsRenaming(true);
                            setIsInfoPanelOpen(true);
                            setShowConversationMenu(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm ${theme.hoverConv}`}
                        >
                          <Pencil size={16} />
                          Renommer le groupe
                        </button>

                        <button
                          onClick={() => {
                            setSelectedMembersToAdd([]);
                            setIsAddMembersModalOpen(true);
                            setShowConversationMenu(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm ${theme.hoverConv}`}
                        >
                          <UserPlus size={16} />
                          Ajouter des membres
                        </button>
                      </>
                    )}

                    <button
                      onClick={handleDeleteConversation}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                      Supprimer la conversation
                    </button>
                  </div>
                )}
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
                  <MessageCircle className={theme.textMuted} size={44} />
                  <p className={`font-medium mt-4 ${theme.textSoft}`}>Aucun message pour le moment</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.is_own_message;

                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[78%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                        {!isOwn && (
                          <span className={`text-[11px] mb-1 font-bold ${theme.textMuted}`}>
                            {msg.sender_name}
                          </span>
                        )}

                        <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${isOwn ? `${theme.sentBubble} rounded-br-md` : `${theme.receivedBubble} rounded-bl-md`}`}>
                          {msg.content ? <p>{msg.content}</p> : null}

                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className={`grid grid-cols-1 gap-3 ${msg.content ? 'mt-3' : ''}`}>
                              {msg.attachments.map((attachment) => (
                                <a
                                  key={attachment.id}
                                  href={attachment.file_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`rounded-xl p-3 border flex items-center gap-3 ${isOwn ? 'bg-white/10 border-white/20' : isAthleteSpace ? 'bg-[#2D2D2D] border-[#3D3D3D]' : 'bg-slate-50 border-slate-200'}`}
                                >
                                  {attachment.is_image ? (
                                    <img
                                      src={attachment.file_url}
                                      alt={attachment.file_name}
                                      className="w-14 h-14 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isOwn ? 'bg-white/10' : theme.cardAlt}`}>
                                      <FileText size={18} />
                                    </div>
                                  )}

                                  <div className="min-w-0">
                                    <p className="font-semibold truncate">{attachment.file_name}</p>
                                    <p className={`text-xs ${isOwn ? 'text-white/70' : theme.textMuted}`}>
                                      Pièce jointe
                                    </p>
                                  </div>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 mt-2 px-1">
                          <span className={`text-[10px] font-bold ${theme.textMuted}`}>
                            {formatMessageTime(msg.created_at)}
                          </span>

                          {isOwn && (
                            <>
                              {msg.is_read ? (
                                <CheckCheck size={14} className="text-[#FF6A00]" />
                              ) : (
                                <Check size={14} className={theme.textMuted} />
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

            {/* PREVIEW FICHIERS */}
            {selectedFiles.length > 0 && (
              <div className={`px-5 pt-4 border-t ${theme.headerBorder}`}>
                <div className="flex flex-wrap gap-3">
                  {selectedFiles.map((file) => (
                    <div key={file.id} className="relative">
                      {renderAttachmentPreview(file)}
                      <button
                        onClick={() => removeSelectedFile(file.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INPUT */}
            <div className={`p-5 border-t ${theme.headerBorder} ${theme.card} shrink-0`}>
              {showEmojiPicker && (
                <div className={`mb-4 rounded-2xl border p-3 ${theme.panel}`}>
                  <div className="flex flex-wrap gap-2">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => appendEmoji(emoji)}
                        className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center ${theme.secondaryBtn}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-end gap-3">
                <div className={`flex-1 border rounded-2xl px-3 py-2 flex items-end gap-2 ${theme.input}`}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${theme.secondaryBtn}`}
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
                    className="flex-1 bg-transparent border-none outline-none resize-none py-2 max-h-32"
                  />

                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${theme.secondaryBtn}`}
                  >
                    <Smile size={18} />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    hidden
                    onChange={handleFilesSelected}
                    accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls"
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={(!messageInput.trim() && selectedFiles.length === 0) || sending}
                  className="w-14 h-14 rounded-2xl bg-[#FF6A00] hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-lg shadow-[#FF6A00]/20 transition-all"
                >
                  {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* PANNEAU INFOS */}
      {selectedConversation && isInfoPanelOpen && (
        <aside className={`hidden lg:flex w-[340px] border-l ${theme.headerBorder} ${theme.panel} flex-col shrink-0`}>
          <div className={`p-5 border-b ${theme.headerBorder} flex items-center justify-between`}>
            <div>
              <h3 className="text-lg font-black">Détails</h3>
              <p className={`text-xs uppercase tracking-widest font-bold ${theme.textMuted}`}>
                Conversation
              </p>
            </div>

            <button
              onClick={() => setIsInfoPanelOpen(false)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme.secondaryBtn}`}
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF9E00] flex items-center justify-center text-white font-bold text-2xl mb-3">
                {selectedConversation.is_group ? <Users size={28} /> : getInitials(conversationDetails?.display_name || selectedConversation.display_name)}
              </div>

              {isRenaming && selectedConversation.is_group && selectedConversation.can_manage_group ? (
                <div className="w-full space-y-3">
                  <input
                    type="text"
                    value={renamingTitle}
                    onChange={(e) => setRenamingTitle(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 outline-none focus:border-[#FF6A00] ${theme.input}`}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsRenaming(false)}
                      className={`flex-1 py-2.5 rounded-xl font-bold ${theme.secondaryBtn}`}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleRenameConversation}
                      className="flex-1 py-2.5 rounded-xl font-bold bg-[#FF6A00] text-white hover:bg-orange-600"
                    >
                      Sauvegarder
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h4 className="font-black text-lg">{conversationDetails?.display_name || selectedConversation.display_name}</h4>
                  <p className={`text-sm ${theme.textSoft}`}>
                    {selectedConversation.is_group ? 'Conversation de groupe' : 'Conversation directe'}
                  </p>
                </>
              )}
            </div>

            {selectedConversation.is_group && selectedConversation.can_manage_group && !isRenaming && (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSelectedMembersToAdd([]);
                    setIsAddMembersModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#FF6A00] text-white hover:bg-orange-600 font-bold"
                >
                  <UserPlus size={16} />
                  Ajouter des membres
                </button>
              </div>
            )}

            {selectedConversation.is_group && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-bold">Membres</h5>
                  <span className={`text-xs font-bold ${theme.textMuted}`}>
                    {conversationDetails?.members?.length || 0}
                  </span>
                </div>

                <div className="space-y-2">
                  {(conversationDetails?.members || []).map((member) => (
                    <div
                      key={member.id}
                      className={`rounded-2xl border p-3 flex items-center justify-between ${theme.card}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF9E00] flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {getInitials(member.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{member.name}</p>
                          <p className={`text-xs uppercase tracking-wider ${theme.textMuted}`}>
                            {member.role_label}
                          </p>
                        </div>
                      </div>

                      {selectedConversation.can_manage_group && !member.is_current_user && (
                        <button
                          onClick={() => handleRemoveMember(member)}
                          className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                          title="Retirer du groupe"
                        >
                          <UserMinus size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleDeleteConversation}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/15 font-bold"
              >
                <Trash2 size={16} />
                Supprimer la conversation
              </button>
            </div>
          </div>
        </aside>
      )}

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

        <div className={`relative rounded-3xl shadow-2xl w-full max-w-xl p-8 border ${theme.panel}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black">Nouvelle conversation</h2>
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className={`transition-colors ${theme.textMuted}`}
            >
              <X size={22} />
            </button>
          </div>

          <form onSubmit={handleCreateConversation} className="space-y-5">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${theme.textMuted}`}>
                Type
              </label>
              <select
                value={createType}
                onChange={(e) => setCreateType(e.target.value)}
                className={`w-full border rounded-xl px-4 py-3 outline-none focus:border-[#FF6A00] ${theme.input}`}
              >
                <option value="direct">Conversation directe</option>
                <option value="group">Conversation de groupe</option>
              </select>
            </div>

            {createType === 'group' && (
              <div>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${theme.textMuted}`}>
                  Titre du groupe
                </label>
                <input
                  type="text"
                  value={conversationTitle}
                  onChange={(e) => setConversationTitle(e.target.value)}
                  placeholder="Ex: Groupe cardio lundi"
                  className={`w-full border rounded-xl px-4 py-3 outline-none focus:border-[#FF6A00] ${theme.input}`}
                />
              </div>
            )}

            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${theme.textMuted}`}>
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
                        checked ? 'border-[#FF6A00] bg-[#FF6A00]/10' : `${theme.card}`
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF9E00] flex items-center justify-center text-white font-bold text-sm">
                          {getInitials(contact.name)}
                        </div>
                        <div className="text-left">
                          <p className="font-bold">{contact.name}</p>
                          <p className={`text-xs uppercase tracking-wider ${theme.textMuted}`}>
                            {contact.role_label}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center ${
                          checked ? 'bg-[#FF6A00] border-[#FF6A00]' : 'border-gray-400'
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

      {/* MODAL AJOUT MEMBRES */}
      <div
        className={`fixed inset-0 z-[210] flex items-center justify-center p-4 transition-all duration-300 ${
          isAddMembersModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsAddMembersModalOpen(false)}
        ></div>

        <div className={`relative rounded-3xl shadow-2xl w-full max-w-xl p-8 border ${theme.panel}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black">Ajouter des membres</h2>
              <p className={`text-sm mt-1 ${theme.textSoft}`}>
                {conversationDetails?.display_name || selectedConversation?.display_name}
              </p>
            </div>

            <button
              onClick={() => setIsAddMembersModalOpen(false)}
              className={`transition-colors ${theme.textMuted}`}
            >
              <X size={22} />
            </button>
          </div>

          {availableMembersToAdd.length === 0 ? (
            <div className={`rounded-2xl border p-6 text-center ${theme.card}`}>
              <p className={`font-medium ${theme.textSoft}`}>Aucun membre supplémentaire disponible.</p>
            </div>
          ) : (
            <>
              <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                {availableMembersToAdd.map((contact) => {
                  const checked = selectedMembersToAdd.includes(contact.id);

                  return (
                    <button
                      type="button"
                      key={contact.id}
                      onClick={() => toggleMemberToAdd(contact.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        checked ? 'border-[#FF6A00] bg-[#FF6A00]/10' : `${theme.card}`
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF9E00] flex items-center justify-center text-white font-bold text-sm">
                          {getInitials(contact.name)}
                        </div>
                        <div className="text-left">
                          <p className="font-bold">{contact.name}</p>
                          <p className={`text-xs uppercase tracking-wider ${theme.textMuted}`}>
                            {contact.role_label}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center ${
                          checked ? 'bg-[#FF6A00] border-[#FF6A00]' : 'border-gray-400'
                        }`}
                      >
                        {checked && <Check size={14} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddMembersModalOpen(false)}
                  className={`flex-1 py-3 rounded-2xl font-bold ${theme.secondaryBtn}`}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleAddMembers}
                  disabled={selectedMembersToAdd.length === 0 || addingMembers}
                  className="flex-1 py-3 rounded-2xl font-bold bg-[#FF6A00] text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {addingMembers ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;