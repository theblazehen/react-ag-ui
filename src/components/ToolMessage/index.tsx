import React, { useState } from 'react';
import { ToolCall } from '@ag-ui/client';
import styles from './ToolMessage.module.css';

interface ToolMessageProps {
  toolCall: ToolCall;
  toolResult: string | null;
  isLoading: boolean;
}

export const ToolMessage: React.FC<ToolMessageProps> = ({ toolCall, toolResult, isLoading }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toolName = toolCall.function.name;
  const toolArgs = toolCall.function.arguments;

  return (
    <div className={styles.toolMessage}>
      <button onClick={() => setIsOpen(!isOpen)} className={styles.toolHeader}>
        <span className={styles.arrow}>{isOpen ? '▼' : '►'}</span>
        Tool Call: {toolName} {isLoading && '(Running...)'}
      </button>
      {isOpen && (
        <div className={styles.toolDetails}>
          <div>
            <strong>Arguments:</strong>
            <pre>{toolArgs}</pre>
          </div>
          {toolResult && (
            <div>
              <strong>Result:</strong>
              <pre>{toolResult}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};