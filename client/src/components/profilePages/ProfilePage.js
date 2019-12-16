import React, { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function ProfilePage() {
  const [signedIn, setSignedIn] = useState(false);
  const [hasAccount, setHasAccount] = useState(true);

  if (!signedIn && hasAccount) {
    console.log(false);
    return <LoginForm setHasAccount={setHasAccount} />;
  } else if (!signedIn && !hasAccount) {
    return (
      <>
        <SignupForm setHasAccount={setHasAccount} />
      </>
    );
  }
}
