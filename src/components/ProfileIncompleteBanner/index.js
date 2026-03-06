import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

import "./index.css";

const ProfileIncompleteBanner = () => {
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate();
  const jwtToken = Cookies.get("jwt_Token");

  useEffect(() => {
    const fetchUserDetails = async () => {
      const options = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      };
      try {
        const response = await fetch(
          "http://localhost:3001/user-details",
          options,
        );
        if (response.ok) {
          const data = await response.json();
          setUserDetails({
            name: data.name,
            username: data.username,
          });
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (jwtToken) {
      fetchUserDetails();
    }
  }, [jwtToken]);

  if (!userDetails) return null;

  if (userDetails.name && userDetails.username) return null;

  return (
    <div className="ecoai-profile-incomplete-banner">
      <span>
        ⚠️ Please complete your profile to continue using all features.
      </span>
      <button
        type="button"
        onClick={() => navigate("/user-account-details")}
        className="ecoai-update-profile-btn"
      >
        Update Profile
      </button>
    </div>
  );
};

export default ProfileIncompleteBanner;
