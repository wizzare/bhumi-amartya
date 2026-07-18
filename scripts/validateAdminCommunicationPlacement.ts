import fs from 'node:fs';

const page = fs.readFileSync('app/admin/activity/page.tsx', 'utf8');
const workspace = fs.readFileSync('components/admin/AdminInboxWorkspace.tsx', 'utf8');
const userTable = page.indexOf('<Panel title="User Table"');
const communication = page.indexOf('<AdminInboxWorkspace />');
if (userTable < 0 || communication < 0 || communication < userTable) throw new Error('ADMIN_COMMUNICATION_PLACEMENT_FAIL');
if ((page.match(/<AdminInboxWorkspace\s*\/>/g) || []).length !== 1) throw new Error('ADMIN_COMMUNICATION_DUPLICATE_FAIL');
for (const required of ['Komunikasi &amp; Inbox', 'pesan belum dibaca', 'Belum dibaca', 'Balas', 'Muat ulang']) if (!workspace.includes(required)) throw new Error(`ADMIN_COMMUNICATION_CONTENT_FAIL:${required}`);
if (!workspace.includes('guardianRole === "founder"') || !workspace.includes('guardianRole === "admin"') || !workspace.includes('role === "admin"')) throw new Error('ADMIN_COMMUNICATION_ROLE_FAIL');
if (!workspace.includes('Broadcast') || !workspace.includes('sendBroadcast')) throw new Error('ADMIN_COMMUNICATION_BROADCAST_MISSING');
if (/type="file"|attachments/i.test(workspace)) throw new Error('ADMIN_COMMUNICATION_ATTACHMENT_UI_FAIL');
console.log('ADMIN_COMMUNICATION_PLACEMENT_PASS');
