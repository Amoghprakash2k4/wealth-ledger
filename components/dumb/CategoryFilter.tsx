const CATEGORY_CONFIG: Record<string, { emoji: string; colorClass: string; bgClass: string }> = {
  food:          { emoji: '🍔', colorClass: 'text-[#f97316]', bgClass: 'bg-orange-glow' },
  transport:     { emoji: '🚗', colorClass: 'text-accent-blue', bgClass: 'bg-blue-glow' },
  entertainment: { emoji: '🎮', colorClass: 'text-accent-secondary', bgClass: 'bg-violet-glow-12' },
  utilities:     { emoji: '⚡', colorClass: 'text-accent-green', bgClass: 'bg-green-bg-12' },
  shopping:      { emoji: '🛍️', colorClass: 'text-accent-pink', bgClass: 'bg-pink-glow' },
  income:        { emoji: '💰', colorClass: 'text-accent-green', bgClass: 'bg-green-bg-12' },
  other:         { emoji: '📦', colorClass: 'text-text-secondary', bgClass: 'bg-slate-bg' },
};

const DEFAULT_CAT = { emoji: '📋', colorClass: 'text-accent-primary', bgClass: 'bg-indigo-glow-15' };
const CATEGORIES = ['all', 'food', 'transport', 'entertainment', 'utilities', 'shopping', 'income', 'other'];

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

/**
 * DUMB COMPONENT: Category filter pills
 * Pure presentation — receives selected category and callback via props
 */
export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {CATEGORIES.map((cat) => {
        const cfg = cat === 'all' ? null : CATEGORY_CONFIG[cat] ?? DEFAULT_CAT;
        const active = selectedCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
              active
                ? `${cfg?.bgClass ?? 'bg-indigo-glow-15'} ${cfg?.colorClass ?? 'text-accent-primary'} ${cfg?.colorClass ? `border-current` : 'border-accent-primary'}`
                : 'bg-bg-elevated text-text-muted border-border-default'
            }`}
          >
            {cfg && <span>{cfg.emoji}</span>}
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        );
      })}
    </div>
  );
}
