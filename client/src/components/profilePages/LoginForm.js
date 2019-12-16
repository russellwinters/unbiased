import React from "react";

export default function LoginForm(props) {
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
    console.log(user);
  };

  return (
    <section>
      <h1>Login</h1>
      <form onSubmit={login}>
        <input type="text" name="username" placeholder="Username" />
        <input type="text" name="password" placeholder="Password" />
        <button>Login</button>
      </form>
      <button onClick={changeAccountStatus}>Don't Have an account yet?</button>
    </section>
  );
}
