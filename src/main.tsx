import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import './index.css';
import { store } from '@/app/store';
import { router } from '@/routes/router';
import { bootstrapWalletThunk } from '@/features/wallet/walletThunks';

store.dispatch(bootstrapWalletThunk());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
