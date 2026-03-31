"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu, User } from "lucide-react";

export function TopBar() {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-4 md:hidden">
        <button className="text-gray-500 hover:text-gray-700">
          <Menu size={24} />
        </button>
        <span className="font-bold text-primary-600">Vendas Control</span>
      </div>
      
      <div className="hidden md:block"></div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={16} />
          <span className="hidden md:inline">{session?.user?.name}</span>
          <span className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold ml-2">
            {session?.user?.role}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 px-3 py-2 rounded-md hover:bg-red-50 transition"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
