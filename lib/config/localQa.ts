/** A build-time development switch, never a persisted preference or auth bypass. */
export function isBuild110LocalQa(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.BHUMI_LOCAL_QA === '1';
}
