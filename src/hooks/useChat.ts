import { useContext } from 'react';
import { ChatContext, ChatContextValue } from '../context/ChatContext';

export function useChat(): ChatContextValue {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}