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
        feature.properties?.parcel_id ||
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


    // Save map position
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
  // ADD GEOJSON
  // ============================================================

  useEffect(() => {

    const m = map.current;

    if (!m || !geojsonData) {
      return;
    }


    const addData = () => {

      // --------------------------------------------------------
      // Remove old layers
      // --------------------------------------------------------

      const layers = [
        'parcels-selected-fill',
        'parcels-highlight',
        'parcels-fill',
        'parcels-outline',
      ];

      layers.forEach((layer) => {

        if (m.getLayer(layer)) {
          m.removeLayer(layer);
        }

      });


      // --------------------------------------------------------
      // Remove old source
      // --------------------------------------------------------

      if (m.getSource('parcels')) {
        m.removeSource('parcels');
      }


      // --------------------------------------------------------
      // Add source
      // --------------------------------------------------------

      m.addSource('parcels', {
        type: 'geojson',

        data: geojsonData as unknown as GeoJSON.GeoJSON,
      });


      // --------------------------------------------------------
      // Parcel fill
      // --------------------------------------------------------

      m.addLayer({

        id: 'parcels-fill',

        type: 'fill',

        source: 'parcels',

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
          ],

          'fill-opacity': 0.38,
        },

      });


      // --------------------------------------------------------
      // Parcel outline
      // --------------------------------------------------------

      m.addLayer({

        id: 'parcels-outline',

        type: 'line',

        source: 'parcels',

        paint: {

          'line-color': '#475569',

          'line-width': 0.8,

          'line-opacity': 0.7,

        },

      });


      // --------------------------------------------------------
      // Selected fill
      // --------------------------------------------------------

      m.addLayer({

        id: 'parcels-selected-fill',

        type: 'fill',

        source: 'parcels',

        paint: {

          'fill-color': '#2563eb',

          'fill-opacity': 0.35,

        },

        filter: [

          '==',

          ['get', 'parcel_id'],

          '',

        ],

      });


      // --------------------------------------------------------
      // Selected border
      // --------------------------------------------------------

      m.addLayer({

        id: 'parcels-highlight',

        type: 'line',

        source: 'parcels',

        paint: {

          'line-color': '#1d4ed8',

          'line-width': 4,

          'line-opacity': 1,

        },

        filter: [

          '==',

          ['get', 'parcel_id'],

          '',

        ],

      });


      // --------------------------------------------------------
      // Cursor
      // --------------------------------------------------------

      m.on(
        'mouseenter',
        'parcels-fill',
        () => {

          m.getCanvas().style.cursor =
            'pointer';

        }
      );


      m.on(
        'mouseleave',
        'parcels-fill',
        () => {

          m.getCanvas().style.cursor =
            '';

        }
      );


      // --------------------------------------------------------
      // Click
      // --------------------------------------------------------

      m.on(
        'click',
        'parcels-fill',
        handleParcelClick
      );


      // ========================================================
      // AUTOMATICALLY FIT MAP TO PARCELS
      // ========================================================

      if (geojsonData.features.length > 0) {

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
              padding: 60,

              maxZoom: 15,

              duration: 800,
            }
          );

        }

      }

    };


    // Wait for map style
    if (m.isStyleLoaded()) {

      addData();

    } else {

      m.once(
        'load',
        addData
      );

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

      const filter:
        maplibregl.ExpressionSpecification =
        [
          '==',

          ['get', 'parcel_id'],

          highlightedParcelId || '',
        ];


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

        duration: 800,
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


const MapContainer =
  memo(MapContainerInner);


export default MapContainer;