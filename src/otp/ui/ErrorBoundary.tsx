import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('3D Scene ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-white p-6 text-center text-black">
          <h1 className="text-[22px] font-medium mb-2">
            No se pudo cargar la escena 3D
          </h1>
          <p className="text-[14px] text-[#666666] max-w-md mb-4">
            {this.state.message || 'WebGL context error.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full bg-black px-5 py-2 text-[14px] font-medium text-white cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
