import {
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingCart,
  Users,
  Menu,
  Monitor,
  Ticket
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Bán hàng POS", href: "/pos", icon: Monitor },
  { name: "Sản phẩm", href: "/products", icon: Package },
  { name: "Đơn hàng", href: "/orders", icon: ShoppingCart },
  { name: "Giảm giá", href: "/discounts", icon: Ticket },
  { name: "Khách hàng", href: "/users", icon: Users }
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [role, setRole] = useState<string>("ADMIN");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/login");
    } else {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.role) {
          setTimeout(() => setRole(payload.role), 0);
          if (
            payload.role === "STAFF" &&
            (location.pathname === "/" || location.pathname === "/users")
          ) {
            navigate("/products");
          }
        }
      } catch (e) {
        console.error("Token parse error", e);
      }
    }
  }, [navigate, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${isCollapsed ? "w-20" : "w-64"} bg-white shadow-md transition-all duration-300 flex flex-col z-[100] relative`}
      >
        <div
          className={`h-16 flex items-center ${isCollapsed ? "justify-center px-0" : "justify-between px-6"} font-bold text-xl text-green-700 bg-green-50 overflow-hidden`}
        >
          {!isCollapsed && (
            <>
              <img
                src="/src/assets/logo.png"
                alt="Logo"
                width={50}
                height={50}
              />
              <span className="truncate whitespace-nowrap">RÚ ADMIN</span>
            </>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 rounded-lg hover:bg-green-100 text-green-800 transition-colors cursor-pointer ${isCollapsed ? "" : "ml-2"}`}
            title="Toggle Sidebar"
          >
            <Menu size={22} />
          </button>
        </div>
        <nav className="flex flex-col flex-1 p-4 justify-between relative">
          <div className="space-y-2">
            {navigation.map((item) => {
              if (
                (item.name === "Dashboard" || item.name === "Khách hàng") &&
                role !== "ADMIN"
              )
                return null;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group relative flex items-center gap-3 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-green-100 text-green-800 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } ${isCollapsed ? "justify-center px-0" : "px-4"} cursor-pointer`}
                >
                  <item.icon size={22} className="shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}

                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[9999] pointer-events-none origin-left scale-95 group-hover:scale-100">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          <button
            onClick={handleLogout}
            className={`group relative w-full flex items-center gap-3 py-3 mt-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer ${isCollapsed ? "justify-center px-0" : "px-4"}`}
          >
            <LogOut size={22} className="shrink-0" />
            {!isCollapsed && <span className="truncate">Đăng xuất</span>}

            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[9999] pointer-events-none origin-left scale-95 group-hover:scale-100">
                Đăng xuất
              </div>
            )}
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-green-50 shadow-sm flex items-center justify-between px-8 relative">
          <h1 className="text-xl font-semibold text-gray-800">
            {navigation.find((n) => n.href === location.pathname)?.name ||
              (location.pathname === "/settings"
                ? "Cài đặt tài khoản"
                : "Dashboard")}
          </h1>

          {/* Top Right User Menu */}
          <div className="relative">
            <button
              onClick={() => navigate("/settings")}
              className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="bg-white w-9 h-9 text-green-700 rounded-full flex items-center justify-center font-bold">
                A
              </div>
            </button>
          </div>
        </header>
        <main className="p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
