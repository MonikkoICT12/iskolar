#!/usr/bin/env python3
"""
Generate a clean, accurate, idempotent, schema-adaptive Supabase PostgreSQL
import script (`supabase-import-scholars.sql`) and audit report
(`import-audit-report.md`) from `LGU-ISKO-1st SEMESTER 2026-2027.xlsx`.

Key guarantees:
  - One unique record per scholar (multi-term grades merged into grades[] JSONB
    and public.scholar_grades), preventing Dashboard & Graduates double-counting.
  - Dynamic Filipino compound-surname parsing, 30 canonical schools, ~41 canonical
    courses, 20 official barangays, dual GWA (1.00-5.00) + percentage (50-100) scale.
  - Excludes 'no eligible' and 'cancelled by student' rows.
  - Payment status for 2026-2027 derived from `statement 1st26-27` billing sheets;
    completed 2024-2026 terms marked 'Paid'.
"""

from __future__ import annotations

import colorsys
import difflib
import json
import re
import sys
import unicodedata
import zipfile
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

ROOT_DIR = Path(__file__).resolve().parent.parent
XLSX_PATH = ROOT_DIR / "LGU-ISKO-1st SEMESTER 2026-2027.xlsx"
SQL_OUT_PATH = ROOT_DIR / "supabase-import-scholars.sql"
AUDIT_OUT_PATH = ROOT_DIR / "import-audit-report.md"

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
RNS = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
ANS = "{http://schemas.openxmlformats.org/drawingml/2006/main}"

OFFICIAL_BARANGAYS = [
    "Atate",
    "Aulo",
    "Bagong Buhay",
    "Caballero",
    "Caimito",
    "Doña Josefa",
    "Ganaderia",
    "Imelda Valley",
    "Langka",
    "Malate",
    "Maligaya",
    "Manacnac",
    "Mapait",
    "Marcos Village",
    "Militar",
    "Popolon",
    "Santolan",
    "Sapang Buho",
    "Singalat",
    "Other",
]

