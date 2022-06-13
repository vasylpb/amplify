import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Amplify from "aws-amplify";
import aws_exports from "./aws-exports";
import "react-toastify/dist/ReactToastify.css";

Amplify.configure(aws_exports);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
