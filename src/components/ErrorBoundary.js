/**
 * Simple Error Boundary for Vanilla JS
 */
export const ErrorBoundary = {
  init() {
    window.addEventListener('error', (event) => {
      this.showError(event.error || event.message);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.showError(event.reason);
    });
  },

  showError(error) {
    let message = 'Ha ocurrido un error inesperado.';
    let details = '';

    try {
      // Check if it's our JSON error from Firestore
      const errObj = JSON.parse(error.message || error);
      if (errObj.error && errObj.operationType) {
        message = `Error de base de datos (${errObj.operationType})`;
        details = `Ruta: ${errObj.path || 'N/A'}. ${errObj.error}`;
      }
    } catch (e) {
      // Not a JSON error, use standard message
      if (typeof error === 'string') message = error;
      else if (error.message) message = error.message;
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed bottom-4 right-4 max-w-sm bg-red-50 border-l-4 border-red-500 p-4 shadow-lg z-[100] animate-bounce-in';
    errorDiv.innerHTML = `
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">${message}</h3>
          <div class="mt-2 text-xs text-red-700">
            <p>${details}</p>
          </div>
          <div class="mt-4">
            <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" class="text-xs font-medium text-red-800 hover:underline">Cerrar</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 10 seconds
    setTimeout(() => errorDiv.remove(), 10000);
  }
};
