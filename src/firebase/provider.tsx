'use client';

import React, { createContext, useContext, ReactNode, useMemo, DependencyList } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseContextType {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({
  children,
  firebaseApp,
  firestore,
  auth,
}: FirebaseContextType & { children: ReactNode }) {
  return (
    <FirebaseContext.Provider value={{ firebaseApp, firestore, auth }}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function useFirebaseApp() {
  return useFirebase().firebaseApp;
}

export function useFirestore() {
  return useFirebase().firestore;
}

export function useAuth() {
  return useFirebase().auth;
}

/**
 * A utility hook that memoizes a Firebase reference or query.
 * This is crucial for avoiding infinite re-render loops when passing refs to hooks like useCollection.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoized = useMemo(factory, deps);
  
  // Attach a private property to signal to useCollection/useDoc that this is memoized.
  if (memoized && typeof memoized === 'object') {
    (memoized as any).__memo = true;
  }
  
  return memoized;
}
