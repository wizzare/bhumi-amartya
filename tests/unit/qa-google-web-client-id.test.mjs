import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

let assertions = 0;
const check = (value, message) => {
  assert.ok(value, message);
  assertions++;
};
const reject = (fn, pattern) => {
  assert.throws(fn, pattern);
  assertions++;
};

const helperSource = fs.readFileSync('lib/auth/googleWebClientId.ts', 'utf8');
const helperJs = ts.transpileModule(helperSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const helper = {};
vm.runInNewContext(helperJs, { exports: helper, module: { exports: helper } });

const productionClientId = helper.PRODUCTION_GOOGLE_WEB_CLIENT_ID;
const resolve = helper.resolveGoogleWebClientId;
const qaClientId = '125330899891-qawebclient123.apps.googleusercontent.com';
const qaEnv = {
  NEXT_PUBLIC_QA_MODE: 'realQA',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'bhumi-amartya-qa',
  NEXT_PUBLIC_QA_GOOGLE_WEB_CLIENT_ID: qaClientId,
};

check(productionClientId === '59259824153-vldlev9s91l6sss3ulqbh8mnaah4n4c9.apps.googleusercontent.com');
check(helper.QA_GOOGLE_WEB_CLIENT_ID_ENV === 'NEXT_PUBLIC_QA_GOOGLE_WEB_CLIENT_ID');
check(resolve({}) === productionClientId);
check(resolve({ NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'bhumiamartya-fe85c' }) === productionClientId);

reject(() => resolve({ NEXT_PUBLIC_QA_MODE: '' }), /QA_GOOGLE_AUTH_MODE_BLOCKED/);
reject(() => resolve({ NEXT_PUBLIC_QA_MODE: 'emulator' }), /QA_GOOGLE_AUTH_MODE_BLOCKED/);
reject(() => resolve({ NEXT_PUBLIC_QA_MODE: 'false' }), /QA_GOOGLE_AUTH_MODE_BLOCKED/);
reject(() => resolve({ NEXT_PUBLIC_QA_MODE: 'realQA' }), /QA_GOOGLE_AUTH_PROJECT_MISMATCH/);
reject(() => resolve({ NEXT_PUBLIC_QA_MODE: 'realQA', NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'bhumiamartya-fe85c' }), /QA_GOOGLE_AUTH_PROJECT_MISMATCH/);
reject(() => resolve({ NEXT_PUBLIC_QA_MODE: 'realQA', NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'bhumi-amartya-qa' }), /QA_GOOGLE_WEB_CLIENT_ID_MISSING/);
reject(() => resolve({ ...qaEnv, NEXT_PUBLIC_QA_GOOGLE_WEB_CLIENT_ID: productionClientId }), /QA_GOOGLE_WEB_CLIENT_ID_PRODUCTION_FORBIDDEN/);
reject(() => resolve({ ...qaEnv, NEXT_PUBLIC_QA_GOOGLE_WEB_CLIENT_ID: '59259824153-other.apps.googleusercontent.com' }), /QA_GOOGLE_WEB_CLIENT_ID_PROJECT_MISMATCH/);
reject(() => resolve({ ...qaEnv, NEXT_PUBLIC_QA_GOOGLE_WEB_CLIENT_ID: '125330899891-other' }), /QA_GOOGLE_WEB_CLIENT_ID_PROJECT_MISMATCH/);
reject(() => resolve({ NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'bhumi-amartya-qa' }), /QA_GOOGLE_AUTH_MODE_BLOCKED/);
reject(() => resolve({ NEXT_PUBLIC_QA_GOOGLE_WEB_CLIENT_ID: qaClientId }), /QA_GOOGLE_AUTH_MODE_BLOCKED/);

check(resolve(qaEnv) === qaClientId);
check(resolve({ ...qaEnv, NEXT_PUBLIC_QA_GOOGLE_WEB_CLIENT_ID: ` ${qaClientId} ` }) === qaClientId);

const authSource = fs.readFileSync('lib/auth/authActions.ts', 'utf8');
check(!authSource.includes(productionClientId));
check(authSource.includes('resolveGoogleWebClientId'));
check(authSource.includes('NEXT_PUBLIC_QA_GOOGLE_WEB_CLIENT_ID'));
check(authSource.indexOf('assertQaOperationAllowed()') < authSource.indexOf('resolveGoogleWebClientId({'));

console.log(`qa-google-web-client-id: ${assertions} assertions PASS`);
