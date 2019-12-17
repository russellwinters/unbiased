import React from "react";
import Axios from "axios";

export default function LoginForm(props) {
  const setSignedIn = props.setSignedIn;
  const setHasAccount = props.setHasAccount;
  const changeAccountStatus = () => {
    setHasAccount(false);
  };

  const login = event => {
    event.preventDefault();
    event.persist();
    const user = {
      username: event.target.username.value,
      password: event.target.password.value
    };
    Axios({
      method: "post",
      url: "http://localhost:5000/login/api",
      data: user
    }).then(response => {
      localStorage.setItem("token", response.data.token);
    });
    setSignedIn(true);
    window.location.reload();
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
