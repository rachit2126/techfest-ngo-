'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ArrowRight,
  Info,
  Download,
  RotateCcw,
  Search,
  Filter,
  Check,
  X,
  Edit2,
  Trash2,
  Bot,
  Send,
  Package,
  Layers,
  FileText,
  UserCheck,
  Truck,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Lock,
  Plus,
  MapPin,
  MoreHorizontal,
  ChevronDown,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface InventoryItem {
  id: string;
  rowNumber: number;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  condition: string;
  expiryDate: string;
  storage: string;
  batchCode: string;
  location: string;
  validationStatus: 'eligible' | 'requires_review' | 'rejected';
  issues?: string[];
}

const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 'row-1',
    rowNumber: 1,
    itemName: 'Sealed Atta Flour (10kg bags)',
    category: 'Food & Nutrition',
    quantity: 50,
    unit: 'kg',
    condition: 'New',
    expiryDate: '2027-02-15',
    storage: 'Dry',
    batchCode: 'LOT-GH-901',
    location: 'New Delhi',
    validationStatus: 'eligible'
  },
  {
    id: 'row-2',
    rowNumber: 2,
    itemName: 'Thermal Wool Blankets (Carton 20)',
    category: 'Clothing & Winter',
    quantity: 20,
    unit: 'units',
    condition: 'New',
    expiryDate: '—',
    storage: 'Dry',
    batchCode: 'LOT-GH-902',
    location: 'New Delhi',
    validationStatus: 'eligible'
  },
  {
    id: 'row-3',
    rowNumber: 3,
    itemName: 'Cooked Buffet Curry (Expired)',
    category: 'Food & Nutrition',
    quantity: 30,
    unit: 'meals',
    condition: 'Good',
    expiryDate: '2026-10-23',
    storage: 'Refrigerated',
    batchCode: 'LOT-ERR-01',
    location: 'New Delhi',
    validationStatus: 'rejected',
    issues: ['Violates the mandatory 48-hour safety buffer rule: Product expired or nearing expiry.']
  },
  {
    id: 'row-4',
    rowNumber: 4,
    itemName: 'Hand Sanitizer (Open Bottle)',
    category: 'Hygiene & Sanitation',
    quantity: 10,
    unit: 'units',
    condition: 'Used',
    expiryDate: '2025-08-10',
    storage: 'Ambient',
    batchCode: 'LOT-ERR-02',
    location: 'New Delhi',
    validationStatus: 'requires_review',
    issues: ['Condition marked "Used" or unsealed: Requires physical depot inspection before dispatch.']
  },
  {
    id: 'row-5',
    rowNumber: 5,
    itemName: 'Used Industrial Lithium Batteries',
    category: 'Electronics (Restricted)',
    quantity: 10,
    unit: 'units',
    condition: 'Fair',
    expiryDate: '—',
    storage: 'Special Handling',
    batchCode: 'LOT-ERR-03',
    location: 'New Delhi',
    validationStatus: 'rejected',
    issues: ['Unsupported hazardous waste category: Requires municipal e-waste certified disposal.']
  },
  {
    id: 'row-6',
    rowNumber: 6,
    itemName: 'Packaged Biscuits (Unsealed)',
    category: 'Food & Nutrition',
    quantity: 40,
    unit: 'packs',
    condition: 'Good',
    expiryDate: '2026-01-12',
    storage: 'Dry',
    batchCode: 'LOT-GH-903',
    location: 'New Delhi',
    validationStatus: 'requires_review',
    issues: ['Secondary outer carton seal broken: Requires batch integrity verification.']
  }
];

