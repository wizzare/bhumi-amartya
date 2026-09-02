export type JournalEntryPrivacy = {
  locked: boolean;
  hiddenFromHistory: boolean;
  localOnly: boolean;
  excludeFromMemory: boolean;
};

export const DEFAULT_JOURNAL_ENTRY_PRIVACY: JournalEntryPrivacy = {
  locked: false,
  hiddenFromHistory: false,
  localOnly: false,
  excludeFromMemory: false,
};

export function normalizeJournalEntryPrivacy(value?: Partial<JournalEntryPrivacy> | null): JournalEntryPrivacy {
  return {
    locked: value?.locked === true,
    hiddenFromHistory: value?.hiddenFromHistory === true,
    localOnly: value?.localOnly === true,
    excludeFromMemory: value?.excludeFromMemory === true,
  };
}

export function canSyncJournalEntry(value?: Partial<JournalEntryPrivacy> | null): boolean {
  return !normalizeJournalEntryPrivacy(value).localOnly;
}

export function canExtractJournalMemory(value?: Partial<JournalEntryPrivacy> | null): boolean {
  const privacy = normalizeJournalEntryPrivacy(value);
  return !privacy.localOnly && !privacy.excludeFromMemory;
}

export function isVisibleInJournalHistory(value?: Partial<JournalEntryPrivacy> | null): boolean {
  return !normalizeJournalEntryPrivacy(value).hiddenFromHistory;
}

export function requiresJournalUnlock(value?: Partial<JournalEntryPrivacy> | null): boolean {
  return normalizeJournalEntryPrivacy(value).locked;
}
