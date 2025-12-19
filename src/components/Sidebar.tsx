'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  LayoutDashboard, 
  Zap, 
  BarChart3, 
  Bell, 
  Clock, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Building2,
  LogOut,
  User
} from 'lucide-react';
import clsx from 'clsx';
import { useSidebar } from '@/lib/SidebarContext';

const navigation = [
  { name: 'Comptes MCC', href: '/accounts', icon: Building2, badge: 'API' },
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Actions', href: '/actions', icon: Zap },
  { name: 'Search Terms', href: '/search-terms', icon: Search, badge: 'NocoDB' },
  { name: 'Campagnes', href: '/campaigns', icon: BarChart3 },
  { name: 'Alertes', href: '/alerts', icon: Bell },
  { name: 'Historique', href: '/history', icon: Clock },
];

const bottomNavigation = [
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { collapsed, toggleCollapsed } = useSidebar();

  // Ne pas afficher le sidebar sur la page de login
  if (pathname === '/login') {
    return null;
  }

  return (
    <aside 
      className={clsx(
        'fixed left-0 top-0 h-screen bg-dark-800 border-r border-dark-600 flex flex-col transition-all duration-300 z-50',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-dark-600">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h1 className="font-semibold text-white">MCC Dashboard</h1>
              <p className="text-xs text-gray-500">Google Ads + n8n</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto">
            <span className="text-xl">📊</span>
          </div>
        )}
      </div>

      {/* User info */}
      {session && !collapsed && (
        <div className="px-4 py-3 border-b border-dark-700">
          <div className="flex items-center gap-3">
            {session.user?.image ? (
              <img 
                src={session.user.image} 
                alt="" 
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session.user?.name || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session.user?.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation principale */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href === '/accounts' && pathname.startsWith('/accounts/'));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group',
                isActive 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'text-gray-400 hover:bg-dark-700 hover:text-white'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon 
                className={clsx(
                  'w-5 h-5 flex-shrink-0',
                  isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-white'
                )} 
              />
              {!collapsed && (
                <>
                  <span className="font-medium">{item.name}</span>
                  {item.badge && (
                    <span className={clsx(
                      "ml-auto text-xs px-2 py-0.5 rounded-full",
                      item.badge === 'NocoDB' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : item.badge === 'API'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-amber-500/20 text-amber-400'
                    )}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Navigation bas */}
      <div className="py-4 px-3 border-t border-dark-600">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group',
                isActive 
                  ? 'bg-dark-700 text-white' 
                  : 'text-gray-400 hover:bg-dark-700 hover:text-white'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0 text-gray-500 group-hover:text-white" />
              {!collapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}

        {/* Bouton de déconnexion */}
        {session && (
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 group mt-1"
            title={collapsed ? 'Déconnexion' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 text-gray-500 group-hover:text-red-400" />
            {!collapsed && <span className="font-medium">Déconnexion</span>}
          </button>
        )}

        {/* Toggle button */}
        <button
          onClick={toggleCollapsed}
          className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-dark-700 hover:text-white transition-all"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span className="text-sm">Réduire</span>}
        </button>
      </div>
    </aside>
  );
}
