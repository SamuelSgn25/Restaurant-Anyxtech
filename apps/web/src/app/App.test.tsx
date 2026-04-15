import { render, screen, within } from '@testing-library/react';
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

    // Check for header branding by looking for "Le Cactus" with "Hotel restaurant" using function matcher
    const allCactusElements = screen.getAllByText('Le Cactus');
    expect(allCactusElements.length).toBeGreaterThan(0);
    
    expect(screen.getByText(/Hotel restaurant/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Une Odyssée culinaire entre Terre et Mer/i)
    ).toBeInTheDocument();
  });
});
