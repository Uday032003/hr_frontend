import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import "./index.css";

const Header = () => {
  const jwtToken = Cookies.get("jwt_Token");
  const [theme, setTheme] = useState(
    document.documentElement.getAttribute("data-theme")?.toUpperCase() ||
      "DARK",
  );
  const logoUrl =
    theme === "DARK"
      ? "https://res.cloudinary.com/dnxaaxcjv/image/upload/v1764162107/ecoaiLogoDark_ahwsnk.png"
      : "https://res.cloudinary.com/dnxaaxcjv/image/upload/v1764162107/ecoaiLogoLight_gdh2f2.png";
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const currentTheme = document.documentElement
        .getAttribute("data-theme")
        ?.toUpperCase();
      setTheme(currentTheme);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="ecoai-header-bg-container">
      <img
        className="ecoai-header-logo"
        alt="ECO AI"
        src={logoUrl}
        onClick={() => navigate(jwtToken ? "/" : "/admin-dashboard")}
      />
    </div>
  );
};

export default Header;
