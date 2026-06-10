import Link from "next/link";

type ProfileSettingsProps = {
  fullName: string;
  language: "id" | "en";
  onFullNameChange: (fullName: string) => void;
  onSaveFullName: () => void;
  onLanguageChange: (language: "id" | "en") => void;
  isSavingFullName?: boolean;
  isSavingLanguage?: boolean;
  googleConnected: boolean;
};

export function ProfileSettings({
  fullName,
  language,
  onFullNameChange,
  onSaveFullName,
  onLanguageChange,
  isSavingFullName = false,
  isSavingLanguage = false,
  googleConnected,
}: ProfileSettingsProps) {
  return (
    <section className="bhumi-card p-6 sm:p-8">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.22em] text-[#7B8776]">
          Settings
        </p>
        <h2 className="mt-2 text-2xl text-[#4F5E52]">Preferensi ruangmu</h2>
      </div>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="profile-full-name"
            className="text-sm uppercase tracking-[0.18em] text-[#8B9488]"
          >
            Full Name
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="profile-full-name"
              type="text"
              value={fullName}
              onChange={(event) => onFullNameChange(event.target.value)}
              className="w-full rounded-2xl border border-black/5 bg-white px-4 py-3 text-[#33413A] outline-none transition focus:border-[#7D977B]"
            />
            <button
              type="button"
              onClick={onSaveFullName}
              disabled={isSavingFullName || !fullName.trim()}
              className="rounded-full bg-[#4F5E52] px-5 py-3 text-sm text-white transition hover:bg-[#3e4b42] disabled:opacity-60"
            >
              {isSavingFullName ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="profile-language"
            className="text-sm uppercase tracking-[0.18em] text-[#8B9488]"
          >
            Bahasa
          </label>
          <select
            id="profile-language"
            value={language}
            onChange={(event) => onLanguageChange(event.target.value as "id" | "en")}
            disabled={isSavingLanguage}
            className="mt-2 w-full rounded-2xl border border-black/5 bg-white px-4 py-3 text-[#33413A] outline-none transition focus:border-[#7D977B] disabled:opacity-60"
          >
            <option value="id">ID - Indonesia</option>
            <option value="en">EN - English</option>
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/setup"
            className="rounded-full bg-[#4F5E52] px-5 py-3 text-center text-sm text-white transition hover:bg-[#3e4b42]"
          >
            Edit profile
          </Link>

          <button
            type="button"
            disabled={googleConnected}
            className="rounded-full border border-[#D8D8CF] bg-white px-5 py-3 text-sm text-[#4F5E52] disabled:opacity-60"
          >
            {googleConnected ? "Google connected" : "Reconnect Google"}
          </button>
        </div>
      </div>
    </section>
  );
}
