import React from "react";
import Axios from "axios";
import crypto from "crypto";

export default function LoginForm(props) {
  const setSignedIn = props.setSignedIn;
  const setHasAccount = props.setHasAccount;
  const changeAccountStatus = () => {
    setHasAccount(false);
  };

  const login = (event) => {
    event.preventDefault();
    event.persist();

    let encrypted = crypto
      .createHash("sha256")
      .update(event.target.password.value)
      .digest("hex");

    const user = {
      username: event.target.username.value,
      password: encrypted,
    };
    Axios({
      method: "post",
      url: "http://localhost:5000/login/api",
      data: user,
    }).then((response) => {
      localStorage.setItem("token", response.data.token);
    });
    setSignedIn(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <section>
      <h1>Login</h1>
      <form onSubmit={login}>
        <input type="text" name="username" placeholder="Username" />
        <input type="password" name="password" placeholder="Password" />
        <button>Login</button>
      </form>
      <button onClick={changeAccountStatus}>Don't Have an account yet?</button>
    </section>
  );
}
