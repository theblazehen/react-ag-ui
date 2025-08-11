import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AbstractAgent, Message as AgMessage, State } from '@ag-ui/client';

interface ChatProviderProps {
  agent: AbstractAgent;
  threadId?: string;
  onError?: (error: Error) => void;
  children: React.ReactNode;
}

interface ChatContextValue {
  agent: AbstractAgent;
  messages: AgMessage[];
  isLoading: boolean;
  error: Error | null;
  state: State;
  sendMessage: (content: string) => void;
  clearMessages: () => void;
  loadHistory: () => void;
  threadId?: string;
}

export const ChatContext = React.createContext<ChatContextValue | undefined>(undefined);

export const ChatProvider: React.FC<ChatProviderProps> = ({
  agent,
  threadId,
  onError,
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [_, setUpdateTrigger] = useState(0);

  const forceUpdate = useCallback(() => {
    setUpdateTrigger(val => val + 1);
  }, []);

  const subscriber = useCallback(() => ({
    onRunFailed: (params: { error: Error }) => {
      setError(params.error);
      setIsLoading(false);
      if (onError) onError(params.error);
      forceUpdate();
    },
    onRunFinalized: () => {
      setIsLoading(false);
      forceUpdate();
    },
    onNewMessage: () => {
      forceUpdate();
    },
    onTextMessageContentEvent: () => {
      forceUpdate();
    },
    onStateSnapshot: () => {
      forceUpdate();
    },
    onStateDelta: () => {
      forceUpdate();
    },
  }), [forceUpdate, onError]);

  const sendMessage = async (content: string) => {
    if (!agent || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      agent.addMessage({
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
      });
      forceUpdate();

      await agent.runAgent(undefined, subscriber());
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setIsLoading(false);
      if (onError) onError(error);
    }
  };

  const clearMessages = () => {
    if (agent) {
      agent.messages = [];
      forceUpdate();
    }
  };

  const loadHistory = useCallback(async () => {
    if (!agent) return;

    setIsLoading(true);
    setError(null);
    agent.messages = [];

    try {
      await agent.runAgent(undefined, subscriber());
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load history');
      setError(error);
      if (onError) onError(error);
    } finally {
      setIsLoading(false);
    }
  }, [agent, forceUpdate, onError, subscriber]);

  useEffect(() => {
    if (threadId) {
      agent.threadId = threadId;
      loadHistory();
    }
  }, [agent, threadId, loadHistory]);

  const value = {
    agent,
    messages: agent?.messages || [],
    isLoading,
    error,
    state: agent?.state || {},
    sendMessage,
    clearMessages,
    loadHistory,
    threadId,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export function useChat(): ChatContextValue {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}