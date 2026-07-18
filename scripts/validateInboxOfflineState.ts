type State = 'loading' | 'empty' | 'ready' | 'offline' | 'error';
export function classifyInboxState(input: { loading: boolean; online: boolean; hasMessages: boolean; error?: 'network' | 'permission' }) : State {
  if (input.loading) return 'loading';
  if (!input.online || input.error === 'network') return 'offline';
  if (input.error === 'permission') return 'error';
  return input.hasMessages ? 'ready' : 'empty';
}
export function sendResult(input: { online: boolean; failed: boolean }) { return input.online && !input.failed ? 'success' : 'error'; }
if (classifyInboxState({ loading: false, online: false, hasMessages: false }) !== 'offline' || classifyInboxState({ loading: false, online: true, hasMessages: false }) !== 'empty' || classifyInboxState({ loading: false, online: true, hasMessages: false, error: 'permission' }) !== 'error' || sendResult({ online: true, failed: true }) === 'success') throw new Error('INBOX_OFFLINE_VALIDATION_FAIL');
console.log('INBOX_OFFLINE_VALIDATION_PASS');
