// src/components/ChatPanel.jsx
import React, { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { MessageSquare, Bot, User, X, Mic, MicOff, Send, Sparkles } from "lucide-react";

export const ChatPanel = ({
  isOpen,
  onClose,
  chatHistory,
  isChatLoading,
  chatInput,
  setChatInput,
  handleSendChatMessage,
  handleMicClick,
  isListening,
  awaitingConfirmation,
  chatInputRef,
  focusChatInput,
  setFocusChatInput,
}) => {
  const chatMessagesEndRef = useRef(null);

  // Scroll chat to bottom effect
  useEffect(() => {
    if (isOpen && chatHistory.length > 0) {
      setTimeout(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [chatHistory, isOpen]);

  // Focus effect
  useEffect(() => {
    if (isOpen && focusChatInput && chatInputRef.current) {
      console.log("Focus trigger received, attempting to focus input.");
      chatInputRef.current.focus();
      setFocusChatInput(false);
    }
  }, [isOpen, focusChatInput, setFocusChatInput, chatInputRef]);

  // Handle Enter key press
  const handleChatInputKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendChatMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      {/* Chat Panel Container */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md lg:max-w-sm xl:max-w-md bg-gray-50 dark:bg-gray-900 shadow-2xl z-30 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-title"
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h2 id="chat-title" className="font-semibold text-gray-900 dark:text-white">
                Habit Assistant
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                AI-powered habit coach
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            aria-label="Close Chat"
            className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {chatHistory.length === 0 && (
            <div className="text-center py-8">
              <div className="p-3 mx-auto w-fit rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 mb-4">
                <MessageSquare size={24} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Welcome to your Habit Assistant!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                Ask me anything about your habits, get suggestions, or track your progress.
              </p>
            </div>
          )}

          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                msg.sender === "user" ? "flex-row-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 ${msg.sender === "user" ? "order-2" : ""}`}>
                {msg.sender === "bot" ? (
                  <div className="p-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Bot size={16} className="text-white" />
                  </div>
                ) : (
                  <div className="p-1.5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
                    <User size={16} className="text-white" />
                  </div>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                  msg.sender === "user"
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-md"
                }`}
              >
                <div className={`text-sm leading-relaxed ${
                  msg.sender === "user" ? "text-white" : ""
                }`}>
                  {msg.sender === "bot" ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="my-1 first:mt-0 last:mb-0">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-sm">{children}</li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic text-purple-600 dark:text-purple-400">
                            {children}
                          </em>
                        ),
                        code: ({ children }) => (
                          <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">
                            {children}
                          </code>
                        ),
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          />
                        ),
                      }}
                    >
                      {msg.text || ""}
                    </ReactMarkdown>
                  ) : (
                    <span>{msg.text}</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isChatLoading && (
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Assistant is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatMessagesEndRef} />
        </div>

        {/* Chat Input Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                ref={chatInputRef}
                type="text"
                placeholder={
                  isListening
                    ? "Listening..."
                    : awaitingConfirmation
                    ? "Confirm (yes/no)..."
                    : "Ask about your habits..."
                }
                className="w-full pr-12 py-3 rounded-2xl border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleChatInputKeyPress}
                disabled={isChatLoading && !awaitingConfirmation}
                aria-label="Chat input"
              />
              
              {/* Mic Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMicClick}
                disabled={isChatLoading}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full ${
                  isListening 
                    ? "text-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse" 
                    : "text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                }`}
                title={isListening ? "Stop Listening" : "Start Listening"}
                aria-label={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </Button>
            </div>
            
            {/* Send Button */}
            <Button
              size="icon"
              onClick={handleSendChatMessage}
              disabled={
                (!chatInput.trim() && !awaitingConfirmation) ||
                (isChatLoading && !awaitingConfirmation)
              }
              className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
              aria-label="Send chat message"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
