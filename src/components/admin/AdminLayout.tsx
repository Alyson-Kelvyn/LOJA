import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

export default function AdminLayout({
  children,
  currentPage,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      id: "orders",
      label: "Pedidos",
      icon: ShoppingCart,
      path: "/admin/orders",
    },
    {
      id: "budget",
      label: "Orçamento",
      icon: BarChart3,
      path: "/admin/budget",
    },
    {
      id: "inventory",
      label: "Estoque",
      icon: Package,
      path: "/admin/inventory",
    },
    {
      id: "settings",
      label: "Configurações",
      icon: Settings,
      path: "/admin/settings",
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-slate-900">
          <div className="flex items-center space-x-2">
            <div className="bg-amber-500 text-white p-2 rounded-lg">
              <User className="h-5 w-5" />
            </div>
            <span className="text-white font-bold text-lg">MenStyle Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center px-6 py-3 text-left transition-colors duration-200
                  ${
                    isActive
                      ? "bg-amber-500 text-white border-r-4 border-amber-300"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }
                `}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}

          {/* Seção separada para Venda Local */}
          <div className="mt-8 border-t border-slate-700 pt-4">
            <button
              onClick={() => {
                navigate("/admin/localsale");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors duration-200 bg-amber-100 text-amber-800 font-semibold rounded-lg hover:bg-amber-200 mt-2`}
            >
              <ShoppingCart className="h-5 w-5 mr-3" />
              Venda Local
            </button>
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-6">
          <div className="bg-slate-700 rounded-lg p-4 mb-4">
            <p className="text-slate-300 text-sm">Logado como:</p>
            <p className="text-white font-medium truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors duration-200"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sair
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="text-slate-600 hover:text-slate-800 text-sm font-medium"
              >
                Ver Loja
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
