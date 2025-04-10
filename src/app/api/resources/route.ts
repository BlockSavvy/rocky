import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the resources data from the public/data directory
    const filePath = path.join(process.cwd(), 'public', 'data', 'resources.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const resources = JSON.parse(fileContents);
    
    return NextResponse.json(resources);
  } catch (error) {
    console.error('Error loading resources data:', error);
    return NextResponse.json(
      { error: 'Failed to load resources data' },
      { status: 500 }
    );
  }
} 