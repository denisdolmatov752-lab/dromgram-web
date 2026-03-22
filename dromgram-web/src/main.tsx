import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles/globals.css';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30000 } } });

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {error: Error | null}> {
  constructor(props: any) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'#17212B',color:'#fff',padding:'20px',textAlign:'center'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>⚠️</div>
          <h2 style={{fontSize:'20px',marginBottom:'8px'}}>Что-то пошло не так</h2>
          <p style={{color:'#8b949e',fontSize:'14px',marginBottom:'24px'}}>{this.state.error.message}</p>
          <button onClick={() => window.location.reload()} style={{background:'#2AABEE',color:'#fff',border:'none',borderRadius:'12px',padding:'12px 24px',fontSize:'14px',cursor:'pointer',fontWeight:'600'}}>
            Перезагрузить
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </ErrorBoundary>
);
