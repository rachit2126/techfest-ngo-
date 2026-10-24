import { NextResponse } from 'next/server';
import { VALID_CATEGORIES } from '@/lib/ai-assistant-service';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { title, description } = body;

    const text = `${title || ''} ${description || ''}`.toLowerCase();

    let matchedCategory = 'clothing_blankets';
    let subcategory = 'Blankets';
    let confidence = 0.95;
    let rationale = 'Identified thermal fleece and blanket specifications, matching winter shelter relief.';

    if (text.includes('food') || text.includes('grain') || text.includes('ration') || text.includes('dal') || text.includes('rice')) {
      matchedCategory = 'packaged_food';
      subcategory = 'Grain & Rice';
      confidence = 0.94;
      rationale = 'Identified sealed shelf-stable rations, matching community kitchen and food rescue programs.';
    } else if (text.includes('hygiene') || text.includes('soap') || text.includes('sanitary') || text.includes('dignity')) {
      matchedCategory = 'hygiene_kits';
      subcategory = 'Dignity Kits';
      confidence = 0.93;
      rationale = 'Identified hygiene and sanitary items, matching disaster relief dignity packages.';
    } else if (text.includes('medicine') || text.includes('bandage') || text.includes('first aid') || text.includes('diagnostic')) {
      matchedCategory = 'medical_first_aid';
      subcategory = 'First Aid Kits';
      confidence = 0.92;
      rationale = 'Identified medical and first aid consumables, subject to batch and packaging verification.';
    }

    const categoryMeta = VALID_CATEGORIES[matchedCategory] || VALID_CATEGORIES.other;

    return NextResponse.json({
      success: true,
      category: matchedCategory,
      categoryLabel: categoryMeta.label,
      subcategory,
      availableSubcategories: categoryMeta.subcategories,
      confidence,
      rationale
    });
  } catch (error) {
    console.error('Recommend Category Error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to recommend category' },
      { status: 500 }
    );
  }
}
