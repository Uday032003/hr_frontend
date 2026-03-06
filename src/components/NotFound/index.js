import { Link } from "react-router-dom";

import "./index.css";

const NotFound = () => (
  <div className="ecoai-not-found-page">
    <h1>Page Not Found</h1>
    <Link to="/">
      <button className="ecoai-not-found-btn">Go to home page</button>
    </Link>
  </div>
);

export default NotFound;
