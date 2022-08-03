import React from 'react';
import { createTheme, ThemeProvider, Box } from '@mui/material';
import LoginForm from './components/auth/login-from';
import "./App.scss"

const theme = createTheme({
  palette: {
    primary: {
      main: '#122670'
    },
    secondary: {
      main: '#05c7f7'
    },
    info: {
      main: '#394c91'
    },
    success: {
      main: '#12ff90'
    },
    error: {
      main: '#ff384f'
    },
    warning: {
      main: '#ff7003'
    }
  }, shape: {
    borderRadius: 5
  }
});


function App() {
  return (
    <ThemeProvider theme={theme}>
      <LoginForm></LoginForm>
    </ThemeProvider>
  );
}

export default App;
