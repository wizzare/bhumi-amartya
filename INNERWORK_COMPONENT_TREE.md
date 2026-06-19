# INNERWORK COMPONENT TREE (Current Runtime)

Path: `app/innerwork/page.tsx`

```text
<ProtectedRoute>
  <main>
    <AppNav />
    <div (mx-auto max-w-lg)>
      <BhumiPageHeader />
      <header>
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>

      {recommendations && (
        <section>
          <h2>Rekomendasi Berdasarkan Kondisimu</h2>
          <div (grid-cols-2)>
            <Link (Journaling Card)>
            <Link (Meditation Card)>
            <Link (Manifestation Card)>
            <Link (Workout Card)>
            <Link (Yoga Card)>
            <Link (Audio Card)>
            <Link (Herbal Card)>
          </div>
        </section>
      )}

      {!hasCompletedDailyScan && (
        <div (Incomplete Scan Prompt)>
      )}

      <div (grid-cols-2)>
        {menuItems.map(Item => (
          <Link (Category Menu Item)>
        ))}
      </div>
    </div>
  </main>
</ProtectedRoute>
```
