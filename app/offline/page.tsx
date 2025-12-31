// app/offline/page.tsx
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md text-center">
        {/* Healthcare-focused icon */}
        <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Connection Required</h1>
        
        <p className="text-gray-600 mb-4">
          Your internet connection appears to be offline. This page will refresh automatically when connectivity is restored.
        </p>
        
        <p className="text-sm text-gray-500 mb-8">
          For healthcare continuity, recently viewed patient data remains accessible.
        </p>
        
        {/* Status indicator */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">Offline</span>
        </div>
        
        {/* Manual refresh option (still works without JavaScript) */}
        <a 
          href="/" 
          className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
        >
          Return to App
        </a>
      </div>
      
      {/* Auto-refresh script - works when JS is enabled */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Auto-refresh when back online
            window.addEventListener('online', function() {
              console.log('Connection restored - refreshing...');
              window.location.href = '/';
            });
            
            // Periodically check connection every 5 seconds
            setInterval(function() {
              if (navigator.onLine) {
                window.location.href = '/';
              }
            }, 5000);
            
            // Show online status in console
            console.log('WellChild Clinic: Offline mode active. Data remains available.');
          `,
        }}
      />
    </div>
  );
}