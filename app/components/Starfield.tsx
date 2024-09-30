import React, { useEffect, useRef } from "react";

// Define the props type
interface StarfieldProps {
  starsCount: number;
}

// Define the star properties for better type safety
interface Star {
  left: number;
  top: number;
  sizeX: number;
  sizeY: number;
  speed: number;
  z: number;
  starColor: string;
  glowColor: string; // Glow color from CSS variables
}

// Optimized function to generate starfield with depth (z-axis movement)
const generateStars = (canvas: HTMLCanvasElement, starsCount: number): Star[] => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  const stars: Star[] = [];
  const { width, height } = canvas;

  // Initialize stars with properties (including z-axis for depth)
  for (let i = 0; i < starsCount; i++) {
    const isFast = Math.random() < 0.1;
    const isSlow = Math.random() < 0.15;
    const sizeX = isSlow ? (Math.random() * 1 + 1) : (Math.random() * 1.5 + 0.5);
    const sizeY = isSlow ? (Math.random() * 1 + 1) : (Math.random() * 1.5 + 0.5);
    const speed = isFast ? (Math.random() * 2 + 1) : isSlow ? (Math.random() * 18 + 15) : (Math.random() * 6 + 4);
    const left = Math.random() * width;
    const top = Math.random() * height;
    const z = Math.random() * 2000 + 500; // Random depth (far to close)
    const starColor = Math.random() > 0.85 ? "var(--custom-yellow)" : "white"; // 15% yellow, 85% white
    const glowColor = `var(--glow-color-${Math.floor(Math.random() * 3) + 1})`; // Glow from CSS variables

    stars.push({
      left,
      top,
      sizeX,
      sizeY,
      speed,
      z, // Add z for depth
      starColor,
      glowColor,
    });
  }

  return stars;
};

// Animation loop using requestAnimationFrame (moving stars from background to foreground)
const animateStars = (canvas: HTMLCanvasElement, stars: Star[]) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { width, height } = canvas;

  // Animation loop
  const animate = () => {
    ctx.clearRect(0, 0, width, height);

    // Update and draw stars
    stars.forEach((star) => {
      star.z -= star.speed * 0.123; // Move slower (quarter speed)
      if (star.z < 1) star.z = 2000; // Reset star when it gets too close

      // Calculate perspective scaling based on z-axis depth
      const scale = 500 / star.z;
      const x = (star.left - width / 2) * scale + width / 2;
      const y = (star.top - height / 2) * scale + height / 2;

      // Draw star with neon glow and blur closer to lens
      ctx.fillStyle = star.starColor;
      ctx.beginPath();
      ctx.ellipse(x, y, star.sizeX * scale, star.sizeY * scale, 0, 0, 2 * Math.PI);
      ctx.fill();

      // Apply glow and blur based on depth (closer stars have stronger glow and blur)
      ctx.shadowColor = star.glowColor;
      ctx.shadowBlur = Math.max(30 * scale, 15); // Adjust glow and blur effect based on depth
      ctx.fill();
    });

    requestAnimationFrame(animate); // Continue the animation loop
  };

  requestAnimationFrame(animate); // Start the animation
};

const Starfield: React.FC<StarfieldProps> = ({ starsCount }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to fill the screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Generate and animate stars
    const stars = generateStars(canvas, starsCount);
    animateStars(canvas, stars || []);
  }, [starsCount]);

  return <canvas ref={canvasRef} className="w-full h-screen absolute top-0 left-0"></canvas>; // Full-screen canvas for starfield
};

export default Starfield;
