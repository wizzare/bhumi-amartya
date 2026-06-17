import Image from "next/image";

type BhumiPageHeaderProps = {
  className?: string;
  inverse?: boolean;
};

export function BhumiPageHeader({ className = "", inverse = false }: BhumiPageHeaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`} aria-label="Bhumi Amartya">
      <div className={`relative h-9 w-9 shrink-0 overflow-hidden rounded-full p-1 ${inverse ? "bg-white" : "bg-white shadow-sm ring-1 ring-black/5"}`}>
        <Image src="/images/logo.png" alt="" fill sizes="36px" className="object-contain p-1" priority />
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-[0.24em] ${inverse ? "text-white/80" : "text-[#7B8776]"}`}>
        Bhumi Amartya
      </span>
    </div>
  );
}
