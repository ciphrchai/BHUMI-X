import type { FacilityInfo } from '../types';

export const facilityTypes: FacilityInfo[] = [
  { type: 'school', label: 'School', description: 'Primary or secondary educational institution', icon: 'GraduationCap', default_radius: 5000 },
  { type: 'hospital', label: 'Hospital', description: 'Healthcare facility or clinic', icon: 'Hospital', default_radius: 8000 },
  { type: 'fire_station', label: 'Fire Station', description: 'Fire and emergency response station', icon: 'Flame', default_radius: 3000 },
  { type: 'police_station', label: 'Police Station', description: 'Law enforcement facility', icon: 'Shield', default_radius: 2500 },
  { type: 'bus_terminal', label: 'Bus Terminal', description: 'Public transit terminal', icon: 'Bus', default_radius: 10000 },
  { type: 'public_office', label: 'Public Office', description: 'Government administrative office', icon: 'Building2', default_radius: 4000 },
  { type: 'waste_management', label: 'Waste Management Facility', description: 'Solid waste processing facility', icon: 'Trash2', default_radius: 15000 },
  { type: 'other', label: 'Other', description: 'Custom facility type', icon: 'MoreHorizontal', default_radius: 5000 }
];
