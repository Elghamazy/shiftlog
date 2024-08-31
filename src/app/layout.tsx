import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { Header } from "~/components/site-header";
import { Toaster } from "~/components/ui/sonner";
import { ScrollArea } from "~/components/ui/scroll-area";

export const metadata: Metadata = {
  title: "Work2Be",
  description: "A simple tool for logging and managing work shifts. ",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} dark bg-background`}>
      <body className="container">
        <Header />
        <ScrollArea className="h-[calc(100dvh_-_88px)] rounded-xl mb-6">
          <div className="m-b-6">

          <TRPCReactProvider>{children}</TRPCReactProvider>
          </div>
        </ScrollArea>
        <Toaster />
      </body>
    </html>
  );
}
