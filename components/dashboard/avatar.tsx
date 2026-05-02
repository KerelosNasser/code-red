import React from "react"

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const colors = [
    "#1e3a5f",
    "#9b1c1f",
    "#2d6a4f",
    "#7b2d8b",
    "#b5541a",
    "#1a5c7a",
  ]
  const color = colors[name.charCodeAt(0) % colors.length]

  const cls = size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs"

  return (
    <div
      className={`${cls} flex shrink-0 items-center justify-center rounded-full font-bold text-white`}
      style={{ background: color }}
    >
      {initials}
    </div>
  )
}
