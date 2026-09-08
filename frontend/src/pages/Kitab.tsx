import { useState } from "react";

import type { FormEvent } from "react";

import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Chip,
  Divider,
  Alert,
} from "@mui/material";

import {
  Send,
  BookOpen,
  Sparkles,
  Search,
  Languages,
  RotateCcw,
} from "lucide-react";

import { useKitab } from "../hooks/useKitab";


// ==========================================================
// PAGE AI KITAB KUNING
// ==========================================================

export default function Kitab() {

  const {
    answer,
    aiResults,
    aiLoading,
    error,

    translation,
    translationLoading,
    translate,

    explanation,
    explanationLoading,
    explain,

    ask,
    clear,
  } = useKitab();


  // ========================================================
  // STATE
  // ========================================================

  const [question, setQuestion] =
    useState("");

  const [selectedArab, setSelectedArab] =
    useState("");


  // ========================================================
  // SUBMIT PERTANYAAN
  // ========================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {

    event.preventDefault();

    const value =
      question.trim();

    if (
      !value ||
      aiLoading
    ) {
      return;
    }

    await ask(value);
  };


  // ========================================================
  // RESPONSE BACKEND
  // ========================================================

  const answerMessage =
    answer?.answer ??
    answer?.jawaban ??
    answer?.message ??
    "";


  const dataObject =
    answer?.data &&
    typeof answer.data === "object"
      ? (
          answer.data as Record<
            string,
            unknown
          >
        )
      : null;


  const knowledgeStatus =
    typeof dataObject?.knowledge_status ===
    "string"
      ? dataObject.knowledge_status
      : "";


  const context =
    Array.isArray(
      dataObject?.context
    )
      ? dataObject.context
      : [];


  // ========================================================
  // TERJEMAH AI
  // ========================================================

  const handleTranslate = async (
    arab: string,
    kitab?: string,
    bab?: string,
  ) => {

    const text =
      arab.trim();

    if (
      !text ||
      translationLoading ||
      explanationLoading
    ) {
      return;
    }

    setSelectedArab(text);

    await translate(
      text,
      kitab,
      bab,
    );
  };


  // ========================================================
  // JELASKAN AI
  // ========================================================

  const handleExplain = async (
    arab: string,
    kitab?: string,
    bab?: string,
  ) => {

    const text =
      arab.trim();

    if (
      !text ||
      translationLoading ||
      explanationLoading
    ) {
      return;
    }

    setSelectedArab(text);

    await explain(
      text,
      kitab,
      bab,
    );
  };


  // ========================================================
  // BERSIHKAN
  // ========================================================

  const handleClear = () => {

    setQuestion("");

    setSelectedArab("");

    clear();
  };


  // ========================================================
  // CONTOH PERTANYAAN
  // ========================================================

  const handleExample = (
    text: string,
  ) => {

    setQuestion(text);
  };


  // ========================================================
  // RENDER
  // ========================================================

  return (

    <Box
      sx={{
        minHeight:
          "calc(100vh - 120px)",

        background:
          "linear-gradient(180deg,#f8fbff 0%,#eef6ff 100%)",

        borderRadius: 4,

        p: {
          xs: 1,
          sm: 1.5,
          md: 2,
        },
      }}
    >

      {/* ==================================================
          HEADER
      ================================================== */}

      <Paper
        elevation={0}
        sx={{
          p: {
            xs: 2,
            sm: 2.5,
            md: 3,
          },

          mb: 2,

          borderRadius: 4,

          border:
            "1px solid rgba(15,23,42,0.07)",

          background:
            "linear-gradient(135deg,#ffffff 0%,#f5fbff 100%)",
        }}
      >

        <Box
          display="flex"
          alignItems="center"
          gap={2}
        >

          <Box
            sx={{
              width: {
                xs: 50,
                md: 58,
              },

              height: {
                xs: 50,
                md: 58,
              },

              flexShrink: 0,

              borderRadius: 3,

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              background:
                "linear-gradient(135deg,#dbeafe,#e0f2fe)",

              color: "#0b2a5b",

              boxShadow:
                "0 8px 24px rgba(14,116,144,0.10)",
            }}
          >

            <BookOpen
              size={28}
              strokeWidth={2.2}
            />

          </Box>


          <Box
            minWidth={0}
          >

            <Typography
              sx={{
                fontSize: {
                  xs: 22,
                  sm: 25,
                  md: 28,
                },

                fontWeight: 800,

                color: "#0b2a5b",

                lineHeight: 1.15,
              }}
            >
              AI Kitab Kuning
            </Typography>


            <Typography
              sx={{
                mt: 0.6,

                fontSize: {
                  xs: 12.5,
                  md: 14,
                },

                color: "#64748b",

                lineHeight: 1.6,
              }}
            >
              Cari ibarat kitab, baca referensi,
              terjemahkan dan jelaskan teks Arab
              dengan bantuan AI.
            </Typography>

          </Box>

        </Box>

      </Paper>


      {/* ==================================================
          MAIN CONTAINER
      ================================================== */}

      <Paper
        elevation={0}
        sx={{
          minHeight: {
            xs: 560,
            md: 650,
          },

          borderRadius: 4,

          border:
            "1px solid rgba(15,23,42,0.07)",

          backgroundColor:
            "#ffffff",

          display: "flex",

          flexDirection: "column",

          overflow: "hidden",
        }}
      >

        {/* =================================================
            CONTENT
        ================================================= */}

        <Box
          sx={{
            flex: 1,

            p: {
              xs: 1.5,
              sm: 2,
              md: 3,
            },

            overflowY: "auto",
          }}
        >

          {/* ===============================================
              EMPTY STATE
          =============================================== */}

          {!answerMessage &&
            context.length === 0 &&
            aiResults.length === 0 &&
            !translation &&
            !explanation &&
            !aiLoading &&
            !error && (

              <Box
                sx={{
                  minHeight: {
                    xs: 400,
                    md: 480,
                  },

                  display: "flex",

                  flexDirection: "column",

                  alignItems: "center",

                  justifyContent: "center",

                  textAlign: "center",

                  px: 2,
                }}
              >

                <Box
                  sx={{
                    width: 74,

                    height: 74,

                    borderRadius: "50%",

                    display: "flex",

                    alignItems: "center",

                    justifyContent: "center",

                    background:
                      "linear-gradient(135deg,#e0f2fe,#dbeafe)",

                    color: "#0369a1",

                    mb: 2,
                  }}
                >

                  <Sparkles
                    size={34}
                    strokeWidth={2}
                  />

                </Box>


                <Typography
                  sx={{
                    fontSize: {
                      xs: 20,
                      md: 23,
                    },

                    fontWeight: 800,

                    color: "#0f172a",

                    mb: 1,
                  }}
                >
                  Tanya Kitab Kuning
                </Typography>


                <Typography
                  sx={{
                    maxWidth: 620,

                    fontSize: 14,

                    lineHeight: 1.8,

                    color: "#64748b",
                  }}
                >
                  Tulis kata kunci atau pertanyaan
                  yang ingin dicari di database
                  kitab KasirAI.
                </Typography>


                <Box
                  sx={{
                    display: "flex",

                    flexWrap: "wrap",

                    gap: 1,

                    justifyContent: "center",

                    mt: 3,
                  }}
                >

                  <Chip
                    icon={
                      <Search size={15} />
                    }

                    label="Cari ibarat"

                    variant="outlined"

                    onClick={() =>
                      handleExample(
                        "jual beli",
                      )
                    }

                    sx={{
                      cursor:
                        "pointer",
                    }}
                  />


                  <Chip
                    icon={
                      <BookOpen size={15} />
                    }

                    label="Thaharah"

                    variant="outlined"

                    onClick={() =>
                      handleExample(
                        "thaharah",
                      )
                    }

                    sx={{
                      cursor:
                        "pointer",
                    }}
                  />


                  <Chip
                    icon={
                      <Languages size={15} />
                    }

                    label="Terjemah Arab"

                    variant="outlined"

                    onClick={() =>
                      handleExample(
                        "terjemahkan teks Arab",
                      )
                    }

                    sx={{
                      cursor:
                        "pointer",
                    }}
                  />

                </Box>

              </Box>

            )}


          {/* ===============================================
              LOADING SEARCH
          =============================================== */}

          {aiLoading && (

            <Box
              sx={{
                minHeight: 300,

                display: "flex",

                flexDirection: "column",

                alignItems: "center",

                justifyContent: "center",

                gap: 1.5,
              }}
            >

              <CircularProgress
                size={30}
              />

              <Typography
                fontSize={14}
                color="#64748b"
              >
                Mencari referensi kitab...
              </Typography>

            </Box>

          )}


          {/* ===============================================
              ERROR
          =============================================== */}

          {!aiLoading &&
            error && (

              <Alert
                severity="error"
                sx={{
                  mb: 2,

                  borderRadius: 3,
                }}
              >
                {error}
              </Alert>

            )}


          {/* ===============================================
              HASIL
          =============================================== */}

          {!aiLoading &&
            (
              answerMessage ||
              context.length > 0 ||
              aiResults.length > 0 ||
              translation ||
              explanation
            ) && (

              <Box>

                {/* -----------------------------------------
                    HASIL AI
                ----------------------------------------- */}

                {answerMessage && (

                  <Box mb={3}>

                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      mb={1}
                    >

                      <Sparkles
                        size={18}
                        color="#0284c7"
                      />

                      <Typography
                        fontSize={15}
                        fontWeight={800}
                        color="#0f172a"
                      >
                        Hasil AI Kitab
                      </Typography>

                    </Box>


                    <Paper
                      elevation={0}
                      sx={{
                        p: {
                          xs: 2,
                          md: 2.5,
                        },

                        borderRadius: 3,

                        background:
                          "linear-gradient(135deg,#f8fafc,#f0f9ff)",

                        border:
                          "1px solid #dbeafe",
                      }}
                    >

                      <Typography
                        sx={{
                          fontFamily:
                            "Times New Roman, Times, serif",

                          fontSize: {
                            xs: 14,
                            md: 15,
                          },

                          color: "#334155",

                          lineHeight: 1.9,

                          whiteSpace:
                            "pre-wrap",

                          overflowWrap:
                            "anywhere",
                        }}
                      >
                        {answerMessage}
                      </Typography>

                    </Paper>

                  </Box>

                )}


                {/* -----------------------------------------
                    KNOWLEDGE STATUS
                ----------------------------------------- */}

                {knowledgeStatus && (

                  <Box mb={2}>

                    <Chip
                      size="small"

                      label={
                        knowledgeStatus ===
                        "found"
                          ? "Referensi ditemukan"
                          : knowledgeStatus ===
                            "not_found"
                            ? "Referensi tidak ditemukan"
                            : knowledgeStatus
                      }

                      color={
                        knowledgeStatus ===
                        "found"
                          ? "success"
                          : "default"
                      }

                      variant="outlined"
                    />

                  </Box>

                )}


                {/* -----------------------------------------
                    CONTEXT
                ----------------------------------------- */}

                {context.length > 0 && (

                  <Box mb={3}>

                    <Typography
                      fontSize={15}
                      fontWeight={800}
                      color="#0f172a"
                      mb={1.5}
                    >
                      Referensi Kitab
                    </Typography>


                    {context.map(
                      (
                        item: unknown,
                        index: number,
                      ) => {

                        const text =
                          typeof item ===
                          "string"
                            ? item
                            : JSON.stringify(
                                item,
                                null,
                                2,
                              );


                        return (

                          <Paper
                            key={index}
                            elevation={0}
                            sx={{
                              p: 2,

                              mb: 1,

                              borderRadius: 3,

                              border:
                                "1px solid #e2e8f0",

                              backgroundColor:
                                "#ffffff",
                            }}
                          >

                            <Typography
                              sx={{
                                fontFamily:
                                  "Times New Roman, Times, serif",

                                fontSize: {
                                  xs: 13,
                                  md: 14,
                                },

                                lineHeight: 1.8,

                                color:
                                  "#475569",

                                whiteSpace:
                                  "pre-wrap",

                                overflowWrap:
                                  "anywhere",
                              }}
                            >
                              {text}
                            </Typography>

                          </Paper>

                        );

                      },
                    )}

                  </Box>

                )}


                {/* -----------------------------------------
                    DATABASE RESULTS
                ----------------------------------------- */}

                {aiResults.length > 0 && (

                  <Box>

                    <Divider
                      sx={{
                        mb: 2,
                      }}
                    />


                    <Typography
                      fontSize={15}
                      fontWeight={800}
                      color="#0f172a"
                      mb={1.5}
                    >
                      Sumber Database
                    </Typography>


                    {aiResults.map(
                      (
                        item: any,
                        index: number,
                      ) => (

                        <Paper
                          key={
                            item.id ??
                            index
                          }

                          elevation={0}

                          sx={{
                            p: 2,

                            mb: 1,

                            borderRadius: 3,

                            border:
                              "1px solid #e2e8f0",

                            backgroundColor:
                              "#ffffff",

                            transition:
                              "all 0.2s ease",

                            "&:hover": {
                              borderColor:
                                "#bae6fd",

                              backgroundColor:
                                "#f8fcff",
                            },
                          }}
                        >

                          {/* --------------------------------
                              HEADER
                          -------------------------------- */}

                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            gap={2}
                            flexWrap="wrap"
                          >

                            <Box
                              minWidth={0}
                              flex={1}
                            >

                              <Typography
                                fontSize={14}
                                fontWeight={800}
                                color="#0b2a5b"
                              >
                                {item.kitab ||
                                  "Kitab"}
                              </Typography>


                              {item.bab && (

                                <Typography
                                  sx={{
                                    mt: 0.4,

                                    fontSize: 12.5,

                                    color:
                                      "#64748b",

                                    fontFamily:
                                      "Times New Roman, Times, serif",
                                  }}
                                >
                                  {item.bab}
                                </Typography>

                              )}

                            </Box>


                            {(
                              item.halaman ??
                              item.pdf_page
                            ) != null && (

                              <Chip
                                size="small"

                                label={
                                  `Hal. ${
                                    item.halaman ??
                                    item.pdf_page
                                  }`
                                }
                              />

                            )}

                          </Box>


                          {/* --------------------------------
                              ARAB ASLI
                          -------------------------------- */}

                          {item.arab && (

                            <Box
                              sx={{
                                mt: 1.5,

                                p: {
                                  xs: 1.5,
                                  md: 2,
                                },

                                borderRadius:
                                  2.5,

                                backgroundColor:
                                  "#f8fafc",

                                border:
                                  "1px solid #e2e8f0",
                              }}
                            >

                              <Typography
                                sx={{
                                  direction:
                                    "rtl",

                                  textAlign:
                                    "right",

                                  fontFamily:
                                    "'KFGQPC Uthman Taha','KFG Uthman Taha','Noto Naskh Arabic',serif",

                                  fontSize: {
                                    xs: 22,
                                    sm: 24,
                                    md: 27,
                                  },

                                  lineHeight:
                                    2.2,

                                  color:
                                    "#111827",

                                  whiteSpace:
                                    "pre-wrap",

                                  overflowWrap:
                                    "anywhere",
                                }}
                              >
                                {item.arab}
                              </Typography>

                            </Box>

                          )}


                          {/* --------------------------------
                              METADATA
                          -------------------------------- */}

                          <Box
                            sx={{
                              mt: 1.5,

                              display:
                                "flex",

                              gap: 1,

                              flexWrap:
                                "wrap",
                            }}
                          >

                            {item.kitab && (

                              <Chip
                                size="small"

                                label={
                                  `Kitab: ${item.kitab}`
                                }

                                variant="outlined"
                              />

                            )}


                            {item.bab && (

                              <Chip
                                size="small"

                                label={
                                  `Bab: ${item.bab}`
                                }

                                variant="outlined"
                              />

                            )}


                            {(
                              item.halaman ??
                              item.pdf_page
                            ) != null && (

                              <Chip
                                size="small"

                                label={
                                  `Halaman: ${
                                    item.halaman ??
                                    item.pdf_page
                                  }`
                                }

                                variant="outlined"
                              />

                            )}

                          </Box>


                          {/* --------------------------------
                              AI ACTIONS
                          -------------------------------- */}

                          {item.arab && (

                            <Box
                              sx={{
                                mt: 1.5,

                                display:
                                  "flex",

                                gap: 1,

                                flexWrap:
                                  "wrap",
                              }}
                            >

                              <Chip
                                icon={
                                  <Languages
                                    size={15}
                                  />
                                }

                                label={
                                  translationLoading &&
                                  selectedArab ===
                                    item.arab
                                    ? "Menerjemahkan..."
                                    : "Terjemahkan AI"
                                }

                                variant="outlined"

                                disabled={
                                  translationLoading ||
                                  explanationLoading
                                }

                                onClick={() =>
                                  handleTranslate(
                                    item.arab,
                                    item.kitab,
                                    item.bab,
                                  )
                                }

                                sx={{
                                  cursor:
                                    translationLoading ||
                                    explanationLoading
                                      ? "default"
                                      : "pointer",
                                }}
                              />


                              <Chip
                                icon={
                                  <Sparkles
                                    size={15}
                                  />
                                }

                                label={
                                  explanationLoading &&
                                  selectedArab ===
                                    item.arab
                                    ? "Menjelaskan..."
                                    : "Jelaskan AI"
                                }

                                variant="outlined"

                                disabled={
                                  translationLoading ||
                                  explanationLoading
                                }

                                onClick={() =>
                                  handleExplain(
                                    item.arab,
                                    item.kitab,
                                    item.bab,
                                  )
                                }

                                sx={{
                                  cursor:
                                    translationLoading ||
                                    explanationLoading
                                      ? "default"
                                      : "pointer",
                                }}
                              />

                            </Box>

                          )}


                          {/* --------------------------------
                              TERJEMAHAN DATABASE
                          -------------------------------- */}

                          {item.terjemah && (

                            <Box
                              mt={1.5}
                            >

                              <Typography
                                fontSize={12}
                                fontWeight={700}
                                color="#64748b"
                                mb={0.5}
                                sx={{
                                  fontFamily:
                                    "Times New Roman, Times, serif",
                                }}
                              >
                                Terjemahan
                              </Typography>


                              <Typography
                                sx={{
                                  fontFamily:
                                    "Times New Roman, Times, serif",

                                  fontSize:
                                    13.5,

                                  lineHeight:
                                    1.8,

                                  color:
                                    "#475569",

                                  whiteSpace:
                                    "pre-wrap",
                                }}
                              >
                                {item.terjemah}
                              </Typography>

                            </Box>

                          )}

                        </Paper>

                      ),
                    )}

                  </Box>

                )}


                {/* -----------------------------------------
                    TERJEMAHAN AI
                ----------------------------------------- */}

                {translation && (

                  <Box mb={3}>

                    <Typography
                      fontSize={15}
                      fontWeight={800}
                      color="#0f172a"
                      mb={1.5}
                      sx={{
                        fontFamily:
                          "Times New Roman, Times, serif",
                      }}
                    >
                      🇮🇩 Terjemahan AI
                    </Typography>


                    <Paper
                      elevation={0}
                      sx={{
                        p: {
                          xs: 2,
                          md: 2.5,
                        },

                        borderRadius: 3,

                        border:
                          "1px solid #dbeafe",

                        backgroundColor:
                          "#f8fafc",
                      }}
                    >

                      <Typography
                        sx={{
                          direction:
                            "rtl",

                          textAlign:
                            "right",

                          fontFamily:
                            "'KFGQPC Uthman Taha','KFG Uthman Taha','Noto Naskh Arabic',serif",

                          fontSize: {
                            xs: 20,
                            md: 24,
                          },

                          lineHeight:
                            2.1,

                          color:
                            "#111827",

                          whiteSpace:
                            "pre-wrap",

                          mb: 2,
                        }}
                      >
                        {translation.arab}
                      </Typography>


                      <Divider
                        sx={{
                          mb: 2,
                        }}
                      />


                      <Typography
                        sx={{
                          fontFamily:
                            "Times New Roman, Times, serif",

                          fontSize: {
                            xs: 15,
                            md: 16,
                          },

                          lineHeight:
                            2,

                          color:
                            "#334155",

                          whiteSpace:
                            "pre-wrap",

                          overflowWrap:
                            "anywhere",
                        }}
                      >
                        {translation.terjemah}
                      </Typography>


                      {(
                        translation.kitab ||
                        translation.bab
                      ) && (

                        <Box
                          sx={{
                            mt: 2,

                            display:
                              "flex",

                            gap: 1,

                            flexWrap:
                              "wrap",
                          }}
                        >

                          {translation.kitab && (

                            <Chip
                              size="small"

                              label={
                                `Kitab: ${translation.kitab}`
                              }

                              variant="outlined"
                            />

                          )}


                          {translation.bab && (

                            <Chip
                              size="small"

                              label={
                                `Bab: ${translation.bab}`
                              }

                              variant="outlined"
                            />

                          )}

                        </Box>

                      )}

                    </Paper>

                  </Box>

                )}


                {/* -----------------------------------------
                    PENJELASAN AI
                ----------------------------------------- */}

                {explanation && (

                  <Box mb={3}>

                    <Typography
                      fontSize={15}
                      fontWeight={800}
                      color="#0f172a"
                      mb={1.5}
                      sx={{
                        fontFamily:
                          "Times New Roman, Times, serif",
                      }}
                    >
                      💡 Penjelasan AI
                    </Typography>


                    <Paper
                      elevation={0}
                      sx={{
                        p: {
                          xs: 2,
                          md: 2.5,
                        },

                        borderRadius: 3,

                        border:
                          "1px solid #e2e8f0",

                        backgroundColor:
                          "#ffffff",
                      }}
                    >

                      <Typography
                        sx={{
                          direction:
                            "rtl",

                          textAlign:
                            "right",

                          fontFamily:
                            "'KFGQPC Uthman Taha','KFG Uthman Taha','Noto Naskh Arabic',serif",

                          fontSize: {
                            xs: 20,
                            md: 24,
                          },

                          lineHeight:
                            2.1,

                          color:
                            "#111827",

                          whiteSpace:
                            "pre-wrap",

                          mb: 2,
                        }}
                      >
                        {explanation.arab}
                      </Typography>


                      <Divider
                        sx={{
                          mb: 2,
                        }}
                      />


                      <Typography
                        sx={{
                          fontFamily:
                            "Times New Roman, Times, serif",

                          fontSize: {
                            xs: 15,
                            md: 16,
                          },

                          lineHeight:
                            2,

                          color:
                            "#334155",

                          whiteSpace:
                            "pre-wrap",

                          overflowWrap:
                            "anywhere",
                        }}
                      >
                        {explanation.penjelasan}
                      </Typography>


                      {(
                        explanation.kitab ||
                        explanation.bab
                      ) && (

                        <Box
                          sx={{
                            mt: 2,

                            display:
                              "flex",

                            gap: 1,

                            flexWrap:
                              "wrap",
                          }}
                        >

                          {explanation.kitab && (

                            <Chip
                              size="small"

                              label={
                                `Kitab: ${explanation.kitab}`
                              }

                              variant="outlined"
                            />

                          )}


                          {explanation.bab && (

                            <Chip
                              size="small"

                              label={
                                `Bab: ${explanation.bab}`
                              }

                              variant="outlined"
                            />

                          )}

                        </Box>

                      )}

                    </Paper>

                  </Box>

                )}


                {/* -----------------------------------------
                    AI LOADING
                ----------------------------------------- */}

                {(
                  translationLoading ||
                  explanationLoading
                ) && (

                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    mb={2}
                  >

                    <CircularProgress
                      size={18}
                    />


                    <Typography
                      sx={{
                        fontFamily:
                          "Times New Roman, Times, serif",

                        fontSize: 13,

                        color:
                          "#64748b",
                      }}
                    >
                      {translationLoading
                        ? "AI sedang menerjemahkan teks Arab..."
                        : "AI sedang menjelaskan teks kitab..."}
                    </Typography>

                  </Box>

                )}


                {/* -----------------------------------------
                    CLEAR
                ----------------------------------------- */}

                <Box
                  display="flex"
                  justifyContent="flex-end"
                  mt={2}
                >

                  <Chip
                    icon={
                      <RotateCcw
                        size={14}
                      />
                    }

                    label="Bersihkan"

                    variant="outlined"

                    onClick={
                      handleClear
                    }

                    sx={{
                      cursor:
                        "pointer",

                      fontFamily:
                        "Times New Roman, Times, serif",
                    }}
                  />

                </Box>

              </Box>

            )}

        </Box>


        {/* =================================================
            INPUT
        ================================================= */}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: {
              xs: 1.5,
              md: 2,
            },

            borderTop:
              "1px solid #e2e8f0",

            backgroundColor:
              "#ffffff",
          }}
        >

          <Box
            sx={{
              display: "flex",

              alignItems: "flex-end",

              gap: 1,

              width: "100%",

              maxWidth: 1000,

              mx: "auto",
            }}
          >

            <TextField
              fullWidth

              multiline

              maxRows={5}

              value={question}

              onChange={(
                event,
              ) =>
                setQuestion(
                  event.target.value,
                )
              }

              placeholder={
                "Tanyakan masalah fiqih atau cari ibarat kitab..."
              }

              disabled={
                aiLoading
              }

              sx={{
                "& .MuiOutlinedInput-root":
                  {

                    borderRadius: 3,

                    backgroundColor:
                      "#f8fafc",

                    fontFamily:
                      "Times New Roman, Times, serif",

                    fontSize: 14,

                    "& fieldset": {
                      borderColor:
                        "#e2e8f0",
                    },

                    "&:hover fieldset":
                      {
                        borderColor:
                          "#bae6fd",
                      },

                    "&.Mui-focused fieldset":
                      {
                        borderColor:
                          "#7dd3fc",
                      },

                  },
              }}
            />


            <IconButton
              type="submit"

              disabled={
                aiLoading ||
                !question.trim()
              }

              aria-label={
                "Kirim pertanyaan"
              }

              sx={{
                width: 50,

                height: 50,

                flexShrink: 0,

                borderRadius: 3,

                backgroundColor:
                  question.trim()
                    ? "#0b2a5b"
                    : "#e2e8f0",

                color:
                  question.trim()
                    ? "#ffffff"
                    : "#94a3b8",

                "&:hover": {
                  backgroundColor:
                    "#123d7a",
                },

                "&.Mui-disabled": {
                  backgroundColor:
                    "#e2e8f0",

                  color:
                    "#94a3b8",
                },
              }}
            >

              {aiLoading ? (

                <CircularProgress
                  size={21}
                  color="inherit"
                />

              ) : (

                <Send
                  size={20}
                />

              )}

            </IconButton>

          </Box>


          <Typography
            sx={{
              mt: 1,

              textAlign: "center",

              fontFamily:
                "Times New Roman, Times, serif",

              fontSize: 11,

              color: "#94a3b8",
            }}
          >
            Jawaban Kitab Kuning menggunakan
            referensi yang tersedia di database
            KasirAI.
          </Typography>

        </Box>

      </Paper>

    </Box>
  );
}