// Local QA infrastructure only. Never imported by product code.
import net from 'node:net';
import { syncBuiltinESMExports } from 'node:module';
if (process.env.NODE_ENV === 'production' || process.env.BHUMI_LOCAL_QA !== '1') {
  throw new Error('BUILD110_LOCAL_QA_DISABLED');
}
const connect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function (...args) {
  const first = Array.isArray(args[0]) ? args[0][0] : args[0];
  const opts = typeof first === 'object' && first !== null ? first :
    typeof first === 'string' && !/^\d+$/.test(first) ? { path: first } :
      { port: first, host: typeof args[1] === 'string' ? args[1] : 'localhost' };
  if (!opts.path && !['127.0.0.1', 'localhost', '::1', undefined].includes(opts.host)) {
    throw new Error('BUILD110_LOCAL_QA_EXTERNAL_NETWORK_BLOCKED');
  }
  return Reflect.apply(connect, this, args);
};
syncBuiltinESMExports();
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) {
    throw new Error('BUILD110_LOCAL_QA_EXTERNAL_NETWORK_BLOCKED');
  }
  return originalFetch(input, { ...init, redirect: 'error' });
};
