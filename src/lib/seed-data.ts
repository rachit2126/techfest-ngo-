import {
  User,
  Organisation,
  DonationLot,
  NGORequest,
  EmergencyEvent,
  DLQEvent,
  ScoringWeights,
  DeliveryTimelineEvent,
  AuditLogEntry
} from './types';

export const INITIAL_SCORING_WEIGHTS: ScoringWeights = {
  needFit: 0.30,
  urgency: 0.20,
  deliveryFit: 0.15,
  timeFit: 0.15,
  quantityFit: 0.10,
  freshnessConfidence: 0.10,
  version: 'v1.0-default',
  updatedAt: new Date().toISOString(),
  updatedBy: 'system-init'
};

export const SEED_USERS: User[] = [
  {
    id: 'user_admin',
    name: 'Vikramaditya Sen (Super Admin)',
    email: 'admin@relieflink.ai',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_reviewer',
    name: 'Pooja Narang (NGO Verification Officer)',
    email: 'pooja.reviewer@relieflink.ai',
    role: 'ngo_reviewer',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_emergency',
    name: 'Major Amitav Rao (Emergency Coordinator)',
    email: 'amitav.emergency@relieflink.ai',
    role: 'emergency_coordinator',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_donor_individual',
    name: 'Riya Sharma (Individual Donor)',
    email: 'riya.sharma@example.com',
    role: 'donor',
    phone: '+91 98765 43210',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_donor_business',
    name: 'Grand Horizon Hospitality (Business Donor)',
    email: 'csr@grandhorizon.com',
    role: 'business_donor',
    orgId: 'org_biz_horizon',
    phone: '+91 11 4567 8900',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_ngo_goonj',
    name: 'Anshu Mehra (Goonj Coordinator)',
    email: 'relief@goonj-demo.org',
    role: 'ngo_staff',
    orgId: 'ngo_goonj',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_ngo_annakshetra',
    name: 'Dr. Vivek Joshi (Annakshetra Director)',
    email: 'operations@annakshetra-demo.org',
    role: 'ngo_staff',
    orgId: 'ngo_annakshetra',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_ngo_seeds',
    name: 'Sunita Bora (SEEDS Disaster Lead)',
    email: 'rapidresponse@seeds-demo.org',
    role: 'ngo_staff',
    orgId: 'ngo_seeds',
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

export const SEED_ORGANISATIONS: Organisation[] = [
  {
    id: 'ngo_goonj',
    type: 'ngo',
    legalName: 'Goonj Relief & Community Development Trust',
    registrationNumber: 'DL/2004/0014298',
    publicProfile: {
      description: 'Pan-India NGO turning urban surplus into disaster relief, winter warm kits, and village development resources.',
      website: 'https://goonj.org',
      contactEmail: 'relief@goonj-demo.org',
      contactPhone: '+91 11 2697 2222',
      imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&auto=format&fit=crop&q=80'
    },
    serviceArea: {
      country: 'India',
      state: 'Delhi',
      city: 'New Delhi',
      district: 'South Delhi Hub',
      radiusKm: 150,
      coordinates: [28.5355, 77.2610],
      approximateLocationText: 'Sarita Vihar Logistics Center, South Delhi'
    },
    supportedCategories: ['clothing_blankets', 'hygiene_kits', 'packaged_food'],
    capacitySummary: 'Central sorting facility with 12,000 sq ft covered dry storage and 3 fleet vans.',
    verificationStatus: 'verified',
    verificationDate: '2026-08-15T10:00:00Z',
    verificationExpiry: '2027-08-15T10:00:00Z',
    verifiedBy: 'Pooja Narang (Officer #412)',
    sourceProvenance: {
      directoryName: 'NGO Darpan (NITI Aayog)',
      recordId: 'DL/2016/0104882',
      lastCheckedDate: '2026-10-01T00:00:00Z',
      verifiedMethod: 'Full 80G/12A Certificate + Physical Depot Audit'
    },
    activeNeedsCount: 2,
    createdAt: '2026-01-10T09:00:00Z'
  },
  {
    id: 'ngo_annakshetra',
    type: 'ngo',
    legalName: 'Annakshetra Surplus Food Recovery Foundation',
    registrationNumber: 'RJ/2014/0078120',
    publicProfile: {
      description: 'Dedicated food rescue network collecting surplus banquet & institutional food to serve community shelters and old-age homes.',
      website: 'https://annakshetra-demo.org',
      contactEmail: 'operations@annakshetra-demo.org',
      contactPhone: '+91 141 2345 678',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&auto=format&fit=crop&q=80'
    },
    serviceArea: {
      country: 'India',
      state: 'Rajasthan',
      city: 'Jaipur',
      district: 'Jaipur Urban & Delhi Corridor',
      radiusKm: 80,
      coordinates: [26.9124, 75.7873],
      approximateLocationText: 'C-Scheme Recovery Depot, Jaipur'
    },
    supportedCategories: ['packaged_food'],
    capacitySummary: 'Refrigerated van, thermal transport insulation, food safety testing kit, daily intake cap: 1,500 meals.',
    verificationStatus: 'verified',
    verificationDate: '2026-09-01T11:30:00Z',
    verificationExpiry: '2027-09-01T11:30:00Z',
    verifiedBy: 'Pooja Narang (Officer #412)',
    sourceProvenance: {
      directoryName: 'Food Safety and Standards Authority (FSSAI) Relief Registry',
      recordId: 'FSSAI-REG-2024-9981',
      lastCheckedDate: '2026-10-10T00:00:00Z',
      verifiedMethod: 'FSSAI Food Safety Licence + Cold Chain Inspection'
    },
    activeNeedsCount: 2,
    createdAt: '2026-02-14T10:00:00Z'
  },
  {
    id: 'ngo_seeds',
    type: 'ngo',
    legalName: 'SEEDS Disaster Response & Humanitarian Relief India',
    registrationNumber: 'AS/2018/0091341',
    publicProfile: {
      description: 'Rapid response humanitarian agency specialising in monsoon floods, emergency shelter kits, water purification, and hygiene.',
      website: 'https://seedsindia-demo.org',
      contactEmail: 'rapidresponse@seeds-demo.org',
      contactPhone: '+91 361 2456 789',
      imageUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&auto=format&fit=crop&q=80'
    },
    serviceArea: {
      country: 'India',
      state: 'Assam',
      city: 'Guwahati',
      district: 'Kamrup & Brahmaputra Basin',
      radiusKm: 300,
      coordinates: [26.1445, 91.7362],
      approximateLocationText: 'Guwahati Air Cargo Warehouse & Field Hub'
    },
    supportedCategories: ['clothing_blankets', 'hygiene_kits', 'medical_first_aid', 'packaged_food'],
    capacitySummary: 'Disaster response staging hub with boat transport units and 4,000 family shelter pack staging area.',
    verificationStatus: 'verified',
    verificationDate: '2026-07-20T08:00:00Z',
    verificationExpiry: '2027-07-20T08:00:00Z',
    verifiedBy: 'Pooja Narang (Officer #412)',
    sourceProvenance: {
      directoryName: 'NDMA Disaster Response Partner Roster',
      recordId: 'NDMA-NGO-2023-041',
      lastCheckedDate: '2026-10-15T00:00:00Z',
      verifiedMethod: 'Ministry of Home Affairs FCRA + NDMA Rapid Deployment Audit'
    },
    activeNeedsCount: 2,
    createdAt: '2026-03-01T08:00:00Z'
  },
  {
    id: 'ngo_health_forall',
    type: 'ngo',
    legalName: 'Health for All Foundation',
    registrationNumber: 'KA/2021/0045199',
    publicProfile: {
      description: 'Community health camps, essential medicines, diagnostic triage, and mobile rural healthcare support.',
      website: 'https://healthforall-demo.org',
      contactEmail: 'contact@healthforall-demo.org',
      contactPhone: '+91 80 2345 6789',
      imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&auto=format&fit=crop&q=80'
    },
    serviceArea: {
      country: 'India',
      state: 'Karnataka',
      city: 'Bengaluru',
      district: 'Bengaluru Urban & Rural',
      radiusKm: 120,
      coordinates: [12.9716, 77.5946],
      approximateLocationText: 'Koramangala Community Health Wing, Bengaluru'
    },
    supportedCategories: ['medical_first_aid', 'hygiene_kits'],
    capacitySummary: 'Mobile health outreach ambulance, cold-chain medicine depot, and 15 volunteer medical staff.',
    verificationStatus: 'verified',
    verificationDate: '2026-09-10T09:00:00Z',
    verificationExpiry: '2027-09-10T09:00:00Z',
    verifiedBy: 'Pooja Narang (Officer #412)',
    sourceProvenance: {
      directoryName: 'National Health Mission Partner Registry',
      recordId: 'NHM-KA-2021-08',
      lastCheckedDate: '2026-10-18T00:00:00Z',
      verifiedMethod: 'State Health Directorate Licensure & Physical Audit'
    },
    activeNeedsCount: 2,
    createdAt: '2026-04-12T09:00:00Z'
  },
  {
    id: 'ngo_green_earth',
    type: 'ngo',
    legalName: 'Green Earth Initiative',
    registrationNumber: 'MH/2019/0034291',
    publicProfile: {
      description: 'Environmental conservation, clean water filtration units, solar relief micro-grids, and sustainable livelihoods.',
      website: 'https://greenearth-demo.org',
      contactEmail: 'info@greenearth-demo.org',
      contactPhone: '+91 20 2567 8910',
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&auto=format&fit=crop&q=80'
    },
    serviceArea: {
      country: 'India',
      state: 'Maharashtra',
      city: 'Pune',
      district: 'Pune & Western Ghats',
      radiusKm: 160,
      coordinates: [18.5204, 73.8567],
      approximateLocationText: 'Shivajinagar Clean Water Depository, Pune'
    },
    supportedCategories: ['hygiene_kits', 'clothing_blankets'],
    capacitySummary: 'Portable water filtration systems, flood-resilient solar generators, and 2,000 sq ft eco-warehouse.',
    verificationStatus: 'verified',
    verificationDate: '2026-08-25T14:30:00Z',
    verificationExpiry: '2027-08-25T14:30:00Z',
    verifiedBy: 'Pooja Narang (Officer #412)',
    sourceProvenance: {
      directoryName: 'NGO Darpan (NITI Aayog)',
      recordId: 'MH/2019/0088192',
      lastCheckedDate: '2026-10-12T00:00:00Z',
      verifiedMethod: 'NITI Aayog Darpan UID + Statutory 12A/80G'
    },
    activeNeedsCount: 2,
    createdAt: '2026-05-19T10:00:00Z'
  },
  {
    id: 'ngo_hope_unverified',
    type: 'ngo',
    legalName: 'Hope Welfare Trust (Varanasi)',
    registrationNumber: 'UP/2025/PENDING',
    publicProfile: {
      description: 'Newly registered grassroots initiative aiming to provide school supplies and winter garments.',
      contactEmail: 'contact@hopewelfare-demo.org',
      contactPhone: '+91 542 2223 344',
      imageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400&auto=format&fit=crop&q=80'
    },
    serviceArea: {
      country: 'India',
      state: 'Uttar Pradesh',
      city: 'Varanasi',
      district: 'Varanasi Urban',
      radiusKm: 40,
      coordinates: [25.3176, 82.9739],
      approximateLocationText: 'Assi Ghat Area, Varanasi'
    },
    supportedCategories: ['clothing_blankets'],
    capacitySummary: 'Small volunteer basement sorting area (approx 400 sq ft).',
    verificationStatus: 'in_review',
    sourceProvenance: {
      directoryName: 'Self-Registered Web Submission',
      recordId: 'APP-2026-10-994',
      lastCheckedDate: '2026-10-22T14:00:00Z',
      verifiedMethod: 'Awaiting Pan/Trust Deed Verification'
    },
    documents: [
      {
        id: 'doc_trust_deed',
        name: 'Trust_Deed_Scanned_Copy.pdf',
        type: 'Registration Document',
        uploadedAt: '2026-10-22T14:10:00Z',
        status: 'pending'
      },
      {
        id: 'doc_pan',
        name: 'PAN_Card_Trust_Copy.pdf',
        type: 'Tax Identification',
        uploadedAt: '2026-10-22T14:11:00Z',
        status: 'pending'
      }
    ],
    activeNeedsCount: 0,
    createdAt: '2026-10-22T14:00:00Z'
  },
  {
    id: 'ngo_sewa',
    type: 'ngo',
    legalName: 'Sewa Bharat',
    registrationNumber: 'DL/2008/0029811',
    publicProfile: {
      description: 'Empowering women workers in the informal economy through livelihood support, disaster relief, and health aid.',
      website: 'https://sewabharat.org',
      contactEmail: 'relief@sewabharat.org',
      contactPhone: '+91 11 2337 9988',
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=80'
    },
    serviceArea: {
      country: 'India',
      state: 'Delhi',
      city: 'Delhi',
      district: 'Central Delhi Corridor',
      radiusKm: 30,
      coordinates: [28.6139, 77.2090],
      approximateLocationText: 'Connaught Place & Old Delhi Relief Ward'
    },
    supportedCategories: ['clothing_blankets', 'hygiene_kits'],
    capacitySummary: 'Active ground team with 200 volunteer distributors across Delhi NCR shelters.',
    verificationStatus: 'verified',
    verificationDate: '2026-06-15T09:00:00Z',
    verificationExpiry: '2027-06-15T09:00:00Z',
    verifiedBy: 'Pooja Narang (Officer #412)',
    sourceProvenance: {
      directoryName: 'NGO Darpan (NITI Aayog)',
      recordId: 'DL/2008/0029811',
      lastCheckedDate: '2026-10-01T00:00:00Z',
      verifiedMethod: 'Full 80G/12A Certificate + Physical Depot Audit'
    },
    activeNeedsCount: 3,
    createdAt: '2026-01-15T09:00:00Z'
  },
  {
    id: 'ngo_helpcare',
    type: 'ngo',
    legalName: 'Help & Care Foundation',
    registrationNumber: 'DL/2012/0061922',
    publicProfile: {
      description: 'Dedicated to elderly shelter assistance, winter relief drives, and emergency medical kits.',
      website: 'https://helpcarefoundation.org',
      contactEmail: 'contact@helpcarefoundation.org',
      contactPhone: '+91 11 4152 7700',
      imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&auto=format&fit=crop&q=80'
    },
    serviceArea: {
      country: 'India',
      state: 'Delhi',
      city: 'Delhi NCR',
      district: 'Noida & South East Delhi',
      radiusKm: 45,
      coordinates: [28.5355, 77.3910],
      approximateLocationText: 'Noida Sector 62 & Sarita Vihar'
    },
    supportedCategories: ['clothing_blankets', 'medical_first_aid'],
    capacitySummary: '800-bed winter shelter coordination network with 2 transport vans.',
    verificationStatus: 'verified',
    verificationDate: '2026-07-10T10:00:00Z',
    verificationExpiry: '2027-07-10T10:00:00Z',
    verifiedBy: 'Pooja Narang (Officer #412)',
    sourceProvenance: {
      directoryName: 'NGO Darpan (NITI Aayog)',
      recordId: 'DL/2012/0061922',
      lastCheckedDate: '2026-10-05T00:00:00Z',
      verifiedMethod: 'Full 80G/12A Certificate + Physical Depot Audit'
    },
    activeNeedsCount: 2,
    createdAt: '2026-02-10T10:00:00Z'
  },
  {
    id: 'ngo_nayasavera',
    type: 'ngo',
    legalName: 'Naya Savera NGO',
    registrationNumber: 'DL/2015/0088193',
    publicProfile: {
      description: 'Grassroots initiative supporting homeless families, slum clusters, and temporary shelters with clothing and hygiene kits.',
      website: 'https://nayasavera-demo.org',
      contactEmail: 'help@nayasavera-demo.org',
      contactPhone: '+91 11 2291 3344',
      imageUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&auto=format&fit=crop&q=80'
    },
    serviceArea: {
      country: 'India',
      state: 'Delhi',
      city: 'New Delhi',
      district: 'North & West Delhi',
      radiusKm: 35,
      coordinates: [28.6304, 77.2177],
      approximateLocationText: 'Karol Bagh & Kashmiri Gate Hub'
    },
    supportedCategories: ['clothing_blankets', 'hygiene_kits'],
    capacitySummary: 'Community depot with dry storage and 50 youth volunteer runners.',
    verificationStatus: 'verified',
    verificationDate: '2026-08-01T11:00:00Z',
    verificationExpiry: '2027-08-01T11:00:00Z',
    verifiedBy: 'Pooja Narang (Officer #412)',
    sourceProvenance: {
      directoryName: 'NGO Darpan (NITI Aayog)',
      recordId: 'DL/2015/0088193',
      lastCheckedDate: '2026-10-10T00:00:00Z',
      verifiedMethod: 'Full 80G/12A Certificate + Physical Depot Audit'
    },
    activeNeedsCount: 1,
    createdAt: '2026-03-05T11:00:00Z'
  }
];

export const SEED_NEEDS: NGORequest[] = [
  {
    id: 'need_blankets_delhi',
    orgId: 'ngo_goonj',
    orgName: 'Goonj Relief & Community Development Trust',
    category: 'clothing_blankets',
    itemSpecification: 'High-thermal fleece or woolen blankets for upcoming North India winter night shelters',
    quantityRequested: 100,
    quantityFulfilled: 0,
    unit: 'units',
    urgency: 'high',
    neededBy: '2026-11-15T00:00:00Z',
    serviceArea: {
      city: 'New Delhi',
      state: 'Delhi',
      coordinates: [28.5355, 77.2610]
    },
    storageCapabilities: ['dry', 'sheltered'],
    status: 'open',
    lastConfirmedAt: '2026-10-22T08:00:00Z',
    createdAt: '2026-10-20T10:00:00Z'
  },
  {
    id: 'need_hygiene_delhi',
    orgId: 'ngo_goonj',
    orgName: 'Goonj Relief & Community Development Trust',
    category: 'hygiene_kits',
    itemSpecification: 'Standard dignity kits containing soap, toothpaste, toothbrush, sanitary napkins and antiseptic wipes',
    quantityRequested: 250,
    quantityFulfilled: 50,
    unit: 'kits',
    urgency: 'medium',
    neededBy: '2026-12-01T00:00:00Z',
    serviceArea: {
      city: 'New Delhi',
      state: 'Delhi',
      coordinates: [28.5355, 77.2610]
    },
    storageCapabilities: ['dry'],
    status: 'open',
    lastConfirmedAt: '2026-10-21T09:00:00Z',
    createdAt: '2026-10-18T10:00:00Z'
  },
  {
    id: 'need_ration_jaipur',
    orgId: 'ngo_annakshetra',
    orgName: 'Annakshetra Surplus Food Recovery Foundation',
    category: 'packaged_food',
    itemSpecification: 'Unopened sealed grain packets, pulses, wheat flour or ready-to-eat meal bars with min 30-day shelf life',
    quantityRequested: 500,
    quantityFulfilled: 120,
    unit: 'kg',
    urgency: 'high',
    neededBy: '2026-11-05T00:00:00Z',
    serviceArea: {
      city: 'Jaipur',
      state: 'Rajasthan',
      coordinates: [26.9124, 75.7873]
    },
    storageCapabilities: ['dry', 'ambient'],
    status: 'open',
    lastConfirmedAt: '2026-10-23T06:00:00Z',
    createdAt: '2026-10-19T11:00:00Z'
  },
  {
    id: 'need_emergency_kits_assam',
    orgId: 'ngo_seeds',
    orgName: 'SEEDS Disaster Response & Humanitarian Relief India',
    category: 'clothing_blankets',
    itemSpecification: 'Water-resistant tarpaulins and heavy-duty fleece blankets for displaced flood victims in temporary embankment camps',
    quantityRequested: 600,
    quantityFulfilled: 150,
    unit: 'units',
    urgency: 'critical',
    neededBy: '2026-10-30T00:00:00Z',
    serviceArea: {
      city: 'Guwahati',
      state: 'Assam',
      coordinates: [26.1445, 91.7362]
    },
    storageCapabilities: ['waterproof', 'elevated'],
    status: 'open',
    lastConfirmedAt: '2026-10-23T07:30:00Z',
    emergencyEventId: 'emerg_assam_flood_2026',
    createdAt: '2026-10-21T06:00:00Z'
  },
  {
    id: 'need_emergency_hygiene_assam',
    orgId: 'ngo_seeds',
    orgName: 'SEEDS Disaster Response & Humanitarian Relief India',
    category: 'hygiene_kits',
    itemSpecification: 'Water purification drops, chlorine tablets and flood hygiene kits',
    quantityRequested: 400,
    quantityFulfilled: 0,
    unit: 'kits',
    urgency: 'critical',
    neededBy: '2026-10-28T00:00:00Z',
    serviceArea: {
      city: 'Guwahati',
      state: 'Assam',
      coordinates: [26.1445, 91.7362]
    },
    storageCapabilities: ['dry'],
    status: 'open',
    lastConfirmedAt: '2026-10-23T07:30:00Z',
    emergencyEventId: 'emerg_assam_flood_2026',
    createdAt: '2026-10-21T06:30:00Z'
  },
  {
    id: 'need_blankets_sewa',
    orgId: 'ngo_sewa',
    orgName: 'Sewa Bharat',
    category: 'clothing_blankets',
    itemSpecification: 'Winter fleece blankets for informal women workers and families in night shelters',
    quantityRequested: 40,
    quantityFulfilled: 0,
    unit: 'units',
    urgency: 'high',
    neededBy: '2026-11-20T00:00:00Z',
    serviceArea: {
      city: 'Delhi',
      state: 'Delhi',
      coordinates: [28.6139, 77.2090]
    },
    storageCapabilities: ['dry', 'sheltered'],
    status: 'open',
    lastConfirmedAt: '2026-10-23T09:00:00Z',
    createdAt: '2026-10-20T09:00:00Z'
  },
  {
    id: 'need_blankets_helpcare',
    orgId: 'ngo_helpcare',
    orgName: 'Help & Care Foundation',
    category: 'clothing_blankets',
    itemSpecification: 'High-density warm blankets for elderly care and homeless winter shelters in NCR',
    quantityRequested: 100,
    quantityFulfilled: 10,
    unit: 'units',
    urgency: 'high',
    neededBy: '2026-11-15T00:00:00Z',
    serviceArea: {
      city: 'Delhi NCR',
      state: 'Delhi',
      coordinates: [28.5355, 77.3910]
    },
    storageCapabilities: ['dry', 'sheltered'],
    status: 'open',
    lastConfirmedAt: '2026-10-23T08:30:00Z',
    createdAt: '2026-10-19T08:00:00Z'
  },
  {
    id: 'need_blankets_nayasavera',
    orgId: 'ngo_nayasavera',
    orgName: 'Naya Savera NGO',
    category: 'clothing_blankets',
    itemSpecification: 'Thermal blankets and warm shawls for slum clusters in North Delhi',
    quantityRequested: 50,
    quantityFulfilled: 0,
    unit: 'units',
    urgency: 'medium',
    neededBy: '2026-12-01T00:00:00Z',
    serviceArea: {
      city: 'New Delhi',
      state: 'Delhi',
      coordinates: [28.6304, 77.2177]
    },
    storageCapabilities: ['dry'],
    status: 'open',
    lastConfirmedAt: '2026-10-22T10:00:00Z',
    createdAt: '2026-10-18T10:00:00Z'
  }
];

export const SEED_EMERGENCIES: EmergencyEvent[] = [
  {
    id: 'emerg_assam_flood_2026',
    name: 'Monsoon Flood Surge & Brahmaputra Basin Inundation 2026',
    type: 'flood',
    severity: 'code_red',
    officialSource: 'National Disaster Management Authority (NDMA) Special Advisory #NDMA/REL/2026-88',
    sourceUrl: 'https://ndma.gov.in/advisories/assam-flood-surge-2026',
    geography: {
      affectedStates: ['Assam'],
      affectedDistricts: ['Kamrup', 'Morigaon', 'Dhubri', 'Barpeta'],
      epicenter: [26.1445, 91.7362],
      radiusKm: 250
    },
    validFrom: '2026-10-18T00:00:00Z',
    validUntil: '2026-11-10T23:59:59Z',
    requiredSupplies: ['Water purification kits', 'Heavy fleece blankets', 'Waterproof tarps', 'Dry ration packets'],
    status: 'active',
    priorityMultiplier: 1.45,
    createdBy: 'Major Amitav Rao (Emergency Coordinator)',
    createdAt: '2026-10-18T04:00:00Z'
  }
];

// Pre-seeded ready test donation: 100 blankets for the Judge Demo Scenario
export const SEED_DONATIONS: DonationLot[] = [
  {
    id: 'don_blankets_100_demo',
    donorId: 'user_donor_individual',
    donorType: 'individual',
    donorName: 'Riya Sharma',
    category: 'clothing_blankets',
    itemName: 'Warm Woolen Double-Ply Blankets (New Packaging)',
    quantity: 100,
    unit: 'units',
    condition: 'new',
    location: {
      city: 'New Delhi',
      state: 'Delhi',
      coordinates: [28.6139, 77.2090],
      approximateText: 'Connaught Place Area, Central Delhi',
      privateAddress: 'Flat 4B, Barakhamba Road, New Delhi 110001 (Confidential - authorized transit only)'
    },
    availabilityWindow: 'Monday - Friday 10:00 AM - 5:00 PM',
    status: 'eligible',
    allocatedQuantity: 0,
    remainingQuantity: 100,
    eligibilityChecks: {
      passed: true,
      reasons: ['Condition is verified brand new', 'Supported relief category', 'Donor location within verified active NGO radius'],
      expiryBufferSafe: true,
      categorySupported: true,
      foodSafetyAcknowledged: true
    },
    createdAt: '2026-10-23T08:00:00Z',
    updatedAt: '2026-10-23T08:00:00Z'
  },
  {
    id: 'don_completed_rice_bags',
    donorId: 'user_donor_business',
    donorType: 'business',
    donorName: 'Grand Horizon Hospitality',
    donorOrgName: 'Grand Horizon Hotel New Delhi',
    category: 'packaged_food',
    itemName: 'Sealed Basmati Rice & Lentil Sacks (25kg bags)',
    quantity: 200,
    unit: 'kg',
    condition: 'new',
    expiryDate: '2027-04-30T00:00:00Z',
    storageRequirements: 'dry',
    batchLotCode: 'GH-2026-LOT-049',
    location: {
      city: 'New Delhi',
      state: 'Delhi',
      coordinates: [28.5355, 77.2610],
      approximateText: 'Aerocity Hospitality District, New Delhi',
      privateAddress: 'Loading Dock B, Grand Horizon Hotel, Aerocity, New Delhi'
    },
    status: 'delivered_confirmed',
    allocatedQuantity: 200,
    remainingQuantity: 0,
    activeAllocationId: 'alloc_rice_confirmed_01',
    eligibilityChecks: {
      passed: true,
      reasons: ['Shelf life > 180 days', 'FSSAI packaging intact', 'Storage dry ambient verified'],
      expiryBufferSafe: true,
      categorySupported: true,
      foodSafetyAcknowledged: true
    },
    createdAt: '2026-10-15T09:00:00Z',
    updatedAt: '2026-10-17T16:00:00Z'
  }
];

export const SEED_TIMELINE_EVENTS: DeliveryTimelineEvent[] = [
  {
    id: 'evt_deliv_rice_01',
    donationId: 'don_completed_rice_bags',
    allocationId: 'alloc_rice_confirmed_01',
    status: 'delivered_confirmed',
    actor: {
      id: 'user_ngo_goonj',
      name: 'Anshu Mehra',
      role: 'ngo_staff'
    },
    timestamp: '2026-10-17T15:45:00Z',
    note: 'Delivered to Goonj Sarita Vihar Community Kitchen Depot. Weight verified on industrial scale: 200kg exact.',
    evidenceUrl: 'https://relieflink-storage-demo.s3.internal/receipts/proof_delivery_rice_200kg.pdf',
    recipientConfirmation: {
      confirmedBy: 'Anshu Mehra (Goonj Depot In-Charge)',
      confirmedQuantity: 200,
      conditionVerified: true,
      notes: 'All 8 sacks inspected: seals completely intact, stored in elevated dry palette.'
    }
  }
];

export const SEED_DLQ_EVENTS: DLQEvent[] = [
  {
    id: 'dlq_webhook_failed_01',
    eventType: 'ngo.partner_sms_dispatch',
    payload: {
      recipientPhone: '+919999900000',
      message: 'ReliefLink Alert: New blanket allocation proposed in Delhi district.',
      urgency: 'high',
      targetNGO: 'ngo_goonj'
    },
    error: 'SMS Gateway Provider Connection Timeout: 504 Gateway Timeout after 3 retries (Provider mock endpoint offline)',
    retryCount: 3,
    maxRetries: 3,
    status: 'failed',
    firstFailedAt: '2026-10-23T05:12:00Z',
    lastAttemptAt: '2026-10-23T05:15:30Z'
  }
];

export const SEED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit_init_01',
    actor: {
      id: 'user_admin',
      name: 'Vikramaditya Sen',
      role: 'admin'
    },
    action: 'SYSTEM_BOOTSTRAP_SEED',
    entityType: 'user',
    entityId: 'system_init',
    beforeSummary: 'Empty database',
    afterSummary: 'Platform seeded with 4 NGOs, 5 Needs, 1 Emergency Event, 2 Donations, 1 Scoring Config',
    reason: 'Initial production-ready prototype initialization with verified demo provenance',
    timestamp: '2026-10-23T07:00:00Z'
  },
  {
    id: 'audit_verify_02',
    actor: {
      id: 'user_reviewer',
      name: 'Pooja Narang',
      role: 'ngo_reviewer'
    },
    action: 'NGO_VERIFICATION_APPROVED',
    entityType: 'ngo',
    entityId: 'ngo_goonj',
    beforeSummary: 'status: in_review',
    afterSummary: 'status: verified, scope: Pan-India, expiry: 2027-08-15',
    reason: 'Document set validated against NGO Darpan record DL/2016/0104882',
    timestamp: '2026-08-15T10:00:00Z'
  }
];
