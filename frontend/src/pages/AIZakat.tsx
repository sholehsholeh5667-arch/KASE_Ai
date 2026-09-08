import {
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";

import api from "../api/axios";


// ==========================================================
// TYPES
// ==========================================================

interface ZakatRequest {
  module: "zakat";
  action: "hitung";
  message: string;

  kas: number;
  bank: number;
  persediaan: number;
  piutang: number;
  utang: number;

  harga_emas_per_gram: number;
  kalender: "hijriah" | "masehi";
}

interface ZakatData {
  kalender?: string;

  kas?: string;
  bank?: string;
  persediaan?: string;
  piutang?: string;
  utang?: string;

  total_harta?: string;
  harta_bersih?: string;

  gram_emas_nisab?: string;
  harga_emas_per_gram?: string;
  nisab?: string;

  tarif?: string;
  tarif_persen?: string;

  wajib_zakat?: boolean;
  zakat?: string;

  rumus?: string;
  rumus_nisab?: string;
  rumus_zakat?: string;

  status_text?: string;
  nama_metode?: string;
  dasar_nisab?: string;
  sumber_perhitungan?: string;
}

interface ZakatResponse {
  status?: string;
  success?: boolean;
  provider?: string;
  module?: string;
  message?: string;
  data?: ZakatData;
  timestamp?: string;
}


// ==========================================================
// HELPERS
// ==========================================================

function parseAmount(value: string): number {
  const cleaned = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const number = Number(cleaned);

  return Number.isFinite(number)
    ? number
    : 0;
}


function rupiah(
  value: string | number | undefined,
): string {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) {
    return "Rp0";
  }

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
  ).format(number);
}


// ==========================================================
// REUSABLE COMPONENT
// ==========================================================

function DataRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        padding: "9px 0",
        borderBottom:
          "1px solid #f0f2f5",
      }}
    >
      <span
        style={{
          color: "#6b7280",
          fontSize: 13,
        }}
      >
        {label}
      </span>

      <span
        style={{
          color: "#111827",
          fontSize: 13,
          fontWeight:
            strong ? 800 : 600,
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}


function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#4b5563",
        }}
      >
        {label}
      </span>

      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        style={{
          width: "100%",
          boxSizing: "border-box",
          border: "1px solid #dfe3e8",
          borderRadius: 10,
          padding: "10px 11px",
          fontSize: 13,
          color: "#111827",
          background: "#fff",
          outline: "none",
        }}
      />
    </label>
  );
}


function IconButton({
  children,
  title,
  onClick,
}: {
  children: ReactNode;
  title: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        width: 36,
        height: 36,
        border: "none",
        borderRadius: 9,
        background: "transparent",
        color: "#6b7280",
        cursor: "pointer",
        fontSize: 18,
      }}
    >
      {children}
    </button>
  );
}


// ==========================================================
// MAIN
// ==========================================================

