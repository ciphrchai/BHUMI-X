import {
  useRef,
  useEffect,
  useCallback,
  useState,
  memo,
} from 'react';

import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import maplibreWorker from
  'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

import { useMapStore } from '../../stores';

import type {
  GeoJSONFeatureCollection,
} from '../../types';


// ============================================================
// MAPLIBRE WORKER
// ============================================================

maplibregl.setWorkerUrl(maplibreWorker);


// ============================================================
// MAP STYLE
// ============================================================

const MAP_STYLE_URL =
  import.meta.env.VITE_MAP_STYLE_URL ||
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';


// ============================================================
// PROPS
// ============================================================

interface MapContainerProps {
  geojsonData?: GeoJSONFeatureCollection;

  onParcelClick?: (
    parcelId: string
  ) => void;

  highlightedParcelId?: string | null;

  className?: string;

  interactive?: boolean;

  fitBounds?: [
    [number, number],
    [number, number]
  ];
}


// ============================================================
// COMPONENT
// ============================================================

function MapContainerInner({
  geojsonData,
  onParcelClick,
  highlightedParcelId,
  className = '',
  interactive = true,
  fitBounds,
}: MapContainerProps) {

  const mapContainer =
    useRef<HTMLDivElement>(null);

  const map =
    useRef<maplibregl.Map | null>(null);

  const hasFitted =
    useRef(false);

  const clickAttached =
    useRef(false);

  const [is3D, setIs3D] =
    useState(false);

  const {
    viewState,
    setViewState,
  } = useMapStore();


  // ==========================================================
  // CLICK HANDLER
  // ==========================================================

  const handleParcelClick =
    useCallback(
      (
        e: maplibregl.MapMouseEvent & {
          features?: maplibregl.MapGeoJSONFeature[];
        }
      ) => {

        if (
          !e.features ||
          e.features.length === 0
        ) {
          return;
        }

        const feature =
          e.features[0];

        const parcelId =
          feature.properties?.parcel_id ??
          feature.id;

        if (
          parcelId &&
          onParcelClick
        ) {
          onParcelClick(
            String(parcelId)
          );
        }
      },
      [onParcelClick]
    );


  // ==========================================================
  // INITIALIZE MAP
  // ==========================================================

  useEffect(() => {

    if (
      !mapContainer.current ||
      map.current
    ) {
      return;
    }

    const m =
      new maplibregl.Map({

        container:
          mapContainer.current,

        style:
          MAP_STYLE_URL,

        center:
          viewState.center,

        zoom:
          viewState.zoom,

        pitch:
          0,

        bearing:
          0,

        attributionControl:
          false,

        interactive,

      });


    // Navigation
    m.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );


    // Scale
    m.addControl(
      new maplibregl.ScaleControl({
        unit: 'metric',
      }),
      'bottom-left'
    );


    // Save camera
    m.on(
      'moveend',
      () => {

        const center =
          m.getCenter();

        setViewState({

          center: [
            center.lng,
            center.lat,
          ],

          zoom:
            m.getZoom(),

        });

      }
    );


    map.current = m;


    return () => {

      m.remove();

      map.current = null;

      clickAttached.current =
        false;

    };

    // Initialize only once.
    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, []);


  // ==========================================================
  // ADD PARCEL DATA
  // ==========================================================

  useEffect(() => {

    const m =
      map.current;

    if (
      !m ||
      !geojsonData
    ) {
      return;
    }


    const setupLayers =
      () => {

        if (!m.getSource('parcels')) {

          // ====================================================
          // GEOJSON SOURCE
          // ====================================================

          m.addSource(
            'parcels',
            {
              type: 'geojson',

              data:
                geojsonData as any,

              tolerance:
                0.375,

              buffer:
                0,

            }
          );


          // ====================================================
          // NORMAL 2D PARCELS
          // ====================================================

          m.addLayer({

            id:
              'parcels-fill',

            type:
              'fill',

            source:
              'parcels',

            minzoom:
              11,

            paint: {

              'fill-color': [

                'match',

                [
                  'get',
                  'suitability_status',
                ],

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

              'fill-opacity': [

                'interpolate',

                ['linear'],

                ['zoom'],

                11,
                0.03,

                13,
                0.05,

                14,
                0.08,

                15,
                0.14,

                16,
                0.22,

                17,
                0.30,

                18,
                0.38,

              ] as any,

            },

          });


          // ====================================================
          // OUTLINE
          // ====================================================

          m.addLayer({

            id:
              'parcels-outline',

            type:
              'line',

            source:
              'parcels',

            minzoom:
              14,

            paint: {

              'line-color':
                '#475569',

              'line-width': [

                'interpolate',

                ['linear'],

                ['zoom'],

                14,
                0.25,

                15,
                0.40,

                16,
                0.60,

                17,
                0.80,

                18,
                1.0,

              ] as any,

              'line-opacity': [

                'interpolate',

                ['linear'],

                ['zoom'],

                14,
                0.15,

                15,
                0.25,

                16,
                0.40,

                17,
                0.55,

                18,
                0.70,

              ] as any,

            },

          });


          // ====================================================
          // 3D BUILDING / URBAN MASSING
          //
          // IMPORTANT:
          // Use simple MapLibre expressions for stability.
          // ====================================================

          m.addLayer({

            id:
              'buildings-3d',

            type:
              'fill-extrusion',

            source:
              'parcels',

            minzoom:
              12,

            layout: {

              visibility:
                'none',

            },

            paint: {

              // Height from dataset.
              // 2.5x visual exaggeration.

              'fill-extrusion-height': [

                '*',

                [

                  'coalesce',

                  [
                    'get',
                    'average_building_height_m',
                  ],

                  8,

                ],

                2.5,

              ] as any,


              'fill-extrusion-base':
                0,


              'fill-extrusion-color': [

                'match',

                [
                  'get',
                  'suitability_status',
                ],

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


              'fill-extrusion-opacity':
                0.82,

              'fill-extrusion-vertical-gradient':
                true,

            },

          });


          // ====================================================
          // SELECTED PARCEL
          // ====================================================

          m.addLayer({

            id:
              'parcels-selected-fill',

            type:
              'fill',

            source:
              'parcels',

            paint: {

              'fill-color':
                '#2563eb',

              'fill-opacity':
                0.50,

            },

            filter: [

              '==',

              [
                'get',
                'parcel_id',
              ],

              '',

            ] as any,

          });


          // ====================================================
          // SELECTED BORDER
          // ====================================================

          m.addLayer({

            id:
              'parcels-highlight',

            type:
              'line',

            source:
              'parcels',

            paint: {

              'line-color':
                '#1d4ed8',

              'line-width':
                4,

              'line-opacity':
                1,

            },

            filter: [

              '==',

              [
                'get',
                'parcel_id',
              ],

              '',

            ] as any,

          });

        }
        else {

          // ====================================================
          // SOURCE ALREADY EXISTS
          // ====================================================

          const source =
            m.getSource(
              'parcels'
            ) as maplibregl.GeoJSONSource;

          source.setData(
            geojsonData as any
          );

        }


        // ======================================================
        // CLICK HANDLER
        // ======================================================

        if (
          !clickAttached.current
        ) {

          m.on(
            'click',
            'parcels-fill',
            handleParcelClick
          );

          clickAttached.current =
            true;


          m.on(
            'mouseenter',
            'parcels-fill',
            () => {

              m.getCanvas()
                .style.cursor =
                'pointer';

            }
          );


          m.on(
            'mouseleave',
            'parcels-fill',
            () => {

              m.getCanvas()
                .style.cursor =
                '';

            }
          );

        }


        // ======================================================
        // INITIAL FIT
        // ======================================================

        if (
          !hasFitted.current &&
          geojsonData.features.length > 0
        ) {

          const bounds =
            new maplibregl.LngLatBounds();


          geojsonData.features.forEach(
            (feature) => {

              if (
                feature.geometry.type !==
                'Polygon'
              ) {
                return;
              }


              feature.geometry.coordinates.forEach(
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


          if (
            !bounds.isEmpty()
          ) {

            m.fitBounds(
              bounds,
              {

                padding:
                  70,

                maxZoom:
                  13,

                duration:
                  500,

              }
            );


            hasFitted.current =
              true;

          }

        }


        // ======================================================
        // APPLY CURRENT MODE AFTER LAYERS EXIST
        // ======================================================

        applyMode(
          m,
          is3D
        );

      };


    // ==========================================================
    // WAIT FOR STYLE
    // ==========================================================

    if (
      m.isStyleLoaded()
    ) {

      setupLayers();

    }
    else {

      m.once(
        'load',
        setupLayers
      );

    }


  }, [
    geojsonData,
    handleParcelClick,
  ]);


  // ============================================================
  // 2D / 3D MODE
  // ============================================================

  useEffect(() => {

    const m =
      map.current;

    if (!m) {
      return;
    }


    const run =
      () => {

        applyMode(
          m,
          is3D
        );

      };


    if (
      m.isStyleLoaded()
    ) {

      run();

    }
    else {

      m.once(
        'load',
        run
      );

    }

  }, [
    is3D,
  ]);


  // ============================================================
  // SELECTED PARCEL
  // ============================================================

  useEffect(() => {

    const m =
      map.current;

    if (!m) {
      return;
    }


    const update =
      () => {

        const filter = [

          '==',

          [
            'get',
            'parcel_id',
          ],

          highlightedParcelId ||
            '',

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


    if (
      m.isStyleLoaded()
    ) {

      update();

    }
    else {

      m.once(
        'load',
        update
      );

    }

  }, [
    highlightedParcelId,
  ]);


  // ============================================================
  // EXTERNAL FIT
  // ============================================================

  useEffect(() => {

    const m =
      map.current;

    if (
      !m ||
      !fitBounds
    ) {
      return;
    }


    m.fitBounds(
      fitBounds,
      {

        padding:
          40,

        duration:
          500,

      }
    );

  }, [
    fitBounds,
  ]);


  // ============================================================
  // UI
  // ============================================================

  return (

    <div
      className={`
        relative
        w-full
        h-full
        ${className}
      `}
    >

      {/* MAP */}

      <div
        ref={mapContainer}
        className="
          absolute
          inset-0
          w-full
          h-full
        "
        role="application"
        aria-label="Interactive GIS map"
      />


      {/* 2D / 3D SWITCH */}

      <div
        className="
          absolute
          top-4
          left-4
          z-20
          flex
          items-center
          rounded-xl
          border
          border-gray-200
          bg-white
          p-1
          shadow-lg
        "
      >

        <button
          type="button"
          onClick={() =>
            setIs3D(false)
          }
          className={`
            rounded-lg
            px-4
            py-2
            text-sm
            font-semibold
            transition
            ${
              !is3D
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          2D
        </button>


        <button
          type="button"
          onClick={() =>
            setIs3D(true)
          }
          className={`
            rounded-lg
            px-4
            py-2
            text-sm
            font-semibold
            transition
            ${
              is3D
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          3D
        </button>


        <span
          className="
            hidden
            sm:block
            px-3
            text-xs
            font-medium
            text-gray-500
          "
        >
          {is3D
            ? 'Urban 3D Intelligence'
            : 'Parcel Intelligence'}
        </span>

      </div>


      {/* 3D INFORMATION */}

      {is3D && (

        <div
          className="
            absolute
            bottom-4
            left-4
            z-20
            rounded-lg
            border
            border-blue-200
            bg-white/95
            px-3
            py-2
            text-xs
            text-gray-600
            shadow-md
          "
        >

          <div
            className="
              font-semibold
              text-gray-900
            "
          >
            Urban 3D Massing
          </div>

          <div>
            Building height data
          </div>

        </div>

      )}

    </div>

  );
}


// ============================================================
// MODE FUNCTION
// ============================================================

function applyMode(
  m: maplibregl.Map,
  mode3D: boolean
) {

  const fill =
    m.getLayer(
      'parcels-fill'
    );

  const outline =
    m.getLayer(
      'parcels-outline'
    );

  const buildings =
    m.getLayer(
      'buildings-3d'
    );


  // ==========================================================
  // 3D
  // ==========================================================

  if (mode3D) {

    if (fill) {

      m.setLayoutProperty(
        'parcels-fill',
        'visibility',
        'visible'
      );

    }


    if (outline) {

      m.setLayoutProperty(
        'parcels-outline',
        'visibility',
        'visible'
      );

    }


    if (buildings) {

      m.setLayoutProperty(
        'buildings-3d',
        'visibility',
        'visible'
      );

    }


    m.easeTo({

      pitch:
        58,

      bearing:
        -15,

      duration:
        900,

    });

  }


  // ==========================================================
  // 2D
  // ==========================================================

  else {

    if (buildings) {

      m.setLayoutProperty(
        'buildings-3d',
        'visibility',
        'none'
      );

    }


    if (fill) {

      m.setLayoutProperty(
        'parcels-fill',
        'visibility',
        'visible'
      );

    }


    if (outline) {

      m.setLayoutProperty(
        'parcels-outline',
        'visibility',
        'visible'
      );

    }


    m.easeTo({

      pitch:
        0,

      bearing:
        0,

      duration:
        700,

    });

  }

}


// ============================================================
// EXPORT
// ============================================================

const MapContainer =
  memo(
    MapContainerInner
  );

export default MapContainer;