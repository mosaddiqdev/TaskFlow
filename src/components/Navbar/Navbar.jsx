import React from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";

export function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>TF</div>
      <Link to="/app" className={styles.link}>
        Enter App
      </Link>
    </nav>
  );
}
