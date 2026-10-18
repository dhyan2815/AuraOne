// Top navigation — wordmark, section capsules, Ask Aura pill, quick-add, theme toggle and avatar menu; phone gets a floating pill nav + Aura FAB.

import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Moon, Sun, Plus, LogOut, Settings as SettingsIcon, Brain, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import Logo from "./Logo";
import { sections } from "./sections";

interface TopBarProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

const phoneItems = sections.filter((s) => s.key !== "know" && s.key !== "aura");
const menuItemClass =
  "flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] font-semibold outline-none data-[highlighted]:bg-step";

const TopBar = ({ theme, onToggleTheme }: TopBarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    if (user) {
      setUserName(user.user_metadata?.name || user.email?.split("@")[0] || "User");
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <>
      <header className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-2 px-4 py-4 md:px-6">
        <Link to="/dashboard" className="mr-4" aria-label="AuraOne home">
          <Logo textOnly />
        </Link>

        <nav className="hidden flex-wrap gap-1.5 md:flex" aria-label="Main">
          {sections.map((s) => (
            <NavLink
              key={s.path}
              to={s.path}
              style={{ "--c": `var(--${s.key})` } as React.CSSProperties}
              className={({ isActive }) => `lm-cap ${isActive ? "on" : ""}`}
            >
              <i />
              {s.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/chat"
            className="hidden min-w-[300px] items-center gap-2.5 rounded-full bg-sheet py-2 pl-[18px] pr-3 text-ink2 lg:flex"
          >
            Ask Aura to add, move or find…
          </Link>
          <Link to="/tasks/new" className="lm-round hidden md:grid" aria-label="New task">
            <Plus size={20} strokeWidth={2.6} />
          </Link>
          <button
            onClick={onToggleTheme}
            className="lm-round"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="grid h-[42px] w-[42px] flex-none place-items-center rounded-full bg-ink font-extrabold text-water"
                aria-label="Account menu"
              >
                {userName.charAt(0).toUpperCase()}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 min-w-[220px] rounded-[24px] bg-sheet p-2 text-ink shadow-2xl"
              >
                <div className="truncate px-3 py-2 text-sm font-bold text-ink2">{userName}</div>
                <DropdownMenu.Item className={`${menuItemClass} md:hidden`} onSelect={() => navigate("/knowledge")}>
                  <Brain size={18} /> Knowledge
                </DropdownMenu.Item>
                <DropdownMenu.Item className={menuItemClass} onSelect={() => navigate("/settings")}>
                  <SettingsIcon size={18} /> Settings
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className={`${menuItemClass} text-alert data-[highlighted]:bg-alert/10`}
                  onSelect={handleLogout}
                >
                  <LogOut size={18} /> Sign out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>

      {/* Phone: floating pill nav + Aura FAB */}
      <nav
        aria-label="Main"
        className="fixed bottom-4 left-4 right-20 z-40 flex items-center justify-around rounded-full bg-sheet p-1.5 shadow-xl md:hidden"
      >
        {phoneItems.map((s) => (
          <NavLink
            key={s.path}
            to={s.path}
            style={{ "--c": `var(--${s.key})` } as React.CSSProperties}
            className={({ isActive }) =>
              `rounded-full px-2.5 py-2 text-[13px] font-bold transition-colors ${isActive ? "bg-sec text-[#1F211E]" : "text-ink2"}`
            }
          >
            {s.label}
          </NavLink>
        ))}
      </nav>
      <Link
        to="/chat"
        aria-label="Ask Aura"
        className="fixed bottom-4 right-4 z-40 grid h-[52px] w-[52px] place-items-center rounded-full bg-aura text-[#1F211E] shadow-xl transition-transform active:scale-95 md:hidden"
      >
        <Sparkles size={22} />
      </Link>
    </>
  );
};

export default TopBar;
