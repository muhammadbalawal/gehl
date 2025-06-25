"use client";

import Drawer from "@/components/drawer";
import { Icons } from "@/components/icons";
import Menu from "@/components/menu";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [addBorder, setAddBorder] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setAddBorder(true);
      } else {
        setAddBorder(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={
        "relative sticky top-0 z-50 py-4 bg-background/60 backdrop-blur"
      }
    >
      <div className="flex items-center container px-8">
        <div className="flex items-center space-x-8">
          <Link
            href="/"
            title="brand-logo"
            className="flex items-center space-x-2"
          >
            <img src="/logo.png" alt="Kinteli Logo" className="w-auto h-[40px]" />
            <span className="font-bold text-xl">{siteConfig.name}</span>
          </Link>

          <div className="hidden lg:block">
            <nav>
              <Menu />
            </nav>
          </div>
        </div>

        <div className="hidden lg:flex gap-2 ml-auto">
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline" })}
          >
            Login
          </Link>
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ variant: "default" }),
              "w-full sm:w-auto text-background flex gap-2"
            )}
          >
            <img src="/logo.png" alt="Kinteli Logo" className="h-6 w-6" />
            Get Started for Free
          </Link>
        </div>

        <div className="mt-2 cursor-pointer block lg:hidden ml-auto">
          <Drawer />
        </div>
      </div>
      <hr
        className={cn(
          "absolute w-full bottom-0 transition-opacity duration-300 ease-in-out",
          addBorder ? "opacity-100" : "opacity-0"
        )}
      />
    </header>
  );
}
