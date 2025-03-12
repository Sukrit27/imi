import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, ArrowLeft, Send, User, Bot, ExternalLink, Mic, Volume2, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { htmlToText } from 'html-to-text';
import { Menu } from 'lucide-react';
import {  PlusIcon } from 'lucide-react';





// Voice API Setup (Web Speech API)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
const synth = window.speechSynthesis;




const SourceSidebar = ({
  messages,
  isOpen,
  onClose,
}: {
  messages: any[];
  isOpen: boolean;
  onClose: () => void;
}) => {
  const sourcesExist = [...messages].reverse().some((m) => m.type === 'bot' && m.sources?.length > 0);

  return (
    <AnimatePresence>
      {isOpen && sourcesExist && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 300, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-50 fixed right-0 top-0 border-l flex-shrink-0 h-full p-4 z-20"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Sources</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
          <ScrollArea className="h-[calc(100%-4rem)]">
            {(() => {
              const latestMessageWithSources = [...messages]
                .reverse()
                .find((m) => m.type === 'bot' && m.sources?.length > 0);

              if (!latestMessageWithSources) return null;

              return (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">
                    {latestMessageWithSources.content.substring(0, 50)}...
                  </p>
                  {latestMessageWithSources.sources.map((source: any, index: number) => (
                    <div
                      key={index}
                      className="bg-white rounded-md p-2 mb-2 shadow-sm hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <ExternalLink className="h-3 w-3 text-blue-500 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-800 text-xs">
                            {source.title || `Source ${index + 1}`}
                          </p>
                          {source.url && (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate block text-xs"
                            >
                              {source.url}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
};






// const LeftSidebar = ({
//   chatHistory,
//   isOpen,
//   onClose,
//   onSelectChat, // ✅ rename for clarity
//   onNewChat,
// }: {
//   chatHistory: Array<{ id: string; title: string; messages: any[] }>;
//   isOpen: boolean;
//   onClose: () => void;
//   onSelectChat: (chat: { id: string; title: string; messages: any[] }) => void; // ✅ pass the whole chat
//   onNewChat: () => void;
// }) => {
//   if (!chatHistory.length) return null;

//   const handleNewChat = () => {
//     onNewChat();
//     onClose();
//   };

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <motion.div
//           initial={{ width: 0, opacity: 0 }}
//           animate={{ width: 300, opacity: 1 }}
//           exit={{ width: 0, opacity: 0 }}
//           transition={{ duration: 0.3 }}
//           className="bg-gray-50 fixed left-0 top-0 border-r flex-shrink-0 h-full p-4 z-20"
//         >
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-medium text-gray-800">History</h2>
//             <div className="flex space-x-2">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={handleNewChat}
//               >
//                 <PlusIcon className="h-4 w-4 text-gray-600" />
//               </Button>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={onClose}
//               >
//                 <ArrowLeft className="h-4 w-4 text-gray-600" />
//               </Button>
//             </div>
//           </div>

//           <ScrollArea className="h-[calc(100%-4rem)]">
//             {chatHistory.map((chat) => (
//               <div
//                 key={chat.id}
//                 onClick={() => {
//                   onSelectChat(chat); // ✅ load the entire chat
//                   onClose();           // Optional: close sidebar
//                 }}
//                 className="cursor-pointer bg-white rounded-md p-2 mb-2 shadow-sm hover:bg-gray-100 transition-colors"
//               >
//                 <p className="text-sm font-medium text-gray-800 truncate">
//                   {chat.title}
//                 </p>
//                 <p className="text-xs text-gray-500">
//                   {chat.messages.length} messages
//                 </p>
//               </div>
//             ))}
//           </ScrollArea>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };









const LeftSidebar = ({
  chatHistory,
  isOpen,
  onClose,
  onSelectChat,
  onNewChat,
  onRenameChat,  // ✅ Pass rename handler
  onDeleteChat,  // ✅ Pass delete handler
}: {
  chatHistory: Array<{ id: string; title: string; messages: any[] }>;
  isOpen: boolean;
  onClose: () => void;
  onSelectChat: (chat: { id: string; title: string; messages: any[] }) => void;
  onNewChat: () => void;
  onRenameChat: (chatId: string) => void;  // ✅ Handler type
  onDeleteChat: (chatId: string) => void;  // ✅ Handler type
}) => {
  if (!chatHistory.length) return null;

  const handleNewChat = () => {
    onNewChat();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 300, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-50 fixed left-0 top-0 border-r flex-shrink-0 h-full p-4 z-20"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">History</h2>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={handleNewChat}>
                <PlusIcon className="h-4 w-4 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ArrowLeft className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[calc(100%-4rem)]">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className="flex items-center justify-between bg-white rounded-md p-2 mb-2 shadow-sm hover:bg-gray-100 transition-colors"
              >
                {/* Chat Info Clickable */}
                <div
                  onClick={() => {
                    onSelectChat(chat);
                    onClose();
                  }}
                  className="flex-1 cursor-pointer overflow-hidden"
                >
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {chat.title}
                  </p>
                  <p className="text-xs text-gray-500">{chat.messages.length} messages</p>
                </div>

                {/* Actions */}
                <div className="flex space-x-1 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ Prevent triggering onSelectChat
                      onRenameChat(chat.id);
                    }}
                  >
                    <Pencil className="h-4 w-4 text-gray-600" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ Prevent triggering onSelectChat
                      onDeleteChat(chat.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LeftSidebar;








export function Search() {
  const [location, setLocation] = useLocation();

  const getQueryFromUrl = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('q') || '';
  };

  // Load messages from localStorage on mount
  const [messages, setMessages] = useState<
    Array<{
      type: 'user' | 'bot';
      content: string;
      sources?: any[];
      isFollowUp?: boolean;
      originalQuery?: string;
    }>
  >(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [originalQuery, setOriginalQuery] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(getQueryFromUrl());
  const [refetchCounter, setRefetchCounter] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chatHistory, setChatHistory] = useState<Array<{ id: string; title: string; messages: any[] }>>(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  

  const handleNewChat = () => {

    if (messages.length > 0) {
      const chatTitle = `Chat ${chatHistory.length + 1}`;
  
      const newChat = {
        // id: Date.now().toString(), // or use a UUID
        id: sessionId,
        title: chatTitle,
        messages: messages,
      };
  
      const updatedHistory = [...chatHistory, newChat];
      setChatHistory(updatedHistory);
      localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
    }
    

    const newSessionId = Date.now().toString();

    setMessages([]);                // Clear chat messages
    // setSessionId(newSessionId);             // Reset the session
    setSessionId(null);
    setOriginalQuery(null);         // Reset original query
    setSearchQuery('');             // Reset search query
    setInputValue('');              // Clear input box
    setIsSidebarOpen(false);        // Close right sidebar (optional)
    setIsLeftSidebarOpen(false);    // Close left sidebar (optional)
    window.history.pushState({}, '', `/search`); // Reset URL if you want
  };

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  const loadChat = (chat: { id: string; title: string; messages: any[] }) => {
    // Save current chat if there are unsaved messages
    if (messages.length > 0) {
      const existingChatIndex = chatHistory.findIndex((c) => c.id === sessionId);
  
      let updatedHistory;
      if (existingChatIndex !== -1) {
        // Update existing chat with latest messages
        updatedHistory = [...chatHistory];
        updatedHistory[existingChatIndex] = {
          ...updatedHistory[existingChatIndex],
          messages: messages,
        };
      } else {
        const newChat = {
          id: sessionId || Date.now().toString(),
          title: `Chat ${chatHistory.length + 1}`,
          messages: messages,
        };
        updatedHistory = [...chatHistory, newChat];
      }
  
      setChatHistory(updatedHistory);
      localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
    }
  
    // Load the selected chat
    setMessages(chat.messages);
    setSessionId(chat.id);
    setOriginalQuery(null);
    setSearchQuery('');
    window.history.pushState({}, '', `/search`);
  };
  
  

 

  const processSearchResults = (result: any, isFollowUp: boolean = false, followUpQuery: string = '') => {
    let content = '';
    let sources: any[] = [];

    if (result.answer) content = htmlToText(result.answer);
    else if (result.summary) content = htmlToText(result.summary);
    else if (result.content) content = htmlToText(result.content);
    else if (result.results?.length > 0) {
      content = 'Here’s what I found:';
      result.results.forEach((item: any, index: number) => {
        if (item.title) content += `\n\n${index + 1}. ${item.title}`;
        if (item.summary) content += `\n${htmlToText(item.summary)}`;
        else if (item.content) content += `\n${htmlToText(item.content.substring(0, 200))}...`;
      });
    } else content = 'I processed your request but couldn’t find specific information.';

    if (result.sources) sources = result.sources;
    else if (result.results) {
      sources = result.results.map((item: any) => ({
        title: item.title || 'Document',
        url: item.url || null,
        content: item.content || item.summary || null,
      }));
    }

    if (sources.length > 0) setIsSidebarOpen(true);

    return { content, sources, isFollowUp, originalQuery: isFollowUp ? originalQuery : null };
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', searchQuery, refetchCounter],
    queryFn: async () => {
      if (!searchQuery) return null;
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      const result = await response.json();

      if (result.sessionId) {
        setSessionId(result.sessionId);
        if (!originalQuery) setOriginalQuery(searchQuery);
        setMessages((prev) => [...prev, { type: 'user', content: searchQuery }]);
        const { content, sources } = processSearchResults(result);
        setMessages((prev) => [...prev, { type: 'bot', content, sources, isFollowUp: false }]);
      }
      return result;
    },
    enabled: !!searchQuery,
  });

  const followUpMutation = useMutation({
    mutationFn: async (followUpQuery: string) => {
      setMessages((prev) => [...prev, { type: 'user', content: followUpQuery }]);
      if (!sessionId) {
        const response = await fetch(`/api/search?q=${encodeURIComponent(followUpQuery)}`);
        if (!response.ok) throw new Error('Search failed');
        const result = await response.json();
        if (result.sessionId) {
          setSessionId(result.sessionId);
          setOriginalQuery(followUpQuery);
        }
        const { content, sources } = processSearchResults(result);
        setMessages((prev) => [...prev, { type: 'bot', content, sources, isFollowUp: false }]);
        return result;
      }

      console.log('Sending follow-up', { sessionId, followUpQuery });

      const response = await fetch('/api/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, query: followUpQuery }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Follow-up failed. Status: ${response.status}, Error: ${errorText}`);
        throw new Error(`Follow-up failed: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Follow-up result:', result);
      
      const { content, sources } = processSearchResults(result, true, followUpQuery);
      
      setMessages((prev) => [
        ...prev,
        { type: 'bot', content, sources, isFollowUp: true, originalQuery },
      ]);
      
      return result;
      
    },
  });

  const handleSearch = async (newQuery: string) => {
    if (newQuery === searchQuery) setRefetchCounter((c) => c + 1);
    else {
      setSessionId(null);
      setOriginalQuery(null);
      setSearchQuery(newQuery);
    }
    window.history.pushState({}, '', `/search?q=${encodeURIComponent(newQuery)}`);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const newMessage = inputValue;
    setInputValue('');
    if (!sessionId) await handleSearch(newMessage);
    else await followUpMutation.mutateAsync(newMessage);
  };

  const startListening = () => {
    if (!recognition) return alert('Speech recognition not supported in your browser.');
    setIsListening(true);
    recognition.lang = 'en-IN';
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
      handleSendMessage();
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    synth.speak(utterance);
  };

  useEffect(() => {
    const query = getQueryFromUrl();
    if (query && query !== searchQuery && messages.length === 0) {
      setSessionId(null);
      setOriginalQuery(null);
      setSearchQuery(query);
    }
  }, [location]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (error || followUpMutation.error) {
      const err = error || followUpMutation.error;
      setMessages((prev) => [
        ...prev,
        { type: 'bot', content: `Sorry, I encountered an error: ${err instanceof Error ? err.message : 'Unknown error'}` },
      ]);
    }
  }, [error, followUpMutation.error]);



  
  const handleRenameChat = (chatId: string) => {
    const newTitle = window.prompt("Enter a new title for the chat:");
  
    if (newTitle && newTitle.trim() !== "") {
      const updatedChatHistory = chatHistory.map((chat) => {
        if (chat.id === chatId) {
          return { ...chat, title: newTitle };
        }
        return chat;
      });
  
      setChatHistory(updatedChatHistory);
    }
  };
  
  
  const handleDeleteChat = (chatId: string) => {
    // Optional: confirm before deleting
    if (window.confirm("Are you sure you want to delete this chat?")) {
      const updatedChatHistory = chatHistory.filter((chat) => chat.id !== chatId);
      setChatHistory(updatedChatHistory);
    }
  };
  






  return (
    <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className=" relative min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white text-gray-800"
    >
      {/* Header */}
      <motion.div
  initial={{ y: -20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.4 }}
  className="border-b p-4 sticky top-0 bg-white shadow-sm z-10 transition-all duration-300"
  style={{
    marginLeft: isLeftSidebarOpen ? '250px' : '0px', // Change this width to match your sidebar
  }}
>
  <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
    <div className="flex items-center gap-4">
      {/* NEW Menu Button for Left Sidebar */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsLeftSidebarOpen((prev) => !prev)}
        className="text-gray-600 hover:text-blue-600"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Button variant="ghost" size="icon" onClick={() => setLocation('/')}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h1 className="text-xl font-semibold">imiGPT</h1>
    </div>

    {/* Existing button for Right Sidebar */}
    <Button
      variant="outline"
      size="icon"
      onClick={() => setIsSidebarOpen((prev) => !prev)}
      className="text-gray-600 hover:text-blue-600"
    >
      <Link className="h-4 w-4" />
    </Button>
  </div>
</motion.div>


      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden transition-all duration-300 ${isLeftSidebarOpen ? 'pl-[300px]' : ''}`">
        {/* Chat Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center min-h-[50vh] text-center">
                <div className="max-w-md space-y-4">
                  <h2 className="text-2xl font-bold">Welcome</h2>
                  <p className="text-gray-600">Ask me anything, and I’ll provide helpful answers!</p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-2xl ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 shadow">
                      {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div>
                      {/* {message.isFollowUp && message.originalQuery && (
                        <div className="text-xs text-gray-500 mb-1">
                          Follow-up to: "{message.originalQuery}"
                        </div>
                      )} */}
                      {/* {message.isFollowUp && message.originalQuery } */}
                      <div
                        className={`rounded-lg px-4 py-3 text-sm shadow-md ${
                          message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'
                        }`}
                      >
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                      {message.type === 'bot' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 h-6 w-6"
                          onClick={() => speak(message.content)}
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        
      </div>
      {/* Source Sidebar */}
      <SourceSidebar messages={messages} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Input Area */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="p-4 border-t bg-white sticky bottom-0 z-10 shadow-lg"
      >
        <div className="max-w-4xl mx-auto flex items-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={startListening}
            disabled={isLoading || followUpMutation.isPending || isListening}
            className={isListening ? 'bg-blue-100' : ''}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <div className="relative flex-1">
            <textarea
              className="w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[40px] max-h-[120px] overflow-y-auto"
              placeholder="Ask a question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={1}
              style={{ height: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(120, target.scrollHeight)}px`;
              }}
              disabled={isLoading || followUpMutation.isPending}
            />
            {(isLoading || followUpMutation.isPending) && (
              <div className="absolute right-3 bottom-2 flex space-x-1">
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
              </div>
            )}
          </div>
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={isLoading || followUpMutation.isPending || !inputValue.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
    <LeftSidebar
  chatHistory={chatHistory}
  isOpen={isLeftSidebarOpen}
  onClose={() => setIsLeftSidebarOpen(false)}
  onSelectChat={loadChat}       // ✅ loadChat will load full chat history
  onNewChat={handleNewChat}
  onRenameChat={handleRenameChat}   // ✅ Add this
  onDeleteChat={handleDeleteChat} 
/>

   </>
  );
}