import re
import sys
import subprocess
from pathlib import Path


# ============================================================
# KASIRAI - AUTOMATIC DATA INTEGRITY TEST RUNNER
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

TEST_PATTERN = re.compile(
    r"^test_data_integrity_(\d+)([a-z]+)\.py$",
    re.IGNORECASE,
)


def test_sort_key(path: Path):
    """
    Urutan:
    30A
    30B
    ...
    30Z
    31A
    31B
    ...
    """

    match = TEST_PATTERN.match(path.name)

    if not match:
        return (
            999999,
            "",
        )

    nomor = int(match.group(1))
    huruf = match.group(2).lower()

    return (
        nomor,
        huruf,
    )


def cari_semua_test():
    tests = []

    for file in BASE_DIR.glob(
        "test_data_integrity_*.py"
    ):
        if TEST_PATTERN.match(file.name):
            tests.append(file)

    tests.sort(
        key=test_sort_key
    )

    return tests


def jalankan_test(test_file: Path, index: int, total: int):

    nama = test_file.stem.replace(
        "test_data_integrity_",
        "",
    ).upper()

    print()
    print("=" * 80)
    print(
        f"[{index}/{total}] MENJALANKAN TEST {nama}"
    )
    print(
        f"FILE : {test_file.name}"
    )
    print("=" * 80)

    command = [
        sys.executable,
        "-m",
        "pytest",
        "-v",
        "-s",
        test_file.name,
    ]

    hasil = subprocess.run(
        command,
        cwd=BASE_DIR,
    )

    if hasil.returncode == 0:

        print()
        print(
            f"✅ TEST {nama} PASS"
        )

        return True

    print()
    print(
        f"❌ TEST {nama} FAIL"
    )

    print()
    print(
        "AUTO RUNNER DIHENTIKAN."
    )

    print(
        f"Perbaiki TEST {nama} terlebih dahulu."
    )

    return False


def main():

    print()
    print("=" * 80)
    print(
        "KASIRAI - AUTOMATIC DATA INTEGRITY TEST"
    )
    print("=" * 80)

    tests = cari_semua_test()

    if not tests:

        print()
        print(
            "❌ Tidak ditemukan test_data_integrity_*.py"
        )

        return 1

    print()
    print(
        f"TOTAL TEST TERDETEKSI : {len(tests)}"
    )

    print()
    print(
        "URUTAN TEST:"
    )

    for i, test in enumerate(
        tests,
        start=1,
    ):

        nama = test.stem.replace(
            "test_data_integrity_",
            "",
        ).upper()

        print(
            f"{i:03d}. TEST {nama}"
        )

    print()
    print(
        "=" * 80
    )

    passed = 0

    for index, test_file in enumerate(
        tests,
        start=1,
    ):

        berhasil = jalankan_test(
            test_file,
            index,
            len(tests),
        )

        if not berhasil:

            print()
            print("=" * 80)
            print(
                "❌ AUTO TEST DIHENTIKAN"
            )
            print("=" * 80)

            print()
            print(
                f"PASS SEBELUMNYA : {passed}"
            )

            print(
                f"GAGAL PADA      : TEST "
                f"{test_file.stem.replace('test_data_integrity_', '').upper()}"
            )

            print()

            return 1

        passed += 1

    print()
    print("=" * 80)
    print(
        "🎉 SEMUA TEST BERHASIL"
    )
    print("=" * 80)

    print()
    print(
        f"TOTAL : {len(tests)}"
    )

    print(
        f"PASS  : {passed}"
    )

    print(
        "FAIL  : 0"
    )

    print()

    return 0


if __name__ == "__main__":
    raise SystemExit(
        main()
    )