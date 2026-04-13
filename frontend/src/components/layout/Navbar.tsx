"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ShoppingCart, Menu, X, User, LogOut } from "lucide-react";
import {
  Button,
  Flex,
  Container,
  DropdownMenu,
  Avatar
} from "@radix-ui/themes";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { getCategories } from "@/lib/api";
import { Category } from "@/types";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

export const Navbar = () => {
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const [categories, setCategories] = useState<Category[]>([]);

  const plantCategories = categories.filter(
    (cat) => !["DUNG_CU", "PHAN_BON_DAT"].includes(cat.value)
  );
  const supplyCategories = categories.filter((cat) =>
    ["DUNG_CU", "PHAN_BON_DAT"].includes(cat.value)
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Trang chủ", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: "Về chúng tôi", href: "/about" },
    { name: "Liên hệ", href: "/contact" }
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-2",
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm  dark:bg-[#081C15]/80"
          : "bg-primary"
      )}
    >
      <Container size="4">
        <Flex justify="between" align="center" className="px-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center transition-colors">
              <Image src="/images/logo.png" alt="Logo" width={50} height={50} />
            </div>
            <span
              className={cn(
                "text-xl font-bold tracking-tight",
                isScrolled ? "text-foreground dark:text-white" : "text-white"
              )}
            >
              Rú{" "}
              <span
                className={
                  isScrolled
                    ? "text-primary dark:text-secondary"
                    : "text-secondary"
                }
              >
                Garden
              </span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-foreground">
            <Link
              href="/"
              className={cn(
                "transition-all duration-200 hover:scale-105",
                isScrolled
                  ? cn("text-foreground dark:text-white hover:text-primary")
                  : cn("text-white/90 hover:text-white")
              )}
            >
              Trang chủ
            </Link>

            {/* Category Dropdown */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <button
                  className={cn(
                    "flex items-center gap-1 transition-all duration-200 hover:scale-105 cursor-pointer outline-none underline-offset-8 decoration-2",
                    isScrolled
                      ? cn(
                          "text-foreground dark:text-white hover:text-primary",
                          pathname === "/products" && "underline text-primary"
                        )
                      : cn(
                          "text-white/90 hover:text-white",
                          pathname === "/products" && "underline text-white"
                        )
                  )}
                >
                  Danh mục <ChevronDown size={14} />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content
                variant="soft"
                color="gray"
                className="min-w-[200px]"
              >
                <DropdownMenu.Item asChild>
                  <Link href="/products" className="cursor-pointer font-bold">
                    Tất cả sản phẩm
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator />

                <div className="px-3 py-1 font-bold text-xs uppercase text-primary/70">
                  🌿 Cây cảnh
                </div>
                {plantCategories.map((cat) => (
                  <DropdownMenu.Item key={cat.id} asChild>
                    <Link
                      href={`/products?category=${cat.value}`}
                      className="cursor-pointer pl-6"
                    >
                      {cat.name}
                    </Link>
                  </DropdownMenu.Item>
                ))}

                <DropdownMenu.Separator />
                <div className="px-3 py-1 font-bold text-xs uppercase text-amber-600/70">
                  🛠 Vật tư & Phụ kiện
                </div>
                {supplyCategories.map((cat) => (
                  <DropdownMenu.Item key={cat.id} asChild>
                    <Link
                      href={`/products?category=${cat.value}`}
                      className="cursor-pointer pl-6"
                    >
                      {cat.name}
                    </Link>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Root>

            {navLinks.slice(1).map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "transition-all duration-200 hover:scale-105 underline-offset-8 decoration-2",
                    isScrolled
                      ? cn(
                          "text-foreground dark:text-white hover:text-primary",
                          isActive && "text-primary underline"
                        )
                      : cn(
                          "text-white/90 hover:text-white",
                          isActive && "text-white underline"
                        )
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <Flex gap="4" align="center">
            <Link
              href="/cart"
              className={cn(
                "relative p-2 rounded-full transition-colors",
                isScrolled ? "hover:bg-primary" : "hover:bg-white/10"
              )}
            >
              <ShoppingCart
                className={cn(
                  "w-6 h-6",
                  isScrolled ? "text-foreground dark:text-white" : "text-white"
                )}
              />
              {totalItems > 0 && (
                <span
                  className={cn(
                    "absolute top-0 right-0 text-[10px] w-4 h-4 flex items-center justify-center rounded-full",
                    isScrolled
                      ? "bg-primary text-white"
                      : "bg-white text-primary"
                  )}
                >
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated && user ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <button className="hidden md:flex items-center gap-2 hover:bg-muted p-1 pr-3 rounded-full transition-colors cursor-pointer outline-none">
                    <Avatar
                      fallback={user.name?.[0]?.toUpperCase() || "U"}
                      radius="full"
                      size="2"
                      className="bg-white text-primary"
                    />
                    <span
                      className={cn(
                        "text-sm font-medium truncate max-w-[100px]",
                        isScrolled
                          ? "text-foreground dark:text-white"
                          : "text-white"
                      )}
                    >
                      {user.name}
                    </span>
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  variant="soft"
                  color="gray"
                  className="w-48"
                >
                  <DropdownMenu.Item className="cursor-pointer" asChild>
                    <Link href="/account" className="flex items-center gap-2">
                      <User className="w-4 h-4" /> Tài khoản của tôi
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item
                    color="red"
                    className="cursor-pointer"
                    onClick={logout}
                  >
                    <Flex align="center" gap="2">
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </Flex>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            ) : (
              <Button
                variant="classic"
                color="grass"
                radius="full"
                className="hidden md:flex cursor-pointer"
                asChild
              >
                <Link href="/login">Đăng nhập</Link>
              </Button>
            )}

            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </Flex>
        </Flex>
      </Container>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-[#081C15] shadow-lg py-4 px-6 space-y-4 border-t border-muted max-h-[80vh] overflow-y-auto">
          <Link
            href="/"
            className={cn(
              "block text-lg font-medium transition-colors"
              // pathname === "/"
              //   ? "text-primary"
              //   : "text-foreground hover:text-primary"
            )}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Trang chủ
          </Link>

          <div className="space-y-4">
            <Link
              href="/products"
              className={cn(
                "block text-lg font-bold transition-colors",
                pathname === "/products" && !currentCategory
                  ? "text-primary"
                  : "text-foreground"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tất cả sản phẩm
            </Link>

            <div className="space-y-2">
              <div className="font-bold text-sm uppercase tracking-wider text-primary/70 mb-2 border-b pb-1">
                🌿 Cây cảnh
              </div>
              {plantCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.value}`}
                  className={cn(
                    "block text-base font-medium pl-4 transition-colors",
                    currentCategory === cat.value
                      ? "text-primary"
                      : "text-foreground"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            <div className="space-y-2 mt-4">
              <div className="font-bold text-sm uppercase tracking-wider text-amber-600/70 mb-2 border-b pb-1">
                🛠 Vật tư & Phụ kiện
              </div>
              {supplyCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.value}`}
                  className={cn(
                    "block text-base font-medium pl-4 transition-colors",
                    currentCategory === cat.value
                      ? "text-primary"
                      : "text-foreground"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-muted/50 space-y-4">
            {navLinks.slice(1).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "block text-lg font-medium transition-colors",
                  pathname === link.href || pathname.startsWith(`${link.href}/`)
                    ? "text-primary"
                    : "text-foreground hover:text-primary"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {isAuthenticated ? (
            <div className="pt-4 border-t border-muted/50">
              <div className="flex items-center gap-3 mb-4">
                <Avatar
                  fallback={user?.name?.[0]?.toUpperCase() || "U"}
                  radius="full"
                  size="3"
                  className="bg-primary text-white"
                />
                <div>
                  <div className="font-medium text-foreground">
                    {user?.name}
                  </div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
              </div>
              <Link
                href="/account"
                className="block py-2 text-foreground hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tài khoản của tôi
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-red-500 hover:text-red-600"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Button
              variant="classic"
              color="grass"
              radius="full"
              className="w-full"
              asChild
            >
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                Đăng nhập
              </Link>
            </Button>
          )}
        </div>
      )}
    </header>
  );
};
