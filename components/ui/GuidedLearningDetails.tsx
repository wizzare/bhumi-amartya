import { ExternalLink, Search, Video } from "lucide-react";

type GuidedLearningDetailsProps = {
  title: string;
  description: string;
  benefits: string[];
  steps: string[];
  duration: string;
  beginnerFriendly?: boolean;
  googleSearchPhrase: string;
  youtubeSearchPhrase: string;
  accentClass?: string;
};

const googleUrl = (phrase: string) =>
  `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(phrase)}`;

const youtubeUrl = (phrase: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(phrase)}`;

export function GuidedLearningDetails({
  title,
  description,
  benefits,
  steps,
  duration,
  beginnerFriendly = true,
  googleSearchPhrase,
  youtubeSearchPhrase,
  accentClass = "bg-[#F5F1E8] text-[#4F5E52]",
}: GuidedLearningDetailsProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#9AA394]">Apa Ini?</p>
        <p className="mt-2 text-sm leading-relaxed text-[#7B8776]">{description}</p>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#9AA394]">Manfaat</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {benefits.map((benefit) => (
            <span key={benefit} className={`rounded-lg px-2 py-1 text-[10px] font-semibold ${accentClass}`}>
              {benefit}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#9AA394]">Cara Melakukan</p>
        <ol className="mt-2 space-y-2">
          {steps.map((step, index) => (
            <li key={`${title}-${index}`} className="flex gap-3 text-sm text-[#4F5E52]">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F5F1E8] text-[10px] text-[#9AA394]">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#FCFAF5] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#9AA394]">Durasi</p>
          <p className="mt-1 text-sm font-semibold text-[#4F5E52]">{duration}</p>
        </div>
        <div className="rounded-2xl bg-[#FCFAF5] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#9AA394]">Untuk Pemula</p>
          <p className="mt-1 text-sm font-semibold text-[#4F5E52]">
            {beginnerFriendly ? "Ya. Mulai perlahan dan berhenti jika terasa tidak nyaman." : "Perlu pengalaman atau pendampingan."}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E8E9E5] bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[#9AA394]">Sumber Belajar Visual</p>
        <div className="mt-3 space-y-3 text-sm">
          <a
            href={googleUrl(googleSearchPhrase)}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="flex items-start gap-3 rounded-xl bg-[#FCFAF5] p-3 text-[#4F5E52] transition hover:bg-[#F5F1E8]"
          >
            <Search size={16} className="mt-0.5 shrink-0" />
            <span className="flex-1">
              <strong>Google:</strong> {googleSearchPhrase}
            </span>
            <ExternalLink size={14} className="mt-0.5 shrink-0" />
          </a>
          <a
            href={youtubeUrl(youtubeSearchPhrase)}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="flex items-start gap-3 rounded-xl bg-[#FCFAF5] p-3 text-[#4F5E52] transition hover:bg-[#F5F1E8]"
          >
            <Video size={16} className="mt-0.5 shrink-0" />
            <span className="flex-1">
              <strong>YouTube:</strong> {youtubeSearchPhrase}
            </span>
            <ExternalLink size={14} className="mt-0.5 shrink-0" />
          </a>
        </div>
      </div>
    </div>
  );
}
