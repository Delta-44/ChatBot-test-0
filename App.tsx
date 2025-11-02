import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { createChatSession } from './services/geminiService';
import { ChatMessage, MessageRole } from './types';
import { ChatInput } from './components/ChatInput';
import { ChatMessageComponent } from './components/ChatMessage';

export default function App() {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const session = createChatSession();
      setChatSession(session);
      setMessages([{
        role: MessageRole.MODEL,
        content: "Hello! I'm your friendly software development assistant. How can I help you code today?"
      }]);
    } catch (error) {
        console.error("Failed to initialize chat session:", error);
        setMessages([{
            role: MessageRole.ERROR,
            content: "Failed to initialize chat session. Please check your API key and refresh the page."
        }])
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (userMessage: string) => {
    if (!chatSession) return;

    setIsLoading(true);
    const updatedMessages: ChatMessage[] = [
        ...messages, 
        { role: MessageRole.USER, content: userMessage },
        { role: MessageRole.MODEL, content: "" }
    ];
    setMessages(updatedMessages);

    try {
      const stream = await chatSession.sendMessageStream({ message: userMessage });
      
      let text = '';
      for await (const chunk of stream) {
        text += chunk.text;
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], content: text };
            return newMessages;
        });
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setMessages(prev => [
          ...prev.slice(0, -1), // remove empty model message
          { role: MessageRole.ERROR, content: `Error: ${errorMessage}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
        <header className="bg-gray-800/50 backdrop-blur-sm p-4 text-center border-b border-gray-700">
            <h1 className="text-xl font-bold">Dev Assistant Chatbot</h1>
        </header>
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
            {messages.map((msg, index) => (
                <ChatMessageComponent key={index} message={msg} />
            ))}
            <div ref={messagesEndRef} />
        </div>
      </main>
      <footer className="sticky bottom-0">
         <div className="max-w-4xl mx-auto">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
         </div>
      </footer>
    </div>
  );
}
