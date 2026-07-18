import fs from 'node:fs';
const source = fs.readFileSync('app/admin/activity/page.tsx', 'utf8');
if (!source.includes('<Panel title="User Table"') || !source.includes('onClick={() => setSelectedUser(user)}') || !source.includes('Kirim Pesan Personal')) throw new Error('ADMIN_PERSONAL_MESSAGE_UI_FAIL');
if (!source.includes('targetUid: selectedUser.uid')) throw new Error('ADMIN_PERSONAL_RECIPIENT_FAIL');
console.log('ADMIN_USER_TABLE_PERSONAL_MESSAGE_PASS');
