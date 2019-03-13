import React from "react";
import ReactDOM from "react-dom";

import router from "./router.js";
import App from "./components/App.jsx";

router.init();
const app = ReactDOM.render(<App/>, document.getElementById("app"));
