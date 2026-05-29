'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mail,
  CheckCircle,
  AlertCircle,
  Paperclip,
  Copy,
  Bold,
  Italic,
  Underline,
  Eye,
  LogOut,
  Upload,
  X,
  Users,
  Code2,
  Link as LinkIcon,
  Menu,
  Database,
  Sparkles,
  Zap,
  AlertTriangle,
  FileSpreadsheet,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  Minus,
  FileText,
  Image,
  File,
} from 'lucide-react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPassword, setSenderPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [columns, setColumns] = useState<string[]>([]);
  const [allData, setAllData] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const [attachments, setAttachments] = useState<File[]>([]);

  const [activeField, setActiveField] = useState<string | null>(null);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showAttachmentPreview, setShowAttachmentPreview] = useState<string | null>(null);

  const toRef = useRef<HTMLInputElement>(null);
  const ccRef = useRef<HTMLInputElement>(null);
  const bccRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const saveToHistory = (newBody: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newBody);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setBody(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setBody(history[newIndex]);
    }
  };

  useEffect(() => {
    if (history.length === 0 && body) {
      setHistory([body]);
      setHistoryIndex(0);
    }
  }, [body]);

  const markdownToHtml = (text: string) => {
    if (!text) return '';
    
    let html = text;
    
    columns.forEach((col) => {
      const regex = new RegExp(`{{${col}}}`, 'g');
      const value = `{{${col}}}`; 
      html = html.replace(regex, `<span class="variable-placeholder">${value}</span>`);
    });
    
    html = html.replace(/^### (.*?)$/gm, '<h3 style="font-size: 1.17em; font-weight: bold; margin: 0.5em 0;">$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2 style="font-size: 1.5em; font-weight: bold; margin: 0.75em 0;">$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1 style="font-size: 2em; font-weight: bold; margin: 1em 0;">$1</h1>');
    
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: bold;">$1</strong>');
    
    html = html.replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>');
    
    html = html.replace(/_(.*?)_/g, '<u style="text-decoration: underline;">$1</u>');
    
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #3b82f6; text-decoration: underline;">$1</a>');
    
    html = html.replace(/^• (.*?)$/gm, '<li style="margin-left: 1.5em; margin-bottom: 0.25em;">• $1</li>');
    html = html.replace(/(<li.*?<\/li>\n?)+/g, '<ul style="margin: 0.5em 0; padding-left: 0;">$&</ul>');
    
    html = html.replace(/^(\d+)\. (.*?)$/gm, '<li style="margin-left: 1.5em; margin-bottom: 0.25em;"><span style="font-weight: 500;">$1.</span> $2</li>');
    html = html.replace(/(<li.*?<\/li>\n?)+/g, (match) => {
      if (match.includes('font-weight: 500')) {
        return `<ol style="margin: 0.5em 0; padding-left: 0;">${match}</ol>`;
      }
      return match;
    });
    
    html = html.replace(/\n/g, '<br/>');
    
    html = html.replace(/<br\/><br\/>/g, '</p><p style="margin: 0.5em 0;">');
    html = '<p style="margin: 0.5em 0;">' + html + '</p>';
    
    html = html.replace(/<p style="margin: 0.5em 0;"><br\/><\/p>/g, '');
    
    return html;
  };

  const convertToHtmlEmail = (text: string, data: any) => {
    if (!text) return '';
    
    let result = text;
    columns.forEach((col) => {
      const regex = new RegExp(`{{${col}}}`, 'g');
      const value = data[col] || '';
      result = result.replace(regex, value);
    });
    
    return markdownToHtml(result);
  };

  const handleLogin = async () => {
    if (!senderEmail || !senderPassword) {
      setLoginError('Please enter email and password');
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    const testResult = await fetch('/api/testCredentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: senderEmail,
        password: senderPassword,
      }),
    });

    if (testResult.ok) {
      setIsLoggedIn(true);
      setStatus('✅Logged in successfully!');
    } else {
      setLoginError('Invalid credentials. Use Gmail App Password.');
    }

    setLoginLoading(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSenderEmail('');
    setSenderPassword('');
    setFile(null);
    setColumns([]);
    setAllData([]);
    setPreviewData([]);
    setAttachments([]);
    setTo('');
    setCc('');
    setBcc('');
    setSubject('');
    setBody('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);

    const formData = new FormData();
    formData.append('excel', selectedFile);

    const res = await fetch('/api/readExcel', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setColumns(data.columns);
    setAllData(data.allData);
    setPreviewData(data.preview);
    setStatus(`Loaded ${data.allData.length} contacts`);

    setLoading(false);
  };

  const insertVariable = (variable: string) => {
    if (!activeField) {
      setStatus('❌ Click on any field first (To, Subject, or Body)');
      return;
    }

    const insertion = `{{${variable}}}`;

    switch (activeField) {
      case 'to':
        setTo((prev) => prev + (prev ? ' ' : '') + insertion);
        toRef.current?.focus();
        break;
      case 'cc':
        setCc((prev) => prev + (prev ? ' ' : '') + insertion);
        ccRef.current?.focus();
        break;
      case 'bcc':
        setBcc((prev) => prev + (prev ? ' ' : '') + insertion);
        bccRef.current?.focus();
        break;
      case 'subject':
        setSubject((prev) => prev + (prev ? ' ' : '') + insertion);
        subjectRef.current?.focus();
        break;
      case 'body':
        const textarea = bodyRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newText = body.substring(0, start) + insertion + ' ' + body.substring(end);
          setBody(newText);
          saveToHistory(newText);
          setTimeout(() => textarea.focus(), 0);
        }
        break;
    }
  };

  const formatText = (type: string) => {
    const textarea = bodyRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = body.substring(start, end);
    const beforeText = body.substring(0, start);
    const afterText = body.substring(end);

    let formattedText = '';
    let newBody = '';

    switch (type) {
      case 'bold':
        formattedText = selectedText ? `**${selectedText}**` : '****';
        newBody = beforeText + formattedText + afterText;
        break;
      case 'italic':
        formattedText = selectedText ? `*${selectedText}*` : '**';
        newBody = beforeText + formattedText + afterText;
        break;
      case 'underline':
        formattedText = selectedText ? `_${selectedText}_` : '__';
        newBody = beforeText + formattedText + afterText;
        break;
      case 'link':
        const url = prompt('Enter URL:', 'https://');
        if (url) {
          formattedText = selectedText ? `[${selectedText}](${url})` : `[link](${url})`;
          newBody = beforeText + formattedText + afterText;
        } else {
          return;
        }
        break;
      case 'bullet':
        const beforeLine = beforeText.substring(0, beforeText.lastIndexOf('\n') + 1);
        const currentLineContent = selectedText || 'item';
        formattedText = `• ${currentLineContent}`;
        newBody = beforeLine + formattedText + afterText;
        break;
      case 'number':
        const numBeforeLine = beforeText.substring(0, beforeText.lastIndexOf('\n') + 1);
        const numCurrentContent = selectedText || 'item';
        const numberedItems = (beforeText.match(/\n\d+\. /g) || []).length;
        const nextNumber = numberedItems + 1;
        formattedText = `${nextNumber}. ${numCurrentContent}`;
        newBody = numBeforeLine + formattedText + afterText;
        break;
      case 'heading':
        formattedText = selectedText ? `## ${selectedText}` : '## ';
        newBody = beforeText + formattedText + afterText;
        break;
      default:
        return;
    }

    setBody(newBody);
    saveToHistory(newBody);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + formattedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          formatText('bold');
          break;
        case 'i':
          e.preventDefault();
          formatText('italic');
          break;
        case 'u':
          e.preventDefault();
          formatText('underline');
          break;
        case 'z':
          e.preventDefault();
          handleUndo();
          break;
        case 'y':
          e.preventDefault();
          handleRedo();
          break;
      }
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="w-4 h-4 text-red-500" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return <Image className="w-4 h-4 text-blue-500" />;
    if (['doc', 'docx'].includes(ext || '')) return <FileText className="w-4 h-4 text-blue-600" />;
    return <File className="w-4 h-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const markdownToHtmlPreview = (text: string) => {
    if (!text) return '';
    
    let html = text;
    
    columns.forEach((col) => {
      const regex = new RegExp(`{{${col}}}`, 'g');
      const value = `{{${col}}}`;
      html = html.replace(regex, `<span class="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-mono text-xs font-semibold">${value}</span>`);
    });
    
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
    
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    
    html = html.replace(/_(.*?)_/g, '<u class="underline">$1</u>');
    
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank">$1</a>');
    
    html = html.replace(/^• (.*?)$/gm, '<li class="flex items-start gap-2 mb-1"><span class="text-purple-500">•</span><span>$1</span></li>');
    html = html.replace(/(<li.*?<\/li>\n?)+/g, '<ul class="list-none space-y-1 my-2">$&</ul>');
    
    html = html.replace(/^(\d+)\. (.*?)$/gm, '<li class="flex items-start gap-2 mb-1"><span class="text-blue-500 font-semibold min-w-[20px]">$1.</span><span>$2</span></li>');
    html = html.replace(/(<li.*?<\/li>\n?)+/g, (match) => {
      if (match.includes('text-blue-500')) {
        return `<ol class="list-none space-y-1 my-2">${match}</ol>`;
      }
      return match;
    });
    
    html = html.replace(/^## (.*?)$/gm, '<h3 class="text-lg font-bold mt-3 mb-2">$1</h3>');
    
    html = html.replace(/\n/g, '<br/>');
    
    return html;
  };

  const getLivePreview = () => {
    if (previewData.length === 0) return null;
    const firstRow = previewData[0];
    
    let toText = to;
    let ccText = cc;
    let bccText = bcc;
    let subjectText = subject;
    let bodyText = body;
    
    columns.forEach((col) => {
      const regex = new RegExp(`{{${col}}}`, 'g');
      const value = firstRow[col] || '';
      toText = toText.replace(regex, value);
      ccText = ccText.replace(regex, value);
      bccText = bccText.replace(regex, value);
      subjectText = subjectText.replace(regex, value);
      bodyText = bodyText.replace(regex, value);
    });
    
    return {
      to: toText,
      cc: ccText,
      bcc: bccText,
      subject: subjectText,
      body: markdownToHtmlPreview(bodyText),
    };
  };

  const preview = getLivePreview();

  const sendEmails = async () => {
    if (!file) {
      setStatus('❌ Please upload contacts');
      return;
    }

    if (!to.trim()) {
      setStatus('❌ Add recipient');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('excel', file);
    formData.append('to', to);
    formData.append('cc', cc);
    formData.append('bcc', bcc);
    formData.append('subject', subject);
    formData.append('body', body);
    formData.append('senderEmail', senderEmail);
    formData.append('senderPassword', senderPassword);

    attachments.forEach((attachment) => {
      formData.append('attachments', attachment);
    });

    const res = await fetch('/api/sendEmails', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setStatus(data.message);
    setLoading(false);
  };

  // LOGIN SCREEN
if (!isLoggedIn) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto shadow-xl mb-4">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">BulkSend</h1>
          <p className="text-gray-300 mt-2">Send personalized emails easily</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-sm text-gray-300 font-medium">Email Address</label>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="your-email@gmail.com"
              className="w-full mt-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1">Your Gmail address</p>
          </div>

          <div>
            <label className="text-sm text-gray-300 font-medium">App Password</label>
            <input
              type="password"
              value={senderPassword}
              onChange={(e) => setSenderPassword(e.target.value)}
              placeholder="xxxx xxxx xxxx xxxx"
              className="w-full mt-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400"
            />
            
            {/* STEP BY STEP INSTRUCTIONS */}
            <div className="mt-3 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold mt-0.5">i</div>
                <div className="flex-1">
                  <p className="text-blue-300 text-sm font-semibold mb-2">What is an App Password?</p>
                  <p className="text-gray-300 text-xs mb-3">
                    Gmail requires an <strong className="text-blue-300">App Password</strong> instead of your regular password for security. 
                    It's a 16-character code generated specifically for this app.
                  </p>
                  
                  <button 
                    onClick={() => {
                      const steps = document.getElementById('app-password-steps');
                      if (steps) steps.classList.toggle('hidden');
                    }}
                    className="text-blue-400 hover:text-blue-300 text-xs font-medium flex items-center gap-1 mb-2"
                  >
                    📋 Show me how to get it ↓
                  </button>
                  
                  <div id="app-password-steps" className="hidden space-y-3 text-xs">
                    <div className="border-t border-blue-500/20 pt-3">
                      <p className="text-white font-semibold mb-2">Step-by-Step Guide:</p>
                      <ol className="space-y-3 text-gray-300">
                        <li className="flex gap-2">
                          <span className="text-blue-400 font-bold">1.</span>
                          <span>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" className="text-blue-400 hover:underline break-all">myaccount.google.com/apppasswords</a></span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-blue-400 font-bold">2.</span>
                          <span>Sign in to your Google Account</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-blue-400 font-bold">3.</span>
                          <span>At the bottom, click <strong>"Select app"</strong> → Choose <strong>"Mail"</strong></span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-blue-400 font-bold">4.</span>
                          <span>Click <strong>"Select device"</strong> → Choose <strong>"Other"</strong> → Name it <strong>"BulkSend or anything you want"</strong></span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-blue-400 font-bold">5.</span>
                          <span>Click <strong>"Generate"</strong></span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-blue-400 font-bold">6.</span>
                          <span>Copy the <strong className="text-yellow-300">16-character password</strong> (shown in yellow box)</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-blue-400 font-bold">7.</span>
                          <span>Paste it here and click <strong>"Connect Email"</strong></span>
                        </li>
                      </ol>
                      
                      <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-yellow-300 text-xs">
                          ⚠️ <strong>Important:</strong> Copy the password immediately. You won't see it again!
                        </p>
                      </div>
                      
                      <div className="mt-3 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-green-300 text-xs">
                          💡 <strong>2FA Required:</strong> You need <strong>2-Step Verification</strong> enabled on your Google Account to use App Passwords.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loginError && (
            <div className="bg-red-500/20 text-red-200 p-3 rounded-xl text-sm border border-red-500/30">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  {loginError}
                  {loginError.includes('Invalid credentials') && (
                    <div className="mt-2 text-xs text-red-300">
                      Make sure you're using an <strong>App Password</strong>, not your regular Gmail password.
                      <br/>
                      <a href="https://myaccount.google.com/apppasswords" target="_blank" className="underline mt-1 inline-block">
                        → Generate App Password
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loginLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:scale-[1.01] transition disabled:opacity-50 disabled:hover:scale-100"
          >
            {loginLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connecting...
              </div>
            ) : (
              'Connect Email →'
            )}
          </button>
          
          <div className="text-center text-xs text-gray-400 pt-2">
            Your credentials are used only for sending emails and are never stored
          </div>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Bulkmail Sender
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">Email Campaign Manager</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="cursor-pointer">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow hover:scale-[1.02] transition">
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden sm:block text-sm font-medium">Import Excel</span>
              </div>
              <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="hidden" />
            </label>

            {file && (
              <div className="hidden md:flex bg-green-50 border border-green-200 rounded-xl px-3 py-2 items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-xs font-semibold text-green-700">{allData.length} Contacts</p>
                  <p className="text-[10px] text-green-600 max-w-[120px] truncate">{file.name}</p>
                </div>
              </div>
            )}

            <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-xl transition">
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className={`lg:col-span-3 ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="space-y-5 sticky top-24">
              {columns.length > 0 && (
                <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
                  <div className="p-5 border-b bg-gradient-to-r from-violet-50 to-fuchsia-50">
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-600" />
                      Variables
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Click to insert into active field</p>
                  </div>
                  <div className="p-4 flex flex-wrap gap-2 max-h-[300px] overflow-y-auto">
                    {columns.map((col) => (
                      <button
                        key={col}
                        onClick={() => insertVariable(col)}
                        className="px-3 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-700 hover:from-violet-500 hover:to-fuchsia-500 hover:text-white transition-all shadow-sm"
                      >
                        {`📊 ${col}`}
                      </button>
                    ))}
                  </div>
                  <div className="p-3 bg-gray-50 border-t text-xs text-gray-500">
                    💡 Click and use this variable where you want
                  </div>
                </div>
              )}

              {previewData.length > 0 && (
                <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
                  <div className="p-5 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                          <Database className="w-4 h-4 text-blue-600" />
                          Data Preview
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Scroll to view all contacts</p>
                      </div>
                      <div className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-semibold">
                        {allData.length}
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-white z-10">
                        <tr className="border-b">
                          <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">#</th>
                          {columns.map((col) => (
                            <th key={col} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {allData.map((row, idx) => (
                          <tr key={idx} className="border-b hover:bg-blue-50 transition">
                            <td className="px-4 py-3 whitespace-nowrap text-gray-400 text-xs">{idx + 1}</td>
                            {columns.map((col) => (
                              <td key={col} className="px-4 py-3 whitespace-nowrap text-gray-700">
                                {row[col]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-9">
            <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
              {activeField && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 text-xs text-blue-700 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    Inserting into: <span className="font-semibold uppercase">{activeField}</span> field
                  </div>
                  <button onClick={() => setActiveField(null)} className="text-blue-400 hover:text-blue-600">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

            
              <div className="border-b hover:bg-gray-50">
                <div className="p-4 flex gap-3">
                  <label className="w-12 text-sm font-semibold text-gray-600">To *</label>
                  <input
                    ref={toRef}
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    onFocus={() => setActiveField('to')}
                    placeholder="email"
                    className="flex-1 outline-none bg-transparent text-sm"
                  />
                </div>
              </div>

              
              <div className="px-4 py-2 border-b bg-gray-50 flex gap-4 text-xs">
                <button onClick={() => setShowCc(!showCc)} className="text-blue-600 font-medium hover:underline">
                  {showCc ? '−' : '+'} CC
                </button>
                <button onClick={() => setShowBcc(!showBcc)} className="text-blue-600 font-medium hover:underline">
                  {showBcc ? '−' : '+'} BCC
                </button>
              </div>

              {showCc && (
                <div className="border-b p-4">
                  <input
                    ref={ccRef}
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    onFocus={() => setActiveField('cc')}
                    placeholder="CC recipients"
                    className="w-full outline-none text-sm"
                  />
                </div>
              )}

              {showBcc && (
                <div className="border-b p-4">
                  <input
                    ref={bccRef}
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    onFocus={() => setActiveField('bcc')}
                    placeholder="BCC recipients"
                    className="w-full outline-none text-sm"
                  />
                </div>
              )}

              <div className="border-b p-4">
                <input
                  ref={subjectRef}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  onFocus={() => setActiveField('subject')}
                  placeholder="Subject line"
                  className="w-full outline-none font-medium text-sm"
                />
              </div>

             
              <div className="border-b p-3 bg-gray-50 flex items-center gap-2 flex-wrap">
                <button onClick={handleUndo} className="p-1.5 hover:bg-white rounded transition" title="Undo (Ctrl+Z)">
                  <Undo2 className="w-4 h-4 text-gray-600" />
                </button>
                <button onClick={handleRedo} className="p-1.5 hover:bg-white rounded transition" title="Redo (Ctrl+Y)">
                  <Redo2 className="w-4 h-4 text-gray-600" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button onClick={() => formatText('bold')} className="p-1.5 hover:bg-white rounded transition" title="Bold (Ctrl+B) → **text**">
                  <Bold className="w-4 h-4 text-gray-600" />
                </button>
                <button onClick={() => formatText('italic')} className="p-1.5 hover:bg-white rounded transition" title="Italic (Ctrl+I) → *text*">
                  <Italic className="w-4 h-4 text-gray-600" />
                </button>
                <button onClick={() => formatText('underline')} className="p-1.5 hover:bg-white rounded transition" title="Underline (Ctrl+U) → _text_">
                  <Underline className="w-4 h-4 text-gray-600" />
                </button>
                <button onClick={() => formatText('link')} className="p-1.5 hover:bg-white rounded transition" title="Insert Link → [text](url)">
                  <LinkIcon className="w-4 h-4 text-gray-600" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button onClick={() => formatText('bullet')} className="p-1.5 hover:bg-white rounded transition" title="Bullet List → • item">
                  <List className="w-4 h-4 text-gray-600" />
                </button>
                <button onClick={() => formatText('number')} className="p-1.5 hover:bg-white rounded transition" title="Numbered List → 1. item">
                  <ListOrdered className="w-4 h-4 text-gray-600" />
                </button>
                <button onClick={() => formatText('heading')} className="p-1.5 hover:bg-white rounded transition" title="Heading → ## Heading">
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
              
              </div>

              
              <div onFocus={() => setActiveField('body')}>
                <textarea
                  ref={bodyRef}
                  value={body}
                  onChange={(e) => {
                    setBody(e.target.value);
                    saveToHistory(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  rows={14}
                  className="w-full p-5 outline-none resize-none text-sm font-mono"
                  placeholder={`Body content`}
                />
              </div>

              
              <div className="border-t bg-gray-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Attachments ({attachments.length})
                  </label>
                  <label className="cursor-pointer bg-white px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 border hover:bg-blue-50 transition">
                    + Add Files
                    <input
                      type="file"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          setAttachments([...attachments, ...Array.from(e.target.files)]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                
                {attachments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="bg-white border rounded-xl p-3 flex items-center justify-between group hover:shadow-md transition">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getFileIcon(file.name)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                            <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setShowAttachmentPreview(URL.createObjectURL(file))}
                            className="p-1 text-gray-400 hover:text-blue-600 transition"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                            className="p-1 text-gray-400 hover:text-red-600 transition"
                            title="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-xl">
                    <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No attachments yet</p>
                    <p className="text-xs text-gray-400">Click "Add Files" to attach PDFs, images, or documents</p>
                  </div>
                )}
              </div>

              
              {showAttachmentPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAttachmentPreview(null)}>
                  <div className="bg-white rounded-2xl max-w-2xl max-h-[80vh] overflow-auto p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">File Preview</h3>
                      <button onClick={() => setShowAttachmentPreview(null)} className="p-1 hover:bg-gray-100 rounded">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    {showAttachmentPreview.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img src={showAttachmentPreview} alt="Preview" className="max-w-full h-auto rounded" />
                    ) : (
                      <iframe src={showAttachmentPreview} className="w-full h-96 rounded" title="Preview" />
                    )}
                  </div>
                </div>
              )}

             
              {preview && previewMode && (
                <div className="border-t bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    Live Preview (First Recipient)
                  </h3>
                  <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-3">
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700">To:</span>
                      <div className="mt-1 text-gray-800 break-all">{preview.to || '—'}</div>
                    </div>
                    {preview.cc && (
                      <div className="text-sm">
                        <span className="font-semibold text-gray-700">CC:</span>
                        <div className="mt-1 text-gray-800 break-all">{preview.cc}</div>
                      </div>
                    )}
                    {preview.bcc && (
                      <div className="text-sm">
                        <span className="font-semibold text-gray-700">BCC:</span>
                        <div className="mt-1 text-gray-800 break-all">{preview.bcc}</div>
                      </div>
                    )}
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700">Subject:</span>
                      <div className="mt-1 text-gray-800 font-medium">{preview.subject || '—'}</div>
                    </div>
                    <div className="pt-3 border-t">
                      <div 
                        className="text-sm prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: preview.body }}
                      />
                    </div>
                  </div>
                </div>
              )}

              
              <div className="p-5 border-t bg-gradient-to-r from-gray-50 to-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {file ? (
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {allData.length} Recipients Ready
                    </div>
                  ) : (
                    <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Upload contacts to begin
                    </div>
                  )}
                  {attachments.length > 0 && (
                    <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      {attachments.length} Attachment(s)
                    </div>
                  )}
                </div>
                <button
                  onClick={sendEmails}
                  disabled={loading || !file}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-semibold hover:scale-[1.01] transition shadow-lg disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Send Campaign
                    </div>
                  )}
                </button>
              </div>
            </div>

           
            {status && (
              <div className={`mt-4 p-4 rounded-2xl border text-sm flex items-start gap-2 ${
                status.includes('✅') ? 'bg-green-50 border-green-200 text-green-700' : 
                status.includes('❌') ? 'bg-red-50 border-red-200 text-red-700' : 
                'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                {status.includes('✅') ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> :
                 status.includes('❌') ? <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> :
                 <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                <span>{status}</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}