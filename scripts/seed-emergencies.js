const { MongoClient } = require('mongodb');

const emergenciesData = [
  {
    id: 'em_turkiye',
    name: 'Türkiye Earthquake',
    type: 'earthquake',
    severity: 'critical',
    verificationStatus: 'verified',
    country: 'Türkiye',
    region: 'Middle East',
    officialSource: 'AFAD Official Bulletin',
    sourceUrl: 'https://en.afad.gov.tr',
    sourceAgency: 'Disaster and Emergency Management Authority (AFAD)',
    geography: {
      affectedStates: ['Hatay', 'Gaziantep', 'Kahramanmaraş'],
      affectedDistricts: ['Antakya Sector', 'Iskenderun Port Basin'],
      epicenter: [36.8, 36.2],
      radiusKm: 350
    },
    description: 'Severe earthquakes have caused widespread damage. Urgent need for winter shelter, heating supplies, and medical equipment.',
    topSupplies: [
      { name: 'Insulated Family Tents', category: 'shelter', quantity: '12,000 units', unitsNeeded: 12000, percentNeeded: 72, iconType: 'tent' },
      { name: 'Winter Thermal Blankets', category: 'clothing_blankets', quantity: '25,000 units', unitsNeeded: 25000, percentNeeded: 48, iconType: 'blanket' },
      { name: 'Portable Heaters', category: 'equipment', quantity: '5,000 units', unitsNeeded: 5000, percentNeeded: 84, iconType: 'heater' }
    ],
    requiredSupplies: ['Insulated Family Tents', 'Winter Thermal Blankets', 'Portable Heaters', 'Emergency First Aid Packs'],
    activeNgosCount: 18,
    respondingNgos: [
      { id: 'ngo_red_crescent', name: 'Turkish Red Crescent', category: 'Emergency Relief', verified: true, avatar: 'TR' },
      { id: 'ngo_hayata_destek', name: 'Support to Life (Hayata Destek)', category: 'Shelter & WASH', verified: true, avatar: 'HD' },
      { id: 'ngo_afad_partner', name: 'AFAD Humanitarian Logistics Wing', category: 'Search & Rescue', verified: true, avatar: 'AF' },
      { id: 'ngo_care_turkiye', name: 'CARE International Türkiye', category: 'Winterization', verified: true, avatar: 'CI' }
    ],
    lastUpdated: 'Updated 2 hours ago',
    lastUpdatedFormatted: '26 Oct 2024, 10:24 AM',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    priorityMultiplier: 1.45,
    validUntil: '2026-12-31T00:00:00Z',
    createdAt: new Date('2026-10-24T02:00:00Z').toISOString()
  },
  {
    id: 'em_kenya',
    name: 'Kenya Food Crisis',
    type: 'drought',
    severity: 'high',
    verificationStatus: 'verified',
    country: 'Kenya',
    region: 'East Africa',
    officialSource: 'WFP Situation Report',
    sourceUrl: 'https://www.wfp.org/countries/kenya',
    sourceAgency: 'World Food Programme (WFP) & NDMA Kenya',
    geography: {
      affectedStates: ['Turkana', 'Marsabit', 'Samburu'],
      affectedDistricts: ['Turkana North Corridor', 'Kakuma Staging Hub'],
      epicenter: [3.11, 35.59],
      radiusKm: 500
    },
    description: 'Severe drought conditions have led to critical food shortages across northern regions. Immediate food and nutrition support required.',
    topSupplies: [
      { name: 'Non-Perishable Food', category: 'packaged_food', quantity: '50,000 packs', unitsNeeded: 50000, percentNeeded: 90, iconType: 'food' },
      { name: 'Nutrition Supplements', category: 'medical_first_aid', quantity: '20,000 packs', unitsNeeded: 20000, percentNeeded: 65, iconType: 'nutrition' },
      { name: 'Water Purification Kits', category: 'hygiene_kits', quantity: '15,000 units', unitsNeeded: 15000, percentNeeded: 40, iconType: 'water' }
    ],
    requiredSupplies: ['Non-Perishable Food', 'Nutrition Supplements', 'Water Purification Kits', 'Therapeutic Infant Formula'],
    activeNgosCount: 12,
    respondingNgos: [
      { id: 'ngo_wfp_kenya', name: 'World Food Programme Hub Kenya', category: 'Nutrition', verified: true, avatar: 'WF' },
      { id: 'ngo_red_cross_ke', name: 'Kenya Red Cross Society', category: 'Rapid Response', verified: true, avatar: 'KR' },
      { id: 'ngo_action_hunger', name: 'Action Against Hunger', category: 'Food Security', verified: true, avatar: 'AH' },
      { id: 'ngo_oxfam_kenya', name: 'Oxfam Horn of Africa', category: 'WASH', verified: true, avatar: 'OX' }
    ],
    lastUpdated: 'Updated 5 hours ago',
    lastUpdatedFormatted: '26 Oct 2024, 07:10 AM',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=80',
    priorityMultiplier: 1.35,
    validUntil: '2026-11-20T00:00:00Z',
    createdAt: new Date('2026-10-23T23:00:00Z').toISOString()
  },
  {
    id: 'em_bangladesh',
    name: 'Bangladesh Floods',
    type: 'flood',
    severity: 'moderate',
    verificationStatus: 'verified',
    country: 'Bangladesh',
    region: 'South Asia',
    officialSource: 'UN OCHA Report',
    sourceUrl: 'https://www.unocha.org/bangladesh',
    sourceAgency: 'United Nations Office for the Coordination of Humanitarian Affairs (UN OCHA)',
    geography: {
      affectedStates: ['Sylhet', 'Sunamganj', 'Moulvibazar'],
      affectedDistricts: ['Surma Basin Sector', 'Sunamganj Sadar Inundation'],
      epicenter: [24.8949, 91.8687],
      radiusKm: 200
    },
    description: 'Heavy monsoon rains have caused extensive flooding, affecting thousands of families. Need for clean water, hygiene kits, and temporary shelter.',
    topSupplies: [
      { name: 'Clean Water Kits', category: 'hygiene_kits', quantity: '30,000 units', unitsNeeded: 30000, percentNeeded: 60, iconType: 'water' },
      { name: 'Hygiene Kits', category: 'hygiene_kits', quantity: '40,000 units', unitsNeeded: 40000, percentNeeded: 45, iconType: 'hygiene' },
      { name: 'Temporary Shelter', category: 'shelter', quantity: '10,000 units', unitsNeeded: 10000, percentNeeded: 30, iconType: 'shelter' }
    ],
    requiredSupplies: ['Clean Water Kits', 'Hygiene Kits', 'Temporary Shelter', 'Water Purification Tablets'],
    activeNgosCount: 8,
    respondingNgos: [
      { id: 'ngo_brac', name: 'BRAC Humanitarian Programme', category: 'Shelter & Health', verified: true, avatar: 'BR' },
      { id: 'ngo_bd_red_crescent', name: 'Bangladesh Red Crescent Society', category: 'Flood Rescue', verified: true, avatar: 'RC' },
      { id: 'ngo_unicef_bd', name: 'UNICEF Emergency Relief Wing', category: 'Water & Sanitation', verified: true, avatar: 'UN' }
    ],
    lastUpdated: 'Updated 1 day ago',
    lastUpdatedFormatted: '25 Oct 2024, 04:30 PM',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=80',
    priorityMultiplier: 1.25,
    validUntil: '2026-11-25T00:00:00Z',
    createdAt: new Date('2026-10-23T11:00:00Z').toISOString()
  },
  {
    id: 'em_assam',
    name: 'Assam Flood Relief',
    type: 'flood',
    severity: 'critical',
    verificationStatus: 'verified',
    country: 'India',
    region: 'South Asia',
    officialSource: 'ASDMA Advisory #88',
    sourceUrl: 'https://asdma.gov.in',
    sourceAgency: 'Assam State Disaster Management Authority & NDMA',
    geography: {
      affectedStates: ['Assam'],
      affectedDistricts: ['Kamrup Metro', 'Barpeta', 'Dhubri', 'Morigaon'],
      epicenter: [26.1445, 91.7362],
      radiusKm: 280
    },
    description: 'Monsoon surge in Brahmaputra basin has inundated riparian districts, displacing communities and requiring urgent clean water, tarpaulins, and dry food rations.',
    topSupplies: [
      { name: 'Water Purification Kits', category: 'hygiene_kits', quantity: '20,000 kits', unitsNeeded: 20000, percentNeeded: 85, iconType: 'water' },
      { name: 'Emergency Tarpaulins', category: 'shelter', quantity: '15,000 units', unitsNeeded: 15000, percentNeeded: 65, iconType: 'shelter' },
      { name: 'Dry Ration Packets', category: 'packaged_food', quantity: '35,000 packs', unitsNeeded: 35000, percentNeeded: 55, iconType: 'food' }
    ],
    requiredSupplies: ['Water Purification Kits', 'Emergency Tarpaulins', 'Dry Ration Packets', 'Antiseptic Wipes'],
    activeNgosCount: 12,
    respondingNgos: [
      { id: 'ngo_goonj', name: 'Goonj Rahat Relief Hub', category: 'Disaster Logistics', verified: true, avatar: 'GJ' },
      { id: 'ngo_assam_relief', name: 'Assam Humanitarian Network', category: 'Flood Rescue', verified: true, avatar: 'AH' },
      { id: 'ngo_redcross_assam', name: 'Indian Red Cross Society (Assam)', category: 'First Aid', verified: true, avatar: 'IR' }
    ],
    lastUpdated: 'Updated 3 hours ago',
    lastUpdatedFormatted: '26 Oct 2024, 09:15 AM',
    status: 'active',
    image: '/emergency_rescue.jpg',
    priorityMultiplier: 1.45,
    validUntil: '2026-11-30T00:00:00Z',
    createdAt: new Date('2026-10-24T01:00:00Z').toISOString()
  }
];

async function updateDb() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/relieflink';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  
  for (const item of emergenciesData) {
    await db.collection('emergency_events').updateOne(
      { id: item.id },
      { $set: item },
      { upsert: true }
    );
    console.log('Upserted:', item.id, item.name);
  }
  
  await client.close();
  console.log('Finished updating emergency_events.');
}

updateDb().catch(console.error);
