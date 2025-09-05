import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import Logo from '../assets/logo.svg';
import styles from './Chat.module.css';
import api from '../api.js';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Message = ({ text, from = 'ai' }) => {
  return (
    <div className={`${styles.message} ${from === 'ai' ? styles.ai : styles.user}`}>
      <div className={styles.bubble}>
        <ReactMarkdown
          children={text}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  children={String(children).replace(/\n$/, '')}
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                />
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        />
      </div>
    </div>
  );
};

const Chat = ({ theme, toggleTheme, user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const editInputRef = useRef(null);
  const activeChatIdRef = useRef(activeChatId);
  
  // ADDED: Ref to manage single vs. double click
  const clickTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    if (editingChatId && editInputRef.current) {
        editInputRef.current.focus();
    }
  }, [editingChatId]);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);
  
  // CONSOLIDATED: Logic to fetch history and create new chat is now in one place
  useEffect(() => {
    const setupChat = async () => {
      if (user) {
        try {
          const data = await api.get('/chat/history');
          if (data && data.length > 0) {
            setChats(data);
            selectChat(data[0]._id);
          } else {
            // If no chats exist, create one automatically
            createNewChat();
          }
        } catch (err) {
          console.error('Failed to fetch chat history, creating a new chat.', err);
          createNewChat();
        }
      } else {
        // Reset state for logged-out users
        setChats([]);
        setActiveChatId(null);
        setMessages([{ id: 's1', from: 'ai', text: 'Hello! Please log in to start chatting and save your history.' }]);
      }
    };

    setupChat();

    const s = io({ withCredentials: true });
    socketRef.current = s;
    s.on('connect_error', (err) => console.error('socket connect error', err));
    s.on('ai-response', (payload) => {
      if (payload && payload.content && payload.chat === activeChatIdRef.current) {
        setMessages(prev => [...prev.filter(m => m.id !== 'thinking'), { id: `r${Date.now()}`, from: 'ai', text: payload.content }]);
      }
    });

    return () => {
      s.disconnect();
      // Clear any pending click timeouts
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, [user]);

  const selectChat = async (chatId) => {
    if (activeChatId === chatId || editingChatId === chatId) return;
    try {
      const fetchedMessages = await api.get(`/chat/${chatId}/messages`);
      const formattedMessages = fetchedMessages.map(msg => ({
        id: msg._id,
        from: msg.role === 'user' ? 'user' : 'ai',
        text: msg.content,
      }));
      setMessages(formattedMessages);
      setActiveChatId(chatId);
      setIsHistoryVisible(false);
    } catch (error) {
      console.error('Failed to fetch messages for chat', error);
    }
  };
  
  const createNewChat = async () => {
    if (isCreatingChat) return;
    setIsCreatingChat(true);
    try {
      const response = await api.post('/chat', { title: 'New Conversation' });
      const newChat = response.chat;
      setChats(prev => [newChat, ...prev]);
      setActiveChatId(newChat._id);
      setMessages([{id: 's1', from: 'ai', text: 'Hello! How can I help you?'}]);
      setIsHistoryVisible(false);
    } catch (error) {
      console.error('Failed to create new chat', error);
    } finally {
      setIsCreatingChat(false);
    }
  };

    const handleDeleteChat = async (chatIdToDelete) => {
        try {
            await api.del(`/chat/${chatIdToDelete}`);
            const updatedChats = chats.filter(chat => chat._id !== chatIdToDelete);
            setChats(updatedChats);

            if (activeChatId === chatIdToDelete) {
                if (updatedChats.length > 0) {
                    selectChat(updatedChats[0]._id);
                } else {
                   createNewChat();
                }
            }
        } catch (error) {
            console.error("Failed to delete chat", error);
        }
    };

    const handleStartEditing = (chat) => {
        setEditingChatId(chat._id);
        setEditingTitle(chat.title);
    };

    const handleSaveTitle = async (chatId) => {
        if (!editingTitle.trim()) {
            setEditingChatId(null);
            return;
        };
        try {
            const updatedChat = await api.put(`/chat/${chatId}`, { title: editingTitle });
            setChats(chats.map(c => c._id === chatId ? updatedChat.chat : c));
        } catch (error) {
            console.error("Failed to update chat title", error);
        } finally {
            setEditingChatId(null);
            setEditingTitle('');
        }
    };
    
    // ADDED: New handler to manage single and double clicks
    const handleHistoryItemClick = (chat) => {
      clearTimeout(clickTimeoutRef.current);
      if (!clickTimeoutRef.current) {
        // This is a single click
        clickTimeoutRef.current = setTimeout(() => {
          selectChat(chat._id);
          clickTimeoutRef.current = null;
        }, 250); // 250ms delay
      } else {
        // This is a double click
        clickTimeoutRef.current = null;
        handleStartEditing(chat);
      }
    };

  const sendMessage = () => {
    if (!input.trim() || !activeChatId || !user) return;
    const content = input.trim();
    const userMessage = { id: `u${Date.now()}`, from: 'user', text: content };
    const thinkingMessage = { id: 'thinking', from: 'ai', text: '...' };
    setMessages(prev => [...prev, userMessage, thinkingMessage]);
    setInput('');
    if (socketRef.current?.connected) {
      socketRef.current.emit('ai-message', { chat: activeChatId, content });
    } else {
      setMessages(prev => [...prev.filter(m => m.id !== 'thinking'), { id: `e${Date.now()}`, from: 'ai', text: 'Error: Not connected to server.' }]);
    }
  };

  const onKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <div className={`${styles.container} ${isHistoryVisible ? styles.historyVisible : ''}`}>
      {user && (
        <aside className={styles.historyNav}>
            <button onClick={createNewChat} className={styles.newChatBtn} disabled={isCreatingChat}>+ New Chat</button>
            <nav className={styles.historyList}>
            {chats.map(chat => (
                <div 
                    key={chat._id} 
                    className={`${styles.historyItem} ${chat._id === activeChatId ? styles.active : ''}`}
                    onClick={() => handleHistoryItemClick(chat)} // CHANGED
                >
                    {editingChatId === chat._id ? (
                        <input
                            ref={editInputRef}
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onBlur={() => handleSaveTitle(chat._id)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveTitle(chat._id);
                                if (e.key === 'Escape') setEditingChatId(null);
                            }}
                            className={styles.titleInput}
                        />
                    ) : (
                        <>
                            <span className={styles.titleText}>{chat.title}</span>
                            <button 
                                className={styles.deleteBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteChat(chat._id);
                                }}
                            >
                                &#x1F5D1;
                            </button>
                        </>
                    )}
                </div>
            ))}
            </nav>
        </aside>
      )}

      <div className={styles.chatArea}>
        <header className={styles.header}>
            <div className={styles.leftGroup}>
                {user && (
                    <button className={styles.historyToggle} onClick={() => setIsHistoryVisible(!isHistoryVisible)}>
                        ☰
                    </button>
                )}
                <img src={Logo} alt="AI logo" className={styles.logo} />
            </div>

            <div className={styles.actions}>
                <button onClick={toggleTheme} className={styles.themeToggle}>
                    {theme === 'dark' ? '🌞' : '🌜'}
                </button>
                {user ? (
                    <Link to="/profile">
                        <div className={styles.userProfile}>
                            {user.Fullname.firstName.charAt(0)}
                        </div>
                    </Link>
                ) : (
                    <>
                        <Link to="/login" className={styles.authBtn}>Login</Link>
                        <Link to="/register" className={styles.authBtnPrimary}>Sign up</Link>
                    </>
                )}
            </div>
        </header>

        <main className={styles.messages}>
            {messages.map(m => (
                <Message key={m.id} text={m.text} from={m.from} />
            ))}
            <div ref={messagesEndRef} />
        </main>

        <div className={styles.inputRow}>
            <textarea
                disabled={!user}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                className={styles.input}
                placeholder={user ? "Type your message..." : "Please log in to chat"}
                rows="1"
                style={{ resize: 'none' }}
                onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                }}
            />
            <button disabled={!user || !input.trim()} onClick={sendMessage} className={styles.send} aria-label="send">➤</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;