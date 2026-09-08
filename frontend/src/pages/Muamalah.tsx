import {
  useMemo,
  useState,
} from "react";

import type {
  FormEvent,
  KeyboardEvent,
} from "react";

import { useMuamalah } from "../hooks/useMuamalah";


// ==========================================================
// TYPES
// ==========================================================

type Materi = {
  id?: number;
  kategori?: string;
  judul?: string;
  pertanyaan?: string;

  // Materi lama
  isi_materi?: string;

  // Materi Arab + Indonesia
  teks_arab?: string;
  terjemah?: string;
  penjelasan?: string;

  // Referensi
  referensi_kitab?: string;
  juz?: string;
  halaman?: string;
  sumber?: string;

  aktif?: boolean;
};


// ==========================================================
// FONT / TEXT HELPERS
// ==========================================================

const ARABIC_REGEX =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;


const containsArabic = (text: string) => {
  return ARABIC_REGEX.test(text);
};


// ==========================================================
// RENDER TEKS CAMPURAN ARAB + LATIN
// ==========================================================

const renderMixedText = (text: string) => {
  if (!text) {
    return null;
  }

  const lines = text.split("\n");

  return lines.map((line, lineIndex) => {
    const parts = line.split(
      /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)/
    );

    return (
      <div
        key={`line-${lineIndex}`}
        style={{
          marginBottom:
            lineIndex < lines.length - 1
              ? "8px"
              : "0",
        }}
      >
        {parts.map((part, partIndex) => {
          if (!part) {
            return null;
          }

          const arabic = containsArabic(part);

          if (arabic) {
            return (
              <span
                key={`part-${lineIndex}-${partIndex}`}
                dir="rtl"
                style={{
                  fontFamily:
                    '"KFGQPC Uthman Taha Naskh", "KFG Uthman Taha", "Uthman Taha", serif',
                  fontSize: "24px",
                  lineHeight: 2.2,
                  direction: "rtl",
                  unicodeBidi: "plaintext",
                  display: "inline",
                }}
              >
                {part}
              </span>
            );
          }

          return (
            <span
              key={`part-${lineIndex}-${partIndex}`}
              style={{
                fontFamily:
                  '"Times New Roman", Times, serif',
                fontSize: "16px",
                lineHeight: 1.8,
              }}
            >
              {part}
            </span>
          );
        })}
      </div>
    );
  });
};


// ==========================================================
// RENDER ARABIC KHUSUS
// ==========================================================

const renderArabicText = (text?: string) => {
  if (!text) {
    return null;
  }

  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        fontFamily:
          '"KFGQPC Uthman Taha Naskh", "KFG Uthman Taha", "Uthman Taha", serif',
        direction: "rtl",
        unicodeBidi: "plaintext",
        textAlign: "right",
        fontSize: "25px",
        lineHeight: 2.25,
        color: "#172033",
        whiteSpace: "pre-wrap",
        wordBreak: "normal",
        overflowWrap: "break-word",
      }}
    >
      {text}
    </div>
  );
};


// ==========================================================
// RENDER LATIN / INDONESIA
// ==========================================================

const renderLatinText = (text?: string) => {
  if (!text) {
    return null;
  }

  return (
    <div
      lang="id"
      style={{
        fontFamily:
          '"Times New Roman", Times, serif',
        direction: "ltr",
        textAlign: "left",
        fontSize: "16px",
        lineHeight: 1.85,
        color: "#334155",
        whiteSpace: "pre-wrap",
        overflowWrap: "break-word",
      }}
    >
      {text}
    </div>
  );
};


// ==========================================================
// PAGE
// ==========================================================

