import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, CheckCircle, Circle, Loader2 } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import Slider from '../components/ui/Slider';
import { useAnalysisStore } from '../stores';
import * as analysisService from '../services';

const facilityTypes = [
  { value: 'school', label: 'School' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'park', label: 'Public Park' },
];

const regions = [
  { value: 'yelahanka', label: 'Yelahanka' },
  { value: 'indiranagar', label: 'Indiranagar' },
];

export function AnalysisPage() {
  const navigate = useNavigate();
  const { selectedFacility: facility, selectedRegion: region, minimumArea: minArea, objective, weights, setFacility, setRegion, setMinimumArea: setMinArea, setObjective, updateWeight } = useAnalysisStore();
  
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [maxDistance, setMaxDistance] = useState(2);
  const [envRisk, setEnvRisk] = useState('low');
  const [ownership, setOwnership] = useState('government');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);

  const handleAnalyze = async () => {
    setIsProcessing(true);
    
    // Simulate steps
    for (let i = 1; i <= 5; i++) {
      setProcessStep(i);
      await new Promise(res => setTimeout(res, 600));
    }
    
    await analysisService.submitAnalysis({} as any);
    setIsProcessing(false);
    navigate('/results');
  };

  const getStepIcon = (stepNum: number) => {
    if (processStep > stepNum) return <CheckCircle className="text-green-500" size={16} />;
    if (processStep === stepNum) return <Loader2 className="animate-spin text-blue-500" size={16} />;
    return <Circle className="text-gray-300" size={16} />;
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <PageHeader 
        title="Site Analysis" 
        description="Configure the planning requirement and evaluate candidate parcels." 
      />

      <Card className="p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facility Type</label>
              <Select options={facilityTypes} value={facility || ''} onChange={(val: any) => setFacility(val)} placeholder="Select facility type..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Study Region</label>
              <Select options={regions} value={region || 'yelahanka'} onChange={(val: any) => setRegion(val)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Land Area</label>
            <Input type="number" suffix="m²" value={minArea} onChange={(e: any) => setMinArea(Math.max(1, Number(e.target.value)))} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Optimization Objective</label>
            <div className="space-y-2">
              {['Maximum Population Coverage', 'Minimum Travel Distance', 'Minimum Development Cost', 'Minimum Environmental Impact', 'Balanced Planning'].map((obj) => (
                <label key={obj} className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="objective" checked={objective === obj} onChange={() => setObjective(obj as any)} className="text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">{obj}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Priority Weights</label>
              <span className="text-sm text-gray-500 font-medium">Total Weight: {totalWeight}%</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {Object.entries(weights).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span>{value}%</span>
                  </div>
                  <Slider label={key} value={value} onChange={(val: any) => updateWeight(key as any, val)} />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <button 
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Advanced Filters <ChevronDown size={16} className={`ml-1 transform transition-transform ${filtersExpanded ? 'rotate-180' : ''}`} />
            </button>
            
            {filtersExpanded && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-md">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Max dist from major road</label>
                  <Input type="number" suffix="km" value={maxDistance} onChange={(e: any) => setMaxDistance(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Env risk tolerance</label>
                  <Select options={[{value:'low',label:'Low'},{value:'medium',label:'Medium'},{value:'high',label:'High'}]} value={envRisk} onChange={(val: any) => setEnvRisk(val)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ownership type</label>
                  <Select options={[{value:'any',label:'Any'},{value:'government',label:'Government'},{value:'private',label:'Private'}]} value={ownership} onChange={(val: any) => setOwnership(val)} />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <Button 
              variant="primary" 
              size="lg" 
              className="w-full" 
              disabled={!facility || isProcessing}
              onClick={handleAnalyze}
            >
              {isProcessing ? 'Processing...' : 'Analyze Land'}
            </Button>
          </div>
        </div>
      </Card>

      {isProcessing && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-4">Analyzing {region}...</h3>
          <ul className="space-y-3">
            <li className="flex items-center space-x-3 text-sm text-gray-700">{getStepIcon(1)} <span>Loading land parcels</span></li>
            <li className="flex items-center space-x-3 text-sm text-gray-700">{getStepIcon(2)} <span>Applying land constraints</span></li>
            <li className="flex items-center space-x-3 text-sm text-gray-700">{getStepIcon(3)} <span>Evaluating population demand</span></li>
            <li className="flex items-center space-x-3 text-sm text-gray-700">{getStepIcon(4)} <span>Screening environmental factors</span></li>
            <li className="flex items-center space-x-3 text-sm text-gray-700">{getStepIcon(5)} <span>Ranking candidate parcels</span></li>
          </ul>
        </Card>
      )}
    </div>
  );
}
