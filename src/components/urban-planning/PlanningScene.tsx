import { useEffect, useMemo, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import type {
  GeoJSONFeature,
  GeoJSONFeatureCollection,
  Parcel,
} from '../../types';

interface PlanningSceneProps {
  parcel: Parcel;
  geojson: GeoJSONFeatureCollection;
}

type Coordinate = [number, number];

const MAP_STYLE_URL =
  import.meta.env.VITE_MAP_STYLE_URL ||
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const FALLBACK_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
    },
  ],
};

const BUILDING_HEIGHT = 58.5;
const FLOOR_HEIGHT = 3.05;
const FLOOR_COUNT = 18;

const BUILDING_STONE = '#c9b99d';
const BUILDING_STONE_LIGHT = '#eee7d8';
const BUILDING_STONE_DARK = '#8f816d';
const WINDOW_BLUE = '#315b78';
const WINDOW_DARK = '#1d3547';
const ROOF_COLOR = '#53616d';
const GREEN = '#15803d';

function featureCollection(
  features: GeoJSONFeature[],
): GeoJSONFeatureCollection {
  return {
    type: 'FeatureCollection',
    features,
  };
}

function polygonFeature(
  id: string,
  coordinates: Coordinate[][],
  properties: Record<string, unknown> = {},
): GeoJSONFeature {
  return {
    type: 'Feature',
    id,
    geometry: {
      type: 'Polygon',
      coordinates,
    },
    properties,
  };
}

function boundsFor(
  feature: GeoJSONFeature,
): [[number, number], [number, number]] {
  const ring =
    feature.geometry.coordinates[0] as Coordinate[];

  const lngs = ring.map(([lng]) => lng);
  const lats = ring.map(([, lat]) => lat);

  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}

function centroidFor(
  feature: GeoJSONFeature,
): Coordinate {
  const ring =
    feature.geometry.coordinates[0] as Coordinate[];

  const points = ring.slice(0, -1);

  if (!points.length) {
    return [0, 0];
  }

  const sum = points.reduce(
    (acc, [lng, lat]) => {
      acc[0] += lng;
      acc[1] += lat;
      return acc;
    },
    [0, 0],
  );

  return [
    sum[0] / points.length,
    sum[1] / points.length,
  ];
}

function rectangleAround(
  center: Coordinate,
  width: number,
  depth: number,
  rotationDeg = 0,
): Coordinate[] {
  const [lng, lat] = center;

  const latMeters = 111320;

  const lngMeters =
    Math.cos((lat * Math.PI) / 180) *
    latMeters;

  const halfW = width / 2;
  const halfD = depth / 2;

  const points: [number, number][] = [
    [-halfW, -halfD],
    [halfW, -halfD],
    [halfW, halfD],
    [-halfW, halfD],
  ];

  const angle =
    (rotationDeg * Math.PI) / 180;

  const converted = points.map(
    ([x, y]) => {
      const rx =
        x * Math.cos(angle) -
        y * Math.sin(angle);

      const ry =
        x * Math.sin(angle) +
        y * Math.cos(angle);

      return [
        lng + rx / lngMeters,
        lat + ry / latMeters,
      ] as Coordinate;
    },
  );

  converted.push(converted[0]);

  return converted;
}

function buildingPart(
  id: string,
  center: Coordinate,
  width: number,
  depth: number,
  base: number,
  height: number,
  color: string,
  rotation = 0,
): GeoJSONFeature {
  return polygonFeature(
    id,
    [
      rectangleAround(
        center,
        width,
        depth,
        rotation,
      ),
    ],
    {
      base,
      height,
      color,
    },
  );
}

/* ============================================================
   MAIN ARCHITECTURAL BUILDING
   ============================================================ */

