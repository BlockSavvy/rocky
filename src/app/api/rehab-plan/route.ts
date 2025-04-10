import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the rehab plan data from the public/data directory
    const filePath = path.join(process.cwd(), 'public', 'data', 'rehab-plan.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const rehabPlan = JSON.parse(fileContents);
    
    return NextResponse.json(rehabPlan);
  } catch (error) {
    console.error('Error loading rehab plan data:', error);
    return NextResponse.json(
      { error: 'Failed to load rehab plan data' },
      { status: 500 }
    );
  }
} 