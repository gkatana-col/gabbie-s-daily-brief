import { AtmosphereShell, FloatingNavigation } from "@/components/layout/FloatingNavigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  return <AtmosphereShell><div className="min-h-dvh text-foreground"><main className="mx-auto min-h-dvh w-full max-w-5xl px-4 pb-32 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-7 md:pb-28 md:pt-8">{children}</main><FloatingNavigation /></div></AtmosphereShell>;
}
