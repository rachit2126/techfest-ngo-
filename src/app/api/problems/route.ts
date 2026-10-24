import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export interface GlobalProblem {
  id: string;
  title: string;
  category: 'food_shortage' | 'medical_supplies' | 'clean_water' | 'shelter_housing' | 'child_protection' | 'disaster_relief' | 'refugee_assistance' | 'sanitation';
  country: string;
  region: string;
  coordinates: [number, number]; // [lng, lat]
  severity: 'critical' | 'high' | 'medium';
  priority: 'High Priority' | 'Code Red' | 'Medium Priority';
  affectedPeopleCount: number;
  affectedRegionsCount: number;
  requiredResources: string[];
  availableResources: string[];
  respondingNgos: {
    id: string;
    name: string;
    verified: boolean;
    role: string;
  }[];
  source: string;
  lastUpdated: string;
  description: string;
  status: 'active' | 'mitigating' | 'resolved';
}

const DEFAULT_GLOBAL_PROBLEMS: GlobalProblem[] = [
  {
    id: 'prob_food_horn_africa',
    title: 'Severe Food & Therapeutic Nutrition Shortage',
    category: 'food_shortage',
    country: 'Kenya',
    region: 'Turkana & Horn of Africa',
    coordinates: [35.59, 3.11],
    severity: 'critical',
    priority: 'Code Red',
    affectedPeopleCount: 3200000,
    affectedRegionsCount: 23,
    requiredResources: ['Fortified Flour', 'Therapeutic Peanut Paste', 'Electrolyte Salts', 'Grain Storage Bags'],
    availableResources: ['Fortified Flour (Nairobi Transit Dock) - 8 lots', 'Clean Water Purification Tablets - 50k units'],
    respondingNgos: [
      { id: 'ngo_kenya_ndma', name: 'Kenya Red Cross Humanitarian Roster', verified: true, role: 'Primary Nutritional Dispatch' },
      { id: 'ngo_horn_relief', name: 'East Africa Drylands Alliance', verified: true, role: 'Forward Distribution' }
    ],
    source: 'Kenya NDMA & UN WFP Food Security Early Warning Alert',
    lastUpdated: '15 mins ago',
    description: 'Consecutive failed rainy seasons in Turkana and pastoralist corridors have depleted regional grain reserves, causing acute childhood malnutrition.',
    status: 'active'
  },
  {
    id: 'prob_medical_gaza',
    title: 'Critical Medical Consumables & Surgical Trauma Deficit',
    category: 'medical_supplies',
    country: 'Gaza',
    region: 'Khan Younis & Deir al-Balah',
    coordinates: [34.46, 31.50],
    severity: 'critical',
    priority: 'Code Red',
    affectedPeopleCount: 1700000,
    affectedRegionsCount: 17,
    requiredResources: ['Anesthetics', 'Surgical Sutures', 'Orthopedic Pins', 'Antibiotic IV Packs', 'Burn Dressings'],
    availableResources: ['Emergency Trauma Consignments (Rome Maritime Dock) - In Transit', 'Surgical Kits (Frankfurt Depot) - Staged'],
    respondingNgos: [
      { id: 'ngo_pal_red_crescent', name: 'Palestinian Red Crescent Logistics', verified: true, role: 'Trauma Triage' },
      { id: 'ngo_med_europe', name: 'Médecins Sans Frontières Field Wing', verified: true, role: 'Field Surgical Unit' }
    ],
    source: 'UN OCHA Medical Consignment Emergency Cluster Bulletin',
    lastUpdated: '28 mins ago',
    description: 'Severe exhaustion of critical surgical antibiotics, blood units, and burn treatment supplies across field hospitals.',
    status: 'active'
  },
  {
    id: 'prob_water_assam',
    title: 'Potable Drinking Water Contamination & Flood Inundation',
    category: 'clean_water',
    country: 'India',
    region: 'Assam & Brahmaputra Basin',
    coordinates: [91.7362, 26.1445],
    severity: 'high',
    priority: 'High Priority',
    affectedPeopleCount: 250000,
    affectedRegionsCount: 14,
    requiredResources: ['Chlorine Tablets', 'Mobile RO Filtration Units', 'Collapsible Jerry Cans', 'Oral Rehydration Salts'],
    availableResources: ['Water Filtration Units (Delhi Staging Depot) - 50 lots', 'Flood Rescue Boats - 12 units'],
    respondingNgos: [
      { id: 'ngo_goonj', name: 'Goonj Disaster Relief Operations', verified: true, role: 'Water & Dry Ration Logistics' },
      { id: 'ngo_seeds', name: 'SEEDS India Emergency Habitat Wing', verified: true, role: 'Water Purification Deployment' }
    ],
    source: 'Assam State Disaster Management Authority (ASDMA) Advisory #88',
    lastUpdated: '1 hour ago',
    description: 'Flood waters from the overflowing Brahmaputra submerged over 120 community tube-wells, creating urgent risks of water-borne pathogens.',
    status: 'active'
  },
  {
    id: 'prob_shelter_turkiye',
    title: 'Winter Thermal Shelter & Temporary Housing Shortage',
    category: 'shelter_housing',
    country: 'Türkiye',
    region: 'Hatay & Kahramanmaraş Sector',
    coordinates: [36.20, 36.80],
    severity: 'high',
    priority: 'High Priority',
    affectedPeopleCount: 1200000,
    affectedRegionsCount: 11,
    requiredResources: ['Winterized Insulated Tents', 'Thermal Blankets', 'Kerosene Heaters', 'Prefabricated Sanitation Blocks'],
    availableResources: ['Thermal Shelter Tents (Hatay Forward Depot) - 8 lots', 'Winter Blankets Lot #12 (New Delhi) - Staged'],
    respondingNgos: [
      { id: 'ngo_afad_turk', name: 'AFAD Emergency Disaster Coordination', verified: true, role: 'Camp Staging & Allocation' },
      { id: 'ngo_ahbap', name: 'Ahbap Humanitarian Association', verified: true, role: 'Community Shelter Operations' }
    ],
    source: 'AFAD Turkey Earthquake Recovery Dashboard & UN OCHA',
    lastUpdated: '2 hours ago',
    description: 'Sub-zero nighttime temperatures in rural Hatay require immediate deployment of insulated family shelters and heating appliances.',
    status: 'active'
  },
  {
    id: 'prob_child_manila',
    title: 'Child Nutritional Protection & Displaced Infant Care',
    category: 'child_protection',
    country: 'Philippines',
    region: 'Luzon Coastal Flood Belt',
    coordinates: [120.9842, 14.5995],
    severity: 'medium',
    priority: 'Medium Priority',
    affectedPeopleCount: 280000,
    affectedRegionsCount: 9,
    requiredResources: ['Infant Formula Packs', 'Baby Hygiene Diapers', 'Pediatric Antibiotics', 'Waterproof Cots'],
    availableResources: ['Fortified Nutritional Supplements (Sydney Reserves) - In Transit'],
    respondingNgos: [
      { id: 'ngo_phil_redcross', name: 'Philippine Red Cross Child Relief Wing', verified: true, role: 'Mother & Child Care Stations' }
    ],
    source: 'NDRRMC Weather & Vulnerable Demographics Bulletin #14',
    lastUpdated: '3 hours ago',
    description: 'Post-typhoon flooding in evacuation schools requires targeted infant formula and sterile pediatric care supplies.',
    status: 'active'
  }
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const severity = searchParams.get('severity');
    const country = searchParams.get('country');

    const db = await getDb();
    let problems: GlobalProblem[] = (await db.collection<GlobalProblem>('global_problems')
      .find({})
      .sort({ severity: 1 })
      .toArray()) as unknown as GlobalProblem[];

    if (!problems || problems.length === 0) {
      // Seed default problems if collection is empty
      await db.collection('global_problems').insertMany(DEFAULT_GLOBAL_PROBLEMS as any);
      problems = DEFAULT_GLOBAL_PROBLEMS;
    }

    let filtered = problems;
    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }
    if (severity && severity !== 'all') {
      filtered = filtered.filter(p => p.severity === severity);
    }
    if (country && country !== 'all') {
      filtered = filtered.filter(p => p.country.toLowerCase() === country.toLowerCase());
    }

    return NextResponse.json({
      problems: filtered,
      totalCount: problems.length,
      categoriesCount: {
        food_shortage: 23,
        medical_supplies: 17,
        clean_water: 14,
        shelter_housing: 11,
        child_protection: 9
      }
    });
  } catch (error) {
    return NextResponse.json({
      problems: DEFAULT_GLOBAL_PROBLEMS,
      totalCount: DEFAULT_GLOBAL_PROBLEMS.length,
      categoriesCount: {
        food_shortage: 23,
        medical_supplies: 17,
        clean_water: 14,
        shelter_housing: 11,
        child_protection: 9
      }
    });
  }
}
