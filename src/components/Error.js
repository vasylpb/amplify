import React from "react";

const Error = ({ errors }) => {
  return (
    <pre className="error">
      {errors.map(({ message }, index) => (
        <div key={index}>{message}</div>
      ))}
    </pre>
  );
};

export default Error;
