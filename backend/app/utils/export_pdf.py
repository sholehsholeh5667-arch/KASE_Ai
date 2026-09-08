"""
Export PDF
==========

Utility untuk membuat laporan PDF.
"""

from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
)


class PDFExporter:
    """
    Export laporan ke PDF.
    """

    def __init__(self):

        self.styles = getSampleStyleSheet()

    # ==================================================
    # Export
    # ==================================================

    def export(
        self,
        title: str,
        headers: list,
        rows: list
    ):
        """
        Membuat file PDF.
        """

        buffer = BytesIO()

        document = SimpleDocTemplate(
            buffer,
            pagesize=A4
        )

        elements = []

        elements.append(
            Paragraph(
                title,
                self.styles["Heading1"]
            )
        )

        table_data = [headers]

        for row in rows:
            table_data.append(row)

        table = Table(table_data)

        table.setStyle(
            TableStyle(
                [

                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, 0),
                        colors.darkblue
                    ),

                    (
                        "TEXTCOLOR",
                        (0, 0),
                        (-1, 0),
                        colors.white
                    ),

                    (
                        "GRID",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        colors.grey
                    ),

                    (
                        "ALIGN",
                        (0, 0),
                        (-1, -1),
                        "CENTER"
                    ),

                    (
                        "FONTNAME",
                        (0, 0),
                        (-1, 0),
                        "Helvetica-Bold"
                    ),

                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, 0),
                        10
                    ),

                    (
                        "BACKGROUND",
                        (0, 1),
                        (-1, -1),
                        colors.beige
                    ),
                ]
            )
        )

        elements.append(table)

        document.build(elements)

        pdf = buffer.getvalue()

        buffer.close()

        return pdf