const ids = new Set<string>();
const id = 'birthday:u:2026'; ids.add(id); ids.add(id);
if (ids.size !== 1) throw new Error('BIRTHDAY_DUPLICATE_FAIL');
console.log('BIRTHDAY_NO_DUPLICATE_PASS');
export {};
