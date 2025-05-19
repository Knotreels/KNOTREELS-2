"use client";

import TopNav from "./TopNav";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <PayPalScriptProvider options={{ clientId: "test" }}>
      <div className="flex min-h-screen bg-background text-foreground">
        <main className="flex-1 flex flex-col">
          {/* Mobile TopNav (if needed) */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-zinc-800 text-white shadow-md">
            <span className="font-bold text-xl">KnotReels</span>
          </div>

          {/* Desktop TopNav */}
          <div className="hidden lg:block">
            <TopNav />
          </div>

          {/* Page Content */}
          <div className="p-4 flex-1">{children}</div>
        </main>
      </div>
    </PayPalScriptProvider>
  );
}
