console.log('🔄 Chatbot client script loaded');
const ExecutionEnvironment = require('@docusaurus/ExecutionEnvironment');
console.log('🔄 ExecutionEnvironment:', ExecutionEnvironment);
console.log('🔄 ExecutionEnvironment.default:', ExecutionEnvironment.default);

// Handle both CommonJS and ES module exports
const canUseDOM = ExecutionEnvironment.canUseDOM || ExecutionEnvironment.default?.canUseDOM || (typeof window !== 'undefined');
console.log('🔄 canUseDOM:', canUseDOM);

if (canUseDOM) {
  console.log('✅ DOM is available, proceeding with chatbot initialization');
  // Dynamically import and render chatbot when DOM is ready
  const initializeChatbot = () => {
    console.log('🤖 Initializing SmartWinnr chatbot...');
    import('react').then((React) => {
      console.log('✅ React loaded successfully');
      import('react-dom/client').then((ReactDOM) => {
        console.log('✅ ReactDOM loaded successfully');
        import('../src/components/ChatBot/ChatBot.tsx').then(({ default: ChatBot }) => {
          console.log('✅ ChatBot component loaded successfully');
          // Create container for chatbot
          const container = document.createElement('div');
          container.id = 'smartwinnr-chatbot';
          document.body.appendChild(container);
          console.log('✅ Chatbot container created and added to DOM');

          // Render chatbot
          const root = ReactDOM.createRoot(container);
          root.render(React.createElement(ChatBot));
          console.log('✅ Chatbot rendered successfully');
        }).catch(error => {
          console.error('Failed to load ChatBot component:', error);
        });
      }).catch(error => {
        console.error('Failed to load React DOM:', error);
      });
    }).catch(error => {
      console.error('Failed to load React:', error);
    });
  };

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChatbot);
  } else {
    // Small delay to ensure everything is loaded
    setTimeout(initializeChatbot, 100);
  }
}