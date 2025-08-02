import PropTypes from 'prop-types';

const PlatformContent = ({ title, subtitle }) => {
  return (
    <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{title}</h1>
          <p className="text-xl text-gray-600">{subtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <FeatureCard 
            icon={<DocumentIcon />}
            title="Personalized Memory"
            description="STAN remembers your preferences and past conversations to provide a more personalized experience."
          />
          <FeatureCard 
            icon={<ChatIcon />}
            title="Human-like Interaction"
            description="Enjoy natural, conversational interactions that adapt to your communication style."
          />
          <FeatureCard 
            icon={<BrainIcon />}
            title="Context Awareness"
            description="STAN understands and maintains context throughout your conversation for more coherent responses."
          />
          <FeatureCard 
            icon={<ShieldIcon />}
            title="Secure & Private"
            description="Your conversations are handled with the highest standards of security and privacy."
          />
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">How to Use STAN</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Click the chat icon in the bottom right corner to open the chat window</li>
            <li>Type your message in the input field and press Send</li>
            <li>STAN will respond to your queries in a conversational manner</li>
            <li>Your conversation history is preserved within your session</li>
          </ol>
        </div>
        
        <div className="text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} STAN AI Chatbot. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

// Feature card component
const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
    <div className="text-blue-600 mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

// Icons
const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

FeatureCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

PlatformContent.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

PlatformContent.defaultProps = {
  title: 'Welcome to STAN AI Platform',
  subtitle: 'Your intelligent conversational assistant powered by Google Gemini',
};

export default PlatformContent;