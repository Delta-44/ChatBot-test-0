import React from 'react';
import { ChatMessage, MessageRole } from '../types';
import { UserIcon, BotIcon } from './icons';
import { marked } from 'marked';

interface ChatMessageProps {
  message: ChatMessage;
}

// Create a new marked renderer to customize output
const renderer = new marked.Renderer();

// Override the link renderer to add target="_blank" and specific classes
renderer.link = (token) => {
    const { href, title, text } = token;
    const titleAttr = title ? `title="${title}"` : '';
    return `<a href="${href}" ${titleAttr} target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">${text}</a>`;
};

// Override the code renderer for custom styling
// FIX: The 'marked' library's code token uses the 'text' property for the code content, not 'code'.
// Aliasing 'text' to 'code' to fix the error.
renderer.code = (token) => {
    const { text: code, lang } = token;
    const language = lang || 'plaintext';
    // Escaping is handled by marked before the renderer is called.
    return `<pre><code class="language-${language} p-2 rounded-md block bg-gray-900/50 my-2 overflow-x-auto">${code}</code></pre>`;
};

// Set the custom renderer for all subsequent marked calls
marked.setOptions({ renderer });


export const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message }) => {
  const isUserModel = message.role === MessageRole.USER || message.role === MessageRole.MODEL;
  
  const createMarkup = (content: string) => {
    // Use the configured marked instance to parse the content
    return { __html: marked.parse(content) as string };
  };

  const Icon = message.role === MessageRole.USER ? UserIcon : BotIcon;
  const bgColor = message.role === MessageRole.USER ? 'bg-blue-600/30' : 'bg-gray-700/30';

  if (!isUserModel) {
    return (
        <div className="flex justify-center items-center my-4">
            <div className="px-4 py-2 rounded-lg bg-red-500/30 text-red-300 border border-red-500/50">
                <p>Error: {message.content}</p>
            </div>
        </div>
    );
  }

  return (
    <div className={`flex items-start gap-4 my-4 ${message.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}>
        {message.role === MessageRole.MODEL && <Icon className="w-8 h-8 flex-shrink-0 text-gray-400 mt-1" />}
        <div className={`max-w-2xl w-full px-5 py-3 rounded-2xl ${bgColor}`}>
            <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={createMarkup(message.content)} />
        </div>
        {message.role === MessageRole.USER && <Icon className="w-8 h-8 flex-shrink-0 text-blue-400 mt-1" />}
    </div>
  );
};