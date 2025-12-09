"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, Dot } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarProps, SidebarItem } from "@/interfaces/components/common/navigation/sidebar";
import { IconProps } from "@/interfaces/components/common/core";

// Assuming these components are available from your project's UI library
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarSeparator,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/runtime/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/runtime/components/ui/collapsible";

import { Avatar, AvatarFallback, AvatarImage } from "@/runtime/components/ui/avatar";

// Importing the actual DynamicRenderer as specified
import { DynamicRenderer } from "@/components/DynamicRenderer";


// --- REFACTORED SIDEBAR COMPONENT ---

export const SidebarWithShadCN: React.FC<SidebarProps> = ({
  logo,
  content,
  profile,
  collapsible = true,
  defaultCollapsed = false,
  classes
}) => {
  // Note: SidebarProps uses 'content' property, not 'items'
  // For this component we'll treat content as items
  // Build groups: each heading starts a new group
  const groups = React.useMemo(() => {
    const g: { label?: string; items: SidebarItem[] }[] = [];
    let currentGroup: { label?: string; items: SidebarItem[] } = { label: undefined, items: [] };
    const items = content || [];
    items.forEach((item: SidebarItem) => {
      if (item.type === "heading") {
        if (currentGroup.items.length > 0) {
          g.push(currentGroup);
        }
        currentGroup = { label: item.label, items: [] };
      } else {
        currentGroup.items.push(item);
      }
    });
    if (currentGroup.items.length > 0) {
      g.push(currentGroup);
    }
    return g;
  }, [content]);

  return (
    <SidebarProvider defaultOpen={!defaultCollapsed}>
      <Sidebar
        className={cn(classes)}
        collapsible={collapsible ? "icon" : "none"}
      >
        {/* Logo */}
        <SidebarHeader>
          <Link href={logo.href ?? "#"} className="flex items-center gap-2">
            <DynamicRenderer component={logo.icon} />
            <span className="font-bold text-lg whitespace-nowrap">{logo.text}</span>
          </Link>
        </SidebarHeader>

        <SidebarSeparator />

        {/* Navigation */}
        <SidebarContent>
          {groups.map((group, groupIndex) => (
            <SidebarGroup key={`group-${groupIndex}`}>
              {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}

              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    if (item.type === "separator") {
                      return <SidebarSeparator key={item.uuid} />;
                    }

                    if (item.type === "link") {
                      return (
                        <SidebarMenuItem key={item.uuid}>
                          <SidebarMenuButton asChild isActive={item.active}>
                            <Link href={item.href} className="flex items-center w-full">
                              <span className="mr-2">
                                <DynamicRenderer component={item.icon} />
                              </span>
                              <span className="truncate">{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    }

                    if (item.type === "collapsible") {
                      return (
                        <SidebarMenuItem key={item.uuid}>
                          <Collapsible defaultOpen={item.defaultOpen}>
                            <SidebarMenuButton asChild>
                              <CollapsibleTrigger className="flex w-full items-center justify-between group/collapsible">
                                <div className="flex items-center">
                                  <span className="mr-2">
                                    <DynamicRenderer component={item.icon} />
                                  </span>
                                  <span className="truncate">{item.label}</span>
                                </div>
                                <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                              </CollapsibleTrigger>
                            </SidebarMenuButton>

                            <CollapsibleContent className="pl-6">
                              <SidebarMenu>
                                {item.content.map((subItem) => (
                                  <SidebarMenuItem key={subItem.uuid}>
                                    <SidebarMenuButton asChild isActive={subItem.active}>
                                      <Link href={subItem.href} className="flex items-center w-full">
                                        <Dot className="mr-2 h-4 w-4 flex-shrink-0" />
                                        <span className="truncate">{subItem.label}</span>
                                      </Link>
                                    </SidebarMenuButton>
                                  </SidebarMenuItem>
                                ))}
                              </SidebarMenu>
                            </CollapsibleContent>
                          </Collapsible>
                        </SidebarMenuItem>
                      );
                    }

                    return null;
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarSeparator />

        {/* Profile & collapse toggle */}
        <SidebarFooter>
          {profile && (
             <Link href={profile.href || '#'} className="block w-full">
                <div className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted">
                    <Avatar>
                        <AvatarImage src={profile.avatar.src} alt={profile.avatar.alt} />
                        <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col truncate">
                        <span className="font-semibold text-sm truncate">{profile.name}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {profile.email}
                        </span>
                    </div>
                </div>
            </Link>
          )}
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
};

export default SidebarWithShadCN;
