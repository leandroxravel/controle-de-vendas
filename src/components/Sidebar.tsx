"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next/auth/react";
import { Car, LayoutDashboard, ShoppingCart, Store, Users, FileBarChart } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const isAdmin = role === "Administrador";

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, show: true },
    { label: "Vendas", href: "/sales", icon: ShoppingCart, show: true },
    { label: "Lojas", href: "/stores", icon: Store, show: isAdmin },
    { label: "Usuários", href: "/users", icon: Users, show: isAdmin },
    { label: "Relatórios", href: "/reports", icon: FileBarChart, show: isAdmin },
  ];

  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b text-primary-600 font-bold text-xl gap-2">
        <Car /> Vendas Control
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems
          .filter((item) => item.show)
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname.startsWith(item.href)
                  ? "bg-primary-50 text-primary-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
      </nav>
    </aside>
  );
}
