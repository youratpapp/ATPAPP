import { useLocation, useNavigate } from "react-router-dom";

type NavItem = {
  path: string;
  label: string;
  icon: string;
};

const ITEMS: NavItem[] = [
  { path: "/inicio", label: "Início", icon: "⌂" },
  { path: "/eventos", label: "Eventos", icon: "🏆" },
  { path: "/locais", label: "Locais", icon: "◉" },
  { path: "/ranking", label: "Ranking", icon: "★" },
  { path: "/perfil", label: "Perfil", icon: "👤" },
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {ITEMS.map((item) => {
        const active = pathname.startsWith(item.path);
        return (
          <button
            key={item.path}
            className={active ? "active" : ""}
            onClick={() => navigate(item.path)}
            aria-current={active ? "page" : undefined}
          >
            <span className="nav-icon" aria-hidden>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
