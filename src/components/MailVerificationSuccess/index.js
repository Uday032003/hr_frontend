import { useState } from "react";
import { IoCheckmarkCircle } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

import "./index.css";

const MailVerificationSuccess = () => {
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  const clickedGoToLoginBtn = () => {
    setFadeOut(true);
    setTimeout(() => {
      navigate("/login");
    }, 400);
  };

  return (
    <div
      className={`ecoai-mail-verification-success-container ${
        fadeOut ? "verification-fade-out" : "verification-fade-in"
      }`}
    >
      <div className="ecoai-mail-verification-success-inner-container">
        <span className="ecoai-mail-verification-success-text">
          <IoCheckmarkCircle size={40} color="#4CAF50" />
          Verification Successful
        </span>
        <button
          type="button"
          className="ecoai-mail-verification-success-btn"
          onClick={clickedGoToLoginBtn}
        >
          Go to Login Page
        </button>
      </div>
    </div>
  );
};

export default MailVerificationSuccess;
