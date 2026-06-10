"use client";

interface DailyInnerworkProps {
  tasks: string[];
}

export function DailyInnerwork({ tasks }: DailyInnerworkProps) {
  return (
    <div className="mt-6 bhumi-card p-6">
      <p className="text-[#7B8776]">🌱 Daily Innerwork</p>

      <div className="mt-5 flex flex-col gap-3">
        {tasks.map((task, index) => (
          <div
            key={index}
            className="bg-[#FCFAF5] rounded-2xl px-4 py-4 text-[#4F5E52] font-medium cursor-pointer hover:bg-[#F0EBE3] transition"
          >
            {task}
          </div>
        ))}
      </div>
    </div>
  );
}
