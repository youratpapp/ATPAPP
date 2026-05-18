import { useEffect, useState, type ReactNode } from "react";
import { EntityDrawer } from "./EntityDrawer";

type ResponsiveFilterSheetProps = {
  buttonLabel: ReactNode;
  children: ReactNode;
  eyebrow?: ReactNode;
  summary?: ReactNode;
  title: ReactNode;
};

function useIsMobileFilter() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia("(max-width: 760px)").matches
  );

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const onChange = () => setIsMobile(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

export function ResponsiveFilterSheet({ buttonLabel, children, eyebrow = "Filtros", summary, title }: ResponsiveFilterSheetProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobileFilter();

  useEffect(() => {
    if (!isMobile && open) setOpen(false);
  }, [isMobile, open]);

  return (
    <div className="responsive-filter-sheet">
      {!isMobile ? <div className="responsive-filter-inline">{children}</div> : null}
      {isMobile ? (
        <>
          <button className="responsive-filter-trigger" type="button" onClick={() => setOpen(true)}>
            <span>{buttonLabel}</span>
            {summary ? <small>{summary}</small> : null}
          </button>
          <EntityDrawer open={open} eyebrow={eyebrow} title={title} subtitle={summary} onClose={() => setOpen(false)}>
            <div className="responsive-filter-sheet-body">{children}</div>
          </EntityDrawer>
        </>
      ) : null}
    </div>
  );
}
