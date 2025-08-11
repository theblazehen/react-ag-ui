import React from 'react';
import { Message, ToolCall } from '@ag-ui/client';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { ToolMessage } from '../ToolMessage';
import styles from './AssistantMessage.module.css';

interface AssistantMessageProps {
  message: Message;
  toolCalls?: { toolCall: ToolCall; toolResult: string | null; isLoading: boolean }[];
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({ message, toolCalls }) => {
  const hasToolCalls = toolCalls && toolCalls.length > 0;
  const hasFinalContent = message.content && message.content.trim() !== '';

  return (
    <div className={styles.messageContainer}>
      {hasToolCalls &&
        toolCalls.map((toolCallData) => (
          <ToolMessage
            key={toolCallData.toolCall.id}
            toolCall={toolCallData.toolCall}
            toolResult={toolCallData.toolResult}
            isLoading={toolCallData.isLoading}
          />
        ))}

      {/* If there are tool calls but no final content yet, show a loading indicator */}
      {hasToolCalls && !hasFinalContent && (
        <div className={`${styles.messageBubble} ${styles.loading}`}>...</div>
      )}

      {/* If there is final content, display it */}
      {hasFinalContent && (
        <div className={styles.messageBubble}>
          <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>{message.content}</Markdown>
        </div>
      )}
    </div>
  );
};