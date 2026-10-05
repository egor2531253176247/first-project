"use client";
import { useId } from "react";
export function CarModel({
  color = "#353638",
  finish = "Satin",
  body = "coupe",
}: {
  color?: string;
  finish?: string;
  body?: string;
}) {
  const id = useId().replace(/:/g, "");
  const suv = body === "suv";
  const bodyPath = suv
    ? "M74 245 95 188 144 178 203 105 409 101 493 170 568 184 602 226 596 258 523 266 97 266Z"
    : "M66 250 91 216 153 203 230 137 384 133 480 197 556 211 606 237 604 260 518 269 95 269Z";
  return (
    <svg
      className="car-model"
      viewBox="0 0 680 360"
      role="img"
      aria-label={`Концепция ${body === "suv" ? "внедорожника" : "спортивного автомобиля"}, ${finish}`}
    >
      <defs>
        <linearGradient id={id + "paint"} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor={color} />
          <stop offset=".4" stopColor={color} />
          <stop offset="1" stopColor="#111" />
        </linearGradient>
        <linearGradient id={id + "glass"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#677681" />
          <stop offset=".45" stopColor="#26323b" />
          <stop offset="1" stopColor="#0b1015" />
        </linearGradient>
        <linearGradient id={id + "shine"}>
          <stop
            stopColor="white"
            stopOpacity={finish === "Matte" ? ".1" : ".6"}
          />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={id + "wheel"}>
          <stop stopColor="#696969" />
          <stop offset=".25" stopColor="#222" />
          <stop offset=".7" stopColor="#7a7a7a" />
          <stop offset=".78" stopColor="#171717" />
          <stop offset="1" stopColor="#080808" />
        </radialGradient>
        <pattern
          id={id + "carbon"}
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0 0h3v3H0Zm3 3h3v3H3Z" fill="#bbb" opacity=".18" />
        </pattern>
      </defs>
      <ellipse cx="343" cy="300" rx="280" ry="16" fill="#000" opacity=".9" />
      <path
        d={bodyPath}
        fill={`url(#${id}paint)`}
        stroke="#a3a3a3"
        strokeOpacity=".35"
        strokeWidth="1.3"
      />
      {finish === "Carbon" && <path d={bodyPath} fill={`url(#${id}carbon)`} />}
      {suv ? (
        <>
          <path d="m173 177 51-59 98-2 2 59Z" fill={`url(#${id}glass)`} />
          <path d="m334 116 69 1 72 61-140-3Z" fill={`url(#${id}glass)`} />
        </>
      ) : (
        <>
          <path
            d="m181 200 58-51 66-4 3 53Z"
            fill={`url(#${id}glass)`}
            stroke="#888"
            strokeWidth=".8"
          />
          <path
            d="m321 144 54 1 82 55-133-2Z"
            fill={`url(#${id}glass)`}
            stroke="#888"
            strokeWidth=".8"
          />
        </>
      )}
      <path
        d={
          suv
            ? "M326 110 328 244 466 242 474 178"
            : "M315 143 324 246 455 244 464 202"
        }
        fill="none"
        stroke="#000"
        strokeOpacity=".6"
      />
      <path
        d="M108 218c152 15 298 8 455 6"
        fill="none"
        stroke={`url(#${id}shine)`}
        strokeWidth="2"
      />
      <path d="M79 251c150 15 303 24 521 5l-8 16H93Z" fill="#0d0d0d" />
      <path d="m95 211 35-10-6 11-35 9Z" fill="#f3f3ee" stroke="#aaa" />
      <path d="m564 211 25 13-3 6-27-13Z" fill="#bd1e22" />
      <path
        d="m345 208 24 0"
        stroke="#969696"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="m279 190 20-4 7 8-30 4Z"
        fill="#1c1c1c"
        stroke="#777"
        strokeWidth="1"
      />
      {[170, 504].map((x, i) => (
        <g key={x}>
          <circle
            cx={x}
            cy="262"
            r="47"
            fill="#060606"
            stroke="#151515"
            strokeWidth="4"
          />
          <circle cx={x} cy="262" r="36" fill={`url(#${id}wheel)`} />
          <circle
            cx={x}
            cy="262"
            r="27"
            fill="#121212"
            stroke="#999"
            strokeWidth="1.5"
          />
          {Array.from({ length: 10 }, (_, j) => (
            <path
              key={j}
              d={`M${x - 3} 257l-3-23h5l7 25Z`}
              fill="#a2a2a2"
              transform={`rotate(${j * 36} ${x} 262)`}
            />
          ))}
          <path
            d={`M${x + 15} 245v28`}
            stroke={i ? "#a62822" : "#a62822"}
            strokeWidth="5"
          />
          <circle cx={x} cy="262" r="8" fill="#2f2f2f" stroke="#999" />
        </g>
      ))}
      <path d="M215 266h248" stroke="#444" strokeWidth="2" />
      {!suv && (
        <path
          d="m504 189 57-1 1 6-58 2Z"
          fill="#252525"
          stroke="#666"
          strokeWidth="1"
        />
      )}
    </svg>
  );
}
