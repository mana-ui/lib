import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Ripple = ({ color, init, end, initialSize }) => {
  const variants = {
    initial: {
      opacity: 0,
      scale: 1,
      ...init,
    },
    "fg-radius-in": {
      ...end,
      transition: {
        duration: 0.225,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    "fg-opacity-in": {
      opacity: 0.12,
      transition: { duration: 0.075 },
    },
    "fg-opacity-out": {
      opacity: 0,
      transition: { duration: 0.15 },
    },
  };
  return (
    <motion.div
      initial="initial"
      animate={["fg-radius-in", "fg-opacity-in"]}
      exit="fg-opacity-out"
      variants={variants}
      style={{
        width: initialSize,
        height: initialSize,
        position: "absolute",
        borderRadius: "50%",
        background: color,
        display: "inline-block",
        left: 0,
        top: 0,
      }}
    />
  );
};

export default (color = "#000") => {
  const surfaceRef = useRef();
  const [ripple, setRipple] = useState(null);
  useEffect(() => {
    if (surfaceRef.current) {
      const node = surfaceRef.current;
      const ripple = (event) => {
        const left = event.clientX - node.offsetLeft;
        const top = event.clientY - node.offsetTop;

        const width = node.offsetWidth,
          height = node.offsetHeight;
        const maxDim = Math.max(width, height);
        const maxRadius =
          Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)) + 10;
        const initialSize = Math.floor(maxDim * 0.6);
        const initialRadius = initialSize / 2;
        const handler = () => {
          document.removeEventListener("mouseup", handler);
          setRipple(null);
        };
        document.addEventListener("mouseup", handler);
        setRipple({
          initialSize,
          init: {
            x: left - initialRadius,
            y: top - initialRadius,
          },
          end: {
            x: width / 2 - initialRadius,
            y: height / 2 - initialRadius,
            scale: maxRadius / initialSize,
          },
        });
      };
      node.addEventListener("mousedown", ripple);
      return () => {
        node.removeEventListener("mousedown", ripple);
      };
    }
  });
  return [
    surfaceRef,
    <AnimatePresence>
      {ripple && <Ripple {...ripple} color={color} />}
    </AnimatePresence>,
  ];
};
