import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import styles from "./Hero.module.css";

export function Hero() {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -2; // Max 2deg rotation
    const rotateY = ((x - centerX) / centerX) * 2;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <div className={styles.textContent}>
          <h1 className={styles.title}>TaskFlow</h1>
          <p className={styles.subtitle}>Focus on what matters.</p>
          <Link to="/app" className={styles.cta}>
            <span>Enter Workspace</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div
        className={styles.visualContainer}
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${
            2 + rotation.x
          }deg) rotateY(${rotation.y}deg)`,
        }}
      >
        <div className={styles.appWindow}>
          <div className={styles.windowHeader}>
            <div className={styles.controls}>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
            </div>
            <div className={styles.addressBar}>taskflow.app</div>
          </div>
          <div className={styles.windowContent}>
            <img
              src="/screenshot.png"
              alt="TaskFlow App Interface"
              className={styles.appScreenshot}
            />
          </div>
          <div className={styles.reflection}></div>
        </div>
        <div className={styles.shadow}></div>
      </div>
    </section>
  );
}
