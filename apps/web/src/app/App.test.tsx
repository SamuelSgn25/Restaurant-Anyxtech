import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
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

    const allCactusElements = screen.getAllByText('Le Cactus');
    expect(allCactusElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/Hotel restaurant/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Une table raffinee pour les dejeuners, les diners et les moments a celebrer/i)
    ).toBeInTheDocument();
  });
});
