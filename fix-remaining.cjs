const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, regex, replacement) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(regex, replacement);
  fs.writeFileSync(filePath, content);
}

// 1. App.tsx
replaceInFile(path.join(__dirname, 'src/App.tsx'), /import ([A-Za-z]+Page) from '\.\/pages\/\1';/g, "import { $1 } from './pages/$1';");

// 2. Mock analysis
replaceInFile(path.join(__dirname, 'src/mock/analysis.ts'), /region_id:/g, 'region:');
replaceInFile(path.join(__dirname, 'src/mock/analysis.ts'), /score:/g, 'top_score:');

// 3. Mock dataHealth
replaceInFile(path.join(__dirname, 'src/mock/dataHealth.ts'), /last_updated:/g, 'data_freshness:');

// 4. Mock facilities
replaceInFile(path.join(__dirname, 'src/mock/facilities.ts'), /name:/g, 'label:');

// 5. Mock reports
replaceInFile(path.join(__dirname, 'src/mock/reports.ts'), /type: 'pdf',/g, '');

// 6. Mock simulation
replaceInFile(path.join(__dirname, 'src/mock/simulation.ts'), /improvement:/g, 'improvement_pct:');

// 7. MapContainer.tsx
replaceInFile(path.join(__dirname, 'src/components/gis/MapContainer.tsx'), /import maplibregl from 'maplibre-gl';/g, "import * as maplibregl from 'maplibre-gl';");
replaceInFile(path.join(__dirname, 'src/components/gis/MapContainer.tsx'), /viewState\.pitch/g, '(viewState as any).pitch');
replaceInFile(path.join(__dirname, 'src/components/gis/MapContainer.tsx'), /viewState\.bearing/g, '(viewState as any).bearing');

// 8. LayerControl.tsx
replaceInFile(path.join(__dirname, 'src/components/gis/LayerControl.tsx'), /import type \{ MapLayer \} from '\.\.\/\.\.\/stores';/g, "import type { MapLayer } from '../../types';");

// 9. ResultsPage.tsx
replaceInFile(path.join(__dirname, 'src/pages/ResultsPage.tsx'), /const \{ facility, region \} = useAnalysisStore\(\);/g, 'const { selectedFacility: facility, selectedRegion: region } = useAnalysisStore();');
replaceInFile(path.join(__dirname, 'src/pages/ResultsPage.tsx'), /const \{ facility, region/g, 'const { selectedFacility: facility, selectedRegion: region');

// 10. Card.tsx
replaceInFile(path.join(__dirname, 'src/components/ui/Card.tsx'), /export interface CardProps \{/g, 'export interface CardProps {\n  onClick?: () => void;');
replaceInFile(path.join(__dirname, 'src/components/ui/Card.tsx'), /export default function Card\(\{ children, className = '', padding = 'md' \}: CardProps\) \{/g, "export default function Card({ children, className = '', padding = 'md', onClick }: CardProps) {");
replaceInFile(path.join(__dirname, 'src/components/ui/Card.tsx'), /className=\{`bg-white border/g, 'onClick={onClick} className={`bg-white border');

// 11. Remove unused vars in components
replaceInFile(path.join(__dirname, 'src/pages/SimulatorPage.tsx'), /import React, \{ useEffect, useState \} from 'react';/g, "import { useState } from 'react';");
replaceInFile(path.join(__dirname, 'src/pages/ResultsPage.tsx'), /const \{ data \/\*, isLoading \*\/ \} = /g, '// const { data } = ');

console.log('Fixed remaining issues');
