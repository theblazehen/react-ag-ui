import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { HttpAgent } from '@ag-ui/client';
import { ChatProvider } from '../src/context/ChatContext';
import { ChatHeader } from '../src/components/ChatHeader';
import { MessageList } from '../src/components/MessageList';
import { MessageInput } from '../src/components/MessageInput';
import styles from './App.module.css';
import '../src/theme/global.css';
import { ThemeProvider, useTheme } from './ThemeContext';

interface ChatWindowProps {
  threadId?: string;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ threadId, onClose }) => {
  const [agent] = React.useState(() => new HttpAgent({
    url: 'http://localhost:8000/agent/run',
    description: 'Chat',
  }));

  return (
    <div className={styles.chatWindow}>
      <button onClick={onClose} className={styles.closeButton}>
        &times;
      </button>
      <ChatProvider agent={agent} threadId={threadId}>
        <div className={styles.chatContainer}>
          <ChatHeader />
          <MessageList />
          <MessageInput />
        </div>
      </ChatProvider>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [threads, setThreads] = useState<(string | undefined)[]>([undefined]);
  const [inputValue, setInputValue] = useState('');

  const handleAddThread = () => {
    setThreads([inputValue || undefined, ...threads]);
    setInputValue('');
  };

  const handleNewThread = () => {
    setThreads([undefined, ...threads]);
  };

  const handleCloseThread = (index: number) => {
    setThreads(threads.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.appContainer}>
      <div className={styles.controlsContainer}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter Thread ID to load"
        />
        <button onClick={handleAddThread}>Load Thread</button>
        <button onClick={handleNewThread}>New Thread</button>
        <button onClick={toggleTheme}>
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </div>
      <div className={styles.chatsContainer}>
        {threads.map((threadId, index) => (
          <ChatWindow
            key={index}
            threadId={threadId}
            onClose={() => handleCloseThread(index)}
          />
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);