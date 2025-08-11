import React, { useState, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useChat } from '../../context/ChatContext';
import styles from './MessageInput.module.css';

export const MessageInput: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const { sendMessage, isLoading } = useChat();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.inputContainer}>
      <TextareaAutosize
        ref={inputRef}
        className={styles.input}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        maxRows={6}
      />
      <button
        className={styles.sendButton}
        onClick={handleSend}
        disabled={isLoading || !inputValue.trim()}
      >
        Send
      </button>
    </div>
  );
};