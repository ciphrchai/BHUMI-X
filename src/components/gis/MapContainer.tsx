import { useRef, useEffect, useCallback, memo } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibreWorker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

import { useMapStore } from '../../stores';

import type {
  GeoJSONFeatureCollection,
} from '../../types';

maplibregl.setWorkerUrl(maplibreWorker);

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
  const hasFittedInitialData = useRef(false);

  const { viewState, setViewState } = useMapStore();

  // ============================================================
  // CLICK HANDLER
  // ============================================================

  const handleParcelClick = useCallback(
    (
      e: maplibregl.MapMouseEvent & {
        features?: maplibregl.MapGeoJSONFeature[];
      }
    ) => {
      if (!e.features || e.features.length === 0) {
        return;
      }

      const feature = e.features[0];

      const parcelId =
        feature.properties?.parcel_id ??
        feature.id;

      if (parcelId && onParcelClick) {
        onParcelClick(String(parcelId));
      }
    },
    [onParcelClick]
  );

  // ============================================================
  // INITIALIZE MAP
  // ============================================================

  useEffect(() => {
    if (!mapContainer.current || map.current) {
      return;
    }

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

    // Navigation
    m.addControl(
      new maplibregl.NavigationControl(),
      'top-right'
    );

    // Scale
    m.addControl(
      new maplibregl.ScaleControl({
        unit: 'metric',
      }),
      'bottom-left'
    );

    // Save camera position
    m.on('moveend', () => {
      const center = m.getCenter();

      setViewState({
        center: [
          center.lng,
          center.lat,
        ],
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

  // ============================================================
  // ADD / UPDATE GEOJSON
  // ============================================================

  useEffect(() => {
    const m = map.current;

    if (!m || !geojsonData) {
      return;
    }

    const addOrUpdateData = () => {
      const existingSource =
        m.getSource('parcels') as maplibregl.GeoJSONSource | undefined;

      // --------------------------------------------------------
      // IMPORTANT PERFORMANCE OPTIMIZATION
      //
      // If source already exists, update its data instead of
      // destroying and recreating the entire source/layers.
      // --------------------------------------------------------

      if (existingSource) {
        existingSource.setData(
          geojsonData as any
        );

        return;
      }

      // --------------------------------------------------------
      // FIRST LOAD ONLY
      // --------------------------------------------------------

      m.addSource('parcels', {
        type: 'geojson',
        data: geojsonData as any,

        /*
         * Reduce geometry processing overhead.
         */
        tolerance: 0.375,
        buffer: 0,
      });

      // ========================================================
      // PARCEL FILL
      //
      // IMPORTANT:
      // Do NOT show thousands of tiny colored parcels when
      // zoomed out.
      //
      // Parcels gradually appear as the user zooms in.
      // ========================================================

      m.addLayer({
        id: 'parcels-fill',

        type: 'fill',

        source: 'parcels',

        /*
         * Parcel coloring starts only when sufficiently zoomed in.
         */
        minzoom: 13.5,

        paint: {
          'fill-color': [
            'match',

            ['get', 'suitability_status'],

            'HIGHLY_SUITABLE',
            '#16a34a',

            'highly_suitable',
            '#16a34a',

            'SUITABLE',
            '#22c55e',

            'suitable',
            '#22c55e',

            'MODERATE',
            '#eab308',

            'moderate',
            '#eab308',

            'UNSUITABLE',
            '#f97316',

            'unsuitable',
            '#f97316',

            'RESTRICTED',
            '#dc2626',

            'restricted',
            '#dc2626',

            '#64748b',
          ] as any,

          /*
           * Very subtle at first, stronger when zoomed in.
           */
          'fill-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],

            13.5,
            0.04,

            14,
            0.06,

            15,
            0.12,

            16,
            0.22,

            17,
            0.32,

            18,
            0.40,
          ] as any,
        },
      });

      // ========================================================
      // PARCEL OUTLINES
      //
      // Only show boundaries when properly zoomed in.
      // ========================================================

      m.addLayer({
        id: 'parcels-outline',

        type: 'line',

        source: 'parcels',

        minzoom: 15,

        paint: {
          'line-color': '#64748b',

          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],

            15,
            0.25,

            16,
            0.45,

            17,
            0.70,

            18,
            0.90,
          ] as any,

          'line-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],

            15,
            0.15,

            16,
            0.25,

            17,
            0.40,

            18,
            0.55,
          ] as any,
        },
      });

      // ========================================================
      // SELECTED PARCEL
      //
      // This remains visible even when normal parcels are subtle.
      // ========================================================

      m.addLayer({
        id: 'parcels-selected-fill',

        type: 'fill',

        source: 'parcels',

        paint: {
          'fill-color': '#2563eb',

          'fill-opacity': 0.50,
        },

        filter: [
          '==',
          ['get', 'parcel_id'],
          '',
        ] as any,
      });

      // ========================================================
      // SELECTED PARCEL BORDER
      // ========================================================

      m.addLayer({
        id: 'parcels-highlight',

        type: 'line',

        source: 'parcels',

        paint: {
          'line-color': '#1d4ed8',

          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],

            10,
            2,

            14,
            3,

            16,
            4,

            18,
            5,
          ] as any,

          'line-opacity': 1,
        },

        filter: [
          '==',
          ['get', 'parcel_id'],
          '',
        ] as any,
      });

      // ========================================================
      // CURSOR
      // ========================================================

      m.on(
        'mouseenter',
        'parcels-fill',
        () => {
          m.getCanvas().style.cursor = 'pointer';
        }
      );

      m.on(
        'mouseleave',
        'parcels-fill',
        () => {
          m.getCanvas().style.cursor = '';
        }
      );

      // ========================================================
      // CLICK
      // ========================================================

      m.on(
        'click',
        'parcels-fill',
        handleParcelClick
      );

      // ========================================================
      // INITIAL FIT ONLY
      //
      // Do NOT refit every time filters change.
      // ========================================================

      if (
        !hasFittedInitialData.current &&
        geojsonData.features.length > 0
      ) {
        const bounds =
          new maplibregl.LngLatBounds();

        geojsonData.features.forEach(
          (feature) => {
            const geometry =
              feature.geometry;

            if (
              geometry.type !== 'Polygon'
            ) {
              return;
            }

            geometry.coordinates.forEach(
              (ring) => {
                ring.forEach(
                  (coordinate) => {
                    if (
                      coordinate.length >= 2
                    ) {
                      bounds.extend([
                        coordinate[0],
                        coordinate[1],
                      ]);
                    }
                  }
                );
              }
            );
          }
        );

        if (!bounds.isEmpty()) {
          m.fitBounds(
            bounds,
            {
              padding: 70,

              /*
               * Keep initial view broad.
               */
              maxZoom: 13,

              duration: 500,
            }
          );

          hasFittedInitialData.current = true;
        }
      }
    };

    // ============================================================
    // WAIT FOR MAP STYLE
    // ============================================================

    if (m.isStyleLoaded()) {
      addOrUpdateData();
    } else {
      m.once('load', addOrUpdateData);
    }

  }, [
    geojsonData,
    handleParcelClick,
  ]);

  // ============================================================
  // UPDATE SELECTED PARCEL
  // ============================================================

  useEffect(() => {
    const m = map.current;

    if (!m) {
      return;
    }

    const updateHighlight = () => {
      const filter = [
        '==',
        ['get', 'parcel_id'],
        highlightedParcelId || '',
      ] as any;

      if (
        m.getLayer(
          'parcels-selected-fill'
        )
      ) {
        m.setFilter(
          'parcels-selected-fill',
          filter
        );
      }

      if (
        m.getLayer(
          'parcels-highlight'
        )
      ) {
        m.setFilter(
          'parcels-highlight',
          filter
        );
      }
    };

    if (m.isStyleLoaded()) {
      updateHighlight();
    } else {
      m.once(
        'load',
        updateHighlight
      );
    }

  }, [
    highlightedParcelId,
  ]);

  // ============================================================
  // EXTERNAL FIT BOUNDS
  // ============================================================

  useEffect(() => {
    const m = map.current;

    if (!m || !fitBounds) {
      return;
    }

    m.fitBounds(
      fitBounds,
      {
        padding: 40,
        duration: 500,
      }
    );

  }, [
    fitBounds,
  ]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      ref={mapContainer}
      className={`w-full h-full ${className}`}
      role="application"
      aria-label="Interactive GIS map"
    />
  );
}

const MapContainer = memo(
  MapContainerInner
);

export default MapContainer;