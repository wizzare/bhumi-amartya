/* eslint-disable @next/next/no-img-element */

type ProfileHeaderProps = {
  displayName: string;
  email: string;
  photoURL: string | null;
  language: "id" | "en";
  onLogout: () => void;
  isLoggingOut?: boolean;
};

export function ProfileHeader({
  displayName,
  email,
  photoURL,
  language,
  onLogout,
  isLoggingOut = false,
}: ProfileHeaderProps) {
  return (
    <section className="bhumi-card overflow-hidden p-6 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-white shadow-md">
            <img
              src={photoURL || "/images/logo.png"}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-[#7B8776]">
              Ruang profil
            </p>
            <h1 className="mt-2 text-3xl text-[#4F5E52] sm:text-4xl">
              Halo, {displayName}
            </h1>
            <p className="mt-1 break-all text-sm text-[#7B8776] sm:text-base">
              {email}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <span className="w-fit rounded-full border border-black/5 bg-white px-4 py-2 text-sm text-[#4F5E52]">
            Bahasa: {language.toUpperCase()}
          </span>
          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="rounded-full border border-[#D8D8CF] bg-white px-5 py-3 text-sm text-[#4F5E52] transition hover:border-[#4F5E52] disabled:opacity-60"
          >
            {isLoggingOut ? "Keluar..." : "Logout"}
          </button>
        </div>
      </div>
    </section>
  );
}
