import { useRef, useEffect, useCallback, memo } from 'react';
import * as maplibregl from 'maplibre-gl';
import { useMapStore } from '../../stores';
import type { GeoJSONFeatureCollection } from '../../types';

const MAP_STYLE_URL =
  import.meta.env.VITE_MAP_STYLE_URL ||
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

interface MapContainerProps {
  geojsonData?: GeoJSONFeatureCollection;
  onParcelClick?: (parcelId: string) => void;
  highlightedParcelId?: string | null;
  className?: string;
  interactive?: boolean;
  fitBounds?: [[number, number], [number, number]];
}

function MapContainerInner({
  geojsonData,
  onParcelClick,
  highlightedParcelId,
  className = '',
  interactive = true,
  fitBounds,
}: MapContainerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const { viewState, setViewState } = useMapStore();

  const handleParcelClick = useCallback(
    (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const parcelId = feature.properties?.parcel_id as string;
        if (parcelId && onParcelClick) {
          onParcelClick(parcelId);
        }
      }
    },
    [onParcelClick]
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const m = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE_URL,
      center: viewState.center,
      zoom: viewState.zoom,
      pitch: (viewState as any).pitch || 0,
      bearing: (viewState as any).bearing || 0,
      attributionControl: false,
      interactive,
    });

    m.addControl(new maplibregl.NavigationControl(), 'top-right');
    m.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    m.on('moveend', () => {
      const center = m.getCenter();
      setViewState({
        center: [center.lng, center.lat],
        zoom: m.getZoom(),
      });
    });

    map.current = m;

    return () => {
      m.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add/update any source and layers
  useEffect(() => {
    const m = map.current;
    if (!m || !geojsonData) return;

    const addData = () => {
      // Remove existing if present
      if (m.getLayer('parcels-fill')) m.removeLayer('parcels-fill');
      if (m.getLayer('parcels-outline')) m.removeLayer('parcels-outline');
      if (m.getLayer('parcels-highlight')) m.removeLayer('parcels-highlight');
      if (m.getSource('parcels')) m.removeSource('parcels');

      m.addSource('parcels', {
        type: 'geojson',
        data: geojsonData as unknown as any,
      });

      // Fill layer colored by suitability
      m.addLayer({
        id: 'parcels-fill',
        type: 'fill',
        source: 'parcels',
        paint: {
          'fill-color': [
            'match',
            ['get', 'suitability_status'],
            'highly_suitable', '#16a34a',
            'suitable', '#22c55e',
            'moderate', '#eab308',
            'unsuitable', '#f97316',
            'restricted', '#dc2626',
            '#94a3b8', // default gray
          ],
          'fill-opacity': 0.35,
        },
      });

      // Outline layer
      m.addLayer({
        id: 'parcels-outline',
        type: 'line',
        source: 'parcels',
        paint: {
          'line-color': [
            'match',
            ['get', 'suitability_status'],
            'highly_suitable', '#16a34a',
            'suitable', '#22c55e',
            'moderate', '#eab308',
            'unsuitable', '#f97316',
            'restricted', '#dc2626',
            '#64748b',
          ],
          'line-width': 1.5,
        },
      });

      // Highlight layer for selected parcel
      m.addLayer({
        id: 'parcels-highlight',
        type: 'line',
        source: 'parcels',
        paint: {
          'line-color': '#2563eb',
          'line-width': 3,
        },
        filter: ['==', 'parcel_id', ''],
      });

      // Cursor and click handlers
      m.on('mouseenter', 'parcels-fill', () => {
        m.getCanvas().style.cursor = 'pointer';
      });
      m.on('mouseleave', 'parcels-fill', () => {
        m.getCanvas().style.cursor = '';
      });
      m.on('click', 'parcels-fill', handleParcelClick);
    };

    if (m.isStyleLoaded()) {
      addData();
    } else {
      m.on('load', addData);
    }
  }, [geojsonData, handleParcelClick]);

  // Update highlight filter when selected parcel changes
  useEffect(() => {
    const m = map.current;
    if (!m) return;

    const updateHighlight = () => {
      if (m.getLayer('parcels-highlight')) {
        m.setFilter('parcels-highlight', [
          '==',
          'parcel_id',
          highlightedParcelId || '',
        ]);
      }
    };

    if (m.isStyleLoaded()) {
      updateHighlight();
    } else {
      m.on('load', updateHighlight);
    }
  }, [highlightedParcelId]);

  // Fit bounds when requested
  useEffect(() => {
    const m = map.current;
    if (!m || !fitBounds) return;

    m.fitBounds(fitBounds, { padding: 40, duration: 800 });
  }, [fitBounds]);

  return (
    <div
      ref={mapContainer}
      className={`w-full h-full ${className}`}
      role="application"
      aria-label="Interactive GIS map"
    />
  );
}

const MapContainer = memo(MapContainerInner);
export default MapContainer;
