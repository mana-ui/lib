import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const classes = useStyles();
  return (
    <motion.div
      initial="initial"
      animate={["fg-radius-in", "fg-opacity-in"]}
      exit="fg-opacity-out"
      variants={variants}
      className={classes.ripple}
      style={{
        width: initialSize,
        height: initialSize,
        background: color,
      }}
    />
  );
};

const resolveArgs = (arg) => {
  if (typeof arg === 'string') {
    return {color: arg}
  }
  return arg
}

export default (arg) => {
  const {color, center = false, disabled = false} = resolveArgs(arg)
  const surfaceRef = useRef();
	const [pointerDown, setPointerDown] = useState(null)
  const pressUpHandler = useCallback(() => {
		setPointerDown(null);
  }, []);
  useEffect(() => {
    if (surfaceRef.current && !disabled) {
      const node = surfaceRef.current;
			const press = ({clientX, clientY}) => {
        setPointerDown({x: clientX, y: clientY})
      }
      node.addEventListener("pointerdown", press);
      return () => {
        node.removeEventListener("pointerdown",press);
      };
    }
  });
	useEffect(() => {
		if (pointerDown) {
			document.addEventListener("pointerup", pressUpHandler);
			return () => {
				document.removeEventListener("pointerup", pressUpHandler);
			}
		}
	}, [pointerDown])
	const ripple = useMemo(() => {
		if (!pointerDown) return null
		const node = surfaceRef.current
		const rect = node.getBoundingClientRect()
		const width = node.offsetWidth,
			height = node.offsetHeight;
		const left = center ?  width/ 2:  pointerDown.x- rect.left;
		const top = center ? height / 2: pointerDown.y - rect.top;

		const maxDim = Math.max(width, height);
		const maxRadius =
			Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
		const initialSize = Math.floor(maxDim * 0.6);
		const initialRadius = initialSize / 2;
		return {
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
		};
	}, [pointerDown])
  return [
    surfaceRef,
    <AnimatePresence>
      {ripple && <Ripple {...ripple} color={color} />}
    </AnimatePresence>,
  ];
};
