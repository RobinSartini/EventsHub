import { useState } from "react";

import { AuthLayout } from "@/components/auth-layout";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export function meta() {
  return [{ title: "Connexion - EventsHub" }];
}

export default function Login() {
  const [showSignIn, setShowSignIn] = useState(true);

  return (
    <AuthLayout variant={showSignIn ? "sign-in" : "sign-up"}>
      {showSignIn ? (
        <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
      ) : (
        <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
      )}
    </AuthLayout>
  );
}
