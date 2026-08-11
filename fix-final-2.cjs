const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, regex, replacement) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(regex, replacement);
  fs.writeFileSync(filePath, content);
}

// 1. Fix MapContainer MapanyFeature back to MapGeoJSONFeature
replaceInFile(path.join(__dirname, 'src/components/gis/MapContainer.tsx'), /MapanyFeature/g, 'MapGeoJSONFeature');
replaceInFile(path.join(__dirname, 'src/components/gis/MapContainer.tsx'), /anyFeatureCollection/g, 'GeoJSONFeatureCollection');

// 2. Fix analysis mock
replaceInFile(path.join(__dirname, 'src/mock/analysis.ts'), /accessibility_top_score/g, 'accessibility_score');
replaceInFile(path.join(__dirname, 'src/mock/analysis.ts'), /population_top_score/g, 'population_score');
replaceInFile(path.join(__dirname, 'src/mock/analysis.ts'), /land_suitability_top_score/g, 'land_suitability_score');
replaceInFile(path.join(__dirname, 'src/mock/analysis.ts'), /environment_top_score/g, 'environment_score');
replaceInFile(path.join(__dirname, 'src/mock/analysis.ts'), /facility_gap_top_score/g, 'facility_gap_score');
replaceInFile(path.join(__dirname, 'src/mock/analysis.ts'), /infrastructure_top_score/g, 'infrastructure_score');
replaceInFile(path.join(__dirname, 'src/mock/analysis.ts'), /overall_top_score/g, 'overall_score');

// 3. Fix dataHealth mock (restore full object)
fs.writeFileSync(path.join(__dirname, 'src/mock/dataHealth.ts'), `import type { DataHealthReport } from '../types';

export const mockDataHealth: DataHealthReport = {
  total_parcels: 18421,
  valid_geometries: 17982,
  invalid_geometries: 439,
  land_use_completeness: 87,
  ownership_completeness: 91,
  data_freshness: '2023-10-15'
};
`);

// 4. Fix facilities mock
replaceInFile(path.join(__dirname, 'src/mock/facilities.ts'), /default_radius: \d+, ?/g, '');

// 5. Fix reports mock
replaceInFile(path.join(__dirname, 'src/mock/reports.ts'), /type: 'pdf', ?/g, '');
replaceInFile(path.join(__dirname, 'src/mock/reports.ts'), /size: '[^']+' ?/g, ''); // size might also be missing

// 6. Fix ResultsPage
replaceInFile(path.join(__dirname, 'src/pages/ResultsPage.tsx'), /const \{ facility, region \} = useAnalysisStore\(\) as any;/g, 'const { selectedFacility: facility, selectedRegion: region } = useAnalysisStore();');
replaceInFile(path.join(__dirname, 'src/pages/ResultsPage.tsx'), /const \{ selectedFacility: facility, selectedRegion: region \} = useAnalysisStore\(\) as any; \/\/.*/g, 'const { selectedFacility: facility, selectedRegion: region } = useAnalysisStore();');

// 7. Fix mapStore MapLayer
let msPath = path.join(__dirname, 'src/stores/mapStore.ts');
let ms = fs.readFileSync(msPath, 'utf8');
if (!ms.includes('MapLayer')) {
  ms = ms.replace(/import type \{([^}]*)\} from '\.\.\/types';/, "import type { $1, MapLayer } from '../types';");
  fs.writeFileSync(msPath, ms);
} else if (!ms.match(/import type \{[^}]*MapLayer[^}]*\} from '\.\.\/types';/)) {
  ms = ms.replace(/import type \{([^}]*)\} from '\.\.\/types';/, "import type { $1, MapLayer } from '../types';");
  fs.writeFileSync(msPath, ms);
}

// 8. Fix Navbar React import
replaceInFile(path.join(__dirname, 'src/components/layout/Navbar.tsx'), /import React from 'react';\n?/g, '');
// SimulatorPage
replaceInFile(path.join(__dirname, 'src/pages/SimulatorPage.tsx'), /import \{ useState \} from 'react';/g, "import { useState, useEffect } from 'react';");
replaceInFile(path.join(__dirname, 'src/pages/SimulatorPage.tsx'), /import \{ useEffect \} from 'react';/g, "import { useEffect } from 'react';");

console.log('Fixed completely');
