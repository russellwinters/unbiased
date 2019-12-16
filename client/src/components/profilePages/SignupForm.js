import React from "react";
import axios from "axios";

export default function SignupForm() {
  //Basic registration form that's not asking for anything specific from the username or password
  const register = event => {
    event.preventDefault();
    event.persist();
    let user = {};
    if (event.target.password.value === event.target.passwordCheck.value) {
      user.username = event.target.username.value;
      user.password = event.target.password.value;
      axios({
        method: "post",
        url: "http://localhost:5000/register/api",
        data: user
      }).then(response => console.log("success"));
    } else console.log("error");
  };

  return (
    <section>
      <h1>Sign Up</h1>
      <form onSubmit={register}>
        <input type="text" name="username" placeholder="Username" />
        <input type="password" name="password" placeholder="Password" />
        <input
          type="password"
          name="passwordCheck"
          placeholder="Confirm Password"
        />
        <button>Register</button>
      </form>
    </section>
  );
}
