import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock the child components to simplify testing
vi.mock('../components/Header', () => ({
  default: () => <div data-testid="header">Header Component</div>
}));

vi.mock('../components/PlatformContent', () => ({
  default: () => <div data-testid="platform-content">Platform Content</div>
}));

vi.mock('../components/ChatbotModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, children }) => (
    isOpen ? (
      <div data-testid="chatbot-modal">
        <button onClick={onClose} data-testid="close-modal">Close</button>
        {children}
      </div>
    ) : null
  )
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('renders the main components', () => {
    render(<App />);
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('platform-content')).toBeInTheDocument();
  });

  it('loads session ID from localStorage on initial render', () => {
    localStorageMock.getItem.mockReturnValueOnce('test-session-id');
    render(<App />);
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('chatSessionId');
  });

  // Add more tests for App functionality as needed
});