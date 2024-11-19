'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import {
    update_session
} from '../lib/ton_supabase_api'


const AuthContext = createContext({ session: null, event: null });

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({ session: null, event: null });

  useEffect(() => {
    
    // const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
    //   setAuthState({ session, event });
    // });

    const subscription = update_session()
    console.log('AuthProvider useEffect subscription = ',subscription)

    // Cleanup listener on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);