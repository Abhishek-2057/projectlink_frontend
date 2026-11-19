import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { formatTimeAgo } from '../../lib/utils';
import {
  MessageSquare,
  Send,
  Paperclip,
  Users,
  Search,
  CheckCheck,
  Shield,
  Layers,
  ArrowLeft,
} from 'lucide-react';

export function MessagesPage() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const teamIdParam = searchParams.get('teamId');

  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    initSocket,
    fetchConversations,
    setActiveConversation,
    sendMessage,
  } = useChatStore();

  const [messageText, setMessageText] = useState('');
  const [fileAttachment, setFileAttachment] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?._id) {
      initSocket(user._id);
      fetchConversations();
    }
  }, [user]);

  // If teamId query param is present, automatically select that team's conversation
  useEffect(() => {
    if (teamIdParam && conversations.length > 0) {
      const match = conversations.find((c) => c.teamId === teamIdParam);
      if (match && activeConversation?._id !== match._id) {
        setActiveConversation(match);
      }
    }
  }, [teamIdParam, conversations]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = messageText.trim();
    const fileToSend = fileAttachment;
    if ((!textToSend && !fileToSend) || isSending) return;

    setMessageText('');
    setFileAttachment(null);
    setIsSending(true);

    try {
      await sendMessage(textToSend, fileToSend || undefined);
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    const otherUser = c.participantUsers?.find((p) => p._id !== user?._id);
    return (
      c.title?.toLowerCase().includes(q) ||
      otherUser?.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-left">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex flex-col">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex-1 flex flex-col md:flex-row overflow-hidden min-h-[500px] sm:min-h-[600px] max-h-[82vh]">
          {/* Left Column: Conversation List */}
          <div className={`w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50 ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
            {/* Header & Search */}
            <div className="p-4 border-b border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-600" /> Messages
                </h2>
                <span className="text-[11px] font-semibold text-slate-500">
                  {conversations.length} Active
                </span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No active conversations found.
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive = activeConversation?._id === conv._id;
                  const isTeam = conv.type === 'team';
                  const otherUser = conv.participantUsers?.find((p) => p._id !== user?._id);
                  const title = isTeam
                    ? conv.title || 'Team Group'
                    : conv.type === 'project'
                    ? conv.title
                    : otherUser?.name || 'Direct Chat';

                  return (
                    <button
                      key={conv._id}
                      onClick={() => setActiveConversation(conv)}
                      className={`w-full p-4 flex items-start gap-3 text-left transition-colors cursor-pointer ${
                        isActive ? 'bg-emerald-50/80 border-r-2 border-emerald-600' : 'hover:bg-slate-100/60'
                      }`}
                    >
                      <Avatar
                        src={isTeam ? conv.avatar : otherUser?.avatar}
                        alt={title}
                        size="md"
                        fallback={isTeam ? 'T' : title?.[0]}
                      />
                      <div className="overflow-hidden flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <h4 className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                              {title}
                            </h4>
                            {isTeam && (
                              <Badge variant="emerald" className="text-[9px] px-1.5 py-0 font-bold shrink-0">
                                Team
                              </Badge>
                            )}
                            {conv.type === 'project' && (
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 shrink-0">
                                Project
                              </Badge>
                            )}
                          </div>
                          {conv.lastMessage?.createdAt && (
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {formatTimeAgo(conv.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 truncate">
                          {conv.lastMessage
                            ? `${conv.lastMessage.senderName}: ${conv.lastMessage.text}`
                            : isTeam
                            ? 'Team collaboration chat'
                            : 'Started conversation'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Chat Box */}
          <div className={`flex-1 flex flex-col bg-white ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
            {activeConversation ? (
              <>
                {/* Chat Top Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white z-10">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveConversation(null)}
                      className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                      title="Back to conversations"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <Avatar
                      src={activeConversation.type === 'team' ? activeConversation.avatar : undefined}
                      alt={activeConversation.title || 'Chat'}
                      size="sm"
                      fallback={activeConversation.type === 'team' ? 'T' : 'C'}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">
                          {activeConversation.type === 'team' || activeConversation.type === 'project'
                            ? activeConversation.title
                            : activeConversation.participantUsers?.find((p) => p._id !== user?._id)?.name || 'Direct Conversation'}
                        </h3>
                        {activeConversation.type === 'team' && (
                          <Badge variant="emerald" className="text-[10px] font-bold">
                            Team Group
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                        {activeConversation.type === 'team' ? (
                          <>
                            <Users className="h-3 w-3 text-emerald-600" />
                            <span>
                              {activeConversation.participantUsers?.length || activeConversation.participants?.length || 0} Members in Team
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                            Live Socket.IO Channel
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Team Member Avatars pill if team chat */}
                  {activeConversation.type === 'team' && activeConversation.participantUsers && (
                    <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {activeConversation.participantUsers.slice(0, 4).map((p: any) => (
                          <Avatar
                            key={p._id}
                            src={p.avatar}
                            alt={p.name}
                            size="sm"
                            className="inline-block ring-2 ring-white"
                          />
                        ))}
                      </div>
                      {activeConversation.participantUsers.length > 4 && (
                        <span className="text-[10px] text-slate-400 font-bold ml-1">
                          +{activeConversation.participantUsers.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Messages stream */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
                      <Users className="h-8 w-8 text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">No messages yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Send a message to start collaborating with your teammates!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === user?._id;
                      return (
                        <div
                          key={msg._id}
                          className={`flex items-start gap-2.5 max-w-[80%] ${
                            isMe ? 'ml-auto flex-row-reverse' : ''
                          }`}
                        >
                          <Avatar src={msg.senderAvatar} alt={msg.senderName} size="sm" />
                          <div
                            className={`p-3 rounded-2xl text-xs space-y-1 shadow-2xs ${
                              isMe
                                ? 'bg-emerald-600 text-white rounded-tr-none'
                                : 'bg-slate-100 text-slate-900 rounded-tl-none'
                            }`}
                          >
                            {!isMe && (
                              <p className="text-[10px] font-bold text-slate-700 pb-0.5">
                                {msg.senderName}
                              </p>
                            )}
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="pt-1">
                                <a
                                  href={msg.attachments[0]}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`text-[11px] underline flex items-center gap-1 ${
                                    isMe ? 'text-emerald-100' : 'text-emerald-700 font-medium'
                                  }`}
                                >
                                  <Paperclip className="h-3 w-3" /> View Attachment
                                </a>
                              </div>
                            )}
                            <p
                              className={`text-[9px] text-right ${
                                isMe ? 'text-emerald-100' : 'text-slate-400'
                              }`}
                            >
                              {formatTimeAgo(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <form
                  onSubmit={handleSend}
                  className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
                >
                  <label className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors">
                    <Paperclip className="h-4 w-4" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setFileAttachment(e.target.files[0]);
                        }
                      }}
                    />
                  </label>

                  {fileAttachment && (
                    <span className="text-[11px] bg-slate-100 px-2 py-1 rounded text-slate-700 truncate max-w-[120px]">
                      {fileAttachment.name}
                    </span>
                  )}

                  <input
                    type="text"
                    placeholder={
                      activeConversation.type === 'team'
                        ? 'Message your team...'
                        : 'Type your message...'
                    }
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                  />

                  <Button
                    type="submit"
                    variant="emerald"
                    size="sm"
                    className="h-9 w-9 p-0 flex items-center justify-center shrink-0"
                    disabled={(!messageText.trim() && !fileAttachment) || isSending}
                    isLoading={isSending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 mb-1">Select a Conversation</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Choose a direct message or team group chat from the left panel to begin communicating.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
