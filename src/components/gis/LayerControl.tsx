import { useMemo } from 'react';
import { useMapStore } from '../../stores';
import type { MapLayer } from '../../types';
import {
  Map,
  Layers,
  Building2,
  Users,
  TreePine,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const CATEGORY_INFO: Record<string, { label: string; icon: React.ReactNode }> = {
  base: { label: 'Base Maps', icon: <Map className="w-4 h-4" /> },
  land: { label: 'Land', icon: <Layers className="w-4 h-4" /> },
  infrastructure: { label: 'Infrastructure', icon: <Building2 className="w-4 h-4" /> },
  population: { label: 'Population', icon: <Users className="w-4 h-4" /> },
  environment: { label: 'Environment', icon: <TreePine className="w-4 h-4" /> },
};

export default function LayerControl() {
  const { layers, toggleLayer } = useMapStore();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['land', 'infrastructure'])
  );

  const grouped = useMemo(() => {
    const groups: Record<string, MapLayer[]> = {};
    for (const layer of layers) {
      if (!groups[layer.category]) groups[layer.category] = [];
      groups[layer.category].push(layer);
    }
    return groups;
  }, [layers]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <div className="w-full">
      <h3 className="text-xs font-semibold text-[var(--color-brand-400)] uppercase tracking-wider mb-3 px-1">
        Map Layers
      </h3>
      <div className="space-y-1">
        {Object.entries(grouped).map(([category, categoryLayers]) => {
          const info = CATEGORY_INFO[category] || { label: category, icon: null };
          const isExpanded = expandedCategories.has(category);

          return (
            <div key={category}>
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium text-[var(--color-brand-700)] hover:bg-[var(--color-brand-50)] transition-colors"
                aria-expanded={isExpanded}
              >
                {info.icon}
                <span className="flex-1 text-left">{info.label}</span>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--color-brand-400)]" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--color-brand-400)]" />
                )}
              </button>
              {isExpanded && (
                <div className="ml-2 mt-0.5 space-y-0.5">
                  {categoryLayers.map((layer) => (
                    <button
                      key={layer.id}
                      onClick={() => toggleLayer(layer.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)] transition-colors"
                      aria-pressed={layer.visible}
                    >
                      {layer.visible ? (
                        <Eye className="w-3.5 h-3.5 text-[var(--color-accent-600)]" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-[var(--color-brand-300)]" />
                      )}
                      <span className={layer.visible ? 'text-[var(--color-brand-800)]' : 'text-[var(--color-brand-400)]'}>
                        {layer.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
