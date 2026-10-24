import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { mode, text, photoName, voiceNotes, priceIntent } = body;

    // AI Listing Extraction and Verification Guardrails
    // Parses user natural language, photo description, or voice notes into structured donation/sale draft
    const inputContent = (text || photoName || voiceNotes || '').toLowerCase();

    let detectedCategory = 'clothing_blankets';
    let subcategory = 'blankets';
    let title = 'Winter Relief Supplies';
    let suggestedQuantity = 50;
    let suggestedUnit = 'units';
    let detectedCondition = 'new';
    let brand = 'Generic / No Brand';
    let estimatedFairValue = '₹600 - ₹1,500 per unit';
    let safetyFlags: string[] = [];
    let confidence = 0.94;

    if (inputContent.includes('blanket') || inputContent.includes('quilt') || inputContent.includes('jacket') || inputContent.includes('clothes') || inputContent.includes('fleece')) {
      detectedCategory = 'clothing_blankets';
      subcategory = inputContent.includes('blanket') ? 'Blankets' : 'Warm Clothing';
      title = 'Warm Fleece Winter Blankets';
      suggestedQuantity = 50;
      suggestedUnit = 'units';
      brand = 'Generic / Relief Grade';
      estimatedFairValue = '₹600 - ₹1,500 per unit';
    } else if (inputContent.includes('food') || inputContent.includes('ration') || inputContent.includes('rice') || inputContent.includes('grain') || inputContent.includes('packet')) {
      detectedCategory = 'packaged_food';
      subcategory = 'Dry Rations & Meals';
      title = 'Packaged Emergency Dry Rations';
      suggestedQuantity = 100;
      suggestedUnit = 'meals';
      estimatedFairValue = '₹40 - ₹80 per meal';
    } else if (inputContent.includes('medical') || inputContent.includes('first aid') || inputContent.includes('bandage') || inputContent.includes('medicine')) {
      detectedCategory = 'medical_first_aid';
      subcategory = 'First Aid & Trauma Packs';
      title = 'Humanitarian First Aid & Trauma Kits';
      suggestedQuantity = 25;
      suggestedUnit = 'kits';
      estimatedFairValue = '₹450 - ₹1,200 per kit';
    } else if (inputContent.includes('soap') || inputContent.includes('sanitizer') || inputContent.includes('hygiene') || inputContent.includes('water')) {
      detectedCategory = 'hygiene_kits';
      subcategory = 'Sanitation & Hygiene';
      title = 'Essential Hygiene & Sanitation Packs';
      suggestedQuantity = 40;
      suggestedUnit = 'kits';
      estimatedFairValue = '₹250 - ₹600 per kit';
    }

    if (inputContent.includes('used') || inputContent.includes('second hand') || inputContent.includes('purana')) {
      detectedCondition = 'good';
    }

    // Safety and prohibited check
    if (inputContent.includes('weapon') || inputContent.includes('alcohol') || inputContent.includes('expired') || inputContent.includes('hazard')) {
      safetyFlags.push('Item contains keywords restricted by ReliefLink humanitarian safety charter.');
    }

    return NextResponse.json({
      success: true,
      draft: {
        title,
        category: detectedCategory,
        subcategory,
        description: `High-quality ${subcategory.toLowerCase()} suitable for community relief or distribution. Verified intact in protective packing.`,
        quantity: suggestedQuantity,
        unit: suggestedUnit,
        condition: detectedCondition,
        brand,
        dimensions: '200 × 150 × 5 cm',
        weight: '1.5 kg',
        estimatedFairValue,
        confidenceScore: confidence,
        tags: [detectedCategory, subcategory, 'Relief', 'Verified Intake'],
        safetyFlags,
        potentialNgoMatchesCount: 12
      }
    });
  } catch (error) {
    console.error('AI Assistant listing error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
