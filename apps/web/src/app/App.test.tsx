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

    expect(screen.getAllByText(/Restaurant Hotel Cactus/i)[0]).toBeInTheDocument();
    expect(
      screen.getByText(/Une table qui marie finesse francaise et chaleur beninoise/i)
    ).toBeInTheDocument();
  });
});