export default function Muamalah() {

  const {
    data,
    loading,
    error,
    aiResults,
    aiLoading,
    searchForAI,
    clearAIResults,
  } = useMuamalah();


  // ========================================================
  // STATE
  // ========================================================

  const [question, setQuestion] =
    useState("");

  const [submittedQuestion, setSubmittedQuestion] =
    useState("");


  // ========================================================
  // MATERI AKTIF
  // ========================================================

  const activeMateri = useMemo(
    () => {

      return (data as Materi[]).filter(
        (item) =>
          item.aktif !== false
      );

    },
    [data]
  );


  // ========================================================
  // ASK AI MUAMALAH
  // ========================================================

  const handleAsk = async (
    event?: FormEvent
  ) => {

    event?.preventDefault();

    const keyword =
      question.trim();

    if (!keyword) {
      return;
    }

    setSubmittedQuestion(keyword);

    await searchForAI(
      keyword,
      5
    );

  };


  // ========================================================
  // ENTER
  // ========================================================

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      void handleAsk();

    }

  };


  // ========================================================
  // RESET
  // ========================================================

  const handleReset = () => {

    setQuestion("");

    setSubmittedQuestion("");

    clearAIResults();

  };


  // ========================================================
  // RENDER
  // ========================================================

  return (
    <div
      style={{
        minHeight: "100%",
        background:
          "linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%)",
        padding: "28px",
        boxSizing: "border-box",
      }}
    >

      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
        }}
      >

        <div
          style={{
            background:
              "linear-gradient(135deg, #ffffff 0%, #f7fbff 100%)",
            border:
              "1px solid #dbe7f5",
            borderRadius: "24px",
            padding: "28px 32px",
            boxShadow:
              "0 8px 30px rgba(30, 70, 120, 0.08)",
            marginBottom: "22px",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              flexWrap: "wrap",
            }}
          >

            {/* ICON */}

            <div
              style={{
                width: "62px",
                height: "62px",
                borderRadius: "18px",
                background:
                  "linear-gradient(135deg, #2563eb, #7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "30px",
                fontWeight: 700,
                boxShadow:
                  "0 8px 20px rgba(37, 99, 235, 0.25)",
              }}
            >
              ✦
            </div>


            {/* TITLE */}

            <div
              style={{
                flex: 1,
                minWidth: "250px",
              }}
            >

              <h1
                style={{
                  margin: 0,
                  fontSize: "32px",
                  fontWeight: 800,
                  color: "#123b78",
                  letterSpacing: "-0.5px",
                }}
              >
                AI Muamalah
              </h1>

              <p
                style={{
                  margin:
                    "7px 0 0",
                  color: "#64748b",
                  fontSize: "15px",
                  lineHeight: 1.6,
                }}
              >
                Tanya jawab fiqih muamalah
                berdasarkan materi dan referensi
                yang tersedia di database.
              </p>

            </div>


            {/* STATUS */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding:
                  "9px 14px",
                borderRadius: "999px",
                background: "#ecfdf5",
                border:
                  "1px solid #bbf7d0",
                color: "#15803d",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >

              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#22c55e",
                }}
              />

              Materi Terhubung

            </div>

          </div>

        </div>


        {/* ==================================================
            MAIN CHAT CARD
        ================================================== */}

        <div
          style={{
            background: "#ffffff",
            border:
              "1px solid #dbe7f5",
            borderRadius: "24px",
            boxShadow:
              "0 8px 35px rgba(30, 70, 120, 0.08)",
            overflow: "hidden",
          }}
        >

          {/* ------------------------------------------------
              CHAT AREA
          ------------------------------------------------ */}

          <div
            style={{
              minHeight: "420px",
              padding: "32px",
              boxSizing: "border-box",
            }}
          >

            {/* WELCOME */}

            {!submittedQuestion &&
              aiResults.length === 0 && (
                <div
                  style={{
                    maxWidth: "760px",
                    margin:
                      "35px auto 0",
                    textAlign: "center",
                  }}
                >

                  <div
                    style={{
                      width: "76px",
                      height: "76px",
                      margin: "0 auto 20px",
                      borderRadius: "24px",
                      background:
                        "linear-gradient(135deg, #eff6ff, #f5f3ff)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "38px",
                    }}
                  >
                    📚
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      color: "#173f7a",
                      fontSize: "27px",
                      fontWeight: 800,
                    }}
                  >
                    Apa yang ingin Anda tanyakan?
                  </h2>

                  <p
                    style={{
                      margin:
                        "12px auto 0",
                      maxWidth: "650px",
                      color: "#64748b",
                      lineHeight: 1.7,
                      fontSize: "15px",
                    }}
                  >
                    Tanyakan permasalahan jual beli,
                    akad, utang piutang, syirkah,
                    salam, murabahah, riba,
                    zakat perdagangan, atau
                    permasalahan muamalah lainnya.
                  </p>


                  {/* CONTOH PERTANYAAN */}

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      marginTop: "26px",
                    }}
                  >

                    {[
                      "Apa hukum jual beli secara umum?",
                      "Apa hukum riba dalam jual beli?",
                      "Bagaimana hukum utang piutang?",
                      "Apa syarat sah akad jual beli?",
                    ].map(
                      (example) => (

                        <button
                          key={example}
                          type="button"
                          onClick={() => {
                            setQuestion(example);
                          }}
                          style={{
                            border:
                              "1px solid #dbe7f5",
                            background:
                              "#f8fbff",
                            color: "#24518e",
                            borderRadius:
                              "12px",
                            padding:
                              "10px 14px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: 600,
                            transition:
                              "all 0.2s",
                          }}
                        >
                          {example}
                        </button>

                      )
                    )}

                  </div>

                </div>
              )
            }


            {/* QUESTION */}

            {submittedQuestion && (
              <div
                style={{
                  maxWidth: "820px",
                  margin:
                    "0 auto 28px",
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "flex-end",
                  }}
                >

                  <div
                    style={{
                      maxWidth: "75%",
                      background:
                        "linear-gradient(135deg, #2563eb, #3b82f6)",
                      color: "#ffffff",
                      padding:
                        "14px 18px",
                      borderRadius:
                        "18px 18px 4px 18px",
                      lineHeight: 1.6,
                      fontSize: "15px",
                      boxShadow:
                        "0 5px 15px rgba(37, 99, 235, 0.18)",
                    }}
                  >
                    {submittedQuestion}
                  </div>

                </div>

              </div>
            )}


            {/* LOADING */}

            {aiLoading && (
              <div
                style={{
                  maxWidth: "820px",
                  margin: "0 auto",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >

                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    flexShrink: 0,
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #eff6ff, #ede9fe)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                  }}
                >
                  ✦
                </div>

                <div
                  style={{
                    background: "#f8fafc",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius:
                      "16px",
                    padding:
                      "15px 18px",
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                >
                  Sedang mencari materi
                  Muamalah...
                </div>

              </div>
            )}


            {/* ERROR */}

            {error && !aiLoading && (
              <div
                style={{
                  maxWidth: "820px",
                  margin: "20px auto",
                  padding:
                    "14px 16px",
                  borderRadius: "14px",
                  background: "#fff7ed",
                  border:
                    "1px solid #fed7aa",
                  color: "#c2410c",
                  fontSize: "14px",
                }}
              >
                ⚠️ {error}
              </div>
            )}


            {/* AI RESULTS */}

            {!aiLoading &&
              aiResults.length > 0 && (

                <div
                  style={{
                    maxWidth: "820px",
                    margin: "0 auto",
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "16px",
                    }}
                  >

                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "12px",
                        background:
                          "linear-gradient(135deg, #eff6ff, #ede9fe)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                      }}
                    >
                      ✦
                    </div>

                    <div>

                      <div
                        style={{
                          fontWeight: 800,
                          color: "#173f7a",
                          fontSize: "15px",
                        }}
                      >
                        Referensi Muamalah
                      </div>

                      <div
                        style={{
                          color: "#94a3b8",
                          fontSize: "12px",
                          marginTop: "2px",
                        }}
                      >
                        Materi yang ditemukan
                        dari database
                      </div>

                    </div>

                  </div>


                  {/* RESULT CARDS */}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                    }}
                  >

                    {aiResults.map(
                      (
                        item,
                        index
                      ) => {

                        const materi =
                          item as Materi;

                        return (
                          <div
                            key={
                              materi.id ??
                              index
                            }
                            style={{
                              border:
                                "1px solid #dbe7f5",
                              borderRadius:
                                "18px",
                              padding:
                                "20px",
                              background:
                                "#ffffff",
                              boxShadow:
                                "0 4px 18px rgba(30, 70, 120, 0.05)",
                            }}
                          >

                            {/* CATEGORY */}

                            {materi.kategori && (
                              <div
                                style={{
                                  display:
                                    "inline-flex",
                                  alignItems:
                                    "center",
                                  padding:
                                    "5px 10px",
                                  borderRadius:
                                    "999px",
                                  background:
                                    "#eff6ff",
                                  color:
                                    "#2563eb",
                                  fontSize:
                                    "11px",
                                  fontWeight:
                                    800,
                                  marginBottom:
                                    "10px",
                                }}
                              >
                                {materi.kategori}
                              </div>
                            )}


                            {/* TITLE */}

                            {materi.judul && (
                              <h3
                                style={{
                                  margin:
                                    "0 0 10px",
                                  color:
                                    "#173f7a",
                                  fontSize:
                                    "18px",
                                  fontWeight:
                                    800,
                                }}
                              >
                                {materi.judul}
                              </h3>
                            )}


                            {/* QUESTION */}

                            {materi.pertanyaan && (
                              <div
                                style={{
                                  marginBottom:
                                    "12px",
                                  color:
                                    "#475569",
                                  fontFamily:
                                    '"Times New Roman", Times, serif',
                                  fontSize:
                                    "15px",
                                  lineHeight:
                                    1.7,
                                }}
                              >
                                <strong>
                                  Pertanyaan:
                                </strong>{" "}
                                {materi.pertanyaan}
                              </div>
                            )}


                            {/* =================================================
                                TEKS ARAB
                            ================================================= */}

                            {materi.teks_arab && (
                              <div
                                style={{
                                  marginTop: "16px",
                                  marginBottom: "16px",
                                  border:
                                    "1px solid #e2e8f0",
                                  borderRadius:
                                    "16px",
                                  background:
                                    "#fffdf7",
                                  overflow:
                                    "hidden",
                                }}
                              >

                                <div
                                  style={{
                                    padding:
                                      "10px 16px",
                                    borderBottom:
                                      "1px solid #eee7d8",
                                    background:
                                      "#fffaf0",
                                    color:
                                      "#7c5c20",
                                    fontFamily:
                                      '"Times New Roman", Times, serif',
                                    fontSize:
                                      "12px",
                                    fontWeight:
                                      800,
                                    textAlign:
                                      "left",
                                  }}
                                >
                                  📖 IBARAT / TEKS ARAB
                                </div>

                                <div
                                  style={{
                                    padding:
                                      "22px 24px",
                                    overflowX:
                                      "auto",
                                  }}
                                >
                                  {renderArabicText(
                                    materi.teks_arab
                                  )}
                                </div>

                              </div>
                            )}


                            {/* =================================================
                                TERJEMAH
                            ================================================= */}

                            {materi.terjemah && (
                              <div
                                style={{
                                  marginBottom:
                                    "16px",
                                  border:
                                    "1px solid #dbe7f5",
                                  borderRadius:
                                    "16px",
                                  background:
                                    "#f8fbff",
                                  overflow:
                                    "hidden",
                                }}
                              >

                                <div
                                  style={{
                                    padding:
                                      "10px 16px",
                                    borderBottom:
                                      "1px solid #e2e8f0",
                                    background:
                                      "#f1f7ff",
                                    color:
                                      "#24518e",
                                    fontFamily:
                                      '"Times New Roman", Times, serif',
                                    fontSize:
                                      "12px",
                                    fontWeight:
                                      800,
                                  }}
                                >
                                  🇮🇩 TERJEMAH
                                </div>

                                <div
                                  style={{
                                    padding:
                                      "17px 20px",
                                  }}
                                >
                                  {renderLatinText(
                                    materi.terjemah
                                  )}
                                </div>

                              </div>
                            )}


                            {/* =================================================
                                PENJELASAN
                            ================================================= */}

                            {materi.penjelasan && (
                              <div
                                style={{
                                  marginBottom:
                                    "16px",
                                  border:
                                    "1px solid #e2e8f0",
                                  borderRadius:
                                    "16px",
                                  background:
                                    "#ffffff",
                                  overflow:
                                    "hidden",
                                }}
                              >

                                <div
                                  style={{
                                    padding:
                                      "10px 16px",
                                    borderBottom:
                                      "1px solid #e2e8f0",
                                    background:
                                      "#f8fafc",
                                    color:
                                      "#334155",
                                    fontFamily:
                                      '"Times New Roman", Times, serif',
                                    fontSize:
                                      "12px",
                                    fontWeight:
                                      800,
                                  }}
                                >
                                  💡 PENJELASAN
                                </div>

                                <div
                                  style={{
                                    padding:
                                      "17px 20px",
                                  }}
                                >
                                  {renderLatinText(
                                    materi.penjelasan
                                  )}
                                </div>

                              </div>
                            )}


                            {/* =================================================
                                ISI MATERI LAMA
                                Tetap ditampilkan agar data lama aman.
                            ================================================= */}

                            {materi.isi_materi && (
                              <div
                                style={{
                                  marginTop:
                                    materi.teks_arab ||
                                    materi.terjemah ||
                                    materi.penjelasan
                                      ? "18px"
                                      : "0",
                                  background:
                                    "#f8fafc",
                                  borderRadius:
                                    "14px",
                                  padding:
                                    "18px",
                                  border:
                                    "1px solid #e2e8f0",
                                  color:
                                    "#334155",
                                  overflowX:
                                    "auto",
                                }}
                              >

                                <div
                                  style={{
                                    marginBottom:
                                      "10px",
                                    color:
                                      "#64748b",
                                    fontFamily:
                                      '"Times New Roman", Times, serif',
                                    fontSize:
                                      "12px",
                                    fontWeight:
                                      800,
                                  }}
                                >
                                  📄 MATERI
                                </div>

                                {renderMixedText(
                                  materi.isi_materi
                                )}

                              </div>
                            )}


                            {/* REFERENCE */}

                            {(materi.referensi_kitab ||
                              materi.juz ||
                              materi.halaman ||
                              materi.sumber) && (

                              <div
                                style={{
                                  display:
                                    "flex",
                                  flexWrap:
                                    "wrap",
                                  gap:
                                    "8px",
                                  marginTop:
                                    "14px",
                                }}
                              >

                                {materi.referensi_kitab && (
                                  <span
                                    style={{
                                      padding:
                                        "6px 10px",
                                      borderRadius:
                                        "9px",
                                      background:
                                        "#f5f3ff",
                                      color:
                                        "#6d28d9",
                                      fontSize:
                                        "11px",
                                      fontWeight:
                                        700,
                                      fontFamily:
                                        '"Times New Roman", Times, serif',
                                    }}
                                  >
                                    📚{" "}
                                    {materi.referensi_kitab}
                                  </span>
                                )}

                                {materi.juz && (
                                  <span
                                    style={{
                                      padding:
                                        "6px 10px",
                                      borderRadius:
                                        "9px",
                                      background:
                                        "#f0fdf4",
                                      color:
                                        "#15803d",
                                      fontSize:
                                        "11px",
                                      fontWeight:
                                        700,
                                      fontFamily:
                                        '"Times New Roman", Times, serif',
                                    }}
                                  >
                                    Juz {materi.juz}
                                  </span>
                                )}

                                {materi.halaman && (
                                  <span
                                    style={{
                                      padding:
                                        "6px 10px",
                                      borderRadius:
                                        "9px",
                                      background:
                                        "#fff7ed",
                                      color:
                                        "#c2410c",
                                      fontSize:
                                        "11px",
                                      fontWeight:
                                        700,
                                      fontFamily:
                                        '"Times New Roman", Times, serif',
                                    }}
                                  >
                                    Hal. {materi.halaman}
                                  </span>
                                )}

                                {materi.sumber && (
                                  <span
                                    style={{
                                      padding:
                                        "6px 10px",
                                      borderRadius:
                                        "9px",
                                      background:
                                        "#f8fafc",
                                      color:
                                        "#64748b",
                                      fontSize:
                                        "11px",
                                      fontWeight:
                                        700,
                                      fontFamily:
                                        '"Times New Roman", Times, serif',
                                    }}
                                  >
                                    Sumber:{" "}
                                    {materi.sumber}
                                  </span>
                                )}

                              </div>

                            )}

                          </div>
                        );

                      }
                    )}

                  </div>

                </div>

              )
            }


            {/* NO RESULT */}

            {!aiLoading &&
              submittedQuestion &&
              aiResults.length === 0 &&
              !error && (

                <div
                  style={{
                    maxWidth: "700px",
                    margin:
                      "35px auto",
                    textAlign: "center",
                    padding: "30px",
                    borderRadius: "18px",
                    background:
                      "#f8fafc",
                    border:
                      "1px dashed #cbd5e1",
                  }}
                >

                  <div
                    style={{
                      fontSize: "34px",
                      marginBottom: "10px",
                    }}
                  >
                    🔎
                  </div>

                  <div
                    style={{
                      fontWeight: 800,
                      color: "#334155",
                      fontSize: "17px",
                      fontFamily:
                        '"Times New Roman", Times, serif',
                    }}
                  >
                    Materi belum ditemukan
                  </div>

                  <p
                    style={{
                      margin:
                        "8px 0 0",
                      color: "#64748b",
                      fontSize: "14px",
                      lineHeight: 1.6,
                      fontFamily:
                        '"Times New Roman", Times, serif',
                    }}
                  >
                    Coba gunakan kata kunci
                    atau pertanyaan yang
                    berbeda.
                  </p>

                </div>

              )}

          </div>


          {/* =================================================
              INPUT AREA
          ================================================= */}

          <div
            style={{
              borderTop:
                "1px solid #e5edf7",
              background:
                "#fbfdff",
              padding:
                "20px 24px 24px",
            }}
          >

            <form
              onSubmit={handleAsk}
              style={{
                maxWidth: "900px",
                margin: "0 auto",
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "10px",
                  padding: "8px",
                  border:
                    "1px solid #cbdced",
                  borderRadius: "18px",
                  background:
                    "#ffffff",
                  boxShadow:
                    "0 5px 20px rgba(30, 70, 120, 0.07)",
                }}
              >

                <input
                  value={question}
                  onChange={(event) =>
                    setQuestion(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleKeyDown
                  }
                  placeholder="Tanyakan masalah muamalah..."
                  disabled={aiLoading}
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    padding:
                      "13px 14px",
                    fontSize: "15px",
                    fontFamily:
                      '"Times New Roman", Times, serif',
                    color: "#1e293b",
                    background:
                      "transparent",
                    minWidth: 0,
                  }}
                />


                {/* RESET */}

                {(question ||
                  submittedQuestion) && (
                  <button
                    type="button"
                    onClick={
                      handleReset
                    }
                    disabled={aiLoading}
                    title="Bersihkan"
                    style={{
                      width: "42px",
                      height: "42px",
                      border: "none",
                      borderRadius: "12px",
                      background:
                        "#f1f5f9",
                      color: "#64748b",
                      cursor:
                        aiLoading
                          ? "default"
                          : "pointer",
                      fontSize: "17px",
                    }}
                  >
                    ×
                  </button>
                )}


                {/* SEND */}

                <button
                  type="submit"
                  disabled={
                    aiLoading ||
                    !question.trim()
                  }
                  style={{
                    height: "42px",
                    padding:
                      "0 20px",
                    border: "none",
                    borderRadius: "12px",
                    background:
                      aiLoading ||
                      !question.trim()
                        ? "#cbd5e1"
                        : "linear-gradient(135deg, #2563eb, #4f46e5)",
                    color: "#ffffff",
                    cursor:
                      aiLoading ||
                      !question.trim()
                        ? "default"
                        : "pointer",
                    fontSize: "14px",
                    fontWeight: 800,
                    fontFamily:
                      '"Times New Roman", Times, serif',
                    boxShadow:
                      aiLoading ||
                      !question.trim()
                        ? "none"
                        : "0 5px 14px rgba(37, 99, 235, 0.22)",
                  }}
                >
                  {aiLoading
                    ? "Mencari..."
                    : "Tanya ✦"}
                </button>

              </div>


              <div
                style={{
                  textAlign: "center",
                  marginTop: "10px",
                  color: "#94a3b8",
                  fontSize: "11px",
                  fontFamily:
                    '"Times New Roman", Times, serif',
                }}
              >
                Jawaban berdasarkan materi
                Muamalah yang tersedia
                dalam database Kasir AI.
              </div>

            </form>

          </div>

        </div>


        {/* ==================================================
            INFORMATION CARDS
        ================================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
            marginTop: "18px",
          }}
        >

          {/* CARD 1 */}

          <div
            style={{
              background: "#ffffff",
              border:
                "1px solid #dbe7f5",
              borderRadius: "18px",
              padding: "18px",
            }}
          >

            <div
              style={{
                fontSize: "22px",
                marginBottom: "8px",
              }}
            >
              📚
            </div>

            <div
              style={{
                color: "#173f7a",
                fontWeight: 800,
                fontSize: "14px",
                fontFamily:
                  '"Times New Roman", Times, serif',
              }}
            >
              Sumber Materi
            </div>

            <div
              style={{
                marginTop: "5px",
                color: "#64748b",
                fontSize: "12px",
                lineHeight: 1.5,
                fontFamily:
                  '"Times New Roman", Times, serif',
              }}
            >
              Materi disediakan dan
              dikelola oleh Admin.
            </div>

          </div>


          {/* CARD 2 */}

          <div
            style={{
              background: "#ffffff",
              border:
                "1px solid #dbe7f5",
              borderRadius: "18px",
              padding: "18px",
            }}
          >

            <div
              style={{
                fontSize: "22px",
                marginBottom: "8px",
              }}
            >
              🔐
            </div>

            <div
              style={{
                color: "#173f7a",
                fontWeight: 800,
                fontSize: "14px",
                fontFamily:
                  '"Times New Roman", Times, serif',
              }}
            >
              Materi Terkontrol
            </div>

            <div
              style={{
                marginTop: "5px",
                color: "#64748b",
                fontSize: "12px",
                lineHeight: 1.5,
                fontFamily:
                  '"Times New Roman", Times, serif',
              }}
            >
              User tidak dapat menambah,
              mengubah, atau menghapus
              materi.
            </div>

          </div>


          {/* CARD 3 */}

          <div
            style={{
              background: "#ffffff",
              border:
                "1px solid #dbe7f5",
              borderRadius: "18px",
              padding: "18px",
            }}
          >

            <div
              style={{
                fontSize: "22px",
                marginBottom: "8px",
              }}
            >
              📖
            </div>

            <div
              style={{
                color: "#173f7a",
                fontWeight: 800,
                fontSize: "14px",
                fontFamily:
                  '"Times New Roman", Times, serif',
              }}
            >
              Referensi Kitab
            </div>

            <div
              style={{
                marginTop: "5px",
                color: "#64748b",
                fontSize: "12px",
                lineHeight: 1.5,
                fontFamily:
                  '"Times New Roman", Times, serif',
              }}
            >
              Referensi kitab, juz,
              halaman, dan sumber
              dapat ditampilkan.
            </div>

          </div>


          {/* CARD 4 */}

          <div
            style={{
              background: "#ffffff",
              border:
                "1px solid #dbe7f5",
              borderRadius: "18px",
              padding: "18px",
            }}
          >

            <div
              style={{
                fontSize: "22px",
                marginBottom: "8px",
              }}
            >
              📊
            </div>

            <div
              style={{
                color: "#173f7a",
                fontWeight: 800,
                fontSize: "14px",
                fontFamily:
                  '"Times New Roman", Times, serif',
              }}
            >
              Materi Tersedia
            </div>

            <div
              style={{
                marginTop: "5px",
                color: "#64748b",
                fontSize: "12px",
                lineHeight: 1.5,
                fontFamily:
                  '"Times New Roman", Times, serif',
              }}
            >
              {loading
                ? "Memuat materi..."
                : `${activeMateri.length} materi aktif tersedia.`}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}