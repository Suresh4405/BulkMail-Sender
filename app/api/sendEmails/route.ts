import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import nodemailer from 'nodemailer';


function markdownToHtml(text: string, columns: string[], rowData: any) {
  if (!text) return '';
  
  let html = text;
  
  columns.forEach((col) => {
    const regex = new RegExp(`{{${col}}}`, 'g');
    const value = rowData[col] || '';
    html = html.replace(regex, value);
  });
  
  const lines = html.split('\n');
  const processedLines = [];
  let inBulletList = false;
  let inNumberedList = false;
  let bulletItems: string[] = [];
  let numberedItems: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    if (line.trim() === '') {
      if (inBulletList && bulletItems.length > 0) {
        processedLines.push(`<ul style="margin:0 0 0 20px;padding:0;">${bulletItems.join('')}</ul>`);
        bulletItems = [];
        inBulletList = false;
      }
      if (inNumberedList && numberedItems.length > 0) {
        processedLines.push(`<ol style="margin:0 0 0 20px;padding:0;">${numberedItems.join('')}</ol>`);
        numberedItems = [];
        inNumberedList = false;
      }
      processedLines.push('<br>'); 
      continue;
    }
    
    const bulletMatch = line.match(/^\s*[•\-\*]\s+(.*)$/);
    const numberMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
    
    if (bulletMatch) {
      if (!inBulletList) {
        if (inNumberedList && numberedItems.length > 0) {
          processedLines.push(`<ol style="margin:0 0 0 20px;padding:0;">${numberedItems.join('')}</ol>`);
          numberedItems = [];
          inNumberedList = false;
        }
        inBulletList = true;
      }
      bulletItems.push(`<li style="margin:0;padding:0;line-height:1.5;">${bulletMatch[1].trim()}</li>`);
    } 
    else if (numberMatch) {
      if (!inNumberedList) {
        if (inBulletList && bulletItems.length > 0) {
          processedLines.push(`<ul style="margin:0 0 0 20px;padding:0;">${bulletItems.join('')}</ul>`);
          bulletItems = [];
          inBulletList = false;
        }
        inNumberedList = true;
      }
      numberedItems.push(`<li style="margin:0;padding:0;line-height:1.5;"><span style="font-weight:500;">${numberMatch[1]}.</span> ${numberMatch[2].trim()}</li>`);
    }
    else {
      if (inBulletList && bulletItems.length > 0) {
        processedLines.push(`<ul style="margin:0 0 0 20px;padding:0;">${bulletItems.join('')}</ul>`);
        bulletItems = [];
        inBulletList = false;
      }
      if (inNumberedList && numberedItems.length > 0) {
        processedLines.push(`<ol style="margin:0 0 0 20px;padding:0;">${numberedItems.join('')}</ol>`);
        numberedItems = [];
        inNumberedList = false;
      }
      processedLines.push(line);
    }
  }
  
  
  if (inBulletList && bulletItems.length > 0) {
    processedLines.push(`<ul style="margin:0 0 0 20px;padding:0;">${bulletItems.join('')}</ul>`);
  }
  if (inNumberedList && numberedItems.length > 0) {
    processedLines.push(`<ol style="margin:0 0 0 20px;padding:0;">${numberedItems.join('')}</ol>`);
  }
  
  html = processedLines.join('\n');
  
  
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:bold;">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em style="font-style:italic;">$1</em>');
  html = html.replace(/_(.*?)_/g, '<u style="text-decoration:underline;">$1</u>');
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color:#3b82f6;text-decoration:underline;">$1</a>');
  
  
  html = html.replace(/\n/g, '<br>');
  
  
  html = html.replace(/(<br>){3,}/g, '<br><br>');
  
  
  html = html.replace(/>\s+</g, '><');
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;line-height:1.5;color:#1a1a1a;">
  <div style="margin:0;padding:0;">
    ${html}
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('excel') as File;
    const toTemplate = formData.get('to') as string || '';
    const ccTemplate = formData.get('cc') as string || '';
    const bccTemplate = formData.get('bcc') as string || '';
    const subjectTemplate = formData.get('subject') as string || '';
    const bodyTemplate = formData.get('body') as string || '';
    const attachments = formData.getAll('attachments') as File[];
    const senderEmail = formData.get('senderEmail') as string;
    const senderPassword = formData.get('senderPassword') as string;
    
    if (!file) {
      return NextResponse.json({ message: '❌ No file uploaded' }, { status: 400 });
    }
    
    if (!senderEmail || !senderPassword) {
      return NextResponse.json({ message: '❌ Email credentials not provided' }, { status: 400 });
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);
    const columns = Object.keys(rows[0] || {});
    
    const replaceVariables = (text: string, data: any) => {
      if (!text) return '';
      let result = text;
      columns.forEach((col) => {
        const regex = new RegExp(`{{${col}}}`, 'g');
        result = result.replace(regex, data[col] || '');
      });
      return result;
    };
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: senderEmail, pass: senderPassword },
    });
    
    
    await transporter.verify();
    
    let successCount = 0;
    let failCount = 0;
    
    for (const row of rows) {
      try {
        const to = replaceVariables(toTemplate, row);
        if (!to) {
          failCount++;
          continue;
        }
        
        const cc = replaceVariables(ccTemplate, row);
        const bcc = replaceVariables(bccTemplate, row);
        const subject = replaceVariables(subjectTemplate, row);
        
        const htmlBody = markdownToHtml(bodyTemplate, columns, row);
        const plainTextBody = replaceVariables(bodyTemplate, row);
        
        const emailAttachments = await Promise.all(attachments.map(async (attachment) => ({
          filename: attachment.name,
          content: Buffer.from(await attachment.arrayBuffer())
        })));
        
        await transporter.sendMail({
          from: senderEmail,
          to,
          cc: cc || undefined,
          bcc: bcc || undefined,
          subject: subject || 'No Subject',
          html: htmlBody,
          text: plainTextBody,
          attachments: emailAttachments,
        });
        
        successCount++;
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        
      } catch (error) {
        console.error('Error sending to:', row, error);
        failCount++;
      }
    }
    
    return NextResponse.json({ 
      message: `✅ Sent ${successCount} of ${rows.length} emails${failCount > 0 ? ` (${failCount} failed)` : ''} with ${attachments.length} attachment(s)`
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      message: '❌ Failed to send emails. Check your email credentials and try again.' 
    }, { status: 500 });
  }
}