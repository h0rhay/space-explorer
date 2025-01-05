import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import "./styles/global.css";

import "./tailwind.css";
import "./styles/starfield.css";
import "./styles/apod_tile.css";
import './styles/space_heading.css'

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Dosis:wght@300;400;500;600;700&display=swap",
  },
  {
    rel: "preload",
    href: "/fonts/MachineStd-Bold.woff2",  // Update with your font path
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous"
  }
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased text-gray-900 bg-custom-black">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="text-custom-cyan bg-custom-black">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
