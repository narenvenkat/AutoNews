import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Plus, 
  List, 
  Video, 
  Settings, 
  User,
  Newspaper,
  LogOut
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Create Job", href: "/jobs/create", icon: Plus },
  { name: "All Jobs", href: "/jobs", icon: List },
  { name: "Published Content", href: "/published", icon: Video },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col" data-testid="sidebar">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200" data-testid="logo-section">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Newspaper className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900" data-testid="text-app-name">AutoNews</h1>
            <p className="text-sm text-slate-500" data-testid="text-app-subtitle">Content Operations</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4" data-testid="navigation">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || 
              (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <div
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                    data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* User Section */}
      <div className="p-4 border-t border-slate-200" data-testid="user-section">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900" data-testid="text-user-name">Admin User</p>
            <p className="text-xs text-slate-500" data-testid="text-user-role">Operator</p>
          </div>
          <button 
            className="text-slate-400 hover:text-slate-600"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
