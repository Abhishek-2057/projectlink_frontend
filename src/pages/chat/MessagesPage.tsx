import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { formatTimeAgo } from '../../lib/utils';
import {
  MessageSquare,
  Send,
  Paperclip,
  Users,
  Search,
  CheckCheck,
} from 'lucide-react';

export function MessagesPage() {
  const { user } = useAuthStore();
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
  const [searchFilter, setSearchFilter] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?._id) {
      initSocket(user._id);
      fetchConversations();
    }
  }, [user]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && !fileAttachment) return;

    await sendMessage(messageText, fileAttachment || undefined);
    setMessageText('');
    setFileAttachment(null);
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
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex-1 flex flex-col md:flex-row overflow-hidden min-h-[600px] max-h-[82vh]">
          {/* Left Column: Conversation List */}
          <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
            {/* Header & Search */}
            <div className="p-4 border-b border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-600" /> Messages
                </h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter conversations..."
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
                  const otherUser = conv.participantUsers?.find((p) => p._id !== user?._id);
                  const title = conv.type === 'project' ? conv.title : otherUser?.name || 'Direct Chat';

                  return (
                    <button
                      key={conv._id}
                      onClick={() => setActiveConversation(conv)}
                      className={`w-full p-4 flex items-start gap-3 text-left transition-colors cursor-pointer ${
                        isActive ? 'bg-emerald-50/80 border-r-2 border-emerald-600' : 'hover:bg-slate-100/60'
                      }`}
                    >
                      <Avatar
                        src={otherUser?.avatar}
                        alt={title}
                        size="md"
                        fallback={title?.[0]}
                      />
                      <div className="overflow-hidden flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                            {title}
                          </h4>
                          {conv.lastMessage?.createdAt && (
                            <span className="text-[10px] text-slate-400">
                              {formatTimeAgo(conv.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 truncate">
                          {conv.lastMessage ? `${conv.lastMessage.senderName}: ${conv.lastMessage.text}` : 'Started conversation'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Chat Box */}
          <div className="flex-1 flex flex-col bg-white">
            {activeConversation ? (
              <>
                {/* Chat Top Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white z-10">
                  <div className="flex items-center gap-3">
                    <Avatar
                      alt={activeConversation.title || 'Chat'}
                      size="sm"
                      fallback="C"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {activeConversation.type === 'project'
                          ? activeConversation.title
                          : activeConversation.participantUsers?.find((p) => p._id !== user?._id)?.name || 'Direct Conversation'}
                      </h3>
                      <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" /> Live Socket.IO Channel
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages stream */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                  {messages.map((msg) => {
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
                            <p className="text-[10px] font-bold text-slate-600 pb-0.5">
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
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <form
                  onSubmit={handleSend}
                  className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
                >
                  <label className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer rounded-lg hover:bg-slate-100">
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
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 text-xs px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />

                  <Button type="submit" variant="emerald" size="sm" className="font-semibold shrink-0">
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <MessageSquare className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">Select a conversation to start chatting</p>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Collaborate in real-time with team members, mentors, and company supervisors.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
