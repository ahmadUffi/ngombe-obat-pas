import { auth } from "./firebase"; // Assuming you have firebaseConfig.js set up
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

const Singup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  console.log(email);

  const handleSignUp = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Handle successful sign-up (e.g., redirect to a different page)
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <form onSubmit={handleSignUp}>
        {" "}
        {/* Add onSubmit handler */}
        {/* email */}
        <label htmlFor="email">email:</label>
        <input
          type="text"
          id="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password">password</label>
        <input
          type="password"
          id="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Submit</button>
        {/* Display error message */}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </>
  );
};

export default Singup;
