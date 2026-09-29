import React from 'react';
import AppNavigator from '../navigation/AppNavigator.js'; 
// Import your AuthProvider context wrapper (adjust the file path if yours sits elsewhere)
import { AuthProvider } from '../context/AuthContext'; 

export default function AppEntry() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
