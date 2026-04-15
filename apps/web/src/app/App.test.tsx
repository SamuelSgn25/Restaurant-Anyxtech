import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from './AuthContext';
import { App } from './App';

describe('App', () => {
  it('renders the homepage branding', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Le Cactus')).toBeInTheDocument();
    expect(screen.getByText(/Hotel restaurant/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Une Odyssée culinaire entre Terre et Mer/i)
    ).toBeInTheDocument();
  });
});
