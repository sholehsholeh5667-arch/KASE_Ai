import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <Sidebar />

      {/* ==================================================
          AREA UTAMA
      ================================================== */}

      <div className="ml-[260px] min-h-screen">

        {/* ==================================================
            NAVBAR
        ================================================== */}

        <Navbar />

        {/* ==================================================
            CONTENT
        ================================================== */}

        <main className="pt-[88px] px-6 md:px-8 pb-8">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}