import { Analytics } from '@vercel/analytics/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DarkModeProvider } from './components/DarkModeContext';
import GridView from './components/GridView';
import ListView from './components/ListView';
import NotFound from './components/NotFound';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DarkModeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ListView />} />
          <Route path="/grid" element={<GridView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Analytics />
      </BrowserRouter>
    </DarkModeProvider>
  </StrictMode>
);