export default function AIZakat() {

  // --------------------------------------------------------
  // DATA
  // --------------------------------------------------------

  const [kalender, setKalender] =
    useState<
      "hijriah" | "masehi"
    >("hijriah");

  const [kas, setKas] =
    useState("");

  const [bank, setBank] =
    useState("");

  const [persediaan, setPersediaan] =
    useState("");

  const [piutang, setPiutang] =
    useState("");

  const [utang, setUtang] =
    useState("");

  const [hargaEmas, setHargaEmas] =
    useState("");


  // --------------------------------------------------------
  // CHAT
  // --------------------------------------------------------

  const [question, setQuestion] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState<ZakatResponse | null>(
      null,
    );


  // --------------------------------------------------------
  // UX
  // --------------------------------------------------------

  const [showData, setShowData] =
    useState(false);

  const [showDetail, setShowDetail] =
    useState(true);


  const data =
    result?.data ?? null;

  const wajib =
    data?.wajib_zakat === true;


  // ========================================================
  // HITUNG
  // ========================================================

  async function submit(
    event?: FormEvent,
  ) {
    event?.preventDefault();

    setError("");

    const harga =
      parseAmount(hargaEmas);

    if (harga <= 0) {
      setError(
        "Masukkan harga emas per gram.",
      );
      setShowData(true);
      return;
    }

    const payload: ZakatRequest = {
      module: "zakat",
      action: "hitung",
      message:
        question.trim() ||
        "Hitung zakat tijarah",

      kas: parseAmount(kas),
      bank: parseAmount(bank),
      persediaan:
        parseAmount(persediaan),
      piutang:
        parseAmount(piutang),
      utang:
        parseAmount(utang),

      harga_emas_per_gram:
        harga,

      kalender,
    };

    try {
      setLoading(true);

      const response =
        await api.post<ZakatResponse>(
          "/ai/process",
          payload,
        );

      const responseData =
        response.data;

      if (
        !responseData.success ||
        !responseData.data
      ) {
        setError(
          responseData.message ||
          "Perhitungan zakat gagal.",
        );
        return;
      }

      setResult(responseData);

    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Gagal terhubung ke backend.",
      );

    } finally {
      setLoading(false);
    }
  }


  // ========================================================
  // QUICK QUESTION
  // ========================================================

  function quickQuestion(
    text: string,
  ) {
    setQuestion(text);
  }


  // ========================================================
  // RESET
  // ========================================================

  function reset() {
    setQuestion("");

    setResult(null);

    setError("");

    setKas("");
    setBank("");
    setPersediaan("");
    setPiutang("");
    setUtang("");
    setHargaEmas("");

    setKalender("hijriah");

    setShowDetail(true);
  }


  // ========================================================
  // STYLES
  // ========================================================

  const page: CSSProperties = {
    height: "calc(100vh - 86px)",
    display: "flex",
    flexDirection: "column",
    background: "#fff",
  };

  const header: CSSProperties = {
    height: 64,
    flexShrink: 0,
    borderBottom:
      "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "space-between",
    padding: "0 18px",
    background: "#fff",
  };

  const chat: CSSProperties = {
    flex: 1,
    overflowY: "auto",
  };

  const content: CSSProperties = {
    width: "100%",
    maxWidth: 900,
    margin: "0 auto",
    padding:
      "28px 20px 180px",
    boxSizing: "border-box",
  };


  // ========================================================
  // RENDER
  // ========================================================

  return (
    <div style={page}>

      {/* ==================================================
          HEADER
      ================================================== */}

      <header style={header}>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
          }}
        >

          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "#173f78",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
            }}
          >
            K
          </div>

          <div>

            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: "#111827",
              }}
            >
              AI Zakat Tijarah
            </div>

            <div
              style={{
                fontSize: 11,
                color: "#9ca3af",
              }}
            >
              KasirAI
            </div>

          </div>

        </div>


        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >

          <IconButton
            title="Data zakat"
            onClick={() =>
              setShowData(
                !showData,
              )
            }
          >
            ⚙
          </IconButton>

          <IconButton
            title="Percakapan baru"
            onClick={reset}
          >
            ＋
          </IconButton>

        </div>

      </header>


      {/* ==================================================
          CHAT
      ================================================== */}

      <main style={chat}>

        <div style={content}>

          {/* -----------------------------------------------
              EMPTY
          ----------------------------------------------- */}

          {!result && !error && (
            <div
              style={{
                minHeight:
                  "calc(100vh - 360px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent:
                  "center",
                textAlign: "center",
              }}
            >

              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1769aa",
                  fontSize: 29,
                  marginBottom: 18,
                }}
              >
                ✦
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 29,
                  color: "#111827",
                  letterSpacing:
                    "-0.4px",
                }}
              >
                Bagaimana saya
                bisa membantu?
              </h1>

              <p
                style={{
                  maxWidth: 600,
                  color: "#6b7280",
                  fontSize: 14,
                  lineHeight: 1.7,
                  margin:
                    "11px 0 24px",
                }}
              >
                Hitung zakat tijarah,
                cek nisab, dan lihat
                rincian perhitungannya.
              </p>


              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: 10,
                  width: "100%",
                  maxWidth: 650,
                }}
              >

                <button
                  type="button"
                  onClick={() =>
                    quickQuestion(
                      "Hitung zakat tijarah saya",
                    )
                  }
                  style={quickCard}
                >
                  <strong>
                    Hitung zakat tijarah
                  </strong>

                  <span>
                    Hitung kewajiban zakat
                    berdasarkan data harta.
                  </span>
                </button>


                <button
                  type="button"
                  onClick={() =>
                    quickQuestion(
                      "Cek apakah harta saya sudah mencapai nisab",
                    )
                  }
                  style={quickCard}
                >
                  <strong>
                    Cek nisab
                  </strong>

                  <span>
                    Bandingkan harta bersih
                    dengan nisab.
                  </span>
                </button>

              </div>

            </div>
          )}


          {/* -----------------------------------------------
              USER
          ----------------------------------------------- */}

          {(result || error) && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 24,
              }}
            >

              <div
                style={{
                  maxWidth: "72%",
                  background: "#f3f4f6",
                  borderRadius:
                    "17px 17px 4px 17px",
                  padding:
                    "11px 15px",
                  fontSize: 14,
                  color: "#111827",
                  lineHeight: 1.6,
                }}
              >
                {question ||
                  "Hitung zakat tijarah"}
              </div>

            </div>
          )}


          {/* -----------------------------------------------
              ASSISTANT
          ----------------------------------------------- */}

          {(result || error) && (
            <div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 9,
                }}
              >

                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    background: "#173f78",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 14,
                  }}
                >
                  K
                </div>

                <strong
                  style={{
                    fontSize: 14,
                    color: "#374151",
                  }}
                >
                  AI Zakat Tijarah
                </strong>

              </div>


              {error && (
                <div
                  style={{
                    border:
                      "1px solid #fecaca",
                    background: "#fff7f7",
                    color: "#b91c1c",
                    borderRadius: 14,
                    padding: 15,
                    lineHeight: 1.6,
                    marginBottom: 20,
                  }}
                >
                  {error}
                </div>
              )}


              {result && data && (
                <div>

                  <div
                    style={{
                      fontSize: 15,
                      lineHeight: 1.8,
                      color: "#374151",
                      marginBottom: 16,
                    }}
                  >
                    {result.message ||
                      "Berikut hasil perhitungan zakat tijarah."}
                  </div>


                  {/* ---------------------------------------
                      MAIN RESULT
                  --------------------------------------- */}

                  <div
                    style={{
                      border:
                        "1px solid #e5e7eb",
                      borderRadius: 18,
                      overflow: "hidden",
                      background: "#fff",
                      marginBottom: 14,
                    }}
                  >

                    <div
                      style={{
                        padding: 20,
                        background:
                          wajib
                            ? "#f0fdf4"
                            : "#eff6ff",
                      }}
                    >

                      <div
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                          marginBottom: 8,
                        }}
                      >
                        HASIL PERHITUNGAN
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent:
                            "space-between",
                          gap: 20,
                          flexWrap: "wrap",
                        }}
                      >

                        <div>

                          <div
                            style={{
                              fontSize: 30,
                              fontWeight: 800,
                              color:
                                wajib
                                  ? "#15803d"
                                  : "#1d4ed8",
                            }}
                          >
                            {wajib
                              ? "Wajib Zakat"
                              : "Belum Wajib Zakat"}
                          </div>

                          <div
                            style={{
                              fontSize: 13,
                              color: "#6b7280",
                              marginTop: 5,
                            }}
                          >
                            Metode:{" "}
                            {data.kalender ===
                            "masehi"
                              ? "Masehi"
                              : "Hijriah"}{" "}
                            ·{" "}
                            {data.tarif_persen ??
                              "0"}
                            %
                          </div>

                        </div>


                        <div
                          style={{
                            textAlign: "right",
                          }}
                        >

                          <div
                            style={{
                              fontSize: 12,
                              color: "#6b7280",
                            }}
                          >
                            Zakat
                          </div>

                          <div
                            style={{
                              fontSize: 29,
                              fontWeight: 800,
                              color: "#111827",
                              marginTop: 2,
                            }}
                          >
                            {rupiah(
                              data.zakat,
                            )}
                          </div>

                        </div>

                      </div>

                    </div>


                    {/* ------------------------------------
                        DETAIL TOGGLE
                    ------------------------------------ */}

                    <button
                      type="button"
                      onClick={() =>
                        setShowDetail(
                          !showDetail,
                        )
                      }
                      style={{
                        width: "100%",
                        border: "none",
                        borderTop:
                          "1px solid #e5e7eb",
                        background: "#fff",
                        padding:
                          "12px 20px",
                        display: "flex",
                        justifyContent:
                          "space-between",
                        cursor: "pointer",
                        color: "#374151",
                        fontWeight: 700,
                      }}
                    >
                      <span>
                        Rincian Perhitungan
                      </span>

                      <span>
                        {showDetail
                          ? "⌃"
                          : "⌄"}
                      </span>
                    </button>


                    {showDetail && (
                      <div
                        style={{
                          padding:
                            "4px 20px 20px",
                        }}
                      >

                        <DataRow
                          label="Kas"
                          value={rupiah(
                            data.kas,
                          )}
                        />

                        <DataRow
                          label="Bank"
                          value={rupiah(
                            data.bank,
                          )}
                        />

                        <DataRow
                          label="Persediaan"
                          value={rupiah(
                            data.persediaan,
                          )}
                        />

                        <DataRow
                          label="Piutang"
                          value={rupiah(
                            data.piutang,
                          )}
                        />

                        <DataRow
                          label="Total Harta"
                          value={rupiah(
                            data.total_harta,
                          )}
                          strong
                        />

                        <DataRow
                          label="Utang Usaha"
                          value={rupiah(
                            data.utang,
                          )}
                        />

                        <DataRow
                          label="Harta Bersih"
                          value={rupiah(
                            data.harta_bersih,
                          )}
                          strong
                        />

                        <DataRow
                          label="Nisab"
                          value={rupiah(
                            data.nisab,
                          )}
                          strong
                        />

                        <DataRow
                          label="Harga Emas / Gram"
                          value={rupiah(
                            data.harga_emas_per_gram,
                          )}
                        />

                      </div>
                    )}


                    {/* ------------------------------------
                        RUMUS
                    ------------------------------------ */}

                    <div
                      style={{
                        borderTop:
                          "1px solid #f0f0f0",
                        background:
                          "#fafafa",
                        padding:
                          "15px 20px",
                      }}
                    >

                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: "#9ca3af",
                          marginBottom: 7,
                        }}
                      >
                        RUMUS
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          color: "#4b5563",
                          lineHeight: 1.8,
                        }}
                      >
                        <div>
                          {data.rumus}
                        </div>

                        <div>
                          {data.rumus_nisab}
                        </div>

                        <div>
                          {data.rumus_zakat}
                        </div>
                      </div>

                    </div>

                  </div>


                  <div
                    style={{
                      fontSize: 11,
                      color: "#9ca3af",
                      lineHeight: 1.6,
                    }}
                  >
                    Perhitungan angka dilakukan
                    oleh backend KasirAI secara
                    deterministik. AI tidak
                    mengubah hasil perhitungan.
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </main>


      {/* ==================================================
          DATA PANEL + COMPOSER
      ================================================== */}

      <div
        style={{
          position: "fixed",
          left:
            "calc(50% + 0px)",
          right: 0,
          bottom: 0,
          zIndex: 20,
          pointerEvents:
            "none",
        }}
      >

        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding:
              "0 20px 16px",
          }}
        >

          {/* -----------------------------------------------
              DATA PANEL
          ----------------------------------------------- */}

          {showData && (
            <div
              style={{
                pointerEvents: "auto",
                background: "#fff",
                border:
                  "1px solid #dfe3e8",
                borderRadius: 18,
                boxShadow:
                  "0 10px 35px rgba(0,0,0,.12)",
                padding: 18,
                marginBottom: 10,
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: 15,
                }}
              >

                <div>

                  <strong
                    style={{
                      color: "#111827",
                    }}
                  >
                    Data Zakat
                  </strong>

                  <div
                    style={{
                      fontSize: 11,
                      color: "#9ca3af",
                      marginTop: 3,
                    }}
                  >
                    Nilai digunakan oleh mesin
                    perhitungan backend.
                  </div>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    setShowData(false)
                  }
                  style={{
                    border: "none",
                    background:
                      "#f3f4f6",
                    borderRadius: 8,
                    padding:
                      "6px 10px",
                    cursor: "pointer",
                  }}
                >
                  Tutup
                </button>

              </div>


              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >

                <Field
                  label="Kas"
                  value={kas}
                  onChange={setKas}
                  placeholder="255000000"
                />

                <Field
                  label="Bank"
                  value={bank}
                  onChange={setBank}
                  placeholder="0"
                />

                <Field
                  label="Persediaan"
                  value={persediaan}
                  onChange={
                    setPersediaan
                  }
                  placeholder="300000000"
                />

                <Field
                  label="Piutang"
                  value={piutang}
                  onChange={setPiutang}
                  placeholder="30000000"
                />

                <Field
                  label="Utang"
                  value={utang}
                  onChange={setUtang}
                  placeholder="50000000"
                />

                <Field
                  label="Harga Emas / Gram"
                  value={hargaEmas}
                  onChange={
                    setHargaEmas
                  }
                  placeholder="2000000"
                />

              </div>

            </div>
          )}


          {/* -----------------------------------------------
              COMPOSER
          ----------------------------------------------- */}

          <form
            onSubmit={submit}
            style={{
              pointerEvents: "auto",
            }}
          >

            <div
              style={{
                border:
                  "1px solid #dfe3e8",
                borderRadius: 18,
                background: "#fff",
                boxShadow:
                  "0 7px 28px rgba(0,0,0,.08)",
                padding:
                  "11px 11px 10px 15px",
              }}
            >

              <textarea
                value={question}
                onChange={(e) =>
                  setQuestion(
                    e.target.value,
                  )
                }
                onKeyDown={(e) => {

                  if (
                    e.key ===
                    "Enter" &&
                    !e.shiftKey
                  ) {

                    e.preventDefault();

                    e.currentTarget
                      .form
                      ?.requestSubmit();
                  }

                }}
                rows={2}
                placeholder="Tanyakan perhitungan zakat..."
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  background:
                    "transparent",
                  fontFamily:
                    "inherit",
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "#111827",
                  boxSizing:
                    "border-box",
                }}
              />


              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 8,
                }}
              >

                <div
                  style={{
                    display: "flex",
                    gap: 7,
                    flexWrap: "wrap",
                  }}
                >

                  <button
                    type="button"
                    onClick={() =>
                      setShowData(
                        !showData,
                      )
                    }
                    style={chipButton}
                  >
                    ⚙ Data Zakat
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      setKalender(
                        kalender ===
                        "hijriah"
                          ? "masehi"
                          : "hijriah",
                      )
                    }
                    style={chipButton}
                  >
                    {kalender ===
                    "hijriah"
                      ? "Hijriah · 2,5%"
                      : "Masehi · 2,577%"}
                  </button>

                </div>


                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: 38,
                    height: 38,
                    border: "none",
                    borderRadius: 11,
                    background:
                      loading
                        ? "#d1d5db"
                        : "#111827",
                    color: "#fff",
                    cursor:
                      loading
                        ? "not-allowed"
                        : "pointer",
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  {loading
                    ? "…"
                    : "↑"}
                </button>

              </div>

            </div>

          </form>


          {error && (
            <div
              style={{
                marginTop: 7,
                background:
                  "#fff7f7",
                color: "#b91c1c",
                border:
                  "1px solid #fecaca",
                borderRadius: 10,
                padding:
                  "8px 11px",
                fontSize: 12,
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              textAlign: "center",
              color: "#9ca3af",
              fontSize: 10,
              marginTop: 7,
            }}
          >
            KasirAI · AI Zakat Tijarah
          </div>

        </div>

      </div>

    </div>
  );
}


// ==========================================================
// CONSTANT STYLES
// ==========================================================

const quickCard: CSSProperties = {
  textAlign: "left",
  border:
    "1px solid #e5e7eb",
  borderRadius: 14,
  background: "#fff",
  padding: 14,
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  gap: 5,
  color: "#111827",
};


const chipButton: CSSProperties = {
  border:
    "1px solid #e5e7eb",
  background: "#fff",
  color: "#4b5563",
  borderRadius: 9,
  padding:
    "7px 10px",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 600,
};