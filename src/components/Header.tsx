'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/practice', label: 'Practice' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <nav className="w-full px-4 py-3 bg-gray-100 border-b flex gap-6 text-sm font-medium">
      {navItems.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`hover:underline ${
            pathname === href ? 'text-blue-600 underline' : 'text-gray-800'
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}