function createBuildingModel(
  selected: GeoJSONFeature,
  parcel: Parcel,
): GeoJSONFeature[] {
  const center =
    centroidFor(selected);

  const parcelArea = Math.max(
    500,
    Number(parcel.area_sq_m) || 1200,
  );

  const footprintArea = Math.min(
    parcelArea * 0.42,
    620,
  );

  const width =
    Math.sqrt(footprintArea) * 1.28;

  const depth =
    Math.sqrt(footprintArea) * 0.78;

  const features: GeoJSONFeature[] = [];

  /* ==========================================================
     PLATFORM
     ========================================================== */

  features.push(
    buildingPart(
      'building-platform',
      center,
      width + 16,
      depth + 16,
      0,
      0.35,
      '#d8d0bf',
    ),
  );

  /* ==========================================================
     BASE / PODIUM
     ========================================================== */

  features.push(
    buildingPart(
      'building-base',
      center,
      width,
      depth,
      0.35,
      5.2,
      BUILDING_STONE_DARK,
    ),
  );

  features.push(
    buildingPart(
      'building-base-upper',
      center,
      width - 1.2,
      depth - 1.2,
      5.2,
      7.8,
      BUILDING_STONE,
    ),
  );

  const shaftStart = 7.8;

  /* ==========================================================
     18 STOREYS
     ========================================================== */

  for (
    let floor = 0;
    floor < FLOOR_COUNT;
    floor += 1
  ) {
    const base =
      shaftStart +
      floor * FLOOR_HEIGHT;

    const top =
      base +
      FLOOR_HEIGHT -
      0.08;

    /* Main floor mass */

    features.push(
      buildingPart(
        `floor-${floor + 1}`,
        center,
        width - 1.8,
        depth - 1.8,
        base,
        top,
        floor % 2 === 0
          ? BUILDING_STONE
          : '#bbaa8f',
      ),
    );

    /* ========================================================
       FRONT WINDOWS
       ======================================================== */

    const windowRows = 5;

    for (
      let window = 0;
      window < windowRows;
      window += 1
    ) {
      const windowWidth =
        (width - 4.2) /
        windowRows;

      const xOffset =
        -width / 2 +
        2.1 +
        windowWidth / 2 +
        window * windowWidth;

      const lngOffset =
        xOffset /
        (111320 *
          Math.cos(
            (center[1] * Math.PI) /
              180,
          ));

      const frontLatOffset =
        (depth / 2 + 0.03) /
        111320;

      const windowCenter: Coordinate = [
        center[0] + lngOffset,
        center[1] + frontLatOffset,
      ];

      features.push(
        buildingPart(
          `front-window-${floor}-${window}`,
          windowCenter,
          Math.max(
            2,
            windowWidth - 0.48,
          ),
          0.18,
          base + 0.45,
          top - 0.42,
          WINDOW_BLUE,
        ),
      );
    }

    /* ========================================================
       BACK WINDOWS
       ======================================================== */

    for (
      let window = 0;
      window < windowRows;
      window += 1
    ) {
      const windowWidth =
        (width - 4.2) /
        windowRows;

      const xOffset =
        -width / 2 +
        2.1 +
        windowWidth / 2 +
        window * windowWidth;

      const lngOffset =
        xOffset /
        (111320 *
          Math.cos(
            (center[1] * Math.PI) /
              180,
          ));

      const backLatOffset =
        -(depth / 2 + 0.03) /
        111320;

      const windowCenter: Coordinate = [
        center[0] + lngOffset,
        center[1] + backLatOffset,
      ];

      features.push(
        buildingPart(
          `back-window-${floor}-${window}`,
          windowCenter,
          Math.max(
            2,
            windowWidth - 0.48,
          ),
          0.18,
          base + 0.45,
          top - 0.42,
          WINDOW_DARK,
        ),
      );
    }

    /* ========================================================
       SIDE WINDOWS
       ======================================================== */

    const sideRows = 3;

    for (
      let window = 0;
      window < sideRows;
      window += 1
    ) {
      const windowDepth =
        (depth - 3.6) /
        sideRows;

      const yOffset =
        -depth / 2 +
        1.8 +
        windowDepth / 2 +
        window * windowDepth;

      const latOffset =
        yOffset / 111320;

      const lngOffset =
        (width / 2 + 0.03) /
        (111320 *
          Math.cos(
            (center[1] * Math.PI) /
              180,
          ));

      const rightCenter: Coordinate = [
        center[0] + lngOffset,
        center[1] + latOffset,
      ];

      features.push(
        buildingPart(
          `right-window-${floor}-${window}`,
          rightCenter,
          0.18,
          Math.max(
            2,
            windowDepth - 0.5,
          ),
          base + 0.45,
          top - 0.42,
          WINDOW_BLUE,
        ),
      );

      const leftCenter: Coordinate = [
        center[0] - lngOffset,
        center[1] + latOffset,
      ];

      features.push(
        buildingPart(
          `left-window-${floor}-${window}`,
          leftCenter,
          0.18,
          Math.max(
            2,
            windowDepth - 0.5,
          ),
          base + 0.45,
          top - 0.42,
          WINDOW_BLUE,
        ),
      );
    }

    /* ========================================================
       FLOOR STRING COURSE
       ======================================================== */

    features.push(
      buildingPart(
        `floor-band-${floor}`,
        center,
        width + 0.25,
        depth + 0.25,
        top - 0.1,
        top + 0.16,
        BUILDING_STONE_LIGHT,
      ),
    );
  }

  /* ==========================================================
     CORNER PILASTERS
     ========================================================== */

  const cornerOffsets = [
    [
      -width / 2 + 0.7,
      -depth / 2 + 0.7,
    ],
    [
      width / 2 - 0.7,
      -depth / 2 + 0.7,
    ],
    [
      width / 2 - 0.7,
      depth / 2 - 0.7,
    ],
    [
      -width / 2 + 0.7,
      depth / 2 - 0.7,
    ],
  ];

  cornerOffsets.forEach(
    ([x, y], index) => {
      const lng =
        center[0] +
        x /
          (111320 *
            Math.cos(
              (center[1] * Math.PI) /
                180,
            ));

      const lat =
        center[1] +
        y / 111320;

      features.push(
        buildingPart(
          `corner-pilaster-${index}`,
          [lng, lat],
          1.1,
          1.1,
          7.8,
          BUILDING_HEIGHT,
          BUILDING_STONE_LIGHT,
        ),
      );
    },
  );

  /* ==========================================================
     MAJOR CORNICES
     ========================================================== */

  [17, 35, 53].forEach(
    (height, index) => {
      features.push(
        buildingPart(
          `major-cornice-${index}`,
          center,
          width + 1.2,
          depth + 1.2,
          height,
          height + 0.65,
          BUILDING_STONE_LIGHT,
        ),
      );
    },
  );

  /* ==========================================================
     ORNAMENTAL CROWN
     ========================================================== */

  features.push(
    buildingPart(
      'crown-main',
      center,
      width + 0.8,
      depth + 0.8,
      52.5,
      56,
      BUILDING_STONE_LIGHT,
    ),
  );

  features.push(
    buildingPart(
      'crown-recess',
      center,
      width - 2,
      depth - 2,
      56,
      57.4,
      BUILDING_STONE,
    ),
  );

  /* ==========================================================
     ROOFTOP PENTHOUSE
     ========================================================== */

  features.push(
    buildingPart(
      'penthouse',
      center,
      width * 0.54,
      depth * 0.54,
      57.4,
      58.15,
      BUILDING_STONE_DARK,
    ),
  );

  /* ==========================================================
     ROOF
     ========================================================== */

  features.push(
    buildingPart(
      'roof-cap',
      center,
      width * 0.72,
      depth * 0.72,
      58.15,
      BUILDING_HEIGHT,
      ROOF_COLOR,
    ),
  );

  return features;
}

