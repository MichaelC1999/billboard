import { createMuiTheme } from '@material-ui/core';

export const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#ffffff', // White color for primary
    },
    background: {
      default: '#000000', // Black background
    },
  },
});
