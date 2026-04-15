"use client";

import { useSession } from "next-auth/react";
import LogoutButton from "./LogoutButton";
import GoogleLoginButton from "./GoogleLoginButton";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();
  const isSystemAdmin = session?.role === "ROLE_SYSTEM_ADMIN";
  const isRestaurantOwner = session?.role === "ROLE_RESTAURANT_ADMIN" || session?.role === "ROLE_RESTAURANT_OWNER";
  const isAuthenticated = Boolean(session?.backendAccessToken);

  return (
    <div className="navbar bg-base-100 px-2 shadow-sm sm:px-4">
      <div className="flex items-center gap-1">
        <div className="dropdown lg:hidden">
          <label tabIndex={0} className="btn btn-ghost btn-circle" aria-label="Open navigation menu">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-5 w-5 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content rounded-box z-20 mt-3 w-52 bg-base-100 p-2 shadow">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/restaurants">Restaurants</Link></li>
            {isRestaurantOwner && <li><Link href="/ownerdashboard">Owner dashboard</Link></li>}
            {isSystemAdmin && <li><Link href="/admindashboard">Admin dashboard</Link></li>}
          </ul>
        </div>
        <Link href="/" className="btn btn-ghost btn-circle min-[380px]:hidden" aria-label="Go to home page">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-5 w-5 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10.5 12 3l9 7.5M5.25 9.5V21h13.5V9.5" />
          </svg>
        </Link>
        <Link className="hidden btn btn-ghost px-2 text-base min-[380px]:inline-flex sm:px-4 sm:text-xl" href="/">Restaurant Assistant</Link>
      </div>

      <div className="ml-2 hidden flex-1 lg:flex">
        <Link className="btn btn-ghost text-sm xl:text-base" href="/restaurants">Restaurants</Link>
        {isRestaurantOwner && <Link className="btn btn-ghost text-sm xl:text-base" href="/ownerdashboard">Owner dashboard</Link>}
        {isSystemAdmin && <Link className="btn btn-ghost text-sm xl:text-base" href="/admindashboard">Admin dashboard</Link>}
      </div>

      <div className="ml-auto flex-none">
        {isAuthenticated && session?.user?.image ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img alt="User profile" src={session.user.image || ""} />
              </div>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content rounded-box z-20 mt-3 w-52 bg-base-100 p-2 shadow">
              <li><a>Profile</a></li>
              <li><a>Settings</a></li>
              {isRestaurantOwner && <li><Link href="/ownerdashboard">Owner dashboard</Link></li>}
              {isSystemAdmin && <li><Link href="/admindashboard">Admin dashboard</Link></li>}
              <li><LogoutButton>Logout</LogoutButton></li>
            </ul>
          </div>
        ) : (
          <GoogleLoginButton className="btn-sm sm:btn-md" />
        )}
      </div>
    </div>
  );
}
  