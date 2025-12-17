"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/app/components/ui/sidebar"
import { 
  Utensils, 
  Cookie, 
  Coffee, 
  ChefHat,
  Accessibility,
  Sparkles,
  MessageCircle
} from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { AccessibilitySheet } from "./app-accessibility-sheet"
import { useAccessibilityStyles } from "@/hooks/use-accessibility-styles"
import { cn } from "@/lib/utils"

interface AppSidebarProps {
  temperature?: number;
  precipitation?: number;
  windSpeed?: number;
  windDirection?: number;
}

export function AppSidebar({ 
  temperature, 
  precipitation, 
  windSpeed, 
  windDirection 
}: AppSidebarProps) {
  const pathname = usePathname()
  const { textClasses } = useAccessibilityStyles()
  
  const menuItems = [
    {
      title: "Chat",
      icon: MessageCircle,
      href: "/home/chat",
    },
    {
      title: "Build Your Own",
      icon: ChefHat,
      href: "/home/build",
    },
    {
      title: "Entrees",
      icon: Utensils,
      href: "/home/entree",
    },
    {
      title: "Sides",
      icon: Cookie,
      href: "/home/side",
    },
    {
      title: "Drinks",
      icon: Coffee,
      href: "/home/drink",
    },
    {
      title: "Appetizers",
      icon: Sparkles,
      href: "/home/appetizer",
    }
  ]

  return (
    <Sidebar 
      collapsible="icon"
      className="bg-maroon-gradient border-r-0"
    >
      {/* Header with glass effect */}
      <SidebarHeader className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="lg" 
              asChild 
              isActive={pathname === "/home"}
              className={cn(
                "text-white hover:bg-white/10 hover:text-white transition-all duration-300",
                "data-[active=true]:bg-white/15 data-[active=true]:shadow-lg",
                textClasses
              )}
            >
              <a href="/home" className="font-bold text-lg">
                <div className="flex items-center justify-center size-8 rounded-lg bg-white/10 backdrop-blur-sm shadow-inner">
                  <Image 
                    src="/Panda Express/round_logo.png" 
                    alt="Panda Express Logo" 
                    width={24} 
                    height={24}
                    className="rounded-sm"
                  />
                </div>
                <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text">
                  Panda Express
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Content with glass menu items */}
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
              {menuItems.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                      size="lg"
                      className={cn(
                        // Base styles
                        "relative text-white/90 rounded-xl transition-all duration-300 ease-out",
                        "hover:text-white hover:bg-white/12 hover:shadow-lg hover:scale-[1.02]",
                        "hover:border-white/20",
                        // Glass effect on hover
                        "backdrop-blur-sm border border-transparent",
                        // Active state with glow
                        "data-[active=true]:bg-white/18 data-[active=true]:text-white",
                        "data-[active=true]:border-white/25 data-[active=true]:shadow-[0_0_20px_rgba(255,255,255,0.15)]",
                        "data-[active=true]:scale-[1.02]",
                        textClasses
                      )}
                    >
                      <a href={item.href} className="flex items-center gap-3">
                        <div className={cn(
                          "flex items-center justify-center size-9 rounded-lg transition-all duration-300",
                          isActive 
                            ? "bg-white/20 shadow-inner" 
                            : "bg-white/5 group-hover:bg-white/15"
                        )}>
                          <item.icon className="size-5" />
                        </div>
                        <span className="font-medium">{item.title}</span>
                        {isActive && (
                          <div className="absolute right-3 size-2 rounded-full bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
              
              {/* Accessibility Button with glass styling */}
              <SidebarMenuItem>
                <AccessibilitySheet
                  temperature={temperature}
                  precipitation={precipitation}
                  windSpeed={windSpeed}
                  windDirection={windDirection}
                  trigger={
                    <SidebarMenuButton 
                      size="lg" 
                      className={cn(
                        "w-full text-white/90 rounded-xl transition-all duration-300 ease-out",
                        "hover:text-white hover:bg-white/12 hover:shadow-lg hover:scale-[1.02]",
                        "backdrop-blur-sm border border-transparent hover:border-white/20",
                        textClasses
                      )}
                    >
                      <div className="flex items-center justify-center size-9 rounded-lg bg-white/5 transition-all duration-300 group-hover:bg-white/15">
                        <Accessibility className="size-5" />
                      </div>
                      <span className="font-medium">Accessibility</span>
                    </SidebarMenuButton>
                  }
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with subtle glass effect */}
      <SidebarFooter className="border-t border-white/10 bg-white/5 backdrop-blur-sm py-3 h-20 flex items-center justify-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="sm" className="hover:bg-transparent">
              <a href="/home" className="flex items-center justify-center">
                <span className={cn(
                  "text-xs text-white/60 tracking-wide",
                  textClasses
                )}>
                  © 2024 Panda Express
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
