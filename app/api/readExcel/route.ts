import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('excel') as File;
    
    if (!file) {
      return NextResponse.json({ columns: [], allData: [], preview: [] });
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);
    
    const columns = Object.keys(rows[0] || {});
    const allData = rows;
    const preview = rows.slice(0, 5);
    
    return NextResponse.json({ columns, allData, preview });
  } catch (error) {
    console.error('Error reading Excel:', error);
    return NextResponse.json({ columns: [], allData: [], preview: [] });
  }
}