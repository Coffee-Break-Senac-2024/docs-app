import React from 'react';
import Login from './src/app/components/Pages/login/Login';
import { GlobalStyle } from './src/app/components/Global/Global';


const App: React.FC = () => {
  return (
    <>
      <GlobalStyle />
      <Login />
    </>
  );
};

export default App;
