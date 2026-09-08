interface StatCardProps {
  title: string;
  value: string;
  color: string;
  icon: React.ReactNode;
}

export default function StatCard({
  title,
  value,
  color,
  icon,
}: StatCardProps) {
  return (
    <div
      className="
        w-full
        min-h-[176px]
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-md
      "
    >
      {/* ==================================================
          JUDUL
      ================================================== */}

      <div className="min-h-[44px]">
        <p
          className="
            text-sm
            font-semibold
            leading-5
            text-slate-500
          "
        >
          {title}
        </p>
      </div>

      {/* ==================================================
          NILAI + ICON
      ================================================== */}

      <div className="mt-5 flex items-end justify-between gap-4">

        {/* NILAI */}

        <div
          className="
            min-w-0
            whitespace-nowrap
            text-[30px]
            font-extrabold
            leading-none
            tracking-tight
            text-slate-900
          "
        >
          {value}
        </div>

        {/* ICON */}

        <div
          className={`
            flex
            h-14
            w-14
            shrink-0
            items-center
            justify-center
            rounded-2xl
            ${color}
            text-white
            shadow-sm
          `}
        >
          {icon}
        </div>

      </div>
    </div>
  );
}