# BulkMail Sender — Personalized Email Campaigns from an Excel Sheet

A tool that turns 3 hours of copy-pasting personalized emails into about 2 minutes of automation. Upload an Excel sheet, write one email template with `{{variables}}`, preview it live, and send personalized emails to everyone in the sheet via Gmail — no database, no `.env` file, and credentials are never stored.

**Live Demo:** [bulk-mail-sender-lilac.vercel.app](https://bulk-mail-sender-lilac.vercel.app/)

**Full Technical Writeup:** [dev.to/sureshcodes](https://dev.to/sureshcodes/i-built-a-bulk-email-tool-in-one-evening-no-database-no-env-credentials-never-stored-1g2)

---

## What It Does

Upload Excel file → Parse data → Detect columns → Write a template with `{{variables}}` → Preview personalized emails → Send all via Gmail

- ✅ No database
- ✅ No `.env` file
- ✅ No stored credentials
- ✅ No authentication setup
- ✅ Works with Gmail App Passwords

---

## Tech Stack

Next.js 15, TypeScript, Nodemailer, XLSX (SheetJS), Tailwind CSS — deployed on Vercel.

---

## Why It Was Built This Way

Most bulk email tools either charge monthly fees, require complicated setup, or store your credentials somewhere. The core design principle here was simple: **if there's no stored data, there's nothing to leak.**

The flow: Enter credentials → Verify → Send emails → Request ends → Memory cleared. No database, no Redis, no log file, no `.env`, no stored credentials. The tradeoff is that credentials have to be re-entered each session — the benefit is that nothing sensitive remains after the request completes.

---

## How It Works

### 1. Login with Gmail + App Password

The user enters a Gmail address and an App Password, which is verified instantly (via Nodemailer's `transporter.verify()`) before any emails are sent — so a bad credential fails fast instead of failing mid-send.

### 2. Import an Excel file

The uploaded spreadsheet is parsed with the XLSX library, columns are auto-detected, and a preview of the first few rows is shown. Each detected column becomes an insertable variable — e.g. a `Name` column becomes `{{Name}}`.

### 3. Write the email once, with live preview

A single template (subject + body) is written using `{{variable}}` placeholders. Variables get inserted into either the "To" field or the body via a click-to-insert UI. On send, each row's data is substituted into the template — so one written email becomes N personalized ones.

---

## What Broke the First Time

The first version fired all emails as fast as Node.js could loop through them. By email #47, Gmail responded with `User rate limit exceeded`, and the remaining emails silently failed to send.

**The fix:** a 1-second delay between each send. 100 emails now take roughly 100 seconds instead of failing partway through — slower, but reliable. This is also why the tool works with Gmail App Passwords rather than a transactional email API: it trades raw throughput for zero setup and zero stored infrastructure.

---

## Lessons Learned

- Gmail's sending rate limits are real and need explicit throttling
- Simplicity is often a security feature — the fewer things stored, the less there is to leak
- Excel is still the easiest input format for non-technical users
- Small tools solving a real, recurring annoyance are often the most useful side projects

---

## Future Improvements

- Scheduled campaigns
- Retry queue for failed sends
- CSV support alongside Excel
- Email analytics
- Progress tracking during a send
- Background processing (so sends aren't tied to a single request lifecycle)

---

## Running Locally

```bash
git clone https://github.com/Suresh4405/BulkMail-Sender.git
cd BulkMail-Sender
npm install
npm run dev
```

Open `http://localhost:3000`. No environment variables or database setup required — enter a Gmail address and an [App Password](https://myaccount.google.com/apppasswords) directly in the UI (requires 2-Step Verification enabled on the Google account).

---

## Links

- **Live Demo:** [bulk-mail-sender-lilac.vercel.app](https://bulk-mail-sender-lilac.vercel.app/)
- **Full technical writeup (dev.to):** [From 3 hours of copy-pasting to 2 minutes of automation](https://dev.to/sureshcodes/i-built-a-bulk-email-tool-in-one-evening-no-database-no-env-credentials-never-stored-1g2)
- **Portfolio:** [sureshcodes.vercel.app](https://sureshcodes.vercel.app)
- **LinkedIn:** [linkedin.com/in/sureshm2002](https://www.linkedin.com/in/sureshm2002)
