import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    // Read the progress logs data from the public/data directory
    const filePath = path.join(process.cwd(), 'public', 'data', 'progress-logs.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const progressLogs = JSON.parse(fileContents);
    
    return NextResponse.json(progressLogs);
  } catch (error) {
    console.error('Error loading progress logs data:', error);
    return NextResponse.json(
      { error: 'Failed to load progress logs data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const logData = await request.json();
    
    // Generate a unique ID for the new entry
    const newEntry = {
      id: uuidv4(),
      ...logData,
      date: new Date().toISOString() // Use current date/time if not provided
    };
    
    // Read existing progress logs
    const filePath = path.join(process.cwd(), 'public', 'data', 'progress-logs.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const progressLogs = JSON.parse(fileContents);
    
    // Add the new entry
    progressLogs.push(newEntry);
    
    // Write the updated logs back to the file
    fs.writeFileSync(filePath, JSON.stringify(progressLogs, null, 2), 'utf8');
    
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error('Error saving progress log:', error);
    return NextResponse.json(
      { error: 'Failed to save progress log' },
      { status: 500 }
    );
  }
} 