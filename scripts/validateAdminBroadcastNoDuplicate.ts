let sent = false;
function sendOnce() { if (sent) return false; sent = true; return true; }
if (!sendOnce() || sendOnce()) throw new Error('ADMIN_BROADCAST_DUPLICATE_FAIL');
console.log('ADMIN_BROADCAST_NO_DUPLICATE_PASS');
