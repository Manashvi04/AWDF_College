import { useState } from "react";

function Contact() {
  const [message, setMessage] = useState("");

  const [showHelp, setShowHelp] = useState(false);

  return (
    <div>
      <h1>Contact Me</h1>

      <input
        type="text"
        placeholder="Enter Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <h3>Live Preview</h3>

      <p>{message}</p>

      <p>Characters : {message.length}</p>
    </div>
  );
}

export default Contact;
