import React, { useState } from "react";
import { Container, Logo, LogoutBtn } from "../index";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "@fortawesome/fontawesome-free/css/all.min.css";
import logoPath from "../../assets/images/logo.jpg";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const authStatus = useSelector((state) => state.auth.status);
  const user = useSelector((state) => state.auth.userData);
  const role = user?.role;
  const navigate = useNavigate();
  console.log(role);
  const navItems = [
    { name: "Home", slug: "/", active: true },
    { name: "Login", slug: "/login", active: !authStatus },
    { name: "Signup", slug: "/signup", active: !authStatus },
    { name: "All Courses", slug: "/all-courses", active: authStatus && role === "student" },
    { name: "Add Course", slug: "/add-course", active: authStatus && role === "teacher" },
    { name: "Add Lesson", slug: "/add-lesson", active: authStatus && role === "teacher" },
    { name: "Your Courses", slug: "/your-courses", active: authStatus && role === "teacher" },
    { name: "My Courses", slug: "/my-courses", active: authStatus && role === "student" },
    { name: "Admin Dashboard", slug: "/admin", active: authStatus && role === "admin" }, 
    { name: "Profile", slug: role === "student" ? "/student-profile" : "/teacher-profile", active: authStatus && (role === "student" || role === "teacher") },

  ];

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <header className="py-3 shadow-lg bg-gray-800 text-white">
      <Container noBackground noPaddingY>
        <nav className="flex items-center justify-between">
          <Link to="/">
            <Logo width="70px" logoPath={logoPath} />
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center space-x-6">
            {navItems.map(
              (item) =>
                item.active && (
                  <li key={item.name}>
                    <button
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition duration-200"
                      onClick={() => navigate(item.slug)}
                    >
                      {item.name}
                    </button>
                  </li>
                )
            )}
            {authStatus && (
              <li>
                <LogoutBtn />
              </li>
            )}
          </ul>

          {/* Mobile Button */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle navigation"
          >
            <i className="fas fa-bars text-2xl"></i>
          </button>
        </nav>

        {/* Mobile Menu */}
        <div
          className={`md:hidden mt-2 transition-all transform ${
            isMenuOpen
              ? "max-h-screen opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <ul className="flex flex-col space-y-2">
            {navItems.map(
              (item) =>
                item.active && (
                  <li key={item.name}>
                    <button
                      className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition duration-200"
                      onClick={() => {
                        navigate(item.slug);
                        setIsMenuOpen(false);
                      }}
                    >
                      {item.name}
                    </button>
                  </li>
                )
            )}
            {authStatus && (
              <li>
                <LogoutBtn />
              </li>
            )}
          </ul>
        </div>
      </Container>
    </header>
  );
}

export default Header;
