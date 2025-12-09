"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, Dot, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarProps, SidebarItem } from "@/interfaces/components/common/navigation/sidebar";
import { DynamicRenderer } from "@/components/DynamicRenderer";
import { useAppContext } from "@/context/AppContext";

// --- Collapsible Item Hook ---
const useCollapsible = (defaultOpen = false) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  return { isOpen, toggle: () => setIsOpen(!isOpen) };
};

// --- The Sidebar's Visual Component ---
const SidebarUI: React.FC<
  SidebarProps & { isCollapsed: boolean; toggleCollapsed?: () => void; isMobile?: boolean; classes?: string; basePath?: string }
> = ({
  logo,
  content,
  profile,
  collapsible,
  isCollapsed,
  toggleCollapsed,
  isMobile = false,
  classes,
  basePath = "",
}) => {
  const CollapsibleItem: React.FC<{ item: any }> = ({ item }) => {
    const { isOpen, toggle } = useCollapsible(item.defaultOpen);
    return (
      <div className="w-full">
        <button
          onClick={toggle}
          className={cn(
            "flex w-full items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none",
            isCollapsed && !isMobile && "justify-center"
          )}
        >
          <div className="flex items-center">
            <span className={cn(
              "flex-shrink-0",
              !(isCollapsed && !isMobile) && "mr-3"
            )}>
              <DynamicRenderer component={item.icon} />
            </span>
            <span className={cn("truncate", isCollapsed && "opacity-0 w-0")}>
              {item.label}
            </span>
          </div>
          {!(isCollapsed && !isMobile) && (
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "rotate-90"
              )}
            />
          )}
        </button>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isOpen ? "max-h-screen" : "max-h-0",
            isCollapsed && "hidden"
          )}
        >
          <div className="pl-8 pt-2 space-y-1">
            {item.content.map((sub: any) => (
              <Link
                key={sub.uuid}
                href={`${basePath}${sub.href}`}
                className={cn(
                  "flex items-center p-2 rounded-md text-sm",
                  sub.active
                    ? "font-semibold text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <Dot className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{sub.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full border-r bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100",
        isMobile ? "w-64" : isCollapsed ? "w-0 min-w-0 p-0" : "w-64",
        "transition-all duration-300 ease-in-out",
        isCollapsed && !isMobile && "border-r-0 overflow-hidden",
        classes
      )}
    >
      {/* close button in mobile */}
      {isMobile && toggleCollapsed && (
        <button
          onClick={toggleCollapsed}
          className="absolute top-4 right-4 p-2"
          aria-label="Close menu"
        >
          <X size={24} />
        </button>
      )}

      {/* logo/header */}
      <div className="flex items-center h-16 px-4 border-b dark:border-gray-700 shrink-0">
        <Link href={logo.href ? `${basePath}${logo.href}` : "#"} className="flex items-center gap-3 overflow-hidden">
          <DynamicRenderer component={logo.icon} />
          <span
            className={cn(
              "font-bold text-lg whitespace-nowrap transition-opacity",
              isCollapsed && !isMobile && "opacity-0"
            )}
          >
            {logo.text}
          </span>
        </Link>
      </div>

      {/* nav: only scrollable when not collapsed */}
      <nav
        className={cn(
          "flex-1 p-2 space-y-1",
          (!isCollapsed || isMobile) && "overflow-y-auto"
        )}
      >
        {content.map((item) => {
          // Skip headings entirely when collapsed (desktop)
          if (item.type === "heading" && isCollapsed && !isMobile) {
            return null;
          }

          switch (item.type) {
            case "heading":
              return (
                <h4
                  key={item.uuid}
                  className="px-2 py-2 mt-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500"
                >
                  {item.label}
                </h4>
              );
            case "separator":
              return (
                <hr
                  key={item.uuid}
                  className="my-2 border-gray-200 dark:border-gray-700"
                />
              );
            case "link":
              return (
                <Link
                  key={item.uuid}
                  href={`${basePath}${item.href}`}
                  className={cn(
                    "flex items-center p-2 rounded-md",
                    item.active
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700",
                    isCollapsed && !isMobile && "justify-center"
                  )}
                >
                  <span className={cn(!(isCollapsed && !isMobile) && "mr-3")}>
                    <DynamicRenderer component={item.icon} />
                  </span>
                  <span
                    className={cn(
                      "truncate transition-opacity",
                      isCollapsed && !isMobile && "opacity-0"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            case "collapsible":
              return <CollapsibleItem key={item.uuid} item={item} />;
            default:
              return null;
          }
        })}
      </nav>

      {/* footer: profile + desktop collapse */}
      <div className="p-2 ">
        {/* {profile && (
          <Link
            href={profile.href ? `${basePath}${profile.href}` : "#"}
            className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <img
              src={profile.avatar.src}
              alt={profile.avatar.alt}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div
              className={cn(
                "flex flex-col truncate transition-opacity",
                isCollapsed && !isMobile && "opacity-0"
              )}
            >
              <span className="font-semibold text-sm truncate">
                {profile.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {profile.email}
              </span>
            </div>
          </Link>
        )} */}

        {/* The desktop toggle button is now managed by the parent component */}
      </div>
    </aside>
  );
};

// --- Main Responsive Layout Component ---
export const SidebarComponent: React.FC<SidebarProps & { children: React.ReactNode }> = ({
  children,
  ...sidebarProps
}) => {
  const [isDesktopCollapsed, setIsDesktopCollapsed] = React.useState(
    sidebarProps.defaultCollapsed || false
  );
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const { basePath } = useAppContext();

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* desktop sidebar and toggle */}
      <div className="hidden md:block">
        <div className="fixed inset-y-0 left-0 z-20 flex">
          <SidebarUI
            {...sidebarProps}
            isCollapsed={isDesktopCollapsed}
            toggleCollapsed={() => setIsMobileOpen(false)} // For mobile close button
            basePath={basePath}
          />
        </div>
        {sidebarProps.collapsible && (
          <button
            onClick={() => setIsDesktopCollapsed((s) => !s)}
            className={cn(
              "fixed bottom-5 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200/50 backdrop-blur-sm hover:bg-gray-300/70 dark:bg-gray-700/50 dark:hover:bg-gray-600/70",
              "transition-all duration-300 ease-in-out",
              isDesktopCollapsed
                ? "left-3"
                : "left-[240px] rotate-180" // Center button on the 256px edge (256 - 32/2)
            )}
            aria-label={
              isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* mobile overlay + sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <SidebarUI
            {...sidebarProps}
            isCollapsed={false}
            isMobile
            toggleCollapsed={() => setIsMobileOpen(false)}
            classes="w-64"
            basePath={basePath}
          />
          <div
            onClick={() => setIsMobileOpen(false)}
            className="flex-1 bg-black bg-opacity-50"
            aria-hidden="true"
          />
        </div>
      )}

      {/* content area */}
      <div
        className={cn(
          "flex flex-col flex-1 transition-all duration-300 ease-in-out",
          isDesktopCollapsed ? "md:pl-0" : "md:pl-64"
        )}
      >
        {/* mobile header */}
        <header className="md:hidden flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
          <Link href={sidebarProps.logo.href ? `${basePath}${sidebarProps.logo.href}` : "#"} className="flex items-center gap-2">
            <DynamicRenderer component={sidebarProps.logo.icon} />
            <span className="font-bold">{sidebarProps.logo.text}</span>
          </Link>
          <button
            onClick={() => setIsMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
};

export default SidebarComponent;
