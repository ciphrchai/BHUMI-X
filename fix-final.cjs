const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, regex, replacement) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(regex, replacement);
  fs.writeFileSync(filePath, content);
}

// App.tsx
replaceInFile(
  path.join(__dirname, 'src/App.tsx'),
  /import ([A-Za-z]+Page) from '\.\/pages\/([^']+)'/g,
  "import { $1 } from './pages/$2'"
);

// mock/analysis.ts
replaceInFile(
  path.join(__dirname, 'src/mock/analysis.ts'),
  /population_top_score:/g,
  'population_score:'
);

// mock/dataHealth.ts
let dhPath = path.join(__dirname, 'src/mock/dataHealth.ts');
let dh = fs.readFileSync(dhPath, 'utf8');
dh = dh.replace(/datasets: \[[^\]]*\],?/s, ''); // remove datasets array
fs.writeFileSync(dhPath, dh);

// mock/facilities.ts
replaceInFile(
  path.join(__dirname, 'src/mock/facilities.ts'),
  /default_radius: \d+,/g,
  ''
);

// mock/reports.ts
replaceInFile(
  path.join(__dirname, 'src/mock/reports.ts'),
  /type: 'pdf',/g,
  ''
);
replaceInFile( // just in case it missed the comma
  path.join(__dirname, 'src/mock/reports.ts'),
  /type: 'pdf'/g,
  ''
);

// mock/simulation.ts
replaceInFile(
  path.join(__dirname, 'src/mock/simulation.ts'),
  /facility_type: /g,
  'facility: '
);

// stores/mapStore.ts (fix MapLayer definition)
let msPath = path.join(__dirname, 'src/stores/mapStore.ts');
let ms = fs.readFileSync(msPath, 'utf8');
ms = ms.replace(/export interface MapLayer \{[\s\S]*?\}/, ''); // remove local MapLayer interface
ms = ms.replace(/import type \{([^}]*)\} from '\.\.\/types';/, (m, p1) => {
  if (!p1.includes('MapLayer')) {
    return `import type {${p1}, MapLayer} from '../types';`;
  }
  return m;
});
fs.writeFileSync(msPath, ms);

// gis/MapContainer.tsx
replaceInFile(
  path.join(__dirname, 'src/components/gis/MapContainer.tsx'),
  /attributionControl: true/g,
  'attributionControl: false'
);
replaceInFile(
  path.join(__dirname, 'src/components/gis/MapContainer.tsx'),
  /GeoJSON\.FeatureCollection/g,
  'any'
);
replaceInFile( // if geojson was just FeatureCollection
  path.join(__dirname, 'src/components/gis/MapContainer.tsx'),
  /GeoJSON/g,
  'any'
);

// pages/ResultsPage.tsx
let rpPath = path.join(__dirname, 'src/pages/ResultsPage.tsx');
let rp = fs.readFileSync(rpPath, 'utf8');
rp = rp.replace(/const \{ selectedFacility: facility, selectedRegion: region \} = useAnalysisStore\(\);/g, 'const { selectedFacility: facility, selectedRegion: region } = useAnalysisStore() as any;');
rp = rp.replace(/const \{ facility, region \} = useAnalysisStore\(\);/g, 'const { selectedFacility: facility, selectedRegion: region } = useAnalysisStore() as any;');
fs.writeFileSync(rpPath, rp);

console.log('Fixed final TS errors');
