import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AbstractAgent, Message as AgMessage, State } from '@ag-ui/client';

interface ChatProviderProps {
  agent: AbstractAgent;
  threadId?: string;
  loadHistory?: boolean;
  onError?: (error: Error) => void;
  children: React.ReactNode;
}

export interface ChatContextValue {
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
  loadHistory: shouldLoadHistory = false,
  onError,
  children,
}) => {
  const [messages, setMessages] = useState<AgMessage[]>(agent.messages);
  const [state, setState] = useState<State>(agent.state);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleStateChange = useCallback(() => {
    setMessages([...agent.messages]);
    setState({ ...agent.state });
  }, [agent]);

  const subscriber = useCallback(() => ({
    onRunFailed: (params: { error: Error }) => {
      setError(params.error);
      setIsLoading(false);
      if (onError) onError(params.error);
      handleStateChange();
    },
    onRunFinalized: () => {
      setIsLoading(false);
      handleStateChange();
    },
    onNewMessage: () => {
      handleStateChange();
    },
    onTextMessageContentEvent: () => {
      handleStateChange();
    },
    onStateSnapshot: () => {
      handleStateChange();
    },
    onStateDelta: () => {
      handleStateChange();
    },
  }), [handleStateChange, onError]);

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
      handleStateChange();

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
      handleStateChange();
    }
  };

  const loadHistory = useCallback(async () => {
    if (!agent) return;

    setIsLoading(true);
    setError(null);
    agent.messages = [];
    handleStateChange();

    try {
      await agent.runAgent(undefined, subscriber());
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load history');
      setError(error);
      if (onError) onError(error);
    } finally {
      setIsLoading(false);
    }
  }, [agent, handleStateChange, onError, subscriber]);

  useEffect(() => {
    if (threadId) {
      agent.threadId = threadId;
      if (shouldLoadHistory) {
        loadHistory();
      }
    }
  }, [agent, threadId, shouldLoadHistory, loadHistory]);

  const value = {
    agent,
    messages,
    isLoading,
    error,
    state,
    sendMessage,
    clearMessages,
    loadHistory,
    threadId,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
