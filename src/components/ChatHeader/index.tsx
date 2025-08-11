import React from 'react';
import { useChat } from '../../context/ChatContext';
import styles from './ChatHeader.module.css';

export const ChatHeader: React.FC = () => {
  const { agent, state } = useChat();

  const title = state?.chatTitle || agent.description || 'Chat';

  return (
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
    </div>
  );
};