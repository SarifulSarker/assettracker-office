import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App/App.jsx'
import { BrowserRouter } from 'react-router-dom'


import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReduxWrapper from './App/ReduxWrapper.jsx'

import '@mantine/dates/styles.css';

// create query client
const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ReduxWrapper>
      <MantineProvider  >
      <ModalsProvider>
         <Notifications />
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
          
              
                <App />
                
          
          </QueryClientProvider>
        </BrowserRouter>
        </ModalsProvider>
      </MantineProvider>
    </ReduxWrapper>
  </StrictMode>
)
