import React, { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "100px",
      background = "rgba(0, 0, 0, 1)",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
          } as CSSProperties
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)]",
          "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
          className,
        )}
        ref={ref}
        {...props}
      >
        {/* spark container */}
        <div
          className={cn(
            "-z-30 blur-[2px]",
            "absolute inset-0 overflow-visible",
          )}
        >
          {/* spark */}
          <div className="absolute inset-0 h-full w-full animate-shimmer-slide">
            {/* spark before */}
            <div 
              className="animate-spin-around absolute -inset-full w-auto rotate-0" 
              style={{
                background: `conic-gradient(from calc(270deg - (var(--spread) * 0.5)), transparent 0, var(--shimmer-color) var(--spread), transparent var(--spread))`,
              }}
            />
          </div>
        </div>

        {/* Content */}
        <span className="relative z-10">{children}</span>

        {/* Highlight */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-[inherit]",
            "shadow-[inset_0_-8px_10px_rgba(255,255,255,0.12)]",
            "transform-gpu transition-all duration-300 ease-in-out",
            "group-hover:shadow-[inset_0_-6px_10px_rgba(255,255,255,0.25)]",
            "group-active:shadow-[inset_0_-10px_10px_rgba(255,255,255,0.25)]",
          )}
        />

        {/* backdrop */}
        <div
          className="absolute -z-20"
          style={{
            background: "var(--bg)",
            borderRadius: "var(--radius)",
            inset: "var(--cut)"
          }}
        />
      </button>
    );
  },
);

ShimmerButton.displayName = "ShimmerButton";

export { ShimmerButton }; 