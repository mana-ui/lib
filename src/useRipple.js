import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  ripple: `
  position: absolute;
  border-radius: 50%;
  display: inline-block;
  left: 0;
  top: 0;
  `,
});

const Ripple = ({ color, init, end, initialSize, onAnimationEnd }) => {
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
  const classes = useStyles();
  return (
    <motion.div
      initial="initial"
      animate={["fg-radius-in", "fg-opacity-in"]}
      exit="fg-opacity-out"
      variants={variants}
      onAnimationComplete={onAnimationEnd}
      className={classes.ripple}
      style={{
        width: initialSize,
        height: initialSize,
        background: color,
      }}
    />
  );
};

export default (color = "#000") => {
  const surfaceRef = useRef();
  const pointerUp = useRef()
  const animationEnd = useRef()
  const [ripple, setRipple] = useState(null);
  const handler = useCallback(() => {
    if (pointerUp.current && animationEnd.current) {
      setRipple(null);
    }
  }, []);
  const pointerUpHandler = useCallback(() => {
    pointerUp.current = true
    document.removeEventListener("pointerup", pointerUpHandler);
    handler()
  }, [handler])
  useEffect(() => {
    if (surfaceRef.current) {
      const node = surfaceRef.current;
      const ripple = async (event) => {
        pointerUp.current = false
        animationEnd.current = false
        const left = event.clientX - node.offsetLeft;
        const top = event.clientY - node.offsetTop;

        const width = node.offsetWidth,
          height = node.offsetHeight;
        const maxDim = Math.max(width, height);
        const maxRadius =
          Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)) + 10;
        const initialSize = Math.floor(maxDim * 0.6);
        const initialRadius = initialSize / 2;
        document.addEventListener("pointerup", pointerUpHandler);
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
      node.addEventListener("pointerdown", ripple);
      return () => {
        node.removeEventListener("pointerdown", ripple);
      };
    }
  });
  return [
    surfaceRef,
    <AnimatePresence>
      {ripple && <Ripple {...ripple} onAnimationEnd={() => {
        animationEnd.current = true
        handler()
      }} color={color} />}
    </AnimatePresence>,
  ];
};
