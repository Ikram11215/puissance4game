"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IoGameController, IoSunny, IoMoon, IoLogOut, IoPersonCircle, IoTrophy } from "react-icons/io5";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [theme, setTheme] = useState("light");
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="navbar bg-base-100 shadow-lg">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl flex items-center gap-2">
          <IoGameController className="text-2xl" />
          Puissance 4
        </Link>
      </div>
      <div className="flex-none gap-2">
        <label className="swap swap-rotate">
          <input
            type="checkbox"
            onChange={toggleTheme}
            checked={theme === "dark"}
          />
          <IoSunny className="swap-off h-6 w-6" />
          <IoMoon className="swap-on h-6 w-6" />
        </label>

        {user ? (
          <>
            <Link href="/leaderboard" className="btn btn-ghost btn-sm gap-2">
              <IoTrophy className="text-lg" />
              <span className="hidden md:inline">Classement</span>
            </Link>
            <Link href="/lobby" className="btn btn-primary btn-sm gap-2">
              <IoGameController className="text-lg" />
              <span className="hidden md:inline">Jouer</span>
            </Link>
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost flex items-center gap-2">
                <IoPersonCircle className="text-2xl" />
                <span className="hidden md:inline">{user.firstname} {user.lastname}</span>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                <li className="menu-title">
                  <span>{user.pseudo}</span>
                </li>
                <li><a>{user.email}</a></li>
                <li>
                  <Link href="/history">Historique</Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="text-error">
                    <IoLogOut className="text-lg" />
                    Déconnexion
                  </button>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <ul className="menu menu-horizontal px-1">
            <li>
              <Link href="/login">Connexion</Link>
            </li>
            <li>
              <Link href="/register" className="btn btn-primary ml-2">
                Inscription
              </Link>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

