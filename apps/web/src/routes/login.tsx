import { useState } from "react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export function meta() {
  return [{ title: "Connexion · EventsHub" }];
}

export default function Login() {
  const [showSignIn, setShowSignIn] = useState(true);

  return (
    <main className="flex items-start justify-center px-4 py-12 sm:py-20">
      <div className="bg-card shadow-float w-full max-w-md rounded-[26px] p-6 sm:p-8">
        {showSignIn ? (
          <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
        ) : (
          <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
        )}
      </div>
    </main>
  );
}
