const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

const layoutComponents = ['PageHeader', 'AppShell', 'Breadcrumbs', 'Navbar'];

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix the broken imports from the previous bad replace
  content = content.replace(/from '\.\.\/components\/\$2\/([^']+)'/g, (match, componentName) => {
    const isLayout = layoutComponents.includes(componentName);
    return `from '../components/${isLayout ? 'layout' : 'ui'}/${componentName}'`;
  });

  // Also fix the state variables destructuring in AnalysisPage that got broken
  // In AnalysisPage.tsx: const { facility, region, minArea, objective, weights, setFacility... } = useAnalysisStore();
  // We added `as any; //` at the end, which broke it because `useAnalysisStore` returns the state, but we removed the store variables!
  // Wait, the error was: "Cannot find name 'weights'. Cannot find name 'setFacility'."
  // Ah, my replace was: `content = content.replace(/const \{ facility, region/g, "const { facility, region } = useAnalysisStore() as any; //");`
  // This commented out the rest of the line! Let's restore AnalysisPage.tsx line manually.
  content = content.replace(/const \{ facility, region \} = useAnalysisStore\(\) as any; \/\/.*/g, 
    "const { facility, region, minimumArea: minArea, objective, weights, setFacility, setRegion, setMinimumArea: setMinArea, setObjective, updateWeight } = useAnalysisStore();");

  // Fix ResultsPage "Property 'region' does not exist on type 'AnalysisState'"
  // This is because we need to get selectedRegion and selectedFacility from the store
  content = content.replace(/const \{ facility, region/g, "const { selectedFacility: facility, selectedRegion: region");

  fs.writeFileSync(filePath, content);
}
console.log('Fixed broken imports');
