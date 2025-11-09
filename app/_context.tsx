"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface UserContextType {
  user: User | null;
  isAdmin: boolean;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  isAdmin: false,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setIsAdmin(false);
        return;
      }

      setUser(currentUser);

      try {
        const token = await getIdTokenResult(currentUser);
        setIsAdmin(
          token.claims?.admin === true || token.claims?.role === "admin",
        );
      } catch (error) {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, isAdmin }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  return useContext(UserContext);
};
