import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the rehab plan data from the public/data directory
    const filePath = path.join(process.cwd(), 'public', 'data', 'rehab-plan.json');
    console.log('Trying to read rehab plan from path:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File does not exist:', filePath);
      return NextResponse.json(
        { error: 'Rehab plan file not found' },
        { status: 404 }
      );
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    console.log('Successfully read rehab plan file, length:', fileContents.length);
    
    const rehabPlan = JSON.parse(fileContents);
    console.log('Rehab plan parsed successfully, exercise count:', rehabPlan.exercises?.length || 0);
    
    return NextResponse.json(rehabPlan);
  } catch (error) {
    console.error('Error loading rehab plan data:', error);
    return NextResponse.json(
      { error: 'Failed to load rehab plan data: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 