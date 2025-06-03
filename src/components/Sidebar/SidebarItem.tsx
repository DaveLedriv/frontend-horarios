import { useState } from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarItemProps {
  label: string;
  subItems: { label: string; path: string }[];
}

export default function SidebarItem({ label, subItems }: SidebarItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-3 py-2 rounded-lg font-semibold text-gray-700 hover:bg-gray-100"
      >
        {label}
      </button>
      {open && (
        <div className="ml-4 mt-1 space-y-1">
          {subItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block px-3 py-1 text-sm rounded transition ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
