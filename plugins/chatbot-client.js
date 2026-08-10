// Mounts the Ally chat widget into its own React root on every page.
//
// Deliberately quiet: this used to log a dozen startup lines ("React loaded
// successfully", the ExecutionEnvironment object, and so on) into the console
// of every production page load. Only genuine failures are reported now.
const ExecutionEnvironment = require('@docusaurus/ExecutionEnvironment');

// Handle both CommonJS and ES module exports
const canUseDOM = ExecutionEnvironment.canUseDOM || ExecutionEnvironment.default?.canUseDOM || (typeof window !== 'undefined');

if (canUseDOM) {
  // Dynamically import and render chatbot when DOM is ready
  const initializeChatbot = () => {
    import('react').then((React) => {
      import('react-dom/client').then((ReactDOM) => {
        import('../src/components/ChatBot/ChatBot.tsx').then(({ default: ChatBot }) => {
          // Create container for chatbot
          const container = document.createElement('div');
          container.id = 'smartwinnr-chatbot';
          document.body.appendChild(container);

          // Render chatbot
          const root = ReactDOM.createRoot(container);
          root.render(React.createElement(ChatBot));
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
