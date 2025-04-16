// src/components/ChatPanel.jsx
import React, { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/Card"; // Adjust path
import { Button } from "../ui/Button"; // Adjust path
import { Input } from "../ui/Input"; // Adjust path
import { MessageSquare, Bot, User, X, Mic, MicOff, Send } from "lucide-react";

export const ChatPanel = ({
  isOpen,
  onClose,
  chatHistory,
  isChatLoading,
  chatInput,
  setChatInput, // Receive setter
  handleSendChatMessage,
  handleMicClick,
  isListening,
  awaitingConfirmation,
  chatInputRef, // Receive ref from App
  // FIX: Receive focus state and setter
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

  // FIX: Add useEffect to handle focus trigger
  useEffect(() => {
    if (isOpen && focusChatInput && chatInputRef.current) {
      console.log("Focus trigger received, attempting to focus input.");
      chatInputRef.current.focus();
      setFocusChatInput(false); // Reset the trigger state immediately
    }
  }, [isOpen, focusChatInput, setFocusChatInput, chatInputRef]); // Dependencies

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
        className="fixed inset-0 bg-black/40 z-20 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      {/* Chat Panel Container */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md lg:max-w-sm xl:max-w-md bg-white dark:bg-gray-900 shadow-xl z-30 transform transition-transform duration-300 ease-in-out pt-16 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-title"
      >
        <Card className="h-full flex flex-col border-0 shadow-none rounded-none bg-transparent overflow-hidden">
          {/* Chat Header */}
          <CardHeader className="relative flex-shrink-0 border-b border-gray-200 flex items-center p-4 bg-white dark:bg-gray-900">
            <CardTitle
              id="chat-title"
              className="flex items-center gap-2 text-lg pr-10"
            >
              <MessageSquare
                size={20}
                className="text-indigo-600 dark:text-indigo-400"
              />
              Habit Assistant
            </CardTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              aria-label="Close Chat"
              className="absolute top-2 right-2 z-10 h-9 w-9 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <X size={22} />
            </Button>
          </CardHeader>
          {/* Chat Message Area */}
          <CardContent className="flex-grow overflow-y-auto space-y-4 py-4 px-4 relative scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent bg-white dark:bg-gray-900">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-2.5 ${
                  msg.sender === "user" ? "justify-end" : ""
                }`}
              >
                {msg.sender === "bot" && (
                  <Bot
                    size={24}
                    className="text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-1 p-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900"
                  />
                )}
                <div
                  className={`p-2.5 rounded-lg max-w-[85%] shadow-sm ${
                    msg.sender === "user"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                    <ReactMarkdown
                      components={{
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
                  </div>
                </div>
                {msg.sender === "user" && (
                  <User
                    size={24}
                    className="text-blue-500 dark:text-blue-400 flex-shrink-0 mt-1 p-0.5 rounded-full bg-blue-100 dark:bg-blue-900"
                  />
                )}
              </div>
            ))}
            {isChatLoading && (
              <div className="flex items-start gap-2.5">
                <Bot
                  size={24}
                  className="text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-1 p-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 animate-pulse"
                />
                <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 italic text-sm">
                  Assistant is thinking...
                </div>
              </div>
            )}
            <div ref={chatMessagesEndRef} />
          </CardContent>
          {/* Chat Input Footer */}
          <CardFooter className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-4 px-4 bg-white dark:bg-gray-900 flex-shrink-0">
            <div className="flex w-full items-center space-x-2">
              <Input
                ref={chatInputRef} // Use the passed ref
                type="text"
                placeholder={
                  isListening
                    ? "Listening..."
                    : awaitingConfirmation
                    ? "Confirm (yes/no)..."
                    : `Ask about habits...`
                }
                className="flex-1"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleChatInputKeyPress}
                disabled={isChatLoading && !awaitingConfirmation}
                aria-label="Chat input"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMicClick}
                disabled={isChatLoading}
                className={`text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 ${
                  isListening ? "text-red-500 animate-pulse" : ""
                }`}
                title={isListening ? "Stop Listening" : "Start Listening"}
                aria-label={
                  isListening ? "Stop listening" : "Start voice input"
                }
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </Button>
              <Button
                size="icon"
                onClick={handleSendChatMessage}
                disabled={
                  (!chatInput.trim() && !awaitingConfirmation) ||
                  (isChatLoading && !awaitingConfirmation)
                }
                className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                aria-label="Send chat message"
              >
                <Send size={18} />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};
