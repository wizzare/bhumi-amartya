# BUILD 70 HOTFIX: RESTORE DASHBOARD-FIRST ACCESS RULE

## Root Cause
The "Premium Gate" issue on the `/dashboard` route for expired users was caused by an incorrect conditional rendering logic within `DashboardClient.tsx`. Specifically, a `trialMessage` state variable, when set, would render a button that blocked access and incorrectly implied the dashboard was gated. While `hasFeatureAccess` correctly allowed dashboard access, this UI element created a false barrier.

## Files Changed
- `components/dashboard/DashboardClient.tsx`

## Old Routing (Before Fix)
```typescript
// components/dashboard/DashboardClient.tsx

export function DashboardClient() {
  // ...existing code...
  const [trialMessage, setTrialMessage] = useState<string | null>(null);
  // ...existing code...

  useEffect(() => {
    // ...existing code...
    if (isTrialExpired(p as any)) setTrialMessage("Akses Bhumi kamu perlu diperbarui.");
    else if (daysLeft < 3) setTrialMessage(null);
    // ...existing code...
  });

  return (
    // ...existing code...
    {trialMessage && (
      <button
        onClick={() => router.push("/premium-bhumi")}
        className="w-full mt-6 p-4 bg-yellow-50/50 text-yellow-800 text-[12px] text-center rounded-2xl font-bold uppercase tracking-widest border border-yellow-100/50 active:scale-[0.98] transition-transform"
      >
        {trialMessage}
      </button>
    )}
    // ...existing code...
  );
}
```

## Fixed Routing
The `trialMessage` state, the logic to set it, and its rendering in `DashboardClient.tsx` have been removed. This ensures that the dashboard is no longer incorrectly gated by this UI element.

```typescript
// components/dashboard/DashboardClient.tsx

export function DashboardClient() {
  // ...existing code...
  const [appNow, setAppNow] = useState(() => new Date());
  // ...existing code...

  useEffect(() => {
    // ...existing code...
    // Removed: `trialMessage` setting logic
    // ...existing code...
  });

  return (
    // ...existing code...
    // Removed: `trialMessage` rendering logic
    // ...existing code...
  );
}
```

## QA Result

Test as expired/free user:

- Login → Dashboard PASS
- Open Dashboard PASS
- Open Premium Bhumi PASS
- Open Settings PASS
- Open Wellness → Lock PASS
- Open Journey → Lock PASS
- Open Profile → Lock PASS
- From lock screen:
  - Kembali ke Dashboard → Dashboard PASS
  - Lihat Premium Bhumi → Premium page PASS