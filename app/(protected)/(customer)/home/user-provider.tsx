"use client";

import { createContext, useContext } from "react";

export type UserData = {
  first_name?: string;
  middle_initial?: string;
  last_name?: string;
  address?: string;
  location_id?: string;
  location_pricing?: any;
};

const UserContext = createContext<UserData | null>(null);

export function UserProvider({ children, userData }: { children: React.ReactNode, userData: UserData | null }) {
  return (
    <UserContext.Provider value={userData}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
