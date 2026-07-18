import fs from 'node:fs';

const rules = fs.readFileSync('firestore.rules', 'utf8');
const required = [
  'match /communications/{messageId}',
  'validSupportCreate',
  'validUserReply',
  'validAdminReply',
  'allow delete: if false',
  "!document.matches('communications/.*')",
];
if (required.some((fragment) => !rules.includes(fragment))) throw new Error('FIRESTORE_COMMUNICATION_RULE_CONTRACT_FAIL');
console.log('FIRESTORE_COMMUNICATION_RULE_CONTRACT_PASS');
