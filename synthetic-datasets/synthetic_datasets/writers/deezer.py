import random
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font
from tqdm import tqdm

from ..models.deezer import DeezerListeningHistoryRecord


class DeezerWriter:
    """
    Writer for Deezer listening history data.
    Generates Excel file matching Deezer's export: "deezer-data_{user_id}.xlsx"
    with sheet "10_listeningHistory"
    """

    def __init__(self, output_dir: Path) -> None:
        folder = output_dir / "deezer"
        # Generate random user ID (Deezer uses numeric IDs)
        user_id = random.randint(1000000000, 9999999999)
        self.xlsx_path = folder / f"deezer-data_{user_id}.xlsx"

    def write(self, records: list[DeezerListeningHistoryRecord]):
        """Write records to Excel file with sheet "10_listeningHistory" """
        print(f"Write `xlsx` file: status: `starting`, path: `{self.xlsx_path}`, count_records: `{len(records)}`")

        self.xlsx_path.parent.mkdir(parents=True, exist_ok=True)

        # Create workbook and worksheet
        wb = Workbook()
        ws = wb.active
        ws.title = "10_listeningHistory"

        # Headers matching Deezer export format
        headers = [
            "Song Title",
            "Artist",
            "ISRC",
            "Album Title",
            "IP Address",
            "Listening Time",
            "Platform Name",
            "Platform Model",
            "Date",
        ]

        # Write headers with formatting
        for col_num, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col_num, value=header)
            cell.font = Font(bold=True)
            cell.alignment = Alignment(horizontal="left")

        # Write data rows
        for row_num, record in enumerate(tqdm(records, desc=f"📦 Writing {self.xlsx_path.name}", unit=" records"), 2):
            ws.cell(row=row_num, column=1, value=record.song_title)
            ws.cell(row=row_num, column=2, value=record.artist)
            ws.cell(row=row_num, column=3, value=record.isrc)
            ws.cell(row=row_num, column=4, value=record.album_title)
            ws.cell(row=row_num, column=5, value=record.serialize_ip(record.ip_address))
            ws.cell(row=row_num, column=6, value=record.listening_time)
            ws.cell(row=row_num, column=7, value=record.platform_name)
            ws.cell(row=row_num, column=8, value=record.platform_model)
            ws.cell(row=row_num, column=9, value=record.serialize_date(record.date))

        # Auto-adjust column widths
        for column in ws.columns:
            max_length = 0
            column_letter = column[0].column_letter
            for cell in column:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except (TypeError, AttributeError):
                    pass
            adjusted_width = min(max_length + 2, 50)  # Max width of 50
            ws.column_dimensions[column_letter].width = adjusted_width

        # Save workbook
        wb.save(self.xlsx_path)

        print(f"Write `xlsx` file: status: `success`, path: `{self.xlsx_path}`")
