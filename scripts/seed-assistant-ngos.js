const { MongoClient } = require('mongodb');

const assistantNgos = [
  {
    id: 'ngo_sewa_bharat',
    type: 'ngo',
    legalName: 'Sewa Bharat',
    registrationNumber: 'DL/2006/0018921',
    publicProfile: {
      description: 'National federation dedicated to empowering informal women workers and community shelter resilience drives.',
      website: 'https://sewabharat.org',
      contactEmail: 'relief@sewabharat.org',
      contactPhone: '+91 11 2332 5500',
      imageUrl: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&auto=format&fit=crop&q=80'
    },
    serviceArea: {
      country: 'India',
      state: 'Delhi',
      city: 'Delhi',
      district: 'Central Delhi',
      radiusKm: 50,
      coordinates: [28.6289, 77.2065],
      approximateLocationText: 'Connaught Place Community Hub, Delhi'
    },
    supportedCategories: ['clothing_blankets', 'hygiene_kits', 'packaged_food'],
    capacitySummary: 'Community depot with emergency blanket storage and women relief volunteer corps.',
    verificationStatus: 'verified',
    verificationDate: '2026-08-10T10:00:00Z',
    verificationExpiry: '2027-08-10T10:00:00Z',
    verifiedBy: 'Pooja Narang (Officer #412)',
    sourceProvenance: {
      directoryName: 'NGO Darpan (NITI Aayog)',
      recordId: 'DL/2006/0018921',
      lastCheckedDate: '2026-10-15T00:00:00Z',
      verifiedMethod: 'Full 80G/12A Certificate + Physical Depot Audit'
    },
    activeNeedsCount: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ngo_help_care',
    type: 'ngo',
    legalName: 'Help & Care Foundation',
    registrationNumber: 'DL/2012/0045102',
    publicProfile: {
      description: 'Delhi NCR relief charity operating night shelters, thermal winter drives, and elderly care programs.',
      website: 'https://helpandcare.org',
      contactEmail: 'contact@helpandcare.org',
      contactPhone: '+91 11 2548 9911',
      imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&auto=format&fit=crop&q=80'
    },
    serviceArea: {
      country: 'India',
      state: 'Delhi',
      city: 'Delhi NCR',
      district: 'East Delhi & Noida Border',
      radiusKm: 60,
      coordinates: [28.6189, 77.2965],
      approximateLocationText: 'Mayur Vihar Relief Staging Hub'
    },
    supportedCategories: ['clothing_blankets', 'packaged_food'],
    capacitySummary: 'Insulated distribution center with 5,000 blanket capacity.',
    verificationStatus: 'verified',
    verificationDate: '2026-09-05T10:00:00Z',
    verificationExpiry: '2027-09-05T10:00:00Z',
    verifiedBy: 'Pooja Narang (Officer #412)',
    sourceProvenance: {
      directoryName: 'NGO Darpan (NITI Aayog)',
      recordId: 'DL/2012/0045102',
      lastCheckedDate: '2026-10-12T00:00:00Z',
      verifiedMethod: '80G Certificate + Physical Warehouse Audit'
    },
    activeNeedsCount: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ngo_hope_relief',
    type: 'ngo',
    legalName: 'Hope Relief Network',
    registrationNumber: 'UP/2015/0078231',
    publicProfile: {
      description: 'Disaster and seasonal vulnerability assistance network operating across western Uttar Pradesh.',
      website: 'https://hoperelief.org',
      contactEmail: 'info@hoperelief.org',
      contactPhone: '+91 120 4567 890',
      imageUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb9?w=400&auto=format&fit=crop&q=80'
    },
    serviceArea: {
      country: 'India',
      state: 'Uttar Pradesh',
      city: 'Ghaziabad',
      district: 'Ghaziabad Industrial Belt',
      radiusKm: 80,
      coordinates: [28.6692, 77.4538],
      approximateLocationText: 'Ghaziabad Central Warehouse'
    },
    supportedCategories: ['clothing_blankets', 'medical_first_aid'],
    capacitySummary: 'Large dry warehouse with direct highway distribution access.',
    verificationStatus: 'verified',
    verificationDate: '2026-07-20T10:00:00Z',
    verificationExpiry: '2027-07-20T10:00:00Z',
    verifiedBy: 'Pooja Narang (Officer #412)',
    sourceProvenance: {
      directoryName: 'NGO Darpan (NITI Aayog)',
      recordId: 'UP/2015/0078231',
      lastCheckedDate: '2026-10-10T00:00:00Z',
      verifiedMethod: '80G Certificate + Logistics Audit'
    },
    activeNeedsCount: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ngo_care_for_all',
    type: 'ngo',
    legalName: 'Care for All',
    registrationNumber: 'UP/2018/0091823',
    publicProfile: {
      description: 'Community welfare society providing night blankets, hot rations, and slum medical assistance.',
      website: 'https://careforall.org',
      contactEmail: 'help@careforall.org',
      contactPhone: '+91 120 2345 678',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&auto=format&fit=crop&q=80'
    },
    serviceArea: {
      country: 'India',
      state: 'Uttar Pradesh',
      city: 'Noida',
      district: 'Gautam Buddha Nagar',
      radiusKm: 70,
      coordinates: [28.5355, 77.3910],
      approximateLocationText: 'Sector 62 Community Center, Noida'
    },
    supportedCategories: ['clothing_blankets', 'hygiene_kits'],
    capacitySummary: 'Local community depot with refrigerated and dry storage.',
    verificationStatus: 'verified',
    verificationDate: '2026-09-12T10:00:00Z',
    verificationExpiry: '2027-09-12T10:00:00Z',
    verifiedBy: 'Pooja Narang (Officer #412)',
    sourceProvenance: {
      directoryName: 'NGO Darpan (NITI Aayog)',
      recordId: 'UP/2018/0091823',
      lastCheckedDate: '2026-10-08T00:00:00Z',
      verifiedMethod: '80G Verification'
    },
    activeNeedsCount: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ngo_relief_hands',
    type: 'ngo',
    legalName: 'Relief Hands',
    registrationNumber: 'HR/2019/0061298',
    publicProfile: {
      description: 'Emergency response and humanitarian supply distribution foundation serving Haryana and Delhi fringes.',
      website: 'https://reliefhands.org',
      contactEmail: 'contact@reliefhands.org',
      contactPhone: '+91 124 4567 123',
      imageUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&auto=format&fit=crop&q=80'
    },
    serviceArea: {
      country: 'India',
      state: 'Haryana',
      city: 'Gurugram',
      district: 'Gurugram & Manesar Belt',
      radiusKm: 80,
      coordinates: [28.4595, 77.0266],
      approximateLocationText: 'Cyber City Relief Depot, Gurugram'
    },
    supportedCategories: ['clothing_blankets', 'packaged_food'],
    capacitySummary: 'Regional sorting station with dedicated volunteer logistics drivers.',
    verificationStatus: 'verified',
    verificationDate: '2026-08-25T10:00:00Z',
    verificationExpiry: '2027-08-25T10:00:00Z',
    verifiedBy: 'Pooja Narang (Officer #412)',
    sourceProvenance: {
      directoryName: 'NGO Darpan (NITI Aayog)',
      recordId: 'HR/2019/0061298',
      lastCheckedDate: '2026-10-18T00:00:00Z',
      verifiedMethod: '80G Registration + Depot Check'
    },
    activeNeedsCount: 2,
    createdAt: new Date().toISOString()
  }
];

