import React from 'react';
import { Message } from '@ag-ui/client';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import styles from './UserMessage.module.css';

interface UserMessageProps {
  message: Message;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  return (
    <div className={styles.messageContainer}>
      <div className={styles.messageBubble}>
        <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>{message.content}</Markdown>
      </div>
    </div>
  );
};