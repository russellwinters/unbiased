import React, { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import ProfileInfo from "./ProfileInfo";
import BookmarkDisplay from "./BookmarkDisplay";

export default function ProfilePage() {
  const [signedIn, setSignedIn] = useState(false);
  const [hasAccount, setHasAccount] = useState(true);

  const LOG_OUT = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  if (localStorage.getItem("token")) {
    if (!signedIn) {
      setSignedIn(true);
    }

    return (
      <>
        <button onClick={LOG_OUT}>Logout</button>
        <ProfileInfo />
        <BookmarkDisplay />
      </>
    );
  }
  //Above code makes the profile available with token present, but also kills the ability to actually log in.
  else if (!signedIn && hasAccount) {
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
