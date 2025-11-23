import { Navbar } from "../../components/Navbar/Navbar";
import { Hero } from "../../components/Hero/Hero";
import styles from "./LandingPage.module.css";

export function LandingPage() {
  return (
    <div className={styles.container}>
      <div className={styles.spotlight}></div>
      <Navbar />
      <main className={styles.main}>
        <Hero />
      </main>
    </div>
  );
}
