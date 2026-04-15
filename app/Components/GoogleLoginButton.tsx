"use client"

import { signIn } from "next-auth/react";

 type ButtonProps = {
  className?: string
}

export default function GoogleLoginButton({ className }: ButtonProps) {
  return (
  <button className={`btn btn-secondary ${className ?? ""}`.trim()}
    onClick={() => {
      sessionStorage.setItem("restaurant-assistant-auth-active", "1");
      signIn("google", {
          prompt: "select_account",
        })

      console.log("Button clicked")
    }}
  >
    Sign in with Google
  </button>
);

}