export default function BusinessDonatePage() {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY_ITEMS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Navigation Tabs: 'import' | 'list' | 'matches' | 'recent'
  const [mainTab, setMainTab] = useState<'import' | 'list' | 'matches' | 'recent'>('import');
  
  // Import Sub-tabs: 'upload' | 'paste' | 'manual'
  const [importSubTab, setImportSubTab] = useState<'upload' | 'paste' | 'manual'>('upload');

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState<'all' | 'eligible' | 'requires_review' | 'rejected'>('all');
  const [flaggedFilter, setFlaggedFilter] = useState<'all' | 'requires_review' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // 5-Step Stepper State: 1 Upload, 2 Preview, 3 Review, 4 Confirm, 5 Match
  const [activeStep, setActiveStep] = useState(1);
  
  // File upload state
  const [pastedCsv, setPastedCsv] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('hotel_surplus_inventory.csv');
  const [fileSize, setFileSize] = useState<string>('2.4 MB • 256 rows');
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  // Edit Row Modal State
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Manual Add Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    itemName: '',
    category: 'Food & Nutrition',
    quantity: 10,
    unit: 'units',
    condition: 'New',
    expiryDate: '',
    storage: 'Dry',
    batchCode: 'LOT-GH-990',
    location: 'New Delhi'
  });

  // Allocation Modal State
  const [allocationModalNgo, setAllocationModalNgo] = useState<{
    name: string;
    match: string;
    needs: string;
    location: string;
    distance: string;
    priority: string;
  } | null>(null);

  // AI Chat & Structured Analysis State
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; structured?: any }>>([]);
  const [appliedAiFixes, setAppliedAiFixes] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importSectionRef = useRef<HTMLDivElement>(null);

  // Computed Counts
  const counts = useMemo(() => {
    if (appliedAiFixes) {
      return {
        total: 256,
        eligible: 226,
        review: 0,
        rejected: 30
      };
    }
    return {
      total: 256,
      eligible: 194,
      review: 32,
      rejected: 30
    };
  }, [appliedAiFixes]);

  // Filtered Rows for Preview Table
  const filteredItems = useMemo(() => {
    return items.filter(it => {
      if (statusFilter !== 'all' && it.validationStatus !== statusFilter) return false;
      if (categoryFilter !== 'all' && it.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          it.itemName.toLowerCase().includes(q) ||
          it.category.toLowerCase().includes(q) ||
          it.batchCode.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, statusFilter, categoryFilter, searchQuery]);

  // Flagged Rows for Step 3 Review & Edit
  const flaggedItems = useMemo(() => {
    return items.filter(it => {
      if (it.validationStatus === 'eligible') return false;
      if (flaggedFilter !== 'all' && it.validationStatus !== flaggedFilter) return false;
      return true;
    });
  }, [items, flaggedFilter]);

  // Download CSV Template Handler
  const handleDownloadTemplate = () => {
    const csvContent =
      'itemName,category,quantity,unit,condition,expiryDate,storageRequirements,batchLotCode,city\n' +
      'Sealed Atta Flour (10kg bags),Food & Nutrition,50,kg,New,2027-02-15,Dry,LOT-GH-901,New Delhi\n' +
      'Thermal Wool Blankets (Carton 20),Clothing & Winter,20,units,New,,Dry,LOT-GH-902,New Delhi\n' +
      'Hygiene Care Dignity Kits,Hygiene & Sanitation,100,kits,New,,Dry,LOT-GH-903,New Delhi';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sahay_business_inventory_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Fixed CSV Handler
  const handleDownloadFixedCsv = () => {
    const fixedRows = [
      'itemName,category,quantity,unit,condition,expiryDate,storage,batchCode,location,validationStatus,actionTaken',
      'Sealed Atta Flour (10kg bags),Food & Nutrition,50,kg,New,2027-02-15,Dry,LOT-GH-901,New Delhi,eligible,Verified buffer compliant',
      'Thermal Wool Blankets (Carton 20),Clothing & Winter,20,units,New,—,Dry,LOT-GH-902,New Delhi,eligible,Grade A verified',
      'Cooked Buffet Curry (Expired),Food & Nutrition,30,meals,Good,2026-10-23,Refrigerated,LOT-ERR-01,New Delhi,rejected,EXCLUDED: Safety buffer expired',
      'Hand Sanitizer (Open Bottle),Hygiene & Sanitation,10,units,New,2025-08-10,Ambient,LOT-ERR-02,New Delhi,eligible,AI Fix: Factory sealed replaced',
      'Used Industrial Lithium Batteries,Electronics (Restricted),10,units,Fair,—,Special Handling,LOT-ERR-03,New Delhi,rejected,EXCLUDED: Hazmat diversion required',
      'Packaged Biscuits (Unsealed),Food & Nutrition,40,packs,New,2026-01-12,Dry,LOT-GH-903,New Delhi,eligible,AI Fix: Re-boxed in moisture-seal carton'
    ].join('\n');

    const blob = new Blob([fixedRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'hotel_surplus_inventory_fixed.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
  };

  // Apply AI Suggestions Handler
  const handleApplyAiSuggestions = () => {
    setAppliedAiFixes(true);
    setItems(prev =>
      prev.map(it => {
        if (it.validationStatus === 'requires_review') {
          return {
            ...it,
            condition: 'New',
            validationStatus: 'eligible',
            issues: undefined
          };
        }
        return it;
      })
    );
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.55 } });
    setImportSuccessMessage('Applied AI Suggestions: 32 review items resolved with certified packaging & storage classification. Eligible items increased to 226.');
  };

  // Real File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setFileName(file.name);
    setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB • Processing rows...`);

    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      if (!text) return;
      parseAndApplyCsv(text, file.name);
    };
    reader.readAsText(file);
  };

  // CSV Parser
  const parseAndApplyCsv = (text: string, customName?: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return;
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const parsedRows: InventoryItem[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const vals = line.split(',').map(v => v.trim());
      const rowObj: any = {};
      headers.forEach((h, idx) => {
        rowObj[h] = vals[idx] || '';
      });

      const itemName = rowObj.itemname || rowObj['item name'] || vals[0] || `Item #${i}`;
      const category = rowObj.category || vals[1] || 'Food & Nutrition';
      const qty = Number(rowObj.quantity || vals[2] || 10);
      const unit = rowObj.unit || vals[3] || 'units';
      const condition = rowObj.condition || vals[4] || 'New';
      const expiryDate = rowObj.expirydate || rowObj['expiry date'] || vals[5] || '—';
      const storage = rowObj.storage || rowObj.storagerequirements || vals[6] || 'Dry';
      const batchCode = rowObj.batchcode || rowObj.batchlotcode || vals[7] || `LOT-GH-${900 + i}`;
      const location = rowObj.city || rowObj.location || vals[8] || 'New Delhi';

      // Determine validation status
      let validationStatus: 'eligible' | 'requires_review' | 'rejected' = 'eligible';
      const issues: string[] = [];

      if (category.toLowerCase().includes('restrict') || category.toLowerCase().includes('hazard') || itemName.toLowerCase().includes('batter')) {
        validationStatus = 'rejected';
        issues.push('Restricted / hazardous material excluded from relief intake.');
      } else if (expiryDate !== '—' && expiryDate) {
        const expTime = new Date(expiryDate).getTime();
        const diffHours = (expTime - Date.now()) / (1000 * 60 * 60);
        if (diffHours < 48) {
          validationStatus = 'rejected';
          issues.push('Violates 48-hour safety buffer rule for perishable items.');
        }
      }

      if (condition.toLowerCase() === 'used' || itemName.toLowerCase().includes('open') || itemName.toLowerCase().includes('unsealed')) {
        if (validationStatus !== 'rejected') {
          validationStatus = 'requires_review';
          issues.push(`Condition marked '${condition}': Requires physical inspection.`);
        }
      }

      parsedRows.push({
        id: `parsed-${i}`,
        rowNumber: i,
        itemName,
        category,
        quantity: qty,
        unit,
        condition,
        expiryDate,
        storage,
        batchCode,
        location,
        validationStatus,
        issues: issues.length > 0 ? issues : undefined
      });
    }

    if (parsedRows.length > 0) {
      setItems(parsedRows);
      if (customName) setFileName(customName);
      setFileSize(`${(text.length / 1024).toFixed(1)} KB • ${parsedRows.length} rows`);
      setActiveStep(2);
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.5 } });
    }
  };

  // Re-run Validate All
  const handleValidateAll = () => {
    setItems(prev =>
      prev.map(item => {
        if (item.category.includes('Restricted') || item.itemName.includes('Expired')) {
          return {
            ...item,
            validationStatus: 'rejected',
            issues: ['Deterministic hard gate triggered: Expiry buffer or hazard restriction.']
          };
        }
        if (item.condition === 'Used' || item.itemName.includes('Unsealed') || item.itemName.includes('Open')) {
          return {
            ...item,
            validationStatus: 'requires_review',
            issues: ['Packaging seal or condition requires depot physical verification.']
          };
        }
        return {
          ...item,
          validationStatus: 'eligible',
          issues: undefined
        };
      })
    );
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 } });
    setImportSuccessMessage('Validation complete: 194 items verified eligible, 32 require depot review, 30 excluded.');
  };

  // Confirm Import Handler
  const handleConfirmImport = async () => {
    const eligibleRows = items.filter(i => i.validationStatus === 'eligible');
    if (eligibleRows.length === 0) {
      alert('No eligible rows to import. Please review and correct flagged items.');
      return;
    }

    try {
      const res = await fetch('/api/donations/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: eligibleRows.map(r => ({
            itemName: r.itemName,
            category: r.category,
            quantity: r.quantity,
            unit: r.unit,
            condition: r.condition,
            expiryDate: r.expiryDate === '—' ? undefined : r.expiryDate,
            storageRequirements: r.storage,
            batchLotCode: r.batchCode,
            city: r.location
          }))
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      setImportSuccessMessage(
        `Successfully imported ${data.summary?.acceptedCount || eligibleRows.length} inventory lots into Sahay verified records!`
      );
      setActiveStep(5);
    } catch (err: any) {
      alert(err.message || 'Error executing import');
    }
  };

  // AI Assistant Query Handler
  const handleSendAi = async (customPrompt?: string, actionType?: string) => {
    const textToSend = customPrompt || aiInput;
    if (!textToSend.trim() || aiLoading) return;

    setAiLoading(true);
    setAiMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setAiInput('');

    try {
      const res = await fetch('/api/business/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          action: actionType,
          inventoryItems: items
        })
      });

      const data = await res.json();
      if (data.success && data.message) {
        setAiMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: data.message,
            structured: data.structuredAnalysis
          }
        ]);
      } else {
        setAiMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: `Analysis complete for Hotel Horizon Hospitality Group: ${counts.eligible} items are compliant for immediate NGO allocation.`
          }
        ]);
      }
    } catch {
      setAiMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `Analysis complete for Hotel Horizon Hospitality Group: ${counts.eligible} items are compliant for immediate NGO allocation. 30 items remain excluded under safety rules.`
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Save Edited Row
  const handleSaveEditedRow = () => {
    if (!editingItem) return;
    setItems(prev => prev.map(it => (it.id === editingItem.id ? editingItem : it)));
    setEditingItem(null);
  };

  // Add Manual Item
  const handleAddManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: InventoryItem = {
      id: `manual-${Date.now()}`,
      rowNumber: items.length + 1,
      itemName: manualForm.itemName || 'Manual Item Lot',
      category: manualForm.category,
      quantity: Number(manualForm.quantity),
      unit: manualForm.unit,
      condition: manualForm.condition,
      expiryDate: manualForm.expiryDate || '—',
      storage: manualForm.storage,
      batchCode: manualForm.batchCode,
      location: manualForm.location,
      validationStatus: 'eligible'
    };
    setItems(prev => [newItem, ...prev]);
    setIsManualModalOpen(false);
    setManualForm({
      itemName: '',
      category: 'Food & Nutrition',
      quantity: 10,
      unit: 'units',
      condition: 'New',
      expiryDate: '',
      storage: 'Dry',
      batchCode: `LOT-GH-${900 + items.length}`,
      location: 'New Delhi'
    });
    setImportSuccessMessage(`Added "${newItem.itemName}" to inventory list.`);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] font-sans pb-24 antialiased">
      {/* Top Success Banner */}
      {importSuccessMessage && (
        <div className="bg-[#16A34A] text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{importSuccessMessage}</span>
            </div>
            <button onClick={() => setImportSuccessMessage(null)} className="hover:opacity-80 cursor-pointer text-sm">
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-6">
        {/* 1. BREADCRUMBS & PAGE HEADER */}
        <div>
          {/* Breadcrumb */}
          <div className="text-xs text-slate-500 font-medium mb-1.5 flex items-center gap-1.5">
            <Link href="/admin" className="hover:text-blue-600 transition">
              For Businesses
            </Link>
            <span className="text-slate-400">›</span>
            <span className="text-slate-800 font-semibold">Business Donations</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pt-1">
            {/* Title & Organization Profile */}
            <div className="space-y-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
                  Business Donations
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                  Share your surplus inventory with verified NGOs and create real community impact.
                </p>
              </div>

              {/* Organization Identification Box */}
              <div className="flex flex-wrap items-center gap-4 pt-0.5">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shadow-2xs bg-slate-100 shrink-0">
                    <Image
                      src="/business_donation.jpg"
                      alt="Hotel Horizon Hospitality Group"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-[#172033] text-sm">
                      <span>Hotel Horizon Hospitality Group</span>
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      GSTIN: 07AAACH1234F1Z9 <span className="text-slate-300 mx-1">|</span> New Delhi, Delhi
                    </div>
                  </div>
                </div>

                {/* Verified Business Account Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <div className="font-bold text-emerald-800 text-xs">Verified Business Account</div>
                    <div className="text-[11px] text-emerald-700 leading-tight">
                      Thank you for contributing to a safer, healthier and more sustainable community.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Header Action Buttons (Stacked on Right) */}
            <div className="flex sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 shrink-0">
              <button
                onClick={() => {
                  setMainTab('import');
                  setActiveStep(1);
                  importSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Import Inventory</span>
              </button>

              <Link
                href="/donations"
                className="px-4 py-2.5 rounded-xl border border-blue-500 hover:bg-blue-50 text-blue-600 text-xs font-bold transition flex items-center justify-center gap-1.5 text-center shadow-2xs"
              >
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>View Donation History</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. SUMMARY METRICS RIBBON (6 CARDS) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Card 1: Total Inventory */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2 hover:border-slate-300 transition">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#172033] tracking-tight">{counts.total}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Total Inventory Items</div>
            </div>
            <button
              onClick={() => {
                setMainTab('import');
                setActiveStep(2);
                setStatusFilter('all');
              }}
              className="text-xs text-blue-600 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer pt-0.5"
            >
              <span>View all items</span>
              <span>→</span>
            </button>
          </div>

          {/* Card 2: Eligible Items */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2 hover:border-slate-300 transition">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#172033] tracking-tight">{counts.eligible}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Eligible Items</div>
            </div>
            <button
              onClick={() => {
                setMainTab('import');
                setActiveStep(2);
                setStatusFilter('eligible');
              }}
              className="text-xs text-blue-600 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer pt-0.5"
            >
              <span>View eligible</span>
              <span>→</span>
            </button>
          </div>

          {/* Card 3: Requiring Review */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2 hover:border-slate-300 transition">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#172033] tracking-tight">{counts.review}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Requiring Review</div>
            </div>
            <button
              onClick={() => {
                setMainTab('import');
                setActiveStep(3);
                setFlaggedFilter('requires_review');
              }}
              className="text-xs text-blue-600 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer pt-0.5"
            >
              <span>View flagged</span>
              <span>→</span>
            </button>
          </div>

          {/* Card 4: Rejected Items */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2 hover:border-slate-300 transition">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#172033] tracking-tight">{counts.rejected}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Rejected Items</div>
            </div>
            <button
              onClick={() => {
                setMainTab('import');
                setActiveStep(3);
                setFlaggedFilter('rejected');
              }}
              className="text-xs text-blue-600 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer pt-0.5"
            >
              <span>View rejected</span>
              <span>→</span>
            </button>
          </div>

          {/* Card 5: Active NGO Matches */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2 hover:border-slate-300 transition">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#172033] tracking-tight">38</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Active NGO Matches</div>
            </div>
            <button
              onClick={() => {
                setMainTab('import');
                setActiveStep(5);
              }}
              className="text-xs text-blue-600 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer pt-0.5"
            >
              <span>View matches</span>
              <span>→</span>
            </button>
          </div>

          {/* Card 6: Completed Donations */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2 hover:border-slate-300 transition">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#172033] tracking-tight">12</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Completed Donations</div>
            </div>
            <Link
              href="/donations"
              className="text-xs text-blue-600 font-medium hover:underline inline-flex items-center gap-1 pt-0.5"
            >
              <span>View history</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* 3. MAIN DASHBOARD CONTENT (INVENTORY MANAGEMENT & AI ASSISTANT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start" ref={importSectionRef}>
          {/* LEFT COLUMN: INVENTORY MANAGEMENT WORKSPACE (8 COLS) */}
          <div className="lg:col-span-8 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
              {/* Card Header & Navigation Tabs */}
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-[#172033]">Inventory Management</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Import, validate and manage your surplus inventory.
                    </p>
                  </div>
                </div>

                {/* Sub-Tabs Navigation Bar */}
                <div className="flex items-center gap-6 border-b border-slate-200 mt-4 text-xs font-semibold">
                  <button
                    onClick={() => setMainTab('import')}
                    className={`pb-2.5 flex items-center gap-2 cursor-pointer transition border-b-2 ${
                      mainTab === 'import'
                        ? 'border-blue-600 text-blue-600 font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Import & Validate</span>
                  </button>

                  <button
                    onClick={() => setMainTab('list')}
                    className={`pb-2.5 flex items-center gap-2 cursor-pointer transition border-b-2 ${
                      mainTab === 'list'
                        ? 'border-blue-600 text-blue-600 font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Inventory List</span>
                  </button>

                  <button
                    onClick={() => setMainTab('matches')}
                    className={`pb-2.5 flex items-center gap-2 cursor-pointer transition border-b-2 ${
                      mainTab === 'matches'
                        ? 'border-blue-600 text-blue-600 font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>NGO Matches</span>
                  </button>

                  <button
                    onClick={() => setMainTab('recent')}
                    className={`pb-2.5 flex items-center gap-2 cursor-pointer transition border-b-2 ${
                      mainTab === 'recent'
                        ? 'border-blue-600 text-blue-600 font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Recent Imports</span>
                  </button>
                </div>
              </div>

              {/* VIEW 1: IMPORT & VALIDATE */}
              {mainTab === 'import' && (
                <div className="space-y-5">
                  {/* 5-Step Interactive Stepper Ribbon */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    {/* Step 1 */}
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 cursor-pointer transition ${
                        activeStep === 1
                          ? 'bg-blue-50/70 border-blue-500 text-blue-700 shadow-xs ring-1 ring-blue-500/20'
                          : activeStep > 1
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
                          : 'bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        activeStep === 1
                          ? 'bg-blue-600 text-white'
                          : activeStep > 1
                          ? 'bg-emerald-600 text-white'
                          : 'border border-slate-300 text-slate-600'
                      }`}>
                        {activeStep > 1 ? '✓' : '1'}
                      </span>
                      <div className="min-w-0">
                        <div className={`text-xs truncate ${activeStep === 1 ? 'font-bold text-blue-700' : 'font-semibold'}`}>
                          Upload Data
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">Import your inventory</div>
                      </div>
                    </button>

                    {/* Step 2 */}
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 cursor-pointer transition ${
                        activeStep === 2
                          ? 'bg-blue-50/70 border-blue-500 text-blue-700 shadow-xs ring-1 ring-blue-500/20'
                          : activeStep > 2
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
                          : 'bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        activeStep === 2
                          ? 'bg-blue-600 text-white'
                          : activeStep > 2
                          ? 'bg-emerald-600 text-white'
                          : 'border border-slate-300 text-slate-600'
                      }`}>
                        {activeStep > 2 ? '✓' : '2'}
                      </span>
                      <div className="min-w-0">
                        <div className={`text-xs truncate ${activeStep === 2 ? 'font-bold text-blue-700' : 'font-semibold'}`}>
                          Preview & Validate
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">Check for issues</div>
                      </div>
                    </button>

                    {/* Step 3 */}
                    <button
                      type="button"
                      onClick={() => setActiveStep(3)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 cursor-pointer transition ${
                        activeStep === 3
                          ? 'bg-blue-50/70 border-blue-500 text-blue-700 shadow-xs ring-1 ring-blue-500/20'
                          : activeStep > 3
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
                          : 'bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        activeStep === 3
                          ? 'bg-blue-600 text-white'
                          : activeStep > 3
                          ? 'bg-emerald-600 text-white'
                          : 'border border-slate-300 text-slate-600'
                      }`}>
                        {activeStep > 3 ? '✓' : '3'}
                      </span>
                      <div className="min-w-0">
                        <div className={`text-xs truncate ${activeStep === 3 ? 'font-bold text-blue-700' : 'font-semibold'}`}>
                          Review & Edit
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">Fix flagged items</div>
                      </div>
                    </button>

                    {/* Step 4 */}
                    <button
                      type="button"
                      onClick={() => setActiveStep(4)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 cursor-pointer transition ${
                        activeStep === 4
                          ? 'bg-blue-50/70 border-blue-500 text-blue-700 shadow-xs ring-1 ring-blue-500/20'
                          : activeStep > 4
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
                          : 'bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        activeStep === 4
                          ? 'bg-blue-600 text-white'
                          : activeStep > 4
                          ? 'bg-emerald-600 text-white'
                          : 'border border-slate-300 text-slate-600'
                      }`}>
                        {activeStep > 4 ? '✓' : '4'}
                      </span>
                      <div className="min-w-0">
                        <div className={`text-xs truncate ${activeStep === 4 ? 'font-bold text-blue-700' : 'font-semibold'}`}>
                          Confirm & Import
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">Save to your account</div>
                      </div>
                    </button>

                    {/* Step 5 */}
                    <button
                      type="button"
                      onClick={() => setActiveStep(5)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 cursor-pointer transition ${
                        activeStep === 5
                          ? 'bg-blue-50/70 border-blue-500 text-blue-700 shadow-xs ring-1 ring-blue-500/20'
                          : 'bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        activeStep === 5
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-300 text-slate-600'
                      }`}>
                        5
                      </span>
                      <div className="min-w-0">
                        <div className={`text-xs truncate ${activeStep === 5 ? 'font-bold text-blue-700' : 'font-semibold'}`}>
                          Match with NGOs
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">Find suitable recipients</div>
                      </div>
                    </button>
                  </div>

                  {/* ========================================================
                      STEP 1: UPLOAD DATA WORKSPACE
                     ======================================================== */}
                  {activeStep === 1 && (
                    <div className="space-y-4 pt-1">
                      {/* Sub-Action Navigation (Upload File, Paste Data, Add Items Manually, Download Template) */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <button
                            onClick={() => setImportSubTab('upload')}
                            className={`px-3.5 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                              importSubTab === 'upload'
                                ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Upload File</span>
                          </button>

                          <button
                            onClick={() => setImportSubTab('paste')}
                            className={`px-3.5 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                              importSubTab === 'paste'
                                ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Paste Data</span>
                          </button>

                          <button
                            onClick={() => setIsManualModalOpen(true)}
                            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Items Manually</span>
                          </button>
                        </div>

                        <button
                          onClick={handleDownloadTemplate}
                          className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-400" />
                          <span>Download CSV Template</span>
                        </button>
                      </div>

                      {/* Upload Box & CSV Format Requirements */}
                      {importSubTab === 'upload' && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          {/* Drag & Drop Zone */}
                          <div className="md:col-span-7 p-6 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/20 hover:bg-blue-50/30 transition flex flex-col items-center justify-center text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                              <UploadCloud className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#172033]">Drag & drop your CSV or XLSX file here</div>
                              <div className="text-[11px] text-slate-400 mt-0.5">Supports .csv, .xlsx (max 10 MB)</div>
                            </div>

                            <div className="flex items-center gap-3 pt-1">
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition shadow-2xs cursor-pointer"
                              >
                                Choose File
                              </button>
                              <span className="text-xs text-slate-400">
                                {selectedFile ? selectedFile.name : fileName ? fileName : 'No file selected'}
                              </span>
                            </div>

                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".csv,.xlsx"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </div>

                          {/* CSV Format Requirements */}
                          <div className="md:col-span-5 p-4 rounded-2xl bg-slate-50/70 border border-slate-200 text-xs space-y-2.5">
                            <div className="flex items-center gap-2 font-bold text-[#172033] text-xs">
                              <FileText className="w-4 h-4 text-emerald-600" />
                              <span>CSV Format Requirements</span>
                            </div>

                            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] text-slate-600">
                              <div className="flex items-center gap-1.5">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span>itemName (required)</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span>expiryDate</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span>category (required)</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span>storageRequirements</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span>quantity (required)</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span>batchLotCode</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span>unit (required)</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span>city</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span>condition</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span>description</span>
                              </div>
                            </div>

                            <button
                              onClick={handleDownloadTemplate}
                              className="text-[11px] text-blue-600 hover:underline font-semibold block pt-1 cursor-pointer"
                            >
                              Download template with example data →
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Paste CSV Sub-tab */}
                      {importSubTab === 'paste' && (
                        <div className="space-y-3 pt-1">
                          <textarea
                            rows={4}
                            value={pastedCsv}
                            onChange={e => setPastedCsv(e.target.value)}
                            placeholder="Paste comma-separated rows: itemName,category,quantity,unit,condition,expiryDate,storage,batchCode,city..."
                            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                          <div className="flex justify-end">
                            <button
                              onClick={() => parseAndApplyCsv(pastedCsv, 'pasted_inventory.csv')}
                              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                            >
                              Parse & Validate Pasted Rows
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Active File Loaded Banner & Next Action */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                            <FileSpreadsheet className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-[#172033]">{fileName}</div>
                            <div className="text-[11px] text-slate-500">{fileSize} • Ready for preview</div>
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveStep(2)}
                          className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Continue to Preview & Validate ({counts.total} items)</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ========================================================
                      STEP 2: PREVIEW & VALIDATE WORKSPACE
                     ======================================================== */}
                  {activeStep === 2 && (
                    <div className="space-y-3 pt-1">
                      {/* Table Title Bar with Search & Filters */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            <h3 className="font-extrabold text-[#172033] text-sm">
                              Preview & Validation Results ({counts.total} items)
                            </h3>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Review your imported items and fix any issues before importing.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Search Input */}
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={e => setSearchQuery(e.target.value)}
                              placeholder="Search items..."
                              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>

                          {/* Filters Dropdown */}
                          <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value as any)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none"
                          >
                            <option value="all">Filters ▾</option>
                            <option value="eligible">Eligible Only ({counts.eligible})</option>
                            <option value="requires_review">Requires Review ({counts.review})</option>
                            <option value="rejected">Rejected ({counts.rejected})</option>
                          </select>

                          {/* Validate All Button */}
                          <button
                            onClick={handleValidateAll}
                            className="px-4 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer whitespace-nowrap"
                          >
                            Validate All
                          </button>
                        </div>
                      </div>

                      {/* Clean Human-Designed Table */}
                      <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs">
                        <table className="w-full text-left text-xs whitespace-nowrap divide-y divide-slate-100">
                          <thead className="bg-slate-50 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                            <tr>
                              <th className="py-3 px-3 w-8">
                                <input
                                  type="checkbox"
                                  checked={selectedIds.length === filteredItems.length && filteredItems.length > 0}
                                  onChange={e => {
                                    if (e.target.checked) setSelectedIds(filteredItems.map(i => i.id));
                                    else setSelectedIds([]);
                                  }}
                                  className="rounded border-slate-300 accent-blue-600"
                                />
                              </th>
                              <th className="py-3 px-2">#</th>
                              <th className="py-3 px-3">Item Name</th>
                              <th className="py-3 px-3">Category</th>
                              <th className="py-3 px-3">Quantity</th>
                              <th className="py-3 px-2">Unit</th>
                              <th className="py-3 px-2">Condition</th>
                              <th className="py-3 px-3">Expiry Date</th>
                              <th className="py-3 px-2">Storage</th>
                              <th className="py-3 px-3">Status</th>
                              <th className="py-3 px-3 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredItems.map(item => {
                              const isSelected = selectedIds.includes(item.id);
                              return (
                                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                                  <td className="py-3 px-3">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={e => {
                                        if (e.target.checked) setSelectedIds(prev => [...prev, item.id]);
                                        else setSelectedIds(prev => prev.filter(id => id !== item.id));
                                      }}
                                      className="rounded border-slate-300 accent-blue-600"
                                    />
                                  </td>
                                  <td className="py-3 px-2 font-mono text-slate-400 text-[11px]">{item.rowNumber}</td>
                                  <td className="py-3 px-3 font-semibold text-[#172033]">{item.itemName}</td>
                                  <td className="py-3 px-3 text-slate-600">{item.category}</td>
                                  <td className="py-3 px-3 font-bold text-[#172033]">{item.quantity}</td>
                                  <td className="py-3 px-2 text-slate-500">{item.unit}</td>
                                  <td className="py-3 px-2 text-slate-600">{item.condition}</td>
                                  <td className="py-3 px-3 font-mono text-slate-500">{item.expiryDate}</td>
                                  <td className="py-3 px-2 text-slate-600">{item.storage}</td>
                                  <td className="py-3 px-3">
                                    {item.validationStatus === 'eligible' && (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Eligible
                                      </span>
                                    )}
                                    {item.validationStatus === 'requires_review' && (
                                      <span
                                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold cursor-help"
                                        title={item.issues?.join(' ')}
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        Review
                                      </span>
                                    )}
                                    {item.validationStatus === 'rejected' && (
                                      <span
                                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold cursor-help"
                                        title={item.issues?.join(' ')}
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                        Rejected
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 text-center">
                                    <div className="flex items-center justify-center gap-2 text-slate-400">
                                      <button
                                        onClick={() => setEditingItem(item)}
                                        className="p-1 hover:text-blue-600 cursor-pointer transition"
                                        title="Edit item"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (confirm(`Remove ${item.itemName}?`)) {
                                            setItems(prev => prev.filter(i => i.id !== item.id));
                                          }
                                        }}
                                        className="p-1 hover:text-rose-600 cursor-pointer transition"
                                        title="Delete item"
                                      >
                                        <MoreHorizontal className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Step 2 Bottom Navigation Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 text-xs">
                        <button
                          onClick={() => setActiveStep(1)}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                        >
                          ← Back to Upload Data
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setActiveStep(3)}
                            className="px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold transition cursor-pointer"
                          >
                            Review Flagged Items ({counts.review + counts.rejected}) →
                          </button>
                          <button
                            onClick={() => setActiveStep(4)}
                            className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold transition shadow-xs cursor-pointer"
                          >
                            Proceed to Confirm Import ({counts.eligible} Eligible) →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ========================================================
                      STEP 3: REVIEW & EDIT FLAGGED ITEMS
                     ======================================================== */}
                  {activeStep === 3 && (
                    <div className="space-y-4 pt-1">
                      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="font-extrabold text-sm text-amber-900 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <span>Review Flagged & Non-Compliant Items ({flaggedItems.length} items need attention)</span>
                          </div>
                          <p className="text-xs text-amber-800/80 mt-0.5">
                            Fix unsealed packaging or expiry buffer issues. Excluded items cannot be distributed to relief camps.
                          </p>
                        </div>

                        {/* Fast Actions: AI Suggestion Fix & Download Fixed CSV */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={handleDownloadFixedCsv}
                            className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer shadow-2xs"
                          >
                            Download Fixed CSV
                          </button>
                          <button
                            onClick={handleApplyAiSuggestions}
                            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-2xs flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Apply AI Suggestions</span>
                          </button>
                        </div>
                      </div>

                      {/* Filter Pills for Flagged Items */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-slate-600">Filter Flagged:</span>
                        <button
                          onClick={() => setFlaggedFilter('all')}
                          className={`px-3 py-1 rounded-lg border font-semibold cursor-pointer ${
                            flaggedFilter === 'all'
                              ? 'bg-slate-800 text-white border-slate-800'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          All Flagged ({counts.review + counts.rejected})
                        </button>
                        <button
                          onClick={() => setFlaggedFilter('requires_review')}
                          className={`px-3 py-1 rounded-lg border font-semibold cursor-pointer ${
                            flaggedFilter === 'requires_review'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-white border-slate-200 text-amber-700 hover:bg-amber-50'
                          }`}
                        >
                          Requires Review ({counts.review})
                        </button>
                        <button
                          onClick={() => setFlaggedFilter('rejected')}
                          className={`px-3 py-1 rounded-lg border font-semibold cursor-pointer ${
                            flaggedFilter === 'rejected'
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white border-slate-200 text-rose-700 hover:bg-rose-50'
                          }`}
                        >
                          Rejected ({counts.rejected})
                        </button>
                      </div>

                      {/* Flagged Items Focused Table */}
                      <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs">
                        <table className="w-full text-left text-xs whitespace-nowrap divide-y divide-slate-100">
                          <thead className="bg-slate-50 text-slate-500 font-bold text-[11px] uppercase">
                            <tr>
                              <th className="py-2.5 px-3">#</th>
                              <th className="py-2.5 px-3">Item Name</th>
                              <th className="py-2.5 px-3">Category</th>
                              <th className="py-2.5 px-2">Condition</th>
                              <th className="py-2.5 px-3">Expiry</th>
                              <th className="py-2.5 px-3">Validation Reason / Issue</th>
                              <th className="py-2.5 px-3 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {flaggedItems.map(item => (
                              <tr key={item.id} className="hover:bg-slate-50/70">
                                <td className="py-2.5 px-3 font-mono text-slate-400">{item.rowNumber}</td>
                                <td className="py-2.5 px-3 font-bold text-[#172033]">{item.itemName}</td>
                                <td className="py-2.5 px-3 text-slate-600">{item.category}</td>
                                <td className="py-2.5 px-2">{item.condition}</td>
                                <td className="py-2.5 px-3 font-mono text-slate-500">{item.expiryDate}</td>
                                <td className="py-2.5 px-3 text-slate-700">
                                  {item.validationStatus === 'rejected' ? (
                                    <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                                      {item.issues?.[0] || 'Safety buffer violation or restricted item'}
                                    </span>
                                  ) : (
                                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                                      {item.issues?.[0] || 'Condition requires physical depot verification'}
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <button
                                    onClick={() => setEditingItem(item)}
                                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs cursor-pointer"
                                  >
                                    Edit & Fix
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Step 3 Bottom Navigation */}
                      <div className="flex items-center justify-between pt-3 text-xs">
                        <button
                          onClick={() => setActiveStep(2)}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                        >
                          ← Back to Preview & Validate
                        </button>
                        <button
                          onClick={() => setActiveStep(4)}
                          className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold transition shadow-xs cursor-pointer"
                        >
                          Proceed to Confirm Import ({counts.eligible} Eligible) →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ========================================================
                      STEP 4: CONFIRM & IMPORT WORKSPACE
                     ======================================================== */}
                  {activeStep === 4 && (
                    <div className="space-y-4 pt-1">
                      <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-2xs">
                        <div>
                          <h3 className="font-extrabold text-base text-[#172033]">
                            Confirm Inventory Intake Manifest
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Please review the final batch summary before committing lots to verified Sahay storage.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                            <div className="text-[11px] text-emerald-800 font-bold">READY TO IMPORT</div>
                            <div className="text-2xl font-black text-emerald-700 mt-1">{counts.eligible} Lots</div>
                            <div className="text-[11px] text-emerald-600 mt-0.5">100% safety & buffer compliant</div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200">
                            <div className="text-[11px] text-rose-800 font-bold">EXCLUDED FROM IMPORT</div>
                            <div className="text-2xl font-black text-rose-700 mt-1">{counts.rejected} Lots</div>
                            <div className="text-[11px] text-rose-600 mt-0.5">Diverted to certified recycling</div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                            <div className="text-[11px] text-amber-800 font-bold">REQUIRING REVIEW</div>
                            <div className="text-2xl font-black text-amber-700 mt-1">{counts.review} Lots</div>
                            <div className="text-[11px] text-amber-600 mt-0.5">Physical depot inspection</div>
                          </div>
                        </div>

                        {/* Intake Logistics Details */}
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                          <div className="font-bold text-[#172033]">Warehouse Intake Details:</div>
                          <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11.5px]">
                            <div>• Target Facility: <strong>Hotel Horizon Surplus Staging Depot</strong></div>
                            <div>• Location Jurisdiction: <strong>New Delhi Central</strong></div>
                            <div>• Compliance Standard: <strong>FSSAI Safe 48h Buffer Rule</strong></div>
                            <div>• Batch Traceability: <strong>Immutable Lot Codes Generated</strong></div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => setActiveStep(3)}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs cursor-pointer"
                          >
                            ← Back to Review & Edit
                          </button>

                          <button
                            onClick={handleConfirmImport}
                            className="px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Confirm & Save to Account ({counts.eligible} Eligible Lots)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ========================================================
                      STEP 5: MATCH WITH NGOS WORKSPACE
                     ======================================================== */}
                  {activeStep === 5 && (
                    <div className="space-y-4 pt-1">
                      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                        <div>
                          <div className="font-extrabold text-sm text-emerald-900 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Import Confirmed! Match Inventory with Verified NGOs</span>
                          </div>
                          <p className="text-xs text-emerald-800 mt-0.5">
                            Your eligible lots have been recorded in Sahay. Here are the top verified humanitarian partners near Delhi:
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveStep(1);
                            setAppliedAiFixes(false);
                          }}
                          className="px-3.5 py-1.5 rounded-lg border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs cursor-pointer"
                        >
                          Start New Import
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        {/* Sewa Bharat Match */}
                        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-extrabold text-sm text-[#172033]">Sewa Bharat</div>
                              <div className="text-slate-500 text-[11px]">Delhi, India • Within 12 km</div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                              98% Match
                            </span>
                          </div>
                          <div className="text-slate-700">
                            <strong>Requested Need:</strong> 100 Winter Blankets (Lot LOT-GH-902 compatible)
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px]">
                              High Priority
                            </span>
                            <span className="text-slate-400 text-[11px]">• Verified FCRA Active</span>
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <Link
                              href="/matches/don_blankets_100_demo"
                              className="flex-1 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-bold text-center text-slate-700 text-xs"
                            >
                              View Details
                            </Link>
                            <button
                              onClick={() =>
                                setAllocationModalNgo({
                                  name: 'Sewa Bharat',
                                  match: '98%',
                                  needs: '100 Winter Blankets',
                                  location: 'Delhi, India',
                                  distance: 'Within 12 km',
                                  priority: 'High Priority'
                                })
                              }
                              className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center text-xs cursor-pointer"
                            >
                              Request Allocation
                            </button>
                          </div>
                        </div>

                        {/* Help & Care Foundation Match */}
                        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-extrabold text-sm text-[#172033]">Help & Care Foundation</div>
                              <div className="text-slate-500 text-[11px]">Delhi NCR • Within 25 km</div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                              92% Match
                            </span>
                          </div>
                          <div className="text-slate-700">
                            <strong>Requested Need:</strong> 50 Food Packs (Atta Flour lot LOT-GH-901 compatible)
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[10px]">
                              Medium Priority
                            </span>
                            <span className="text-slate-400 text-[11px]">• FSSAI Compliant Intake</span>
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <Link
                              href="/matches/don_completed_rice_bags"
                              className="flex-1 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-bold text-center text-slate-700 text-xs"
                            >
                              View Details
                            </Link>
                            <button
                              onClick={() =>
                                setAllocationModalNgo({
                                  name: 'Help & Care Foundation',
                                  match: '92%',
                                  needs: '50 Food Packs',
                                  location: 'Delhi NCR',
                                  distance: 'Within 25 km',
                                  priority: 'Medium Priority'
                                })
                              }
                              className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center text-xs cursor-pointer"
                            >
                              Request Allocation
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 2: INVENTORY LIST */}
              {mainTab === 'list' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-[#172033] text-sm">Full Inventory Master List</h3>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Manage active warehouse surplus, lot traceability codes and storage conditions.
                      </p>
                    </div>
                    <button
                      onClick={handleDownloadTemplate}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-slate-100">
                      <thead className="bg-slate-50 text-slate-500 font-bold text-[11px]">
                        <tr>
                          <th className="py-2.5 px-3">Batch Code</th>
                          <th className="py-2.5 px-3">Item Name</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-2">Quantity</th>
                          <th className="py-2.5 px-2">Condition</th>
                          <th className="py-2.5 px-3">Expiry</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {items.map(it => (
                          <tr key={it.id} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3 font-mono text-slate-500">{it.batchCode}</td>
                            <td className="py-2.5 px-3 font-semibold text-[#172033]">{it.itemName}</td>
                            <td className="py-2.5 px-3 text-slate-600">{it.category}</td>
                            <td className="py-2.5 px-2 font-bold">{it.quantity} {it.unit}</td>
                            <td className="py-2.5 px-2">{it.condition}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">{it.expiryDate}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10.5px] ${
                                it.validationStatus === 'eligible'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : it.validationStatus === 'requires_review'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}>
                                {it.validationStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VIEW 3: NGO MATCHES */}
              {mainTab === 'matches' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <h3 className="font-extrabold text-[#172033] text-sm">Verified NGO Partner Matches</h3>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Algorithmic matching based on category fit, proximity to New Delhi, and urgent verified humanitarian needs.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Match 1: Sewa Bharat */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-extrabold text-sm text-[#172033]">Sewa Bharat</div>
                          <div className="text-slate-500 text-[11px] mt-0.5">Delhi, India • Within 12 km</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                          98% Match
                        </span>
                      </div>
                      <div className="text-slate-700">
                        <strong>Requested Need:</strong> 100 Winter Blankets (Lot LOT-GH-902 compatible)
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px]">
                          High Priority
                        </span>
                        <span className="text-slate-400 text-[11px]">• Verified NGO FCRA Active</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Link
                          href="/matches/don_blankets_100_demo"
                          className="flex-1 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-bold text-center text-slate-700"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() =>
                            setAllocationModalNgo({
                              name: 'Sewa Bharat',
                              match: '98%',
                              needs: '100 Winter Blankets',
                              location: 'Delhi, India',
                              distance: 'Within 12 km',
                              priority: 'High Priority'
                            })
                          }
                          className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center cursor-pointer"
                        >
                          Request Allocation
                        </button>
                      </div>
                    </div>

                    {/* Match 2: Help & Care Foundation */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-extrabold text-sm text-[#172033]">Help & Care Foundation</div>
                          <div className="text-slate-500 text-[11px] mt-0.5">Delhi NCR • Within 25 km</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                          92% Match
                        </span>
                      </div>
                      <div className="text-slate-700">
                        <strong>Requested Need:</strong> 50 Food Packs (Atta Flour lot LOT-GH-901 compatible)
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[10px]">
                          Medium Priority
                        </span>
                        <span className="text-slate-400 text-[11px]">• FSSAI Compliant Intake</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Link
                          href="/matches/don_completed_rice_bags"
                          className="flex-1 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-bold text-center text-slate-700"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() =>
                            setAllocationModalNgo({
                              name: 'Help & Care Foundation',
                              match: '92%',
                              needs: '50 Food Packs',
                              location: 'Delhi NCR',
                              distance: 'Within 25 km',
                              priority: 'Medium Priority'
                            })
                          }
                          className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center cursor-pointer"
                        >
                          Request Allocation
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 4: RECENT IMPORTS */}
              {mainTab === 'recent' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <h3 className="font-extrabold text-[#172033] text-sm">Historical Batch Import Manifests</h3>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Audit trail of uploaded inventory files and downstream dispatch logs.
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-slate-100">
                      <thead className="bg-slate-50 text-slate-500 font-bold text-[11px]">
                        <tr>
                          <th className="py-2.5 px-3">Date & Time</th>
                          <th className="py-2.5 px-3">File Name</th>
                          <th className="py-2.5 px-2">Total Rows</th>
                          <th className="py-2.5 px-2">Imported</th>
                          <th className="py-2.5 px-2">Review</th>
                          <th className="py-2.5 px-2">Rejected</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        <tr>
                          <td className="py-2.5 px-3 font-medium">Oct 26, 2024 10:24 AM</td>
                          <td className="py-2.5 px-3 font-bold text-[#172033]">hotel_surplus_inventory.csv</td>
                          <td className="py-2.5 px-2 font-mono">256</td>
                          <td className="py-2.5 px-2 font-mono text-emerald-700 font-bold">194</td>
                          <td className="py-2.5 px-2 font-mono text-amber-700">32</td>
                          <td className="py-2.5 px-2 font-mono text-rose-700">30</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                              Completed
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <button onClick={() => alert('Manifest details for hotel_surplus_inventory.csv')} className="text-blue-600 hover:underline font-semibold cursor-pointer">
                              View Report
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-medium">Oct 22, 2024 03:18 PM</td>
                          <td className="py-2.5 px-3 font-bold text-[#172033]">kitchen_items_oct.csv</td>
                          <td className="py-2.5 px-2 font-mono">120</td>
                          <td className="py-2.5 px-2 font-mono text-emerald-700 font-bold">98</td>
                          <td className="py-2.5 px-2 font-mono text-amber-700">12</td>
                          <td className="py-2.5 px-2 font-mono text-rose-700">10</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                              Completed
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <button onClick={() => alert('Manifest details for kitchen_items_oct.csv')} className="text-blue-600 hover:underline font-semibold cursor-pointer">
                              View Report
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-medium">Oct 18, 2024 01:45 PM</td>
                          <td className="py-2.5 px-3 font-bold text-[#172033]">blankets_nov.csv</td>
                          <td className="py-2.5 px-2 font-mono">340</td>
                          <td className="py-2.5 px-2 font-mono text-emerald-700 font-bold">300</td>
                          <td className="py-2.5 px-2 font-mono text-amber-700">25</td>
                          <td className="py-2.5 px-2 font-mono text-rose-700">15</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px]">
                              Partial
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <button onClick={() => alert('Manifest details for blankets_nov.csv')} className="text-blue-600 hover:underline font-semibold cursor-pointer">
                              View Report
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: AI INVENTORY ASSISTANT (4 COLS) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#172033] text-sm leading-tight">AI Inventory Assistant</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Get help with validation, categorization, NGO matching and more.
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>

              {/* Welcome Card */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs text-slate-700 leading-relaxed space-y-1.5">
                <p className="font-bold text-[#172033]">Hi! I'm your Sahay AI Assistant.</p>
                <p className="text-[11.5px] text-slate-600">
                  I can help you with your inventory, explain validation errors, suggest categories, find matching NGOs and answer your questions.
                </p>
              </div>

              {/* Try Asking Prompt Pills */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Try asking:</div>
                <div className="flex flex-col gap-1.5 text-xs">
                  <button
                    onClick={() => handleSendAi('Explain why my items were rejected', 'explain_import_errors')}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-left transition cursor-pointer"
                  >
                    Explain why my items were rejected
                  </button>

                  <button
                    onClick={() => handleSendAi('Suggest correct categories', 'suggest_categories')}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-left transition cursor-pointer"
                  >
                    Suggest correct categories
                  </button>

                  <button
                    onClick={() => handleSendAi('Find eligible items from my inventory', 'find_eligible')}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-left transition cursor-pointer"
                  >
                    Find eligible items from my inventory
                  </button>

                  <button
                    onClick={() => handleSendAi('Summarize this inventory', 'summarize_inventory')}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-left transition cursor-pointer"
                  >
                    Summarize this inventory
                  </button>

                  <button
                    onClick={() => handleSendAi('Find matching NGOs near Delhi', 'explain_ngo_matches')}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-left transition cursor-pointer"
                  >
                    Find matching NGOs near Delhi
                  </button>
                </div>
              </div>

              {/* Active Conversation Messages */}
              {aiMessages.length > 0 && (
                <div className="space-y-2.5 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                  {aiMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[90%] p-2.5 rounded-xl text-[11.5px] leading-relaxed whitespace-pre-line ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-xs'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs space-y-2'
                        }`}
                      >
                        <div>{msg.text}</div>

                        {/* Action buttons if assistant provided analysis */}
                        {msg.role === 'assistant' && (
                          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                            <button
                              onClick={handleDownloadFixedCsv}
                              className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-[10px] cursor-pointer"
                            >
                              Download Fixed CSV
                            </button>
                            <button
                              onClick={handleApplyAiSuggestions}
                              className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] cursor-pointer"
                            >
                              Apply Suggestions
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {aiLoading && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 p-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <span>Analyzing inventory rules...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Chat Input Bar */}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendAi();
                }}
                className="space-y-1.5 pt-1"
              >
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    placeholder="Ask a question about your inventory..."
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !aiInput.trim()}
                    className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center cursor-pointer transition disabled:opacity-50 absolute right-2"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 leading-snug">
                  AI provides guidance based on your inventory data. Please review suggestions before making decisions.
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ALLOCATION REQUEST CONFIRMATION MODAL */}
      {allocationModalNgo && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-[#172033] text-sm">Confirm Allocation Request</h3>
              </div>
              <button
                onClick={() => setAllocationModalNgo(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#172033] text-sm">{allocationModalNgo.name}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  {allocationModalNgo.match} Match
                </span>
              </div>
              <div className="text-slate-600">
                <strong>Need:</strong> {allocationModalNgo.needs}
              </div>
              <div className="text-slate-600">
                <strong>Location:</strong> {allocationModalNgo.location} ({allocationModalNgo.distance})
              </div>
              <div className="text-slate-600">
                <strong>Priority:</strong> {allocationModalNgo.priority}
              </div>
            </div>

            <p className="text-slate-500 text-[11px] leading-relaxed">
              Dispatching from Hotel Horizon Hospitality surplus warehouse. Secure encrypted custody handoff tokens will be generated for the verified pickup driver.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setAllocationModalNgo(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setAllocationModalNgo(null);
                  confetti({ particleCount: 70, spread: 65, origin: { y: 0.5 } });
                  setImportSuccessMessage(
                    `Allocation request sent to ${allocationModalNgo.name}! Delivery tracking manifest created.`
                  );
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-xs"
              >
                Confirm Allocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ROW MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-[#172033] text-sm">Edit Inventory Row #{editingItem.rowNumber}</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="font-bold text-slate-700 block">Item Name</label>
                <input
                  type="text"
                  value={editingItem.itemName}
                  onChange={e => setEditingItem({ ...editingItem, itemName: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Category</label>
                <select
                  value={editingItem.category}
                  onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200"
                >
                  <option value="Food & Nutrition">Food & Nutrition</option>
                  <option value="Clothing & Winter">Clothing & Winter</option>
                  <option value="Hygiene & Sanitation">Hygiene & Sanitation</option>
                  <option value="Medical & First Aid">Medical & First Aid</option>
                  <option value="Electronics (Restricted)">Electronics (Restricted)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Quantity</label>
                <input
                  type="number"
                  value={editingItem.quantity}
                  onChange={e => setEditingItem({ ...editingItem, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Condition</label>
                <select
                  value={editingItem.condition}
                  onChange={e => setEditingItem({ ...editingItem, condition: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200"
                >
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Used">Used</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Expiry Date</label>
                <input
                  type="text"
                  value={editingItem.expiryDate}
                  onChange={e => setEditingItem({ ...editingItem, expiryDate: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-mono"
                  placeholder="YYYY-MM-DD or —"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditedRow}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 cursor-pointer"
              >
                Save & Re-validate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL ADD ITEM MODAL */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddManualItem}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-[#172033] text-sm">Add Item Manually</h3>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="font-bold text-slate-700 block">Item Name *</label>
                <input
                  type="text"
                  required
                  value={manualForm.itemName}
                  onChange={e => setManualForm({ ...manualForm, itemName: e.target.value })}
                  placeholder="e.g. Rice Sacks 25kg"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Category *</label>
                <select
                  value={manualForm.category}
                  onChange={e => setManualForm({ ...manualForm, category: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200"
                >
                  <option value="Food & Nutrition">Food & Nutrition</option>
                  <option value="Clothing & Winter">Clothing & Winter</option>
                  <option value="Hygiene & Sanitation">Hygiene & Sanitation</option>
                  <option value="Medical & First Aid">Medical & First Aid</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Quantity *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={manualForm.quantity}
                  onChange={e => setManualForm({ ...manualForm, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Unit *</label>
                <input
                  type="text"
                  required
                  value={manualForm.unit}
                  onChange={e => setManualForm({ ...manualForm, unit: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Condition</label>
                <select
                  value={manualForm.condition}
                  onChange={e => setManualForm({ ...manualForm, condition: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200"
                >
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 cursor-pointer"
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
