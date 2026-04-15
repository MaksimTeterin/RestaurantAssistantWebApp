import Image from "next/image";
import Link from 'next/link'
import GoogleLoginButton from "./Components/GoogleLoginButton";
export default function Home() {
  return (
    <div className="hero h-[calc(100vh-4rem)] overflow-hidden"
  style={{
    backgroundImage:
      "url(restaurant-interior.jpg)",
  }}>
  <div className="hero-overlay"></div>
  <div className="hero-content text-neutral-content text-center">
    <div className="max-w-md px-4 sm:max-w-xl">
      <h1 className="mb-5 text-3xl font-bold sm:text-5xl">Restaurant Assistant</h1>
      <p className="mb-5 text-sm sm:text-base">
        Book a table at your favourit restaurant immediately or ask any questions and get a rapid response
      </p>
    </div>
  </div>
</div>
  );
}
