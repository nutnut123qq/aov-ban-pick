import type { Metadata } from "next";
import { Figtree } from "next/font/google"
import "./globals.css";
import { PropsWithChildren } from "react";
import { InnerLayout } from "./InnerLayout";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
})

export const metadata: Metadata = {
  title: "Tedo Academy",
  description: "Tedo Academy is a platform for learning and growing",
}

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <html
      lang="en"
      className={`${figtree.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <InnerLayout>
          {children}
        </InnerLayout>
      </body>
    </html>
  )
}

export default Layout;