const assistantNeeds = [
  {
    id: 'need_sewa_blankets',
    orgId: 'ngo_sewa_bharat',
    orgName: 'Sewa Bharat',
    category: 'clothing_blankets',
    itemSpecification: 'High-thermal fleece or woolen blankets for upcoming North India winter night shelters',
    quantityRequested: 100,
    quantityFulfilled: 0,
    unit: 'blankets',
    urgency: 'critical',
    status: 'open',
    neededBy: '2026-11-15T00:00:00Z',
    serviceArea: { city: 'Delhi', state: 'Delhi' },
    createdAt: new Date().toISOString()
  },
  {
    id: 'need_help_care_blankets',
    orgId: 'ngo_help_care',
    orgName: 'Help & Care Foundation',
    category: 'clothing_blankets',
    itemSpecification: 'Winter blankets for elderly and unhoused families in East Delhi night camps',
    quantityRequested: 50,
    quantityFulfilled: 0,
    unit: 'blankets',
    urgency: 'high',
    status: 'open',
    neededBy: '2026-11-20T00:00:00Z',
    serviceArea: { city: 'Delhi NCR', state: 'Delhi' },
    createdAt: new Date().toISOString()
  },
  {
    id: 'need_hope_relief_blankets',
    orgId: 'ngo_hope_relief',
    orgName: 'Hope Relief Network',
    category: 'clothing_blankets',
    itemSpecification: 'Heavy-duty blankets for winter relief distribution',
    quantityRequested: 200,
    quantityFulfilled: 0,
    unit: 'blankets',
    urgency: 'high',
    status: 'open',
    neededBy: '2026-11-25T00:00:00Z',
    serviceArea: { city: 'Ghaziabad', state: 'Uttar Pradesh' },
    createdAt: new Date().toISOString()
  },
  {
    id: 'need_care_for_all_blankets',
    orgId: 'ngo_care_for_all',
    orgName: 'Care for All',
    category: 'clothing_blankets',
    itemSpecification: 'Fleece blankets for slum winter outreach drive',
    quantityRequested: 75,
    quantityFulfilled: 0,
    unit: 'blankets',
    urgency: 'medium',
    status: 'open',
    neededBy: '2026-11-30T00:00:00Z',
    serviceArea: { city: 'Noida', state: 'Uttar Pradesh' },
    createdAt: new Date().toISOString()
  },
  {
    id: 'need_relief_hands_blankets',
    orgId: 'ngo_relief_hands',
    orgName: 'Relief Hands',
    category: 'clothing_blankets',
    itemSpecification: 'Warm double-ply blankets for migrant worker camps',
    quantityRequested: 60,
    quantityFulfilled: 0,
    unit: 'blankets',
    urgency: 'medium',
    status: 'open',
    neededBy: '2026-12-05T00:00:00Z',
    serviceArea: { city: 'Gurugram', state: 'Haryana' },
    createdAt: new Date().toISOString()
  }
];

async function seedAssistantDb() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/relieflink';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  for (const org of assistantNgos) {
    await db.collection('organisations').updateOne({ id: org.id }, { $set: org }, { upsert: true });
    console.log('Upserted organisation:', org.legalName);
  }

  for (const need of assistantNeeds) {
    await db.collection('ngo_needs').updateOne({ id: need.id }, { $set: need }, { upsert: true });
    console.log('Upserted need:', need.itemSpecification);
  }

  await client.close();
  console.log('Successfully seeded assistant NGO partners.');
}

seedAssistantDb().catch(console.error);
