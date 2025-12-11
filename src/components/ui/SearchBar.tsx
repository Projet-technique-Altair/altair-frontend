/**
 * @file Search bar input component for Altair dashboards and explorer views.
 *
 * @remarks
 * The `SearchBar` component provides a minimal, responsive search input field
 * with an integrated icon from Lucide React.
 * It is used for filtering labs, starpaths, users, or any searchable dataset
 * across the Altair platform.
 *
 * @packageDocumentation
 */

import { Search } from "lucide-react";


/**
 * Props for the {@link SearchBar} component.
 *
 * @property value - Current search string controlled by the parent component.
 * @property onChange - Callback invoked when the search input value changes.
 *
 * @public
 */
interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}


/**
 * Renders a responsive search input field with a leading icon.
 *
 * @remarks
 * Includes:
 * - Embedded search icon for visual clarity
 * - Rounded input field with Altair theme styling
 * - Focus highlight ring for accessibility
 *
 * Designed for use in dashboards, lab explorers, and general filtering interfaces.
 *
 * @param props - {@link SearchBarProps} defining the current value and change handler.
 * @returns A React JSX element rendering a styled search input field.
 *
 * @public
 */
export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full sm:w-80">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search..."
        className="w-full bg-[#0E1323]/70 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white
                   placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/50 outline-none"
      />
    </div>
  );
}
