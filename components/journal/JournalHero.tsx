"use client";

interface JournalHeroProps {
  userName: string;
  date: string;
}

export function JournalHero({ userName, date }: JournalHeroProps) {
  return (
    <section className="mb-8 pt-8">
      <div className="max-w-2xl">
        <p className="text-[#A08963] text-sm mb-3 tracking-wide">📖 Journaling</p>
        <h1 className="text-4xl md:text-5xl text-[#4F5E52] font-light mb-2">
          A Safe Space to Hear Yourself
        </h1>
        <p className="text-[#8B9488] text-lg leading-relaxed">
          Dear {userName}, today is {date}. 
          <br />
          This is your space to feel everything.
        </p>
      </div>

      {/* Decorative line */}
      <div className="h-px bg-gradient-to-r from-[#E8E9E5] via-[#D4C5B9] to-[#E8E9E5] mt-8" />
    </section>
  );
}