/* ============================================================
   CONTEXT BUILDINGS
   ============================================================ */

function createContextBuildings(
  geojson: GeoJSONFeatureCollection,
  selectedIndex: number,
): GeoJSONFeature[] {
  return geojson.features
    .filter(
      (_, index) =>
        index !== selectedIndex &&
        Math.abs(
          index - selectedIndex,
        ) <= 15,
    )
    .slice(0, 15)
    .map(
      (feature, index) => {
        const ring =
          feature.geometry
            .coordinates[0] as Coordinate[];

        const lngs =
          ring.map(
            ([lng]) => lng,
          );

        const lats =
          ring.map(
            ([, lat]) => lat,
          );

        const height =
          Math.max(
            4,
            Math.min(
              30,
              Number(
                feature.properties
                  .average_building_height_m,
              ) || 8,
            ),
          );

        return polygonFeature(
          `context-${index}`,
          [
            [
              [
                Math.min(...lngs),
                Math.min(...lats),
              ],
              [
                Math.max(...lngs),
                Math.min(...lats),
              ],
              [
                Math.max(...lngs),
                Math.max(...lats),
              ],
              [
                Math.min(...lngs),
                Math.max(...lats),
              ],
              [
                Math.min(...lngs),
                Math.min(...lats),
              ],
            ],
          ],
          {
            height,
          },
        );
      },
    );
}

