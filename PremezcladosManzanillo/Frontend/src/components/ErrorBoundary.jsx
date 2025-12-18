import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para que el siguiente renderizado muestre la interfaz de repuesto
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // También puedes registrar el error en un servicio de reporte de errores
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Puedes renderizar cualquier interfaz de repuesto personalizada
      return (
        <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-lg m-4 border border-red-200 dark:border-red-900">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Algo salió mal.</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Ha ocurrido un error inesperado al renderizar este componente.
          </p>
          <details className="whitespace-pre-wrap text-left text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-black/20 p-4 rounded overflow-auto max-h-64">
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
