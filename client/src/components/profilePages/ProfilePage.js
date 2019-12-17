import React, { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function ProfilePage() {
  const [signedIn, setSignedIn] = useState(false);
  const [hasAccount, setHasAccount] = useState(true);
  //  if (localStorage.getItem("token")) {
  //     if (!signedIn) {
  //       setSignedIn(true);
  //     }
  //     return <h1>Hello User!</h1>;
  //   } else
  //Above code makes the profile available with token present, but also kills the ability to actually log in.

  if (!signedIn && hasAccount) {
    console.log(false);
    return (
      <LoginForm setHasAccount={setHasAccount} setSignedIn={setSignedIn} />
    );
  } else if (!signedIn && !hasAccount) {
    return (
      <>
        <SignupForm setHasAccount={setHasAccount} />
      </>
    );
  }
}