/* ============================================================
   TREES
   ============================================================ */

function createTrees(
  feature: GeoJSONFeature,
): GeoJSONFeature[] {
  const center =
    centroidFor(feature);

  const positions = [
    [-14, -10],
    [14, -10],
    [-14, 10],
    [14, 10],
    [0, 14],
    [0, -14],
  ];

  return positions.map(
    ([x, y], index) => {
      const lng =
        center[0] +
        x /
          (111320 *
            Math.cos(
              (center[1] * Math.PI) /
                180,
            ));

      const lat =
        center[1] +
        y / 111320;

      return polygonFeature(
        `tree-${index}`,
        [
          rectangleAround(
            [lng, lat],
            2.2,
            2.2,
          ),
        ],
        {
          height:
            5.5 +
            (index % 2),
        },
      );
    },
  );
}

/* ============================================================
   WIND LINES
   ============================================================ */

function createWindLines(
  feature: GeoJSONFeature,
): GeoJSONFeature[] {
  const [
    [minLng, minLat],
    [maxLng, maxLat],
  ] = boundsFor(feature);

  const ySpan =
    maxLat - minLat;

  const xSpan =
    maxLng - minLng;

  return [0.25, 0.5, 0.75].map(
    (position, index) => ({
      type: 'Feature',
      id: `wind-${index}`,
      geometry: {
        type: 'LineString',
        coordinates: [
          [
            minLng -
              xSpan * 0.35,
            minLat +
              ySpan * position,
          ],
          [
            maxLng +
              xSpan * 0.35,
            minLat +
              ySpan *
                (position + 0.05),
          ],
        ],
      },
      properties: {},
    }),
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function PlanningScene({
  parcel,
  geojson,
}: PlanningSceneProps) {
  const container =
    useRef<HTMLDivElement>(null);

  const mapRef =
    useRef<maplibregl.Map | null>(
      null,
    );

  const [mode, setMode] =
    useState<
      'context' | 'planning'
    >('planning');

  const [mapError, setMapError] =
    useState<string | null>(null);

  /* ==========================================================
     BUILD SCENE DATA
     ========================================================== */

  const sceneData = useMemo(() => {
    const selectedIndex =
      geojson.features.findIndex(
        (feature) =>
          feature.properties
            .parcel_id ===
          parcel.parcel_id,
      );

    if (selectedIndex < 0) {
      return null;
    }

    const selected =
      geojson.features[selectedIndex];

    return {
      selected,
      building:
        createBuildingModel(
          selected,
          parcel,
        ),
      context:
        createContextBuildings(
          geojson,
          selectedIndex,
        ),
      trees:
        createTrees(selected),
      wind:
        createWindLines(selected),
    };
  }, [geojson, parcel]);

  /* ==========================================================
     CREATE MAP
     ========================================================== */

  useEffect(() => {
    if (
      !container.current ||
      !sceneData ||
      mapRef.current
    ) {
      return;
    }

    const selectedBounds =
      boundsFor(sceneData.selected);

    const center: Coordinate = [
      (
        selectedBounds[0][0] +
        selectedBounds[1][0]
      ) / 2,
      (
        selectedBounds[0][1] +
        selectedBounds[1][1]
      ) / 2,
    ];

    const map =
      new maplibregl.Map({
        container:
          container.current,

        style:
          MAP_STYLE_URL,

        center,

        zoom: 18,

        pitch: 62,

        bearing: -25,

        attributionControl:
          false,

        maxPitch: 80,
      });

    mapRef.current = map;

    (
      window as typeof window & {
        __bhumiPlanningMap?: maplibregl.Map;
      }
    ).__bhumiPlanningMap = map;

    map.addControl(
      new maplibregl.NavigationControl(
        {
          visualizePitch: true,
        },
      ),
      'top-right',
    );

    map.addControl(
      new maplibregl.ScaleControl(
        {
          unit: 'metric',
        },
      ),
      'bottom-left',
    );

    let layersAdded = false;

    const addLayers = () => {
      if (layersAdded) {
        return;
      }

      layersAdded = true;

      /* ======================================================
         CONTEXT BUILDINGS
         ====================================================== */

      map.addSource(
        'bhumi-context',
        {
          type: 'geojson',
          data:
            featureCollection(
              sceneData.context,
            ) as never,
        },
      );

      map.addLayer({
        id:
          'bhumi-context-buildings',

        type:
          'fill-extrusion',

        source:
          'bhumi-context',

        paint: {
          'fill-extrusion-color':
            '#aab3bb',

          'fill-extrusion-height':
            ['get', 'height'] as never,

          'fill-extrusion-base':
            0,

          'fill-extrusion-opacity':
            0.55,
        },
      });

      /* ======================================================
         SELECTED PARCEL
         ====================================================== */

      map.addSource(
        'bhumi-selected-parcel',
        {
          type: 'geojson',

          data:
            sceneData.selected as never,
        },
      );

      map.addLayer({
        id:
          'bhumi-parcel-fill',

        type: 'fill',

        source:
          'bhumi-selected-parcel',

        paint: {
          'fill-color':
            '#4ade80',

          'fill-opacity':
            0.23,
        },
      });

      map.addLayer({
        id:
          'bhumi-parcel-outline',

        type: 'line',

        source:
          'bhumi-selected-parcel',

        paint: {
          'line-color':
            '#15803d',

          'line-width':
            3,

          'line-opacity':
            0.95,
        },
      });

      /* ======================================================
         TREES
         ====================================================== */

      map.addSource(
        'bhumi-trees',
        {
          type: 'geojson',

          data:
            featureCollection(
              sceneData.trees,
            ) as never,
        },
      );

      map.addLayer({
        id:
          'bhumi-trees-3d',

        type:
          'fill-extrusion',

        source:
          'bhumi-trees',

        paint: {
          'fill-extrusion-color':
            GREEN,

          'fill-extrusion-height':
            ['get', 'height'] as never,

          'fill-extrusion-base':
            0,

          'fill-extrusion-opacity':
            0.88,
        },
      });

      /* ======================================================
         MAIN BUILDING
         ====================================================== */

      map.addSource(
        'bhumi-main-building',
        {
          type: 'geojson',

          data:
            featureCollection(
              sceneData.building,
            ) as never,
        },
      );

      map.addLayer({
        id:
          'bhumi-building-main',

        type:
          'fill-extrusion',

        source:
          'bhumi-main-building',

        paint: {
          'fill-extrusion-color':
            ['get', 'color'] as never,

          'fill-extrusion-base':
            ['get', 'base'] as never,

          'fill-extrusion-height':
            ['get', 'height'] as never,

          'fill-extrusion-opacity':
            1,

          'fill-extrusion-vertical-gradient':
            true,
        },
      });

      /* ======================================================
         WIND
         ====================================================== */

      map.addSource(
        'bhumi-wind',
        {
          type: 'geojson',

          data:
            featureCollection(
              sceneData.wind,
            ) as never,
        },
      );

      map.addLayer({
        id:
          'bhumi-wind-lines',

        type: 'line',

        source:
          'bhumi-wind',

        paint: {
          'line-color':
            '#0891b2',

          'line-width':
            2,

          'line-opacity':
            0.65,

          'line-dasharray':
            [1.5, 2],
        },
      });

      /* ======================================================
         SOLAR
         ====================================================== */

      map.addSource(
        'bhumi-solar',
        {
          type: 'geojson',

          data:
            sceneData.selected as never,
        },
      );

      map.addLayer({
        id:
          'bhumi-solar-overlay',

        type: 'fill',

        source:
          'bhumi-solar',

        paint: {
          'fill-color':
            '#f59e0b',

          'fill-opacity':
            0.08,
        },
      });

      /* ======================================================
         CAMERA
         ====================================================== */

      map.fitBounds(
        selectedBounds,
        {
          padding: 100,
          maxZoom: 18.5,
          duration: 0,
        },
      );

      map.easeTo({
        pitch: 62,
        bearing: -25,
        duration: 0,
      });

      requestAnimationFrame(
        () => map.resize(),
      );
    };

    if (map.isStyleLoaded()) {
      addLayers();
    } else {
      map.once(
        'load',
        addLayers,
      );
    }

    map.on(
      'error',
      (event) => {
        console.error(
          'BHUMI-X MapLibre error:',
          event,
        );

        if (!layersAdded) {
          setMapError(
            'Basemap unavailable. Switching to OpenStreetMap.',
          );

          map.setStyle(
            FALLBACK_STYLE,
          );

          map.once(
            'style.load',
            addLayers,
          );
        }
      },
    );

    const resizeObserver =
      new ResizeObserver(() => {
        map.resize();
      });

    resizeObserver.observe(
      container.current,
    );

    return () => {
      resizeObserver.disconnect();

      delete (
        window as typeof window & {
          __bhumiPlanningMap?: maplibregl.Map;
        }
      ).__bhumiPlanningMap;

      map.remove();

      mapRef.current = null;
    };
  }, [sceneData]);

  /* ==========================================================
     MODE SWITCH
     ========================================================== */

  useEffect(() => {
    const map =
      mapRef.current;

    if (!map) {
      return;
    }

    const planningVisibility =
      mode === 'planning'
        ? 'visible'
        : 'none';

    const contextVisibility =
      mode === 'context'
        ? 'visible'
        : 'none';

    [
      'bhumi-building-main',
      'bhumi-trees-3d',
      'bhumi-wind-lines',
      'bhumi-solar-overlay',
    ].forEach(
      (layerId) => {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(
            layerId,
            'visibility',
            planningVisibility,
          );
        }
      },
    );

    if (
      map.getLayer(
        'bhumi-context-buildings',
      )
    ) {
      map.setLayoutProperty(
        'bhumi-context-buildings',
        'visibility',
        contextVisibility,
      );
    }

    map.easeTo({
      pitch:
        mode === 'planning'
          ? 62
          : 0,

      bearing:
        mode === 'planning'
          ? -25
          : 0,

      duration: 650,
    });
  }, [mode]);

  if (!sceneData) {
    return (
      <div className="h-[560px] grid place-items-center bg-slate-50 text-sm text-slate-500">
        GIS geometry unavailable for this parcel.
      </div>
    );
  }

  /* ==========================================================
     RESET CAMERA
     ========================================================== */

  const resetCamera = () => {
    const map =
      mapRef.current;

    if (!map) {
      return;
    }

    const bounds =
      boundsFor(
        sceneData.selected,
      );

    map.fitBounds(
      bounds,
      {
        padding: 100,
        maxZoom: 18.5,
        duration: 700,
      },
    );

    map.easeTo({
      pitch: 62,
      bearing: -25,
      duration: 700,
    });
  };

  /* ==========================================================
     UI
     ========================================================== */

  return (
    <div className="relative h-[560px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">

      <div
        ref={container}
        className="absolute inset-0"
        style={{
          width: '100%',
          height: '100%',
        }}
        aria-label="BHUMI-X Urban Planning 3D Map"
      />

      {mapError && (
        <div className="absolute right-16 top-4 z-20 rounded-md bg-amber-50 px-3 py-2 text-[11px] text-amber-800 shadow">
          {mapError}
        </div>
      )}

      <div className="absolute left-4 top-4 z-20 flex rounded-lg border border-slate-200 bg-white p-1 shadow-md">

        <button
          type="button"
          onClick={() =>
            setMode('context')
          }
          className={`rounded-md px-3 py-2 text-xs font-semibold ${
            mode === 'context'
              ? 'bg-slate-800 text-white'
              : 'text-slate-600'
          }`}
        >
          2D CONTEXT
        </button>

        <button
          type="button"
          onClick={() =>
            setMode('planning')
          }
          className={`rounded-md px-3 py-2 text-xs font-semibold ${
            mode === 'planning'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600'
          }`}
        >
          3D PLANNING
        </button>

      </div>

      <button
        type="button"
        onClick={resetCamera}
        className="absolute left-4 top-16 z-20 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-md hover:bg-slate-50"
      >
        Reset 3D Camera
      </button>

      <div className="absolute bottom-4 left-4 z-20 max-w-sm rounded-xl border border-blue-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">

        <p className="text-[11px] font-bold tracking-[0.18em] text-blue-700">
          BHUMI-X URBAN PLANNING
        </p>

        <p className="mt-1 text-xl font-bold text-slate-900">
          Future Development Scenario
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-600">
          Conceptual 3D development generated from parcel-level land, urban morphology and environmental intelligence.
        </p>

        <div className="mt-2 text-[11px] font-semibold text-slate-500">
          18-storey conceptual building • 58.5 m indicative height
        </div>

      </div>

      {mode === 'planning' && (
        <div className="pointer-events-none absolute bottom-4 right-4 z-20 space-y-2 text-xs">

          <div className="rounded-lg border border-cyan-200 bg-white/95 px-3 py-2 shadow-md">
            <span className="font-bold text-cyan-700">
              WIND
            </span>

            <span className="ml-2 text-slate-600">
              {Number(
                parcel.wind_speed_ms || 0,
              ).toFixed(1)}{' '}
              m/s
            </span>
          </div>

          <div className="rounded-lg border border-amber-200 bg-white/95 px-3 py-2 shadow-md">
            <span className="font-bold text-amber-700">
              SOLAR
            </span>

            <span className="ml-2 text-slate-600">
              {Number(
                parcel.solar_radiation_kwh_m2 ||
                  0,
              ).toFixed(1)}{' '}
              kWh/m²
            </span>
          </div>

          <div className="rounded-lg border border-orange-200 bg-white/95 px-3 py-2 shadow-md">
            <span className="font-bold text-orange-700">
              HEAT STRESS
            </span>

            <span className="ml-2 text-slate-600">
              {Number(
                parcel.heat_stress_pct || 0,
              ).toFixed(0)}
              %
            </span>
          </div>

        </div>
      )}

    </div>
  );
}