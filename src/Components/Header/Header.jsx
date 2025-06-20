import React, { useRef, useEffect, useContext, useState } from "react";
import { Container, Row } from "reactstrap";
import { NavLink, Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { AuthContext } from "../../context/AuthContext";
import "./header.css";

const nav__links = [
  {
    path: "/",
    display: "Home",
  },
  {
    path: "/about",
    display: "About",
  },
  {
    path: "/blogs",
    display: "Blogs",
  },
  {
    path: "/gallery",
    display: "Gallery",
  },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to keep track of menu open/close
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const { user, logout: signout } = useContext(AuthContext);

  const logout = () => {
    signout()
    window.location.href = '/'
  };

  const stickyHeaderFunc = () => {
    window.addEventListener("scroll", () => {
      if (headerRef.current) {
        if (
          document.body.scrollTop > 80 ||
          document.documentElement.scrollTop > 80
        ) {
          headerRef.current.classList?.add("sticky__header");
        } else {
          headerRef.current.classList?.remove("sticky__header");
        }
      }
    });
  };

  useEffect(() => {
    stickyHeaderFunc();
    return () => window.removeEventListener("scroll", stickyHeaderFunc);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen); // Toggle menu open/close state

  return (
    <header className="header" ref={headerRef}>
      <Container>
        <Row>
          <div className="nav__wrapper d-flex align-items-center justify-content-between">
            <div className="logo">
              <Link to="/">
                <img src={logo} alt="Logo" />
              </Link>
            </div>
            {/*Menu start */}
            <div className={`navigation ${isMenuOpen ? "show__menu" : ""}`} ref={menuRef} onClick={toggleMenu}>
              <ul className="menu d-flex align-items-center gap-5">
                {nav__links.map((item, index) => {
                  return (
                    <li className="nav__item" key={index}>
                      <NavLink
                        to={item.path}
                        className={(navClass) =>
                          navClass.isActive ? "active__link" : ""
                        }
                      >
                        {item.display}
                      </NavLink>
                    </li>
                  );
                })}
                {user ? (
                  <>
                    <li className="nav__item">
                      <NavLink
                        to="/add-blog"
                        className={(navClass) =>
                          navClass.isActive ? "active__link" : ""
                        }
                      >
                        Add Blog
                      </NavLink>
                    </li>
                    <li className="nav__item user-info">
                      <span className="username">
                        <i className="ri-user-line"></i> {user.username}
                      </span>
                    </li>
                    <li className="nav__item">
                      <button className="logout__btn" onClick={logout}>
                        <i className="ri-logout-box-line"></i> Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav__item">
                      <NavLink
                        to="/login"
                        className={(navClass) =>
                          navClass.isActive ? "active__link" : ""
                        }
                      >
                        Login
                      </NavLink>
                    </li>
                    <li className="nav__item">
                      <NavLink
                        to="/signup"
                        className={(navClass) =>
                          navClass.isActive ? "active__link" : ""
                        }
                      >
                        Signup
                      </NavLink>
                    </li>
                  </>
                )}
              </ul>
            </div>
            {/*Menu end */}
          </div>
        </Row>
      </Container>
    </header>
  );
};

export default Header;
