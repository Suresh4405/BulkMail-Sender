import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: email, pass: password },
    });
    
    await transporter.verify();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
}