VALID_SUFFIXES = ("None", "Jr.", "Sr.", "II", "III", "IV", "V")
VALID_YEAR_LEVELS = ("1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "6th Year")
VALID_SEMESTERS = ("1st Sem", "2nd Sem", "3rd Sem", "Summer")

COMPOUND_3_PREFIXES = {("de", "la"), ("de", "los"), ("de", "las")}
COMPOUND_2_PREFIXES = {"de", "del", "dela", "delos", "delas", "san", "santa", "sta", "santo", "sto"}

SCHOOL_CANONICAL_MAP = {
    "araullo university": "Araullo University",
    "aruallo university": "Araullo University",
    "wesleyan university philippines": "Wesleyan University-Philippines",
    "wesleyan university": "Wesleyan University-Philippines",
    "wesleyan university phils.": "Wesleyan University-Philippines",
    "wesleyan university phils": "Wesleyan University-Philippines",
    "wesleyan university pils.": "Wesleyan University-Philippines",
    "wesleyan university phis.": "Wesleyan University-Philippines",
    "wesleyan university-philippines": "Wesleyan University-Philippines",
    "wesleyan univewrsity": "Wesleyan University-Philippines",
    "wesleya univerisity": "Wesleyan University-Philippines",
    "weswleyan university philippines": "Wesleyan University-Philippines",
    "wesleyan": "Wesleyan University-Philippines",
    "wes": "Wesleyan University-Philippines",
    "good samaritan colleges": "Good Samaritan Colleges",
    "good samaritan college": "Good Samaritan Colleges",
    "dr. gloria d. lacson colleges": "Dr. Gloria D. Lacson Foundation Colleges",
    "dr. gloria d. lacson": "Dr. Gloria D. Lacson Foundation Colleges",
    "dr. gloria lacson colleges": "Dr. Gloria D. Lacson Foundation Colleges",
    "dr. gloria lacson foundation colleges": "Dr. Gloria D. Lacson Foundation Colleges",
    "midway colleges inc": "Midway Colleges Inc.",
    "midway college inc.": "Midway Colleges Inc.",
    "midway colleges": "Midway Colleges Inc.",
    "midway colleges inc.": "Midway Colleges Inc.",
    "midway collegs inc.": "Midway Colleges Inc.",
    "manuel v. gallego foundation colleges": "Manuel V. Gallego Foundation Colleges",
    "manuel v. gallego colleges": "Manuel V. Gallego Foundation Colleges",
    "manuel gallego colleges": "Manuel V. Gallego Foundation Colleges",
    "mv gallego colleges": "Manuel V. Gallego Foundation Colleges",
    "college for research and technology": "College for Research and Technology",
    "college for research of technology": "College for Research and Technology",
    "crt": "College for Research and Technology",
    "our lady of fatima university": "Our Lady of Fatima University",
    "fatima": "Our Lady of Fatima University",
    "nueva ecija doctors": "Nueva Ecija Doctors College",
    "nueva ecija doctors college": "Nueva Ecija Doctors College",
    "saint louis university": "Saint Louis University",
    "saint louis univewrsity": "Saint Louis University",
    "national university": "National University",
    "university of baguio": "University of Baguio",
    "university of cordilleras": "University of the Cordilleras",
    "university of cordillera": "University of the Cordilleras",
    "abe international college": "ABE International Business College",
    "abe international business college": "ABE International Business College",
    "abe": "ABE International Business College",
    "living water essential colleges": "Living Water Essential Colleges",
    "living water essential school inc.": "Living Water Essential Colleges",
    "living watter colleges": "Living Water Essential Colleges",
    "living water": "Living Water Essential Colleges",
    "centro escolar university": "Centro Escolar University",
    "cnetro escolar university": "Centro Escolar University",
    "centro escolar": "Centro Escolar University",
    "acatech aviation college": "ACATECH Aviation College",
    "acatech": "ACATECH Aviation College",
    "asia pacific college business and arts": "Asia Pacific College of Business and Arts",
    "baliwag maritime academy": "Baliwag Maritime Academy",
    "holy cross college": "Holy Cross College",
    "sti-college ortigas cainta": "STI College Ortigas-Cainta",
    "ama colleges": "AMA Computer College",
    "feu": "Far Eastern University",
    "fine city colleges": "Fine City Colleges",
    "harries memorial college": "Harris Memorial College",
    "st. elizabeth global skills institute inc": "St. Elizabeth Global Skills Institute Inc.",
}

COURSE_CANONICAL_MAP = {
    "nursing": "BS Nursing",
    "bs-nursing": "BS Nursing",
    "bs nursing": "BS Nursing",
    "bsn": "BS Nursing",
    "bacherlor of science nursing": "BS Nursing",
    "criminology": "BS Criminology",
    "bs-criminology": "BS Criminology",
    "crminology": "BS Criminology",
    "criminolgy": "BS Criminology",
    "criminologyu": "BS Criminology",
    "accountancy": "BS Accountancy",
    "bs-accountancy": "BS Accountancy",
    "accounting information system": "BS Accounting Information System",
    "management accounting": "BS Management Accounting",
    "maangement acctg": "BS Management Accounting",
    "information technology": "BS Information Technology",
    "bsit": "BS Information Technology",
    "computer science": "BS Computer Science",
    "bs-computer engineering": "BS Computer Engineering",
    "associate in computer technology": "Associate in Computer Technology",
    "elementary education": "Bachelor of Elementary Education",
    "elementary educaton": "Bachelor of Elementary Education",
    "bseed": "Bachelor of Elementary Education",
    "secondary education": "Bachelor of Secondary Education",
    "bsed major in english": "BSEd Major in English",
    "early chilhood": "Bachelor of Early Childhood Education",
    "beced": "Bachelor of Early Childhood Education",
    "physival education": "Bachelor of Physical Education",
    "teacher education": "Bachelor of Teacher Education",
    "bs-vocational teacher educ.": "Bachelor of Technical-Vocational Teacher Education",
    "hospitality management": "BS Hospitality Management",
    "bshm": "BS Hospitality Management",
    "bs hospitality management": "BS Hospitality Management",
    "hotel & restaurant management": "BS Hospitality Management",
    "hotel and restaurant management": "BS Hospitality Management",
    "hotel and res. management": "BS Hospitality Management",
    "bshrm": "BS Hospitality Management",
    "tourism management": "BS Tourism Management",
    "tourism": "BS Tourism Management",
    "bs-tourism management": "BS Tourism Management",
    "business administration": "BS Business Administration",
    "bsba": "BS Business Administration",
    "human resource management": "BS Human Resource Management",
    "entrepreneurship": "BS Entrepreneurship",
    "custom administration": "BS Customs Administration",
    "social work": "BS Social Work",
    "bs-social work": "BS Social Work",
    "psychology": "BS Psychology",
    "political science": "BA Political Science",
    "medical technology": "BS Medical Technology",
    "bs-medtech": "BS Medical Technology",
    "medical laboratory science": "BS Medical Laboratory Science",
    "medcal laboratory": "BS Medical Laboratory Science",
    "medical biology": "BS Medical Biology",
    "radiologic technology": "BS Radiologic Technology",
    "radiologic technolgy": "BS Radiologic Technology",
    "bs radiologic technology": "BS Radiologic Technology",
    "radtech": "BS Radiologic Technology",
    "respiratory therapy": "BS Respiratory Therapy",
    "respiratory theraphy": "BS Respiratory Therapy",
    "respirstory theraphy": "BS Respiratory Therapy",
    "respiratoy theraphy": "BS Respiratory Therapy",
    "respiratory": "BS Respiratory Therapy",
    "physical therapist": "BS Physical Therapy",
    "pharmacy": "BS Pharmacy",
    "bs-pharmacy": "BS Pharmacy",
    "pharmacist": "BS Pharmacy",
    "midwifery": "BS Midwifery",
    "dentistry": "Doctor of Dental Medicine",
    "dental medicine": "Doctor of Dental Medicine",
    "marine transportation": "BS Marine Transportation",
    "marine trasportation": "BS Marine Transportation",
    "marine transporation": "BS Marine Transportation",
    "marine transporatation": "BS Marine Transportation",
    "marine engineering": "BS Marine Engineering",
    "marine engeenering": "BS Marine Engineering",
    "civil engineering": "BS Civil Engineering",
    "bs-civil engineering": "BS Civil Engineering",
    "electrical engineering": "BS Electrical Engineering",
    "electrica engineering": "BS Electrical Engineering",
    "mechanical engineering": "BS Mechanical Engineering",
    "architecture": "BS Architecture",
    "aircraft maintenance technology": "BS Aircraft Maintenance Technology",
    "amt": "BS Aircraft Maintenance Technology",
}

FEMALE_NAME_HINTS = {
    "april joy", "avril anne joy", "erwina", "marielle", "marjorie", "ashley",
    "kristine", "princess", "kriszel", "ma. lorraine", "maria lorriane",
    "jasmin", "jasmine", "anne", "anna", "maria", "rica", "regine", "rose",
    "shady", "kayla", "alliya", "megan", "flora", "lyka", "cherlie", "judy",
    "ronachelle", "ailen", "aiza", "jel", "maila",
}
MALE_NAME_HINTS = {
    "jayson", "jake aldrich", "john", "mark", "joshua", "michael", "paulo",
    "ken", "kent", "arvin", "denver", "kenjie", "emmanuel", "ralph", "benito",
    "neptali", "romiebert", "elly jay", "mervin", "rusfel", "aljon", "meinrad",
    "dhan rovic", "charlie", "erlonn", "renzen", "moises",
}


def norm_space(val: str) -> str:
    return re.sub(r"\s+", " ", (val or "").strip())


def norm_key(val: str) -> str:
    return norm_space(val).lower()


def norm_brgy_key(val: str) -> str:
    s = unicodedata.normalize("NFD", norm_key(val))
    s = re.sub(r"[\u0300-\u036f]", "", s)
    return norm_space(s)


OFFICIAL_BRGY_LOOKUP = {norm_brgy_key(b): b for b in OFFICIAL_BARANGAYS}
OFFICIAL_BRGY_LOOKUP["mapaet"] = "Mapait"
OFFICIAL_BRGY_LOOKUP["saingalat"] = "Singalat"
OFFICIAL_BRGY_LOOKUP["dona josefa"] = "Doña Josefa"


def apply_tint(hex_rgb: str, tint: float) -> str:
    r = int(hex_rgb[0:2], 16) / 255.0
    g = int(hex_rgb[2:4], 16) / 255.0
    b = int(hex_rgb[4:6], 16) / 255.0
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    if tint < 0:
        l = l * (1.0 + tint)
    else:
        l = l * (1.0 - tint) + tint
    l = max(0.0, min(1.0, l))
    r2, g2, b2 = colorsys.hls_to_rgb(h, l, s)
    return f"#{int(round(r2 * 255)):02X}{int(round(g2 * 255)):02X}{int(round(b2 * 255)):02X}"


def load_workbook_sheets(
    xlsx_path: Path, sheet_max_rows: dict[str, int]
) -> dict[str, list[tuple[int, dict[str, str], dict[str, str]]]]:
    """Stream-parse requested sheets up to each sheet's max_row."""
    result: dict[str, list[tuple[int, dict[str, str], dict[str, str]]]] = {}

    with zipfile.ZipFile(xlsx_path) as z:
        troot = ET.parse(z.open("xl/theme/theme1.xml")).getroot()
        clr_map: dict[str, str] = {}
        clr_scheme = troot.find(f".//{ANS}clrScheme")
        if clr_scheme is not None:
            for ch in clr_scheme:
                tag = ch.tag.split("}")[-1]
                sub = list(ch)[0]
                clr_map[tag] = sub.attrib.get("lastClr") or sub.attrib.get("val") or "FFFFFF"
        theme_idx = [
            clr_map.get("lt1", "FFFFFF"),
            clr_map.get("dk1", "000000"),
            clr_map.get("lt2", "E7E6E6"),
            clr_map.get("dk2", "44546A"),
            clr_map.get("accent1", "4472C4"),
            clr_map.get("accent2", "ED7D31"),
            clr_map.get("accent3", "A5A5A5"),
            clr_map.get("accent4", "FFC000"),
            clr_map.get("accent5", "5B9BD5"),
            clr_map.get("accent6", "70AD47"),
            clr_map.get("hlink", "0563C1"),
            clr_map.get("folHlink", "954F72"),
        ]

        sst: list[str] = []
        if "xl/sharedStrings.xml" in z.namelist():
            with z.open("xl/sharedStrings.xml") as f:
                for _, elem in ET.iterparse(f, events=("end",)):
                    if elem.tag == NS + "si":
                        sst.append("".join(t.text or "" for t in elem.iter(NS + "t")))
                        elem.clear()

        fills: list[str] = []
        xfs: list[int] = []
        with z.open("xl/styles.xml") as f:
            sroot = ET.parse(f).getroot()
            for fill in sroot.findall(f"{NS}fills/{NS}fill"):
                pf = fill.find(f"{NS}patternFill")
                if pf is None or pf.attrib.get("patternType") in (None, "none"):
                    fills.append("NONE")
                else:
                    fg_el = pf.find(f"{NS}fgColor")
                    if fg_el is None:
                        fills.append("NONE")
                    elif "rgb" in fg_el.attrib:
                        rgb = fg_el.attrib["rgb"].upper()
                        fills.append("#" + (rgb[2:] if len(rgb) == 8 else rgb))
                    elif "theme" in fg_el.attrib:
                        th = int(fg_el.attrib["theme"])
                        tint = float(fg_el.attrib.get("tint", "0"))
                        base = theme_idx[th] if th < len(theme_idx) else "FFFFFF"
                        fills.append(apply_tint(base, tint))
                    else:
                        fills.append("NONE")
            for xf in sroot.findall(f"{NS}cellXfs/{NS}xf"):
                xfs.append(int(xf.attrib.get("fillId", 0)))

        rels = {
            rel.attrib["Id"]: rel.attrib["Target"]
            for rel in ET.parse(z.open("xl/_rels/workbook.xml.rels")).getroot()
        }
        sheets: dict[str, str] = {}
        for sh in ET.parse(z.open("xl/workbook.xml")).getroot().iter(NS + "sheet"):
            tgt = rels[sh.attrib[RNS + "id"]].lstrip("/")
            if not tgt.startswith("xl/"):
                tgt = "xl/" + tgt
            sheets[sh.attrib["name"]] = tgt

        for sname, max_row in sheet_max_rows.items():
            if sname not in sheets:
                raise RuntimeError(f"Missing expected sheet {sname!r} in {xlsx_path}")
            rows: list[tuple[int, dict[str, str], dict[str, str]]] = []
            with z.open(sheets[sname]) as f:
                for _, elem in ET.iterparse(f, events=("end",)):
                    if elem.tag == NS + "row":
                        rnum = int(elem.attrib.get("r", 0))
                        if rnum > max_row:
                            elem.clear()
                            break
                        rv: dict[str, str] = {}
                        rf: dict[str, str] = {}
                        for c in elem:
                            if c.tag != NS + "c":
                                continue
                            t = c.attrib.get("t")
                            ref = c.attrib.get("r", "")
                            s_idx = int(c.attrib.get("s", 0))
                            val: Any = None
                            if t == "inlineStr":
                                val = "".join(x.text or "" for x in c.iter(NS + "t"))
                            else:
                                v_el = c.find(NS + "v")
                                if v_el is not None and v_el.text is not None:
                                    raw = v_el.text
                                    if t == "s":
                                        si = int(raw)
                                        val = sst[si] if si < len(sst) else ""
                                    elif t == "b":
                                        val = "1" if raw == "1" else "0"
                                    else:
                                        val = raw
                            if val is not None and str(val).strip() != "":
                                m = re.match(r"^([A-Z]+)", ref)
                                if m:
                                    col = m.group(1)
                                    rv[col] = str(val).strip()
                                    rf[col] = fills[xfs[s_idx]] if s_idx < len(xfs) else "NONE"
                        if rv:
                            rows.append((rnum, rv, rf))
                        elem.clear()
            result[sname] = rows

    return result


def smart_title_word(word: str, is_surname_part: bool = False) -> str:
    if not word:
        return word
    if re.fullmatch(r"(II|III|IV|V)", word, re.I):
        return word.upper()
    if re.fullmatch(r"[A-Za-z]\.?", word):
        return word[0].upper() + ("." if word.endswith(".") else "")
    if word.lower() in ("ma.", "ma"):
        return "Ma." if word.endswith(".") else "Ma"
    if word.lower() in ("de", "la", "los", "las", "del", "da") and is_surname_part:
        return word.capitalize()
    if "-" in word:
        parts = word.split("-")
        return "-".join(smart_title_word(p, is_surname_part=is_surname_part) for p in parts if p != "")
    if word.isupper() or word.islower():
        if word.lower().startswith("mc") and len(word) > 2:
            return "Mc" + word[2:].capitalize()
        return word.capitalize()
    return word


def normalize_person_name_case(tokens: list[str], is_surname: bool = False) -> str:
    return " ".join(smart_title_word(t, is_surname_part=is_surname) for t in tokens if t)


def extract_clean_name_and_remarks(raw_name: str) -> tuple[str, str, str, str, str, list[str]]:
    """
    Parse combined full name into (first_name, middle_name, last_name, suffix, inline_remark, flags).
    Applies general Filipino compound-surname rules.
    """
    flags: list[str] = []
    remarks: list[str] = []
    s = norm_space(raw_name)

    if re.search(r"\+[A-Z]+\d+:[A-Z]+\d+", s):
        s = norm_space(re.sub(r"\+[A-Z]+\d+:[A-Z]+\d+", "", s))
        flags.append("Stripped accidental cell-range paste from name")

    for m in re.finditer(r"\(([^)]+)\)", s):
        remarks.append(m.group(1).strip())
    s = norm_space(re.sub(r"\([^)]*\)", "", s))

    if "Ken- Kineth" in s:
        s = s.replace("Ken- Kineth", "Ken Kineth")
        flags.append("Normalized stray hyphen in 'Ken- Kineth'")

    remark_patterns = [
        r"\s*-\s*pipunta\s+mayor\b",
        r"\s*-\s*kasama\s+si\s+mayor\b",
        r"\s*-\s*mayor\b",
        r"\s*-\s*no\s+eligible\b",
        r"\s*-\s*magkapatid\b",
        r"\s*-\s*new\b",
        r"\s*-\s*2nd\s+24-25\b",
        r"(?<!-)\s+2nd\s+24-25\b",
    ]
    for pat in remark_patterns:
        m = re.search(pat, s, flags=re.I)
        if m:
            rem = m.group(0).strip(" -")
            if rem:
                remarks.append(rem)
            s = norm_space(s[: m.start()] + " " + s[m.end() :])

    s = s.strip(" -,")
    tokens = s.split()

    suffix = "None"
    cleaned_tokens: list[str] = []
    suffix_map = {
        "jr": "Jr.",
        "jr.": "Jr.",
        "sr": "Sr.",
        "sr.": "Sr.",
        "ii": "II",
        "iii": "III",
        "iv": "IV",
        "v": "V",
    }
    for tok in tokens:
        low = tok.lower().rstrip(",")
        if low in suffix_map and suffix == "None" and len(cleaned_tokens) >= 1:
            suffix = suffix_map[low]
        else:
            cleaned_tokens.append(tok.rstrip(","))

    if len(cleaned_tokens) < 2:
        first_name = normalize_person_name_case(cleaned_tokens)
        last_name = first_name or "Unknown"
        flags.append(f"Single-token name fallback for {raw_name!r}")
        return first_name, "", last_name, suffix, "; ".join(remarks), flags

    # Dynamic Filipino compound surname detection
    lower_tokens = [re.sub(r"[.,]+$", "", t.lower()) for t in cleaned_tokens]
    last_len = 1
    if len(cleaned_tokens) >= 4 and (lower_tokens[-3], lower_tokens[-2]) in COMPOUND_3_PREFIXES:
        last_len = 3
    elif len(cleaned_tokens) >= 3 and lower_tokens[-2] in COMPOUND_2_PREFIXES:
        last_len = 2

    last_tokens = cleaned_tokens[-last_len:]
    rest_tokens = cleaned_tokens[:-last_len]

    middle_name = ""
    if len(rest_tokens) >= 2 and re.fullmatch(r"[A-Za-z]\.?", rest_tokens[-1]):
        middle_name = rest_tokens[-1].rstrip(".").upper() + "."
        first_tokens = rest_tokens[:-1]
    else:
        first_tokens = rest_tokens

    first_name = normalize_person_name_case(first_tokens, is_surname=False)
    last_name = normalize_person_name_case(last_tokens, is_surname=True)
    return first_name, middle_name, last_name, suffix, "; ".join(remarks), flags


def canonical_name_key(raw_name: str) -> str:
    first, mid, last, suf, _, _ = extract_clean_name_and_remarks(raw_name)
    parts = [first, mid.rstrip("."), last, "" if suf == "None" else suf.rstrip(".")]
    return norm_key(" ".join(p for p in parts if p))


def canonicalize_school(raw_school: str, clean_full_name: str) -> tuple[str, list[str], list[str]]:
    remarks: list[str] = []
    flags: list[str] = []
    s = norm_space(raw_school)
    low = s.lower()
    nm_low = clean_full_name.lower()

    if not s:
        if "christine mae" in nm_low and "sabado" in nm_low:
            flags.append("Recovered blank school 'Wesleyan University-Philippines' from statement 1st26-27 R1218")
            return "Wesleyan University-Philippines", remarks, flags
        if "mark gabriel ruzo" in nm_low:
            flags.append("Recovered blank school 'Good Samaritan Colleges' from 1stSem 2026-2027 R461")
            return "Good Samaritan Colleges", remarks, flags
        flags.append("Blank school -> set 'To Be Verified'")
        return "To Be Verified", ["School missing in source"], flags

    if low == "ds":
        flags.append("Ambiguous school code 'ds' -> set 'To Be Verified (ds)'")
        return "To Be Verified (ds)", ["Raw school in Excel was 'ds'"], flags
    if low == "transfer to neust":
        remarks.append("transfer to neust")
        flags.append("Mapped 'transfer to neust' -> 'Nueva Ecija University of Science and Technology'")
        return "Nueva Ecija University of Science and Technology", remarks, flags

    if low in SCHOOL_CANONICAL_MAP:
        return SCHOOL_CANONICAL_MAP[low], remarks, flags

    flags.append(f"Unmapped school kept as raw: {s!r}")
    return s, remarks, flags


def canonicalize_course(raw_course: str, canonical_school: str) -> tuple[str | None, list[str]]:
    flags: list[str] = []
    s = norm_space(raw_course)
    if not s:
        flags.append("Empty course -> NULL")
        return None, flags
    low = s.lower()
    if low == "bsmt":
        if "midway" in canonical_school.lower() or "maritime" in canonical_school.lower():
            return "BS Marine Transportation", flags
        return "BS Medical Technology", flags
    if low in COURSE_CANONICAL_MAP:
        return COURSE_CANONICAL_MAP[low], flags
    flags.append(f"Unmapped course kept as raw: {s!r}")
    return s, flags


def normalize_barangay(raw_brgy: str) -> tuple[str, list[str]]:
    flags: list[str] = []
    s = norm_space(raw_brgy)
    if not s:
        flags.append("Missing barangay -> set 'Other'")
        return "Other", flags
    k = norm_brgy_key(s)
    if k in OFFICIAL_BRGY_LOOKUP:
        canonical = OFFICIAL_BRGY_LOOKUP[k]
        if s.lower() in ("mapaet", "saingalat"):
            flags.append(f"Fixed barangay typo {s!r} -> {canonical!r}")
        return canonical, flags
    flags.append(f"Non-official barangay {s!r} -> set 'Other'")
    return "Other", flags


def parse_year_and_semester(raw_year: str, col_n: str, col_o: str, default_sem: str) -> tuple[str, str, list[str]]:
    flags: list[str] = []
    yr_raw = norm_space(raw_year)
    yl_low = yr_raw.lower()
    sem_hint = " ".join([yr_raw, col_n or "", col_o or ""]).lower()
    if re.search(r"3rd\s*(sem|term)", sem_hint):
        semester = "3rd Sem"
    elif re.search(r"1st\s*(sem|term)", sem_hint):
        semester = "1st Sem"
    elif re.search(r"2nd\s*(sem|term)", sem_hint):
        semester = "2nd Sem"
    else:
        semester = default_sem

    if re.search(r"(^|\b)(!st|1st|1)\b", yl_low):
        year_level = "1st Year"
    elif re.search(r"(^|\b)(2nd|2ndyr|2)\b", yl_low):
        year_level = "2nd Year"
    elif re.search(r"(^|\b)(3rd|3)\b", yl_low):
        year_level = "3rd Year"
    elif re.search(r"(^|\b)(4th|4)\b", yl_low):
        year_level = "4th Year"
    elif re.search(r"(^|\b)(5th|5)\b", yl_low):
        year_level = "5th Year"
    elif re.search(r"(^|\b)(6th|6)\b", yl_low):
        year_level = "6th Year"
    else:
        year_level = "1st Year"
        flags.append(f"Missing/unrecognized year level {yr_raw!r} -> defaulted to '1st Year'")

    if yr_raw in ("!st Year", "1st yeare", "3rd-irre"):
        flags.append(f"Normalized year level {yr_raw!r} -> {year_level!r}")

    return year_level, semester, flags


def parse_gender(col_k: str, col_l: str, clean_name: str, first_name: str, suffix: str, source: str) -> tuple[str, list[str], str | None]:
    """Return (gender, flags, suspect_gender_note)."""
    flags: list[str] = []
    suspect_note: str | None = None
    k = norm_space(col_k)
    l = norm_space(col_l)
    nm_low = clean_name.lower()
    fn_low = first_name.lower()

    if k and not l:
        gender = "Male"
    elif l and not k:
        gender = "Female"
    else:
        if "adrielle bayan" in nm_low:
            gender = "Male"
            flags.append(f"Gender marked in both K & L in {source}; resolved to 'Male' from 1stSem R313")
        elif "allizza janelle compas" in nm_low or "maila superales estigoy" in nm_low or "jel anusencion" in nm_low:
            gender = "Female"
            flags.append(f"Gender missing/both in {source}; set 'Female' (verify)")
            suspect_note = f"Missing/both K&L in Excel ({source}); set 'Female'"
        elif k and l:
            gender = "Female"
            flags.append(f"Gender marked in both K & L in {source}; defaulted to 'Female' (verify)")
            suspect_note = f"Both K&L marked in Excel ({source}); defaulted 'Female'"
        else:
            gender = "Male"
            flags.append(f"Gender missing in {source}; defaulted to 'Male' (verify)")
            suspect_note = f"Gender missing in Excel ({source}); defaulted 'Male'"
        return gender, flags, suspect_note

    # Check if Excel K/L mark looks swapped vs common first-name/suffix cues
    if gender == "Male" and any(fn_low == h or fn_low.startswith(h + " ") for h in FEMALE_NAME_HINTS):
        suspect_note = f"Marked Male (Col K) in {source} despite feminine first name {first_name!r}"
    elif gender == "Female" and (suffix in ("Jr.", "Sr.", "II", "III", "IV", "V") or any(fn_low == h or fn_low.startswith(h + " ") for h in MALE_NAME_HINTS)):
        suspect_note = f"Marked Female (Col L) in {source} despite masculine name/suffix {clean_name!r}"

    return gender, flags, suspect_note


def parse_pwd_and_solo(col_n: str, col_o: str, col_p: str, col_q: str, col_r: str) -> tuple[bool, bool, bool, list[str]]:
    """Return (is_pwd, is_solo_parent, solo_explicit_na, extra_remarks)."""
    n = norm_space(col_n)
    o = norm_space(col_o)
    p = norm_space(col_p)
    q = norm_space(col_q)
    r = norm_space(col_r)
    extra_remarks: list[str] = []

    combined_npqr = " ".join([n, p, q, r]).lower()
    combined_all = " ".join([n, o, p, q, r]).lower()

    is_pwd = ("pwd" in combined_all) or ("physical disability" in o.lower()) or (n.lower() == "yes")
    negated_solo = ("not applicable" in combined_npqr) or bool(re.search(r"\bsolo\s*parent\s*na\b", combined_npqr))

    o_low = o.lower()
    o_is_non_parent_note = (
        not o
        or bool(re.search(r"\b(sem|term|new|pwd|disability|father)\b", o_low))
        or bool(re.fullmatch(r"\d+", o_low))
    )
    o_is_parent_name = bool(o) and not o_is_non_parent_note

    is_solo_parent = False if negated_solo else (("solo" in combined_npqr) or (o_is_parent_name and not is_pwd))

    if o_is_parent_name:
        extra_remarks.append(f"Parent/Guardian: {o}")
    for tag, val in [("Remarks", p), ("Tag Q", q), ("Tag R", r), ("Col N", n)]:
        if val and val.lower() not in ("yes",):
            if (
                tag == "Remarks"
                or ("not applicable" in val.lower())
                or ("full" in val.lower())
                or ("new" in val.lower())
                or ("sem" in val.lower())
                or ("term" in val.lower())
            ):
                extra_remarks.append(val)

    seen_rem: set[str] = set()
    uniq_rem: list[str] = []
    for item in extra_remarks:
        k = item.lower()
        if k not in seen_rem:
            seen_rem.add(k)
            uniq_rem.append(item)

    return is_pwd, is_solo_parent, negated_solo, uniq_rem


def parse_amount(raw_amt: str, clean_name: str, source: str) -> tuple[float, list[str]]:
    flags: list[str] = []
    s = norm_space(raw_amt)
    nm_low = clean_name.lower()

    if not s:
        if "allizza janelle compas" in nm_low:
            flags.append("Recovered empty amount 7000.00 from statement 1st26-27 R6545")
            return 7000.00, flags
        flags.append(f"Empty amount in {source} -> set 0.00")
        return 0.00, flags

    if s == "36.087.44":
        flags.append("Fixed malformed amount '36.087.44' -> 36087.44")
        return 36087.44, flags

    cleaned = s.replace(",", "").replace("₱", "").strip()
    try:
        val = round(float(cleaned), 2)
        if val < 0:
            flags.append(f"Negative amount {val} clamped to 0.00")
            return 0.00, flags
        return val, flags
    except ValueError:
        flags.append(f"Non-numeric amount {s!r} in {source} -> set 0.00")
        return 0.00, flags


def parse_grade(raw_grade: str, clean_name: str, source: str) -> tuple[float | None, list[str]]:
    flags: list[str] = []
    s = norm_space(raw_grade)
    nm_low = clean_name.lower()
    if not s:
        return None, flags

    if "janelle fajardo" in nm_low and s == "10500":
        flags.append("Recovered Janelle Fajardo grade '10500' -> 82.50 from 1stSem R210")
        return 82.50, flags

    try:
        val = round(float(s), 2)
    except ValueError:
        flags.append(f"Non-numeric grade {s!r} in {source} -> cleared (NULL)")
        return None, flags

    if (1.00 <= val <= 5.00) or (50.00 <= val <= 100.00):
        return val, flags

    flags.append(f"Out-of-range grade {val} in {source} -> cleared (NULL)")
    return None, flags


def parse_contact(raw_contact: str) -> tuple[str | None, list[str], list[str]]:
    flags: list[str] = []
    remarks: list[str] = []
    s = norm_space(raw_contact)
    if not s:
        return None, remarks, flags

    def fmt_single(part: str) -> str | None:
        d = re.sub(r"\D", "", part)
        if not d:
            return None
        if len(d) == 10 and d.startswith("9"):
            d = "0" + d
        if len(d) == 11 and d.startswith("09"):
            return f"{d[:4]}-{d[4:7]}-{d[7:]}"
        return None

    if "/" in s:
        parts = [p.strip() for p in s.split("/") if p.strip()]
        primary = fmt_single(parts[0])
        if primary:
            alts = [fmt_single(p) or p for p in parts[1:]]
            remarks.append("Alt contact: " + ", ".join(alts))
            flags.append(f"Split multi-contact {s!r} -> primary {primary!r}, alt in remarks")
            return primary, remarks, flags

    primary = fmt_single(s)
    if primary:
        return primary, remarks, flags

    digits = re.sub(r"\D", "", s)
    if not digits:
        remarks.append(f"Contact note: {s}")
        flags.append(f"Non-numeric contact {s!r} moved to remarks")
        return None, remarks, flags

    trimmed = s[:20]
    flags.append(f"Irregular contact number {s!r} preserved as {trimmed!r}")
    return trimmed, remarks, flags


def grade_semester_label(short_sem: str) -> str:
    return {
        "1st Sem": "1st Semester",
        "2nd Sem": "2nd Semester",
        "3rd Sem": "3rd Semester",
        "Summer": "Summer",
    }.get(short_sem, short_sem)


def build_statement_index(stmt_rows: list[tuple[int, dict[str, str], dict[str, str]]]) -> dict[str, Any]:
    entries: list[dict[str, Any]] = []
    by_nkey: set[str] = set()
    by_fl: set[str] = set()
    by_last: dict[str, list[dict[str, Any]]] = defaultdict(list)

    for rnum, rv, _ in stmt_rows:
        a = rv.get("A", "")
        b = rv.get("B", "")
        c = rv.get("C", "")
        if a.isdigit() and b:
            f, _, l, _, _, _ = extract_clean_name_and_remarks(b)
            nkey = canonical_name_key(b)
            fl = norm_key(f"{f} {l}")
            try:
                amt = round(float(c.replace(",", "")), 2) if c else None
            except ValueError:
                amt = None
            ent = {"row": rnum, "raw": b, "nkey": nkey, "fl": fl, "last": l.lower(), "amt": amt}
            entries.append(ent)
            by_nkey.add(nkey)
            by_fl.add(fl)
            by_last[l.lower()].append(ent)

    return {"entries": entries, "by_nkey": by_nkey, "by_fl": by_fl, "by_last": by_last}


def is_billed_in_statement(scholar: dict[str, Any], stmt_idx: dict[str, Any]) -> bool:
    if scholar["name_key"] in stmt_idx["by_nkey"]:
        return True
    fl = norm_key(f"{scholar['first_name']} {scholar['last_name']}")
    if fl in stmt_idx["by_fl"]:
        return True
    for e in stmt_idx["by_last"].get(scholar["last_name"].lower(), []):
        sim = difflib.SequenceMatcher(None, fl, e["fl"]).ratio()
        if sim >= 0.82:
            return True
        if sim >= 0.68 and e["amt"] is not None and abs(e["amt"] - scholar["scholarship_amount"]) < 1.00:
            return True
    return False


def sql_str(val: str | None) -> str:
    if val is None:
        return "NULL"
    return "'" + val.replace("'", "''") + "'"


def suffixes_compatible(suf1: str, suf2: str) -> bool:
    return not (suf1 != "None" and suf2 != "None" and suf1 != suf2)


def year_level_rank(yl: str) -> int:
    return {"1st Year": 1, "2nd Year": 2, "3rd Year": 3, "4th Year": 4, "5th Year": 5, "6th Year": 6}.get(yl, 0)


def sem_rank(sem_label: str) -> int:
    return {"1st Semester": 1, "2nd Semester": 2, "3rd Semester": 3, "Summer": 4}.get(sem_label, 0)


def sort_grades(grades: list[dict[str, Any]]) -> list[dict[str, Any]]:
    # Deduplicate by (schoolYear, semester) keeping latest added/highest detail
    by_term: dict[tuple[str, str], dict[str, Any]] = {}
    for g in grades:
        key = (g["schoolYear"], g["semester"])
        if key not in by_term:
            by_term[key] = g
    return sorted(
        by_term.values(),
        key=lambda g: (g["schoolYear"], sem_rank(g["semester"])),
        reverse=True,
    )


def build_records(
    sheets_data: dict[str, list[tuple[int, dict[str, str], dict[str, str]]]]
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    stmt_idx = build_statement_index(sheets_data["statement 1st26-27"])

    excluded_rows: list[dict[str, str]] = []
    skipped_blank_slots: list[dict[str, str]] = []
    merged_events: list[dict[str, str]] = []

    def parse_raw_entry(
        group_name: str,
        sheet_name: str,
        rnum: int,
        rv: dict[str, str],
        rf: dict[str, str],
        school_year: str,
        default_sem: str,
        scholar_status: str,
        year_graduated: int | None,
    ) -> dict[str, Any] | None:
        raw_name = rv.get("C", "")
        raw_school = rv.get("D", "")
        p_q_r = " ".join([rv.get("P", ""), rv.get("Q", ""), rv.get("R", "")]).lower()

        if "no eligible" in raw_name.lower() or "no eligible" in p_q_r:
            excluded_rows.append({"source": f"{sheet_name} R{rnum}", "name": raw_name, "reason": "Marked 'no eligible' in source"})
            return None
        if norm_key(raw_school) == "cancelled by student":
            excluded_rows.append({"source": f"{sheet_name} R{rnum}", "name": raw_name, "reason": "Marked 'cancelled by student' in source"})
            return None

        first_name, middle_name, last_name, suffix, name_remark, name_flags = extract_clean_name_and_remarks(raw_name)
        clean_full = " ".join(p for p in [first_name, middle_name, last_name, "" if suffix == "None" else suffix] if p)

        school, school_remarks, school_flags = canonicalize_school(raw_school, clean_full)
        course, course_flags = canonicalize_course(rv.get("E", ""), school)
        barangay, brgy_flags = normalize_barangay(rv.get("F", ""))
        contact_number, contact_remarks, contact_flags = parse_contact(rv.get("G", ""))
        year_level, semester, yl_flags = parse_year_and_semester(rv.get("H", ""), rv.get("N", ""), rv.get("O", ""), default_sem)
        gwa, grade_flags = parse_grade(rv.get("I", ""), clean_full, f"{sheet_name} R{rnum}")
        amount, amt_flags = parse_amount(rv.get("J", ""), clean_full, f"{sheet_name} R{rnum}")
        gender, gender_flags, suspect_gender = parse_gender(
            rv.get("K", ""), rv.get("L", ""), clean_full, first_name, suffix, f"{sheet_name} R{rnum}"
        )
        is_pwd, is_solo_parent, solo_na, tag_remarks = parse_pwd_and_solo(
            rv.get("N", ""), rv.get("O", ""), rv.get("P", ""), rv.get("Q", ""), rv.get("R", "")
        )

        grade_sem = grade_semester_label(semester)
        grade_entry = (
            [
                {
                    "schoolYear": school_year,
                    "semester": grade_sem,
                    "gwa": gwa,
                    "createdAt": "2026-11-20T00:00:00.000Z",
                }
            ]
            if gwa is not None
            else []
        )

        all_remarks: list[str] = []
        for rem in ([name_remark] if name_remark else []) + school_remarks + contact_remarks + tag_remarks:
            if rem and rem not in all_remarks:
                all_remarks.append(rem)

        return {
            "group": group_name,
            "source_sheet": f"{sheet_name} (R{rnum})",
            "audit_source": f"{sheet_name} R{rnum}",
            "row_flags": name_flags + school_flags + course_flags + brgy_flags + contact_flags + yl_flags + grade_flags + amt_flags + gender_flags,
            "suspect_gender": suspect_gender,
            "cell_fill_hex": rf.get("C", "NONE"),
            "raw_name": raw_name,
            "clean_full_name": clean_full,
            "name_key": canonical_name_key(raw_name),
            "first_last_key": norm_key(f"{first_name.split()[0]} {last_name}"),
            "first_name": first_name[:100],
            "middle_name": middle_name[:100] if middle_name else None,
            "last_name": last_name[:100],
            "suffix": suffix,
            "gender": gender,
            "barangay": barangay,
            "school": school[:255],
            "course": course[:255] if course else None,
            "year_level": year_level,
            "semester": semester,
            "school_year": school_year,
            "scholarship_amount": amount,
            "scholar_status": scholar_status,
            "year_graduated": year_graduated,
            "is_pwd": is_pwd,
            "is_solo_parent": is_solo_parent,
            "solo_na": solo_na,
            "contact_number": contact_number[:20] if contact_number else None,
            "grades_list": grade_entry,
            "remarks_list": all_remarks,
            "source_rows": [f"{sheet_name} R{rnum}"],
        }

    scholars: list[dict[str, Any]] = []

    def find_match(cand: dict[str, Any], allow_waitlist_phone_school: bool = False) -> tuple[dict[str, Any] | None, str]:
        for ex in scholars:
            if not suffixes_compatible(cand["suffix"], ex["suffix"]):
                continue
            if cand["name_key"] == ex["name_key"]:
                return ex, "exact name"

        def fuzzy_compatible(ex: dict[str, Any]) -> bool:
            if not suffixes_compatible(cand["suffix"], ex["suffix"]):
                return False
            if cand["middle_name"] and ex["middle_name"] and cand["middle_name"].rstrip(".") != ex["middle_name"].rstrip("."):
                return False
            if cand["contact_number"] and ex["contact_number"] and cand["contact_number"] != ex["contact_number"]:
                return False
            return True

        for ex in scholars:
            if not fuzzy_compatible(ex):
                continue
            if cand["first_last_key"] == ex["first_last_key"]:
                f1 = cand["first_name"].lower().split()
                f2 = ex["first_name"].lower().split()
                prefix_ok = (cand["first_name"].lower() == ex["first_name"].lower()) or (
                    len(f1) <= len(f2) and f2[: len(f1)] == f1
                ) or (
                    len(f2) <= len(f1) and f1[: len(f2)] == f2
                )
                course_conflict = bool(cand["course"] and ex["course"] and cand["course"] != ex["course"])
                if prefix_ok and (
                    (cand["contact_number"] and cand["contact_number"] == ex["contact_number"])
                    or (cand["school"] == ex["school"] and not course_conflict)
                    or (allow_waitlist_phone_school and cand["year_level"] == ex["year_level"] and (not cand["contact_number"] or not ex["contact_number"]))
                ):
                    return ex, "first+last + school/phone"

        if cand["contact_number"]:
            for ex in scholars:
                if not fuzzy_compatible(ex):
                    continue
                if ex["contact_number"] == cand["contact_number"]:
                    sim = difflib.SequenceMatcher(None, cand["name_key"], ex["name_key"]).ratio()
                    if sim >= 0.85:
                        return ex, f"same phone + name sim {sim:.2f}"
                    if allow_waitlist_phone_school and cand["school"] == ex["school"] and cand["last_name"].lower() == ex["last_name"].lower() and cand["year_level"] == ex["year_level"]:
                        return ex, "same phone + school + last_name + year_level"

        for ex in scholars:
            if not fuzzy_compatible(ex):
                continue
            if cand["school"] == ex["school"]:
                course_conflict = bool(cand["course"] and ex["course"] and cand["course"] != ex["course"])
                if course_conflict:
                    continue
                sim = difflib.SequenceMatcher(None, cand["name_key"], ex["name_key"]).ratio()
                if sim >= 0.88:
                    return ex, f"same school + name sim {sim:.2f}"

        return None, ""

    def merge_into(ex: dict[str, Any], incoming: dict[str, Any], reason: str, upgrade_grad_from_sec1: bool = False) -> None:
        # Merge grades
        existing_terms = {(g["schoolYear"], g["semester"]) for g in ex["grades_list"]}
        for g in incoming["grades_list"]:
            if (g["schoolYear"], g["semester"]) not in existing_terms:
                ex["grades_list"].append(g)
                existing_terms.add((g["schoolYear"], g["semester"]))
            elif incoming["school_year"] == "2026-2027" and ex["school_year"] == "2026-2027":
                # Trimester repeat within 1stSem 2026-2027: preserve prior grade as 2025-2026 3rd Semester if free
                alt = dict(g)
                alt["schoolYear"] = "2025-2026"
                alt["semester"] = "3rd Semester"
                if (alt["schoolYear"], alt["semester"]) not in existing_terms:
                    ex["grades_list"].append(alt)
                    existing_terms.add((alt["schoolYear"], alt["semester"]))

        # Merge flags & optional fields without overwriting higher-priority primary values
        ex["is_pwd"] = ex["is_pwd"] or incoming["is_pwd"]
        if not ex["solo_na"]:
            ex["is_solo_parent"] = ex["is_solo_parent"] or incoming["is_solo_parent"]
        if not ex["contact_number"] and incoming["contact_number"]:
            ex["contact_number"] = incoming["contact_number"]
        if not ex["middle_name"] and incoming["middle_name"]:
            ex["middle_name"] = incoming["middle_name"]
        if not ex["course"] and incoming["course"]:
            ex["course"] = incoming["course"]
        for rem in incoming["remarks_list"]:
            if rem not in ex["remarks_list"]:
                ex["remarks_list"].append(rem)
        ex["source_rows"].extend(incoming["source_rows"])

        # Cross-sheet gender verification: resolve Jasmin Lalata (Female in 1stSem, Male in 2nd Sem)
        if ex["gender"] != incoming["gender"]:
            if "jasmin lalata" in ex["name_key"]:
                ex["gender"] = "Female"
                ex["suspect_gender"] = None
            else:
                ex["suspect_gender"] = (ex["suspect_gender"] or "") + f"; Conflicting gender in {incoming['source_sheet']} ({incoming['gender']})"

        # Upgrade Graduate Batch Sec 1 (2024-2025 3rd Year) using 2nd Sem 2025-2026 final (4th/5th Year)
        if upgrade_grad_from_sec1:
            ex["year_level"] = incoming["year_level"]
            ex["semester"] = incoming["semester"]
            if incoming["scholarship_amount"] > 0:
                ex["scholarship_amount"] = incoming["scholarship_amount"]

        merged_events.append(
            {
                "kept": f"{ex['clean_full_name']} ({ex['source_sheet']})",
                "merged": f"{incoming['clean_full_name']} ({incoming['source_sheet']})",
                "reason": reason,
            }
        )

    # ------------------------------------------------------------------
    # Group 1: 1stSem 2026-2027 Active Sections (highest priority)
    # Sort so higher year_level comes first (e.g. 3rd Year before 2nd Year for Midway repeaters)
    # ------------------------------------------------------------------
    s1_rows = sheets_data["1stSem 2026-2027"]
    s1_active_raw: list[dict[str, Any]] = []
    for rnum, rv, rf in s1_rows:
        b_val = rv.get("B", "")
        c_val = rv.get("C", "")
        if 291 <= rnum <= 632:
            sub_grp = "1stSem 2026-2027 (Renewal)"
        elif 659 <= rnum <= 764:
            sub_grp = "1stSem 2026-2027 (Batch 1 New)"
        elif 781 <= rnum <= 1000:
            sub_grp = "1stSem 2026-2027 (Batch 2 New)"
        else:
            continue

        if not c_val and b_val:
            skipped_blank_slots.append({"source": f"1stSem 2026-2027 R{rnum}", "reason": "Blank scholar name (orphan slot)"})
            continue
        if not c_val or not (b_val.isdigit() or b_val == "?"):
            continue

        ent = parse_raw_entry(sub_grp, "1stSem 2026-2027", rnum, rv, rf, "2026-2027", "1st Sem", "Active", None)
        if ent:
            s1_active_raw.append(ent)

    # Process highest year_level first so trimester repeaters keep their current highest year_level
    s1_active_raw.sort(key=lambda e: (-year_level_rank(e["year_level"]), e["source_sheet"]))
    for ent in s1_active_raw:
        ex, rsn = find_match(ent)
        if ex:
            merge_into(ex, ent, f"Same active term / spelling match ({rsn})")
        else:
            scholars.append(ent)

    # ------------------------------------------------------------------
    # Group 2: Graduate Batch 2025-2026 (Sec 2 first, then Sec 1)
    # ------------------------------------------------------------------
    sg_rows = sheets_data["Graduate Batch 2025-2026"]
    sg_sec2 = [(r, rv, rf) for r, rv, rf in sg_rows if 38 <= r <= 125 and rv.get("C") and rv.get("B", "").isdigit()]
    sg_sec1 = [(r, rv, rf) for r, rv, rf in sg_rows if 5 <= r <= 33 and rv.get("C") and rv.get("B", "").isdigit()]

    grad_sec1_keys: set[str] = set()
    for rnum, rv, rf in sg_sec2 + sg_sec1:
        sy = "2025-2026" if rnum >= 38 else "2024-2025"
        ent = parse_raw_entry("Graduate Batch 2025-2026", "Graduate Batch 2025-2026", rnum, rv, rf, sy, "1st Sem", "Graduated", 2026)
        if not ent:
            continue
        ex, rsn = find_match(ent)
        if ex:
            merge_into(ex, ent, f"Merged Graduate Batch record ({rsn})")
        else:
            # Place all 2026 graduates under SY 2025-2026 so they appear together in Graduates tab
            # (their 2024-2025 grade remains tagged '2024-2025' inside grades_list)
            if rnum < 38:
                grad_sec1_keys.add(ent["name_key"])
                ent["school_year"] = "2025-2026"
            scholars.append(ent)

    # ------------------------------------------------------------------
    # Group 3: 2nd Sem 2025-2026 final
    # ------------------------------------------------------------------
    s2_rows = sheets_data["2nd Sem 2025-2026 final"]
    for rnum, rv, rf in s2_rows:
        if rnum < 9:
            continue
        c_val = rv.get("C", "")
        b_val = rv.get("B", "")
        if not c_val:
            if b_val.isdigit():
                skipped_blank_slots.append({"source": f"2nd Sem 2025-2026 final R{rnum}", "reason": "Blank scholar name"})
            continue
        if c_val in ("Name", "new scholar", "NagRenewna", "222") or c_val.startswith("Palayan"):
            continue
        if not (b_val.isdigit() or (547 <= rnum <= 551)):
            continue

        sy = "2024-2025" if rnum <= 52 else "2025-2026"
        ent = parse_raw_entry("2nd Sem 2025-2026 final", "2nd Sem 2025-2026 final", rnum, rv, rf, sy, "2nd Sem", "Active", None)
        if not ent:
            continue
        ex, rsn = find_match(ent)
        if ex:
            upgrade = (ex["name_key"] in grad_sec1_keys) and (sy == "2025-2026")
            merge_into(ex, ent, f"Merged 2nd Sem 2025-2026 grade ({rsn})", upgrade_grad_from_sec1=upgrade)
            if upgrade:
                grad_sec1_keys.discard(ex["name_key"])
        else:
            scholars.append(ent)

    # ------------------------------------------------------------------
    # Group 4: 1stSem 2026-2027 Top Prior-Term Sections (Rows 8..282)
    # ------------------------------------------------------------------
    for rnum, rv, rf in s1_rows:
        if rnum > 282:
            continue
        b_val = rv.get("B", "")
        c_val = rv.get("C", "")
        if not c_val:
            if b_val.isdigit():
                skipped_blank_slots.append({"source": f"1stSem 2026-2027 R{rnum}", "reason": "Blank scholar name (prior-term slot)"})
            continue
        if not b_val.isdigit():
            continue

        if 8 <= rnum <= 42:
            sy, dsem = "2024-2025", "2nd Sem"
        elif 44 <= rnum <= 112:
            sy, dsem = "2025-2026", "1st Sem"
        elif 114 <= rnum <= 282:
            sy, dsem = "2025-2026", "2nd Sem"
        else:
            continue

        ent = parse_raw_entry("1stSem 2026-2027 (Prior-Term)", "1stSem 2026-2027", rnum, rv, rf, sy, dsem, "Active", None)
        if not ent:
            continue
        ex, rsn = find_match(ent)
        if ex:
            merge_into(ex, ent, f"Merged prior-term grade ({rsn})")
        else:
            scholars.append(ent)

    # ------------------------------------------------------------------
    # Group 5: 1st New 2026-2027 & WAITING CHANCE-2nd batch August
    # ------------------------------------------------------------------
    for sname, grp_label in [
        ("1st New 2026-2027", "1st New 2026-2027"),
        ("WAITING CHANCE-2nd batch August", "WAITING CHANCE-2nd batch August"),
    ]:
        for rnum, rv, rf in sheets_data[sname]:
            if rnum < 12:
                continue
            b_val = rv.get("B", "")
            c_val = rv.get("C", "")
            if not c_val:
                if b_val.isdigit():
                    skipped_blank_slots.append({"source": f"{sname} R{rnum}", "reason": "Empty waitlist/new slot"})
                continue
            if not b_val.isdigit():
                continue

            ent = parse_raw_entry(grp_label, sname, rnum, rv, rf, "2026-2027", "1st Sem", "Active", None)
            if not ent:
                continue
            ex, rsn = find_match(ent, allow_waitlist_phone_school=True)
            if ex:
                merge_into(ex, ent, f"Merged pending/waitlist duplicate ({rsn})")
            else:
                scholars.append(ent)

    # Finalize fields, payment status (statement 1st26-27), import_key, and audit flags
    sy_counters: Counter[str] = Counter()
    audit_fixes: list[dict[str, Any]] = []
    outlier_amounts: list[dict[str, Any]] = []
    suspect_genders: list[dict[str, Any]] = []

    for rec in scholars:
        if rec["school_year"] == "2026-2027":
            if rec["group"] in ("1st New 2026-2027", "WAITING CHANCE-2nd batch August") and rec["scholarship_amount"] == 0:
                rec["payment_status"] = "Processing"
            else:
                rec["payment_status"] = "Paid" if is_billed_in_statement(rec, stmt_idx) else "Processing"
        else:
            rec["payment_status"] = "Paid"

        rec["grades_sorted"] = sort_grades(rec["grades_list"])
        rec["grades"] = json.dumps(rec["grades_sorted"], ensure_ascii=False)
        rec["gwa"] = rec["grades_sorted"][0]["gwa"] if rec["grades_sorted"] else None
        rec["grade_semester"] = rec["grades_sorted"][0]["semester"] if rec["grades_sorted"] else None
        rec["remarks"] = "; ".join(rec["remarks_list"])[:500] if rec["remarks_list"] else None

        sy_short = rec["school_year"].replace("-", "")[2:4] + rec["school_year"].replace("-", "")[6:8]
        sy_counters[sy_short] += 1
        rec["import_key"] = f"ISKO-{sy_short}-{sy_counters[sy_short]:04d}"

        if rec["row_flags"]:
            audit_fixes.append(
                {
                    "import_key": rec["import_key"],
                    "source": rec["audit_source"],
                    "raw_name": rec["raw_name"],
                    "clean_name": rec["clean_full_name"],
                    "flags": rec["row_flags"],
                }
            )
        if rec["scholarship_amount"] > 65000 or rec["scholarship_amount"] == 0:
            outlier_amounts.append(
                {
                    "import_key": rec["import_key"],
                    "source": rec["source_sheet"],
                    "name": rec["clean_full_name"],
                    "school": rec["school"],
                    "course": rec["course"],
                    "amount": rec["scholarship_amount"],
                }
            )
        if rec["suspect_gender"]:
            suspect_genders.append(
                {
                    "import_key": rec["import_key"],
                    "source": rec["source_sheet"],
                    "name": rec["clean_full_name"],
                    "assigned_gender": rec["gender"],
                    "note": rec["suspect_gender"].lstrip("; "),
                }
            )

    stats = {
        "total": len(scholars),
        "total_grade_entries": sum(len(r["grades_sorted"]) for r in scholars),
        "multi_term_scholars": sum(1 for r in scholars if len(r["grades_sorted"]) > 1),
        "by_group": Counter(r["group"] for r in scholars),
        "by_sy": Counter(r["school_year"] for r in scholars),
        "by_scholar_status": Counter(r["scholar_status"] for r in scholars),
        "by_payment_status": Counter(r["payment_status"] for r in scholars),
        "by_payment_2627": Counter(r["payment_status"] for r in scholars if r["school_year"] == "2026-2027"),
        "by_school": Counter(r["school"] for r in scholars),
        "by_course": Counter(r["course"] or "<EMPTY>" for r in scholars),
        "excluded_rows": excluded_rows,
        "skipped_blank_slots": skipped_blank_slots,
        "merged_events": merged_events,
        "audit_fixes": audit_fixes,
        "outlier_amounts": outlier_amounts,
        "suspect_genders": suspect_genders,
    }
    return scholars, stats


def write_sql(records: list[dict[str, Any]], stats: dict[str, Any], out_path: Path) -> None:
    lines: list[str] = []
    lines.append("-- =============================================================================")
    lines.append("-- Palayan City LGU Scholarship System — Supabase Import Script (Unique Scholars)")
    lines.append("-- Generated from: LGU-ISKO-1st SEMESTER 2026-2027.xlsx")
    lines.append(f"-- Total Unique Clean Scholars: {len(records)} (with {stats['total_grade_entries']} total grade entries)")
    lines.append("-- =============================================================================")
    lines.append("-- Included Groups (merged into 1 record per unique scholar):")
    for grp, cnt in stats["by_group"].items():
        lines.append(f"--   * {grp}: {cnt} unique scholars")
    lines.append("--")
    lines.append("-- Payment Status Assignment:")
    lines.append(f"--   * SY 2026-2027 : Paid ({stats['by_payment_2627']['Paid']}) if billed in 'statement 1st26-27', Processing ({stats['by_payment_2627']['Processing']}) otherwise")
    lines.append("--   * SY 2024-2026 : Paid (completed prior terms & Graduate Batch 2025-2026)")
    lines.append("--")
    lines.append("-- Excluded Rows:")
    for ex in stats["excluded_rows"]:
        lines.append(f"--   * {ex['source']} — {ex['name']} ({ex['reason']})")
    lines.append("--")
    lines.append("-- How to Run:")
    lines.append("--   1. Open Supabase Dashboard -> SQL Editor -> New Query.")
    lines.append("--   2. Paste this entire file and click Run.")
    lines.append("--   3. Safe to re-run: checks existing records and skips duplicates.")
    lines.append("-- =============================================================================")
    lines.append("")
    lines.append("BEGIN;")
    lines.append("")
    lines.append("CREATE TEMP TABLE _iskolar_import_stage (")
    lines.append("  import_key VARCHAR(50) PRIMARY KEY,")
    lines.append("  source_sheet TEXT NOT NULL,")
    lines.append("  first_name VARCHAR(100) NOT NULL,")
    lines.append("  middle_name VARCHAR(100),")
    lines.append("  last_name VARCHAR(100) NOT NULL,")
    lines.append("  suffix VARCHAR(10) NOT NULL DEFAULT 'None',")
    lines.append("  gender VARCHAR(10) NOT NULL,")
    lines.append("  barangay VARCHAR(100) NOT NULL,")
    lines.append("  school VARCHAR(255) NOT NULL,")
    lines.append("  course VARCHAR(255),")
    lines.append("  year_level VARCHAR(20) NOT NULL,")
    lines.append("  semester VARCHAR(20) NOT NULL,")
    lines.append("  school_year VARCHAR(20) NOT NULL,")
    lines.append("  scholarship_amount NUMERIC(10,2) NOT NULL DEFAULT 0,")
    lines.append("  payment_status VARCHAR(20) NOT NULL DEFAULT 'Processing',")
    lines.append("  scholar_status VARCHAR(20) NOT NULL DEFAULT 'Active',")
    lines.append("  year_graduated INTEGER,")
    lines.append("  is_pwd BOOLEAN NOT NULL DEFAULT FALSE,")
    lines.append("  is_solo_parent BOOLEAN NOT NULL DEFAULT FALSE,")
    lines.append("  contact_number VARCHAR(20),")
    lines.append("  gwa NUMERIC(5,2),")
    lines.append("  grade_semester VARCHAR(20),")
    lines.append("  grades JSONB NOT NULL DEFAULT '[]'::jsonb,")
    lines.append("  remarks TEXT")
    lines.append(") ON COMMIT DROP;")
    lines.append("")

    cols = (
        "import_key, source_sheet, first_name, middle_name, last_name, "
        "suffix, gender, barangay, school, course, year_level, semester, school_year, "
        "scholarship_amount, payment_status, scholar_status, year_graduated, is_pwd, "
        "is_solo_parent, contact_number, gwa, grade_semester, grades, remarks"
    )
    batch_size = 150
    for start in range(0, len(records), batch_size):
        batch = records[start : start + batch_size]
        lines.append(f"INSERT INTO _iskolar_import_stage ({cols}) VALUES")
        row_sqls: list[str] = []
        for rec in batch:
            yg = str(rec["year_graduated"]) if rec["year_graduated"] is not None else "NULL"
            gwa_s = f"{rec['gwa']:.2f}" if rec["gwa"] is not None else "NULL"
            amt_s = f"{rec['scholarship_amount']:.2f}"
            row_sqls.append(
                "  ("
                + ", ".join(
                    [
                        sql_str(rec["import_key"]),
                        sql_str(rec["source_sheet"]),
                        sql_str(rec["first_name"]),
                        sql_str(rec["middle_name"]),
                        sql_str(rec["last_name"]),
                        sql_str(rec["suffix"]),
                        sql_str(rec["gender"]),
                        sql_str(rec["barangay"]),
                        sql_str(rec["school"]),
                        sql_str(rec["course"]),
                        sql_str(rec["year_level"]),
                        sql_str(rec["semester"]),
                        sql_str(rec["school_year"]),
                        amt_s,
                        sql_str(rec["payment_status"]),
                        sql_str(rec["scholar_status"]),
                        yg,
                        "TRUE" if rec["is_pwd"] else "FALSE",
                        "TRUE" if rec["is_solo_parent"] else "FALSE",
                        sql_str(rec["contact_number"]),
                        gwa_s,
                        sql_str(rec["grade_semester"]),
                        sql_str(rec["grades"]) + "::jsonb",
                        sql_str(rec["remarks"]),
                    ]
                )
                + ")"
            )
        lines.append(",\n".join(row_sqls) + ";")
        lines.append("")

    lines.extend(
        [
            "DO $$",
            "DECLARE",
            "  v_use_camel BOOLEAN;",
            "  v_c_school_id TEXT;",
            "  v_c_first TEXT;",
            "  v_c_middle TEXT;",
            "  v_c_last TEXT;",
            "  v_c_suffix TEXT;",
            "  v_c_gender TEXT;",
            "  v_c_barangay TEXT;",
            "  v_c_school TEXT;",
            "  v_c_course TEXT;",
            "  v_c_year_level TEXT;",
            "  v_c_semester TEXT;",
            "  v_c_school_year TEXT;",
            "  v_c_sch_amt TEXT;",
            "  v_c_amt TEXT;",
            "  v_c_pay_status TEXT;",
            "  v_c_status TEXT;",
            "  v_c_sch_status TEXT;",
            "  v_c_year_grad TEXT;",
            "  v_c_pwd TEXT;",
            "  v_c_solo TEXT;",
            "  v_c_contact TEXT;",
            "  v_c_grades TEXT;",
            "  v_c_remarks TEXT;",
            "  v_status_holds_scholar_state BOOLEAN := FALSE;",
            "  v_con RECORD;",
            "  v_ins_cols TEXT[] := ARRAY[]::TEXT[];",
            "  v_sel_exprs TEXT[] := ARRAY[]::TEXT[];",
            "  v_dedup_cond TEXT;",
            "  v_sql TEXT;",
            "  v_inserted BIGINT := 0;",
            "  v_staged BIGINT := 0;",
            "  v_g_scholar_id TEXT;",
            "  v_g_sy TEXT;",
            "  v_g_sem TEXT;",
            "  v_g_gwa TEXT;",
            "  v_g_inserted BIGINT := 0;",
            "BEGIN",
            "  -- 1. Create public.scholars if it does not exist",
            "  IF to_regclass('public.scholars') IS NULL THEN",
            "    CREATE TABLE public.scholars (",
            "      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
            "      school_id VARCHAR(50) UNIQUE NOT NULL,",
            "      first_name VARCHAR(100) NOT NULL,",
            "      last_name VARCHAR(100) NOT NULL,",
            "      middle_name VARCHAR(100),",
            "      suffix TEXT DEFAULT 'None',",
            "      gender TEXT NOT NULL DEFAULT 'Male',",
            "      barangay VARCHAR(100) NOT NULL,",
            "      school VARCHAR(255) NOT NULL,",
            "      year_level VARCHAR(20) NOT NULL,",
            "      semester VARCHAR(20) NOT NULL,",
            "      course VARCHAR(255),",
            "      amount NUMERIC(10,2) NOT NULL DEFAULT 0,",
            "      scholarship_amount NUMERIC(10,2) NOT NULL DEFAULT 0,",
            "      status VARCHAR(20) NOT NULL DEFAULT 'Processing',",
            "      payment_status VARCHAR(20) NOT NULL DEFAULT 'Processing',",
            "      scholar_status VARCHAR(20) NOT NULL DEFAULT 'Active',",
            "      year_graduated INTEGER,",
            "      is_pwd BOOLEAN NOT NULL DEFAULT FALSE,",
            "      is_solo_parent BOOLEAN NOT NULL DEFAULT FALSE,",
            "      contact_number VARCHAR(20),",
            "      email VARCHAR(255),",
            "      school_year VARCHAR(20) NOT NULL,",
            "      grades JSONB NOT NULL DEFAULT '[]'::jsonb,",
            "      remarks TEXT,",
            "      created_at TIMESTAMPTZ DEFAULT NOW(),",
            "      updated_at TIMESTAMPTZ DEFAULT NOW()",
            "    );",
            "    ALTER TABLE public.scholars ENABLE ROW LEVEL SECURITY;",
            "  END IF;",
            "",
            "  -- 2. Detect naming convention and existing columns",
            "  SELECT EXISTS (",
            "    SELECT 1 FROM information_schema.columns",
            "    WHERE table_schema = 'public' AND table_name = 'scholars' AND column_name = 'firstName'",
            "  ) INTO v_use_camel;",
            "",
            "  SELECT column_name INTO v_c_school_id FROM information_schema.columns WHERE table_schema='public' AND table_name='scholars' AND column_name IN ('school_id','schoolId') LIMIT 1;",
            "  SELECT column_name INTO v_c_first FROM information_schema.columns WHERE table_schema='public' AND table_name='scholars' AND column_name IN ('first_name','firstName') LIMIT 1;",
            "  SELECT column_name INTO v_c_middle FROM information_schema.columns WHERE table_schema='public' AND table_name='scholars' AND column_name IN ('middle_name','middleName') LIMIT 1;",
            "  SELECT column_name INTO v_c_last FROM information_schema.columns WHERE table_schema='public' AND table_name='scholars' AND column_name IN ('last_name','lastName') LIMIT 1;",
            "  SELECT column_name INTO v_c_suffix FROM information_schema.columns WHERE table_schema='public' AND table_name='scholars' AND column_name = 'suffix' LIMIT 1;",
            "  SELECT column_name INTO v_c_gender FROM information_schema.columns WHERE table_schema='public' AND table_name='scholars' AND column_name = 'gender' LIMIT 1;",
            "  SELECT column_name INTO v_c_barangay FROM information_schema.columns WHERE table_schema='public' AND table_name='scholars' AND column_name = 'barangay' LIMIT 1;",
            "  SELECT column_name INTO v_c_school FROM information_schema.columns WHERE table_schema='public' AND table_name='scholars' AND column_name = 'school' LIMIT 1;",
            "  SELECT column_name INTO v_c_course FROM information_schema.columns WHERE table_schema='public' AND table_name='scholars' AND column_name = 'course' LIMIT 1;",
            "  SELECT column_name INTO v_c_year_level FROM information_schema.columns WHERE table_schema='public' AND table_name='scholars' AND column_name IN ('year_level','yearLevel') LIMIT 1;",
            "  SELECT column_name INTO v_c_semester FROM information_schema.columns WHERE table_schema='public' AND table_name='scholars' AND column_name = 'semester' LIMIT 1;",
            "  SELECT column_name INTO v_c_school_year FROM information_schema.columns WHERE table_schema='public' AND table_name='scholars' AND column_name IN ('school_year','schoolYear') LIMIT 1;",
            "  SELECT column_name INTO v_c_sch_amt FROM information_schema.columns WHERE table_schema='public' AND table_name='scholars' AND column_name IN ('scholarship_amount','scholarshipAmount') LIMIT 1;",
            "  SELECT column_name INTO v_c_amt FROM information_schema.columns WHERE table_schema='public' AND table_name='scholars' AND column_name = 'amount' LIMIT 1;",
            "  SELECT column_name INTO v_c_pay_status FROM information_schema.columns WHERE table_schema='public' AND table_name='scholars' AND column_name IN ('payment_status','paymentStatus') LIMIT 1;",
            "  SELECT column_name INTO v_c_status FROM information_schema.columns WHERE table_schema='public' AND table_name='scholars' AND column_name = 'status' LIMIT 1;",
            "  SELECT column_name INTO v_c_sch_status FROM information_schema.columns WHERE table_schema='public' AND table_name='scholars' AND column_name IN ('scholar_status','scholarStatus') LIMIT 1;",
            "  SELECT column_name INTO v_c_year_grad FROM information_schema.columns WHERE table_schema='public' AND table_name='scholars' AND column_name IN ('year_graduated','yearGraduated') LIMIT 1;",
            "  SELECT column_name INTO v_c_pwd FROM information_schema.columns WHERE table_schema='public' AND table_name='scholars' AND column_name IN ('is_pwd','isPwd') LIMIT 1;",
            "  SELECT column_name INTO v_c_solo FROM information_schema.columns WHERE table_schema='public' AND table_name='scholars' AND column_name IN ('is_solo_parent','isSoloParent') LIMIT 1;",
            "  SELECT column_name INTO v_c_contact FROM information_schema.columns WHERE table_schema='public' AND table_name='scholars' AND column_name IN ('contact_number','contactNumber') LIMIT 1;",
            "  SELECT column_name INTO v_c_grades FROM information_schema.columns WHERE table_schema='public' AND table_name='scholars' AND column_name = 'grades' LIMIT 1;",
            "  SELECT column_name INTO v_c_remarks FROM information_schema.columns WHERE table_schema='public' AND table_name='scholars' AND column_name = 'remarks' LIMIT 1;",
            "",
            "  -- 3. Add missing columns",
            "  IF v_c_suffix IS NULL THEN ALTER TABLE public.scholars ADD COLUMN suffix TEXT DEFAULT 'None'; v_c_suffix := 'suffix'; END IF;",
            "  IF v_c_gender IS NULL THEN ALTER TABLE public.scholars ADD COLUMN gender TEXT NOT NULL DEFAULT 'Male'; v_c_gender := 'gender'; END IF;",
            "  IF v_c_semester IS NULL THEN ALTER TABLE public.scholars ADD COLUMN semester TEXT; v_c_semester := 'semester'; END IF;",
            "  IF v_c_pwd IS NULL THEN ALTER TABLE public.scholars ADD COLUMN is_pwd BOOLEAN NOT NULL DEFAULT FALSE; v_c_pwd := 'is_pwd'; END IF;",
            "  IF v_c_solo IS NULL THEN ALTER TABLE public.scholars ADD COLUMN is_solo_parent BOOLEAN NOT NULL DEFAULT FALSE; v_c_solo := 'is_solo_parent'; END IF;",
            "  IF v_c_sch_amt IS NULL THEN ALTER TABLE public.scholars ADD COLUMN scholarship_amount NUMERIC(10,2) NOT NULL DEFAULT 0; v_c_sch_amt := 'scholarship_amount'; END IF;",
            "  IF v_c_sch_status IS NULL THEN",
            "    IF v_use_camel THEN ALTER TABLE public.scholars ADD COLUMN \"scholarStatus\" TEXT NOT NULL DEFAULT 'Active'; v_c_sch_status := 'scholarStatus';",
            "    ELSE ALTER TABLE public.scholars ADD COLUMN scholar_status TEXT NOT NULL DEFAULT 'Active'; v_c_sch_status := 'scholar_status'; END IF;",
            "  END IF;",
            "  IF v_c_pay_status IS NULL THEN",
            "    IF v_use_camel THEN ALTER TABLE public.scholars ADD COLUMN \"paymentStatus\" TEXT NOT NULL DEFAULT 'Processing'; v_c_pay_status := 'paymentStatus';",
            "    ELSE ALTER TABLE public.scholars ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'Processing'; v_c_pay_status := 'payment_status'; END IF;",
            "  END IF;",
            "  IF v_c_year_grad IS NULL THEN",
            "    IF v_use_camel THEN ALTER TABLE public.scholars ADD COLUMN \"yearGraduated\" INTEGER; v_c_year_grad := 'yearGraduated';",
            "    ELSE ALTER TABLE public.scholars ADD COLUMN year_graduated INTEGER; v_c_year_grad := 'year_graduated'; END IF;",
            "  END IF;",
            "  IF v_c_grades IS NULL THEN ALTER TABLE public.scholars ADD COLUMN grades JSONB NOT NULL DEFAULT '[]'::jsonb; v_c_grades := 'grades'; END IF;",
            "  IF v_c_remarks IS NULL THEN ALTER TABLE public.scholars ADD COLUMN remarks TEXT; v_c_remarks := 'remarks'; END IF;",
            "",
            "  IF v_c_status IS NOT NULL THEN",
            "    SELECT EXISTS (",
            "      SELECT 1 FROM pg_constraint",
            "      WHERE conrelid = 'public.scholars'::regclass AND contype = 'c'",
            "        AND pg_get_constraintdef(oid) ~* '\\mstatus\\M'",
            "        AND pg_get_constraintdef(oid) ~* 'Graduated'",
            "    ) INTO v_status_holds_scholar_state;",
            "  END IF;",
            "",
            "  -- 4. Update CHECK constraints safely",
            "  FOR v_con IN",
            "    SELECT conname, pg_get_constraintdef(oid) AS condef",
            "    FROM pg_constraint",
            "    WHERE conrelid = 'public.scholars'::regclass AND contype = 'c'",
            "  LOOP",
            "    IF v_con.condef ~* '\\m(barangay|semester|suffix|year_level|yearLevel|gender)\\M' THEN",
            "      EXECUTE format('ALTER TABLE public.scholars DROP CONSTRAINT IF EXISTS %I', v_con.conname);",
            "    END IF;",
            "  END LOOP;",
            "",
            "  ALTER TABLE public.scholars DROP CONSTRAINT IF EXISTS check_barangay_values;",
            "  ALTER TABLE public.scholars ADD CONSTRAINT check_barangay_values CHECK (barangay IN (",
            "    'Atate','Aulo','Bagong Buhay','Caballero','Caimito','Doña Josefa',",
            "    'Ganaderia','Imelda Valley','Langka','Malate','Maligaya','Manacnac',",
            "    'Mapait','Marcos Village','Militar','Popolon','Santolan','Sapang Buho',",
            "    'Singalat','Other'",
            "  ));",
            "  ALTER TABLE public.scholars DROP CONSTRAINT IF EXISTS check_semester_values;",
            "  ALTER TABLE public.scholars ADD CONSTRAINT check_semester_values CHECK (semester IS NULL OR semester IN ('1st Sem','2nd Sem','3rd Sem','Summer'));",
            "  ALTER TABLE public.scholars DROP CONSTRAINT IF EXISTS check_suffix_values;",
            "  ALTER TABLE public.scholars ADD CONSTRAINT check_suffix_values CHECK (suffix IS NULL OR suffix IN ('None','Jr.','Sr.','II','III','IV','V'));",
            "  ALTER TABLE public.scholars DROP CONSTRAINT IF EXISTS check_gender_values;",
            "  ALTER TABLE public.scholars ADD CONSTRAINT check_gender_values CHECK (gender IN ('Male','Female'));",
            "  ALTER TABLE public.scholars DROP CONSTRAINT IF EXISTS check_year_level_values;",
            "  EXECUTE format('ALTER TABLE public.scholars ADD CONSTRAINT check_year_level_values CHECK (%I IN (''1st Year'',''2nd Year'',''3rd Year'',''4th Year'',''5th Year'',''6th Year''))', v_c_year_level);",
            "",
            "  -- 5. Dynamically assemble idempotent INSERT INTO public.scholars",
            "  IF v_c_school_id IS NOT NULL THEN v_ins_cols := array_append(v_ins_cols, format('%I', v_c_school_id)); v_sel_exprs := array_append(v_sel_exprs, 's.import_key'::TEXT); END IF;",
            "  v_ins_cols := array_append(v_ins_cols, format('%I', v_c_first));        v_sel_exprs := array_append(v_sel_exprs, 's.first_name'::TEXT);",
            "  IF v_c_middle IS NOT NULL THEN v_ins_cols := array_append(v_ins_cols, format('%I', v_c_middle)); v_sel_exprs := array_append(v_sel_exprs, 's.middle_name'::TEXT); END IF;",
            "  v_ins_cols := array_append(v_ins_cols, format('%I', v_c_last));         v_sel_exprs := array_append(v_sel_exprs, 's.last_name'::TEXT);",
            "  v_ins_cols := array_append(v_ins_cols, format('%I', v_c_suffix));       v_sel_exprs := array_append(v_sel_exprs, 's.suffix'::TEXT);",
            "  v_ins_cols := array_append(v_ins_cols, format('%I', v_c_gender));       v_sel_exprs := array_append(v_sel_exprs, 's.gender'::TEXT);",
            "  v_ins_cols := array_append(v_ins_cols, format('%I', v_c_barangay));     v_sel_exprs := array_append(v_sel_exprs, 's.barangay'::TEXT);",
            "  v_ins_cols := array_append(v_ins_cols, format('%I', v_c_school));       v_sel_exprs := array_append(v_sel_exprs, 's.school'::TEXT);",
            "  IF v_c_course IS NOT NULL THEN v_ins_cols := array_append(v_ins_cols, format('%I', v_c_course)); v_sel_exprs := array_append(v_sel_exprs, 's.course'::TEXT); END IF;",
            "  v_ins_cols := array_append(v_ins_cols, format('%I', v_c_year_level));   v_sel_exprs := array_append(v_sel_exprs, 's.year_level'::TEXT);",
            "  IF v_c_semester IS NOT NULL THEN v_ins_cols := array_append(v_ins_cols, format('%I', v_c_semester)); v_sel_exprs := array_append(v_sel_exprs, 's.semester'::TEXT); END IF;",
            "  IF v_c_school_year IS NOT NULL THEN v_ins_cols := array_append(v_ins_cols, format('%I', v_c_school_year)); v_sel_exprs := array_append(v_sel_exprs, 's.school_year'::TEXT); END IF;",
            "  v_ins_cols := array_append(v_ins_cols, format('%I', v_c_sch_amt));      v_sel_exprs := array_append(v_sel_exprs, 's.scholarship_amount'::TEXT);",
            "  IF v_c_amt IS NOT NULL THEN v_ins_cols := array_append(v_ins_cols, format('%I', v_c_amt)); v_sel_exprs := array_append(v_sel_exprs, 's.scholarship_amount'::TEXT); END IF;",
            "  v_ins_cols := array_append(v_ins_cols, format('%I', v_c_pay_status));   v_sel_exprs := array_append(v_sel_exprs, 's.payment_status'::TEXT);",
            "  IF v_c_status IS NOT NULL THEN",
            "    v_ins_cols := array_append(v_ins_cols, format('%I', v_c_status));",
            "    v_sel_exprs := array_append(v_sel_exprs, CASE WHEN v_status_holds_scholar_state THEN 's.scholar_status'::TEXT ELSE 's.payment_status'::TEXT END);",
            "  END IF;",
            "  v_ins_cols := array_append(v_ins_cols, format('%I', v_c_sch_status));   v_sel_exprs := array_append(v_sel_exprs, 's.scholar_status'::TEXT);",
            "  v_ins_cols := array_append(v_ins_cols, format('%I', v_c_year_grad));    v_sel_exprs := array_append(v_sel_exprs, 's.year_graduated'::TEXT);",
            "  v_ins_cols := array_append(v_ins_cols, format('%I', v_c_pwd));          v_sel_exprs := array_append(v_sel_exprs, 's.is_pwd'::TEXT);",
            "  v_ins_cols := array_append(v_ins_cols, format('%I', v_c_solo));         v_sel_exprs := array_append(v_sel_exprs, 's.is_solo_parent'::TEXT);",
            "  IF v_c_contact IS NOT NULL THEN v_ins_cols := array_append(v_ins_cols, format('%I', v_c_contact)); v_sel_exprs := array_append(v_sel_exprs, 's.contact_number'::TEXT); END IF;",
            "  v_ins_cols := array_append(v_ins_cols, format('%I', v_c_grades));       v_sel_exprs := array_append(v_sel_exprs, 's.grades'::TEXT);",
            "  v_ins_cols := array_append(v_ins_cols, format('%I', v_c_remarks));      v_sel_exprs := array_append(v_sel_exprs, 's.remarks'::TEXT);",
            "",
            "  v_dedup_cond := format(",
            "    'LOWER(t.%I) = LOWER(s.first_name) AND LOWER(t.%I) = LOWER(s.last_name) AND COALESCE(t.%I, ''None'') = s.suffix AND LOWER(t.%I) = LOWER(s.school)',",
            "    v_c_first, v_c_last, v_c_suffix, v_c_school",
            "  );",
            "  IF v_c_school_id IS NOT NULL THEN",
            "    v_dedup_cond := format('(LOWER(t.%I) = LOWER(s.import_key) OR (%s))', v_c_school_id, v_dedup_cond);",
            "  END IF;",
            "",
            "  SELECT COUNT(*) INTO v_staged FROM _iskolar_import_stage;",
            "  v_sql := format(",
            "    'INSERT INTO public.scholars (%s) SELECT %s FROM _iskolar_import_stage s WHERE NOT EXISTS (SELECT 1 FROM public.scholars t WHERE %s)',",
            "    array_to_string(v_ins_cols, ', '),",
            "    array_to_string(v_sel_exprs, ', '),",
            "    v_dedup_cond",
            "  );",
            "  EXECUTE v_sql;",
            "  GET DIAGNOSTICS v_inserted = ROW_COUNT;",
            "",
            "  -- 6. Unnest ALL multi-term grades into public.scholar_grades if table exists",
            "  IF to_regclass('public.scholar_grades') IS NOT NULL THEN",
            "    SELECT column_name INTO v_g_scholar_id FROM information_schema.columns WHERE table_schema='public' AND table_name='scholar_grades' AND column_name IN ('scholar_id','scholarId') LIMIT 1;",
            "    SELECT column_name INTO v_g_sy FROM information_schema.columns WHERE table_schema='public' AND table_name='scholar_grades' AND column_name IN ('school_year','schoolYear') LIMIT 1;",
            "    SELECT column_name INTO v_g_sem FROM information_schema.columns WHERE table_schema='public' AND table_name='scholar_grades' AND column_name = 'semester' LIMIT 1;",
            "    SELECT column_name INTO v_g_gwa FROM information_schema.columns WHERE table_schema='public' AND table_name='scholar_grades' AND column_name = 'gwa' LIMIT 1;",
            "",
            "    FOR v_con IN",
            "      SELECT conname, pg_get_constraintdef(oid) AS condef",
            "      FROM pg_constraint",
            "      WHERE conrelid = 'public.scholar_grades'::regclass AND contype = 'c'",
            "    LOOP",
            "      IF v_con.condef ~* '\\m(gwa|semester)\\M' THEN",
            "        EXECUTE format('ALTER TABLE public.scholar_grades DROP CONSTRAINT IF EXISTS %I', v_con.conname);",
            "      END IF;",
            "    END LOOP;",
            "",
            "    IF v_g_gwa IS NOT NULL THEN",
            "      EXECUTE format('ALTER TABLE public.scholar_grades ALTER COLUMN %I TYPE NUMERIC(5,2)', v_g_gwa);",
            "      ALTER TABLE public.scholar_grades DROP CONSTRAINT IF EXISTS check_gwa_dual_scale;",
            "      EXECUTE format('ALTER TABLE public.scholar_grades ADD CONSTRAINT check_gwa_dual_scale CHECK ((%I >= 1.00 AND %I <= 5.00) OR (%I >= 50.00 AND %I <= 100.00))', v_g_gwa, v_g_gwa, v_g_gwa, v_g_gwa);",
            "    END IF;",
            "    IF v_g_sem IS NOT NULL THEN",
            "      ALTER TABLE public.scholar_grades DROP CONSTRAINT IF EXISTS check_grade_semester_values;",
            "      EXECUTE format('ALTER TABLE public.scholar_grades ADD CONSTRAINT check_grade_semester_values CHECK (%I IN (''1st Semester'',''2nd Semester'',''3rd Semester'',''Summer''))', v_g_sem);",
            "    END IF;",
            "",
            "    IF v_g_scholar_id IS NOT NULL AND v_g_sy IS NOT NULL AND v_g_sem IS NOT NULL AND v_g_gwa IS NOT NULL THEN",
            "      v_sql := format(",
            "        'INSERT INTO public.scholar_grades (%I, %I, %I, %I) '",
            "        || 'SELECT DISTINCT ON (t.id, g_el->>''schoolYear'', g_el->>''semester'') '",
            "        || '  t.id, g_el->>''schoolYear'', g_el->>''semester'', (g_el->>''gwa'')::numeric(5,2) '",
            "        || 'FROM _iskolar_import_stage s '",
            "        || 'CROSS JOIN LATERAL jsonb_array_elements(s.grades) AS g_el '",
            "        || 'JOIN public.scholars t ON LOWER(t.%I) = LOWER(s.first_name) AND LOWER(t.%I) = LOWER(s.last_name) AND COALESCE(t.%I, ''None'') = s.suffix AND LOWER(t.%I) = LOWER(s.school) '",
            "        || 'WHERE NOT EXISTS (SELECT 1 FROM public.scholar_grades g WHERE g.%I = t.id AND g.%I = (g_el->>''schoolYear'') AND g.%I = (g_el->>''semester''))',",
            "        v_g_scholar_id, v_g_sy, v_g_sem, v_g_gwa, v_c_first, v_c_last, v_c_suffix, v_c_school, v_g_scholar_id, v_g_sy, v_g_sem",
            "      );",
            "      EXECUTE v_sql;",
            "      GET DIAGNOSTICS v_g_inserted = ROW_COUNT;",
            "    END IF;",
            "  END IF;",
            "",
            "  RAISE NOTICE 'Iskolar import complete -> Staged unique scholars: %, Newly inserted: %, Linked multi-term grade rows: %, camelCase schema: %',",
            "    v_staged, v_inserted, v_g_inserted, v_use_camel;",
            "END $$;",
            "",
            "COMMIT;",
            "",
            "-- =============================================================================",
            "-- Post-Commit Verification Queries",
            "-- =============================================================================",
            "SELECT public.public_dashboard_stats();",
            "SELECT * FROM public.public_graduates_by_school();",
            "",
        ]
    )

    out_path.write_text("\n".join(lines), encoding="utf-8")


def write_audit_report(records: list[dict[str, Any]], stats: dict[str, Any], out_path: Path) -> None:
    lines: list[str] = []
    lines.append("# Excel Import Audit Report (Unique-Scholar Edition)")
    lines.append("")
    lines.append(f"- **Source Workbook**: `{XLSX_PATH.name}`")
    lines.append(f"- **Generated SQL Script**: `{SQL_OUT_PATH.name}`")
    lines.append(f"- **Total Unique Scholars**: **{stats['total']}**")
    lines.append(f"- **Total Merged Grade Entries (`grades[]`)**: **{stats['total_grade_entries']}** ({stats['multi_term_scholars']} scholars with multi-term grade history)")
    lines.append("")
    lines.append("## 1. Summary Breakdown")
    lines.append("")
    lines.append("### By Primary Group")
    lines.append("| Primary Source Group | Unique Scholars |")
    lines.append("|---|---:|")
    for grp, cnt in stats["by_group"].items():
        lines.append(f"| {grp} | {cnt} |")
    lines.append("")
    lines.append("### By School Year, Scholar Status & Payment Status")
    lines.append("| Dimension | Value | Count |")
    lines.append("|---|---|---:|")
    for sy, cnt in sorted(stats["by_sy"].items()):
        lines.append(f"| School Year | `{sy}` | {cnt} |")
    for st, cnt in sorted(stats["by_scholar_status"].items()):
        lines.append(f"| Scholar Status | `{st}` | {cnt} |")
    for ps, cnt in sorted(stats["by_payment_status"].items()):
        lines.append(f"| Payment Status (Overall) | `{ps}` | {cnt} |")
    lines.append(f"| Payment Status (`2026-2027` billed in `statement 1st26-27`) | `Paid` | {stats['by_payment_2627']['Paid']} |")
    lines.append(f"| Payment Status (`2026-2027` not in `statement 1st26-27`) | `Processing` | {stats['by_payment_2627']['Processing']} |")
    lines.append("")
    lines.append(f"## 2. Excluded Non-Eligible / Cancelled Rows ({len(stats['excluded_rows'])})")
    lines.append("")
    lines.append("| Source | Name | Reason |")
    lines.append("|---|---|---|")
    for ex in stats["excluded_rows"]:
        lines.append(f"| `{ex['source']}` | {ex['name']} | {ex['reason']} |")
    lines.append("")
    lines.append(f"## 3. Merged Multi-Term & Spelling-Variant Records ({len(stats['merged_events'])} merges)")
    lines.append("")
    reason_counts = Counter(m["reason"].split(" (")[0] for m in stats["merged_events"])
    for rsn, cnt in reason_counts.most_common():
        lines.append(f"- **{cnt}** merges: {rsn}")
    lines.append("")
    lines.append("<details><summary>Spelling-variant & cross-sheet merges sample (first 40)</summary>\n")
    non_exact = [m for m in stats["merged_events"] if "exact name" not in m["reason"]]
    for m in non_exact[:40]:
        lines.append(f"- Kept `{m['kept']}` ⇐ merged `{m['merged']}` *({m['reason']})*")
    lines.append("\n</details>")
    lines.append("")
    lines.append(f"## 4. Canonicalized Schools ({len(stats['by_school'])}) & Courses ({len(stats['by_course'])})")
    lines.append("")
    lines.append("| Canonical School Name | Scholars |")
    lines.append("|---|---:|")
    for sc, cnt in stats["by_school"].most_common():
        lines.append(f"| {sc} | {cnt} |")
    lines.append("")
    lines.append("| Canonical Course Name | Scholars |")
    lines.append("|---|---:|")
    for co, cnt in stats["by_course"].most_common():
        lines.append(f"| {co} | {cnt} |")
    lines.append("")
    lines.append("## 5. Items Requiring Manual Admin Verification")
    lines.append("")
    lines.append(f"### 5A. Outlier Scholarship Amounts (> ₱65,000 or ₱0.00 — {len(stats['outlier_amounts'])} scholars)")
    lines.append("| Import Key | Source | Scholar | School | Course | Amount |")
    lines.append("|---|---|---|---|---|---:|")
    for o in stats["outlier_amounts"]:
        lines.append(f"| `{o['import_key']}` | `{o['source']}` | {o['name']} | {o['school']} | {o['course'] or '—'} | ₱{o['amount']:,.2f} |")
    lines.append("")
    lines.append(f"### 5B. Missing or Potentially Swapped Excel Gender Marks ({len(stats['suspect_genders'])} scholars)")
    lines.append("| Import Key | Source | Scholar | Assigned Gender | Verification Note |")
    lines.append("|---|---|---|---|---|")
    for sg in stats["suspect_genders"]:
        lines.append(f"| `{sg['import_key']}` | `{sg['source']}` | {sg['name']} | `{sg['assigned_gender']}` | {sg['note']} |")
    lines.append("")
    lines.append(f"### 5C. All Other Auto-Fixes ({len(stats['audit_fixes'])} scholars)")
    lines.append("| Import Key | Source | Raw Name | Cleaned Name | Auto-Fixes |")
    lines.append("|---|---|---|---|---|")
    for item in stats["audit_fixes"]:
        lines.append(
            f"| `{item['import_key']}` | `{item['source']}` | {item['raw_name']} | {item['clean_name']} | {'; '.join(item['flags'])} |"
        )
    lines.append("")
    out_path.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    if not XLSX_PATH.exists():
        print(f"ERROR: Workbook not found at {XLSX_PATH}", file=sys.stderr)
        return 1

    sheet_max_rows = {
        "1stSem 2026-2027": 1500,
        "Graduate Batch 2025-2026": 1500,
        "2nd Sem 2025-2026 final": 1500,
        "1st New 2026-2027": 1500,
        "WAITING CHANCE-2nd batch August": 1500,
        "statement 1st26-27": 7500,
    }
    sheets_data = load_workbook_sheets(XLSX_PATH, sheet_max_rows)
    records, stats = build_records(sheets_data)
    write_sql(records, stats, SQL_OUT_PATH)
    write_audit_report(records, stats, AUDIT_OUT_PATH)

    print(f"Generated {SQL_OUT_PATH} ({SQL_OUT_PATH.stat().st_size:,} bytes)")
    print(f"Generated {AUDIT_OUT_PATH} ({AUDIT_OUT_PATH.stat().st_size:,} bytes)")
    print(f"Total unique scholars: {stats['total']} | Grade entries: {stats['total_grade_entries']} (multi-term: {stats['multi_term_scholars']})")
    print("Groups:", dict(stats["by_group"]))
    print("School Years:", dict(stats["by_sy"]))
    print("Scholar Status:", dict(stats["by_scholar_status"]))
    print("Payment Status:", dict(stats["by_payment_status"]), "| 2026-2027:", dict(stats["by_payment_2627"]))
    print(f"Schools: {len(stats['by_school'])} | Courses: {len(stats['by_course'])} | Excluded: {len(stats['excluded_rows'])} | Merges: {len(stats['merged_events'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
