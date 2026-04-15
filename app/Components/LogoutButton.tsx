"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      onClick={() => {
        sessionStorage.removeItem("restaurant-assistant-auth-active");
        void signOut();
      }}
    >
      { children }
    </button>
  );
}
