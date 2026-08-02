import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import { AppRoutes } from './routes/AppRoutes';
import { NetworkProvider } from './context/NetworkContext';
import { OfflineBanner } from './components/OfflineBanner';
import { ErrorBoundary } from './components/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <NetworkProvider>
          <BrowserRouter>
            <OfflineBanner />
            <AppRoutes />
          </BrowserRouter>
        </NetworkProvider>
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
