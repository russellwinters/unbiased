import React from "react";
import axios from "axios";
import crypto from "crypto";

export default function SignupForm(props) {
  const setHasAccount = props.setHasAccount;
  const changeAccountStatus = () => {
    setHasAccount(true);
  };

  //Basic registration form that's not asking for anything specific from the username or password
  const register = (event) => {
    event.preventDefault();
    event.persist();
    let user = {};

    //!Have to encrypt passwords

    if (event.target.password.value.length < 8) {
      console.log("The password has to be greater than 8 characters");
    } else if (
      event.target.password.value === event.target.passwordCheck.value
    ) {
      let encrypted = crypto
        .createHash("sha256")
        .update(event.target.password.value)
        .digest("hex");

      user.username = event.target.username.value;
      user.password = encrypted;
      axios({
        method: "post",
        url: "http://localhost:5000/register/api",
        data: user,
      }).then((response) => console.log("success"));
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
      <button onClick={changeAccountStatus}>Have an Account?</button>
    </section>
  );
}
