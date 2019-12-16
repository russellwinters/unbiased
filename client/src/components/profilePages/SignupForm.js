import React from "react";

export default function LoginForm() {
  return (
    <section>
      <h1>Sign Up</h1>
      <form>
        <input type="text" name="username" placeholder="Username" />
        <input type="text" name="password" placeholder="Password" />
        <input
          type="text"
          name="passwordCheck"
          placeholder="Confirm Password"
        />
        <button>Register</button>
      </form>
    </section>
  );
}
