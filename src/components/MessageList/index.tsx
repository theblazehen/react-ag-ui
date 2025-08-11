import React from 'react';
import { useChat } from '../../context/ChatContext';
import { UserMessage } from '../UserMessage';
import { AssistantMessage } from '../AssistantMessage';
import { Message, ToolCall } from '@ag-ui/client';
import { StickToBottom } from 'use-stick-to-bottom';
import styles from './MessageList.module.css';

// Type guard to identify an assistant message that initiates tool calls.
function isToolCallInitiator(message: Message): message is Message & { role: 'assistant'; toolCalls: ToolCall[] } {
  return message.role === 'assistant' && !!message.toolCalls && message.toolCalls.length > 0;
}

// Define the structure for a "UI Block" which groups related messages.
interface UIBlock {
  id: string;
  type: 'user' | 'assistant';
  initiator: Message;
  toolCalls?: { toolCall: ToolCall; toolResult: string | null; isLoading: boolean }[];
  finalResponse?: Message;
}

export const MessageList: React.FC = () => {
  const { messages, isLoading } = useChat();

  if (isLoading && messages.length === 0) {
    return (
      <div className={styles.messageList}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={styles.messageList}>
        <div className={styles.emptyState}>
          <h2>No messages yet</h2>
          <p>Send a message to start the conversation.</p>
        </div>
      </div>
    );
  }

  // Reduce the flat message list into structured UI Blocks. This runs on every render.
  const uiBlocks = messages.reduce<UIBlock[]>((acc, message) => {
    // User messages are simple: they create a new block.
    if (message.role === 'user') {
      acc.push({ id: message.id, type: 'user', initiator: message });
      return acc;
    }

    // Assistant message that starts a tool call sequence.
    if (isToolCallInitiator(message)) {
      acc.push({
        id: message.id,
        type: 'assistant',
        initiator: message,
        // Map the tool calls to our UI structure, initially all loading.
        toolCalls: message.toolCalls.map(tc => ({
          toolCall: tc,
          toolResult: null,
          isLoading: true,
        })),
      });
      return acc;
    }

    // A tool result message. Find its corresponding block and update it immutably.
    if (message.role === 'tool') {
      return acc.map(block => {
        // If this isn't the block we're looking for, return it unchanged.
        if (!block.toolCalls?.some(tc => tc.toolCall.id === message.toolCallId)) {
          return block;
        }
        // Otherwise, create a new block with the updated toolCall.
        return {
          ...block,
          toolCalls: block.toolCalls.map(tc => {
            if (tc.toolCall.id !== message.toolCallId) {
              return tc;
            }
            return {
              ...tc,
              toolResult: message.content as string,
              isLoading: false,
            };
          }),
        };
      });
    }

    // A final assistant response (text content).
    if (message.role === 'assistant' && message.content) {
      // Find the index of the last assistant block that's waiting for a final response.
      const lastAssistantBlockIndex = acc.findLastIndex(b => b.type === 'assistant' && !b.finalResponse);

      if (lastAssistantBlockIndex !== -1) {
        // This block was initiated by a tool_call message. Update it immutably.
        return acc.map((block, index) => {
          if (index !== lastAssistantBlockIndex) return block;
          return { ...block, finalResponse: message };
        });
      } else {
        // This is a simple assistant message (no preceding tool calls).
        // It could be a new message or a streaming update to an existing one.
        const existingBlockIndex = acc.findIndex(b => b.initiator.id === message.id);
        if (existingBlockIndex !== -1) {
          // Update the existing simple message block immutably.
          return acc.map((block, index) => {
            if (index !== existingBlockIndex) return block;
            return { ...block, initiator: message, finalResponse: message };
          });
        } else {
          // Add a new simple message block.
          return [...acc, { id: message.id, type: 'assistant', initiator: message, finalResponse: message }];
        }
      }
    }

    return acc;
  }, []);

  return (
    <StickToBottom className={styles.messageList}>
      <StickToBottom.Content>
        {uiBlocks.map(block => {
          if (block.type === 'user') {
            return <UserMessage key={block.id} message={block.initiator} />;
          }
          if (block.type === 'assistant') {
            return (
              <AssistantMessage
                key={block.id}
                message={block.finalResponse || block.initiator}
                toolCalls={block.toolCalls}
              />
            );
          }
          return null;
        })}
      </StickToBottom.Content>
    </StickToBottom>
  );
};