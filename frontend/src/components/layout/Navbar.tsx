import {
  Bell,
  UserCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const username =
    localStorage.getItem("username") ||
    "Pengguna";

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <header
      className="
        fixed
        top-0
        right-0
        left-[260px]
        z-50
        h-[72px]
        bg-gradient-to-r
        from-[#081f46]
        via-[#0b2a5b]
        to-[#123d7a]
        shadow-lg
        flex
        items-center
        px-6
        md:px-8
      "
    >
      {/* ==================================================
          BRANDING
      ================================================== */}

      <div className="flex flex-1 items-center gap-3">

        {/* LOGO */}

        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border-2
            border-[#d4af37]
            bg-[#0b2a5b]
            text-lg
            font-extrabold
            text-white
            shadow-md
          "
        >
          K
        </div>

        {/* NAMA APLIKASI */}

        <div className="leading-tight">
          <div
            className="
              text-lg
              font-extrabold
              tracking-wide
              text-white
            "
          >
            KASE AI
          </div>

          <div
            className="
              text-[11px]
              font-medium
              text-white/70
            "
          >
            Kasir AI Syari'ah Entrepreneur
          </div>
        </div>

      </div>


      {/* ==================================================
          USER AREA
      ================================================== */}

      <div className="flex items-center gap-4">

        {/* NOTIFIKASI */}

        <button
          type="button"
          title="Notifikasi"
          className="
            relative
            rounded-lg
            p-2
            text-white
            transition
            hover:bg-white/10
            hover:text-[#d4af37]
          "
        >
          <Bell size={22} />

          <span
            className="
              absolute
              right-1
              top-1
              h-2
              w-2
              rounded-full
              bg-red-500
            "
          />
        </button>


        {/* USER */}

        <div className="hidden items-center gap-2 sm:flex">

          <UserCircle
            size={34}
            className="text-white"
          />

          <div className="leading-tight">

            <div
              className="
                text-sm
                font-semibold
                text-white
              "
            >
              {username}
            </div>

            <div
              className="
                text-[11px]
                text-white/60
              "
            >
              Pengguna
            </div>

          </div>

        </div>


        {/* LOGOUT */}

        <button
          type="button"
          onClick={handleLogout}
          className="
            rounded-lg
            border
            border-white/20
            px-4
            py-2
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-white/10
            hover:text-[#d4af37]
          "
        >
          Logout
        </button>

      </div>

    </header>
  );
}