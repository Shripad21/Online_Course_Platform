import React from "react";
import { Link } from "react-router-dom";
import Logo from "../Logo";
import logoPath from "../../assets/images/logo.jpg";

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Logo and Basic Info */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 flex items-center space-x-4">
            <Logo width="100px" logoPath={logoPath} />
            <p className="text-sm">&copy; 2024. All Rights Reserved.</p>
          </div>

          {/* Quick Links */}
          <div className="flex space-x-8">
            <div>
              <h3 className="text-sm font-semibold uppercase text-gray-400 mb-4">
                Company
              </h3>
              <ul>
                <li className="mb-2">
                  <Link
                    to="/features"
                    className="text-sm hover:text-gray-100 transition"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pricing"
                    className="text-sm hover:text-gray-100 transition"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase text-gray-400 mb-4">
                Support
              </h3>
              <ul>
                <li className="mb-2">
                  <Link
                    to="/help"
                    className="text-sm hover:text-gray-100 transition"
                  >
                    Help
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-sm hover:text-gray-100 transition"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase text-gray-400 mb-4">
                Legal
              </h3>
              <ul>
                <li className="mb-2">
                  <Link
                    to="/terms"
                    className="text-sm hover:text-gray-100 transition"
                  >
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="text-sm hover:text-gray-100 transition"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Powered by Appwrite</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
