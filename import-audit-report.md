# Excel Import Audit Report (Unique-Scholar Edition)

- **Source Workbook**: `LGU-ISKO-1st SEMESTER 2026-2027.xlsx`
- **Generated SQL Script**: `supabase-import-scholars.sql`
- **Total Unique Scholars**: **823**
- **Total Merged Grade Entries (`grades[]`)**: **1276** (443 scholars with multi-term grade history)

## 1. Summary Breakdown

### By Primary Group
| Primary Source Group | Unique Scholars |
|---|---:|
| 1stSem 2026-2027 (Renewal) | 308 |
| 1stSem 2026-2027 (Batch 2 New) | 186 |
| 1stSem 2026-2027 (Batch 1 New) | 92 |
| Graduate Batch 2025-2026 | 103 |
| 2nd Sem 2025-2026 final | 97 |
| 1st New 2026-2027 | 6 |
| WAITING CHANCE-2nd batch August | 31 |

### By School Year, Scholar Status & Payment Status
| Dimension | Value | Count |
|---|---|---:|
| School Year | `2024-2025` | 22 |
| School Year | `2025-2026` | 178 |
| School Year | `2026-2027` | 623 |
| Scholar Status | `Active` | 720 |
| Scholar Status | `Graduated` | 103 |
| Payment Status (Overall) | `Paid` | 750 |
| Payment Status (Overall) | `Processing` | 73 |
| Payment Status (`2026-2027` billed in `statement 1st26-27`) | `Paid` | 550 |
| Payment Status (`2026-2027` not in `statement 1st26-27`) | `Processing` | 73 |

## 2. Excluded Non-Eligible / Cancelled Rows (3)

| Source | Name | Reason |
|---|---|---|
| `2nd Sem 2025-2026 final R91` | Vangie Mary Bolima | Marked 'cancelled by student' in source |
| `1stSem 2026-2027 R71` | Vangie Mary Bolima | Marked 'cancelled by student' in source |
| `1st New 2026-2027 R25` | ANDREI G. SORIANO-no eligible | Marked 'no eligible' in source |

## 3. Merged Multi-Term & Spelling-Variant Records (657 merges)

- **415** merges: Merged 2nd Sem 2025-2026 grade
- **211** merges: Merged prior-term grade
- **18** merges: Merged pending/waitlist duplicate
- **7** merges: Merged Graduate Batch record
- **6** merges: Same active term / spelling match

<details><summary>Spelling-variant & cross-sheet merges sample (first 40)</summary>

- Kept `Jamie Nicole Hidalgo (1stSem 2026-2027 (R876))` ⇐ merged `Jaymee Nicole Hidalgo (Graduate Batch 2025-2026 (R15))` *(Merged Graduate Batch record (same phone + name sim 0.93))*
- Kept `Josha Mie Abrisinos (1stSem 2026-2027 (R349))` ⇐ merged `Josha Mie Abrisionos (2nd Sem 2025-2026 final (R83))` *(Merged 2nd Sem 2025-2026 grade (same phone + name sim 0.97))*
- Kept `Jhon David Retumalta (1stSem 2026-2027 (R318))` ⇐ merged `John David Retumalta (2nd Sem 2025-2026 final (R188))` *(Merged 2nd Sem 2025-2026 grade (same phone + name sim 0.95))*
- Kept `Jareca Capili (1stSem 2026-2027 (R602))` ⇐ merged `Jereca Capili (2nd Sem 2025-2026 final (R454))` *(Merged 2nd Sem 2025-2026 grade (same phone + name sim 0.92))*
- Kept `Nikki Mariel Jumao-As (1stSem 2026-2027 (R524))` ⇐ merged `Nukki Mariel Jumao-As (2nd Sem 2025-2026 final (R517))` *(Merged 2nd Sem 2025-2026 grade (same phone + name sim 0.95))*
- Kept `Rizalyn Nario Limbo (1stSem 2026-2027 (R890))` ⇐ merged `Rizalyn Limbo (WAITING CHANCE-2nd batch August (R38))` *(Merged pending/waitlist duplicate (first+last + school/phone))*
- Kept `Emma Rose Ravina (1stSem 2026-2027 (R785))` ⇐ merged `Ima Rose Ravina (WAITING CHANCE-2nd batch August (R41))` *(Merged pending/waitlist duplicate (same phone + name sim 0.90))*
- Kept `Roby Dave Bisa (1stSem 2026-2027 (R901))` ⇐ merged `Robby Dave Bisa (WAITING CHANCE-2nd batch August (R47))` *(Merged pending/waitlist duplicate (same school + name sim 0.97))*
- Kept `Ralph Jhustin Morondos (1stSem 2026-2027 (R942))` ⇐ merged `Ralph Jhustin Morondoz (WAITING CHANCE-2nd batch August (R55))` *(Merged pending/waitlist duplicate (same phone + name sim 0.95))*
- Kept `Precious Ann Fuertez (1stSem 2026-2027 (R926))` ⇐ merged `Precious Anne Fuertes (WAITING CHANCE-2nd batch August (R61))` *(Merged pending/waitlist duplicate (same phone + name sim 0.93))*
- Kept `Princess Anne Maridel Liban (1stSem 2026-2027 (R869))` ⇐ merged `Princess Anne Liban (WAITING CHANCE-2nd batch August (R63))` *(Merged pending/waitlist duplicate (first+last + school/phone))*
- Kept `Luis Anne Cortez (1stSem 2026-2027 (R923))` ⇐ merged `Luis Ann Cxortez (WAITING CHANCE-2nd batch August (R64))` *(Merged pending/waitlist duplicate (same phone + name sim 0.94))*
- Kept `Allysa Compas (1stSem 2026-2027 (R880))` ⇐ merged `Allizza Janelle Compas (WAITING CHANCE-2nd batch August (R69))` *(Merged pending/waitlist duplicate (same phone + school + last_name + year_level))*
- Kept `Azcerille Manuel (1stSem 2026-2027 (R796))` ⇐ merged `Azcerille Kyle Manuel (WAITING CHANCE-2nd batch August (R70))` *(Merged pending/waitlist duplicate (first+last + school/phone))*
- Kept `Krystal Esyaben (1stSem 2026-2027 (R958))` ⇐ merged `Crystal Cler Esyaben (WAITING CHANCE-2nd batch August (R75))` *(Merged pending/waitlist duplicate (same phone + school + last_name + year_level))*
- Kept `Princee Cabling (1stSem 2026-2027 (R962))` ⇐ merged `Princess Cabling (WAITING CHANCE-2nd batch August (R79))` *(Merged pending/waitlist duplicate (same phone + name sim 0.90))*
- Kept `Angel Dhea Mangaring (1stSem 2026-2027 (R802))` ⇐ merged `Angel Mangaring (WAITING CHANCE-2nd batch August (R84))` *(Merged pending/waitlist duplicate (first+last + school/phone))*
- Kept `Maria Lorriane Manuel (1stSem 2026-2027 (R964))` ⇐ merged `Ma. Lorraine Manuel (WAITING CHANCE-2nd batch August (R93))` *(Merged pending/waitlist duplicate (same phone + name sim 0.85))*

</details>

## 4. Canonicalized Schools (29) & Courses (41)

| Canonical School Name | Scholars |
|---|---:|
| Araullo University | 246 |
| Wesleyan University-Philippines | 234 |
| Good Samaritan Colleges | 147 |
| Manuel V. Gallego Foundation Colleges | 36 |
| Midway Colleges Inc. | 36 |
| College for Research and Technology | 35 |
| Dr. Gloria D. Lacson Foundation Colleges | 27 |
| Our Lady of Fatima University | 15 |
| Nueva Ecija Doctors College | 7 |
| Saint Louis University | 5 |
| Living Water Essential Colleges | 5 |
| ABE International Business College | 4 |
| National University | 3 |
| University of Baguio | 3 |
| University of the Cordilleras | 3 |
| Centro Escolar University | 2 |
| Asia Pacific College of Business and Arts | 2 |
| ACATECH Aviation College | 2 |
| Holy Cross College | 1 |
| Baliwag Maritime Academy | 1 |
| Far Eastern University | 1 |
| STI College Ortigas-Cainta | 1 |
| Fine City Colleges | 1 |
| Harris Memorial College | 1 |
| To Be Verified (ds) | 1 |
| St. Elizabeth Global Skills Institute Inc. | 1 |
| Nueva Ecija University of Science and Technology | 1 |
| To Be Verified | 1 |
| AMA Computer College | 1 |

| Canonical Course Name | Scholars |
|---|---:|
| BS Nursing | 220 |
| BS Criminology | 116 |
| BS Accountancy | 60 |
| BS Information Technology | 48 |
| BS Hospitality Management | 39 |
| Bachelor of Elementary Education | 37 |
| BS Business Administration | 30 |
| Bachelor of Secondary Education | 30 |
| BS Tourism Management | 30 |
| BS Medical Technology | 28 |
| BS Social Work | 25 |
| BS Radiologic Technology | 24 |
| BS Psychology | 21 |
| BS Marine Transportation | 20 |
| BS Civil Engineering | 20 |
| BS Marine Engineering | 14 |
| BS Pharmacy | 9 |
| Doctor of Dental Medicine | 7 |
| BS Respiratory Therapy | 6 |
| BS Medical Laboratory Science | 5 |
| BS Management Accounting | 4 |
| BS Entrepreneurship | 4 |
| BS Accounting Information System | 3 |
| BS Electrical Engineering | 3 |
| BA Political Science | 2 |
| Bachelor of Early Childhood Education | 2 |
| BS Aircraft Maintenance Technology | 2 |
| BS Medical Biology | 1 |
| BS Human Resource Management | 1 |
| BS Mechanical Engineering | 1 |
| BS Computer Science | 1 |
| Bachelor of Technical-Vocational Teacher Education | 1 |
| Associate in Computer Technology | 1 |
| BS Midwifery | 1 |
| BSEd Major in English | 1 |
| BS Computer Engineering | 1 |
| Bachelor of Physical Education | 1 |
| Bachelor of Teacher Education | 1 |
| BS Physical Therapy | 1 |
| BS Customs Administration | 1 |
| BS Architecture | 1 |

## 5. Items Requiring Manual Admin Verification

### 5A. Outlier Scholarship Amounts (> ₱65,000 or ₱0.00 — 14 scholars)
| Import Key | Source | Scholar | School | Course | Amount |
|---|---|---|---|---|---:|
| `ISKO-2627-0001` | `1stSem 2026-2027 (R531)` | Angel Grace Cortez | Centro Escolar University | Doctor of Dental Medicine | ₱84,097.00 |
| `ISKO-2627-0367` | `1stSem 2026-2027 (R901)` | Roby Dave Bisa | Centro Escolar University | Doctor of Dental Medicine | ₱65,072.00 |
| `ISKO-2627-0551` | `1stSem 2026-2027 (R910)` | Hazel Arcenas | College for Research and Technology | BS Information Technology | ₱157,007.50 |
| `ISKO-2526-0168` | `2nd Sem 2025-2026 final (R515)` | John Libreja | Araullo University | BS Nursing | ₱96,000.00 |
| `ISKO-2627-0591` | `1st New 2026-2027 (R40)` | Nickol Sebastian | Araullo University | BS Criminology | ₱0.00 |
| `ISKO-2627-0601` | `WAITING CHANCE-2nd batch August (R25)` | Rizzabelle Cayanga | Araullo University | BS Criminology | ₱0.00 |
| `ISKO-2627-0605` | `WAITING CHANCE-2nd batch August (R32)` | Avril Anne Joy Alvior | Araullo University | BS Criminology | ₱0.00 |
| `ISKO-2627-0606` | `WAITING CHANCE-2nd batch August (R35)` | Gian Paulo Ponce | Good Samaritan Colleges | BS Radiologic Technology | ₱0.00 |
| `ISKO-2627-0609` | `WAITING CHANCE-2nd batch August (R42)` | Erwina Nolasco | Wesleyan University-Philippines | BS Criminology | ₱0.00 |
| `ISKO-2627-0610` | `WAITING CHANCE-2nd batch August (R43)` | Marielle Fernandez | Wesleyan University-Philippines | BS Nursing | ₱0.00 |
| `ISKO-2627-0611` | `WAITING CHANCE-2nd batch August (R44)` | Charmaine Joy Martinez | ABE International Business College | BS Hospitality Management | ₱0.00 |
| `ISKO-2627-0612` | `WAITING CHANCE-2nd batch August (R46)` | Jake Aldrich Ferrer | Araullo University | BS Information Technology | ₱0.00 |
| `ISKO-2627-0616` | `WAITING CHANCE-2nd batch August (R59)` | Ecn Drake Bambalan | Araullo University | BS Civil Engineering | ₱0.00 |
| `ISKO-2627-0619` | `WAITING CHANCE-2nd batch August (R82)` | Mercy Sumallo | Good Samaritan Colleges | BS Nursing | ₱0.00 |

### 5B. Missing or Potentially Swapped Excel Gender Marks (16 scholars)
| Import Key | Source | Scholar | Assigned Gender | Verification Note |
|---|---|---|---|---|
| `ISKO-2627-0065` | `1stSem 2026-2027 (R483)` | Jel Anusencion | `Female` | Missing/both K&L in Excel (1stSem 2026-2027 R483); set 'Female' |
| `ISKO-2627-0106` | `1stSem 2026-2027 (R890)` | Rizalyn Nario Limbo | `Female` | Conflicting gender in WAITING CHANCE-2nd batch August (R38) (Male) |
| `ISKO-2627-0114` | `1stSem 2026-2027 (R300)` | Maila Superales Estigoy | `Female` | Missing/both K&L in Excel (1stSem 2026-2027 R300); set 'Female' |
| `ISKO-2627-0321` | `1stSem 2026-2027 (R580)` | Ken Sheen Mae Andasan | `Female` | Marked Female (Col L) in 1stSem 2026-2027 R580 despite masculine name/suffix 'Ken Sheen Mae Andasan' |
| `ISKO-2627-0367` | `1stSem 2026-2027 (R901)` | Roby Dave Bisa | `Male` | Conflicting gender in WAITING CHANCE-2nd batch August (R47) (Female) |
| `ISKO-2627-0417` | `1stSem 2026-2027 (R688)` | John Kelly Martinez | `Female` | Marked Female (Col L) in 1stSem 2026-2027 R688 despite masculine name/suffix 'John Kelly Martinez' |
| `ISKO-2627-0503` | `1stSem 2026-2027 (R827)` | Lyra Salvador II | `Female` | Marked Female (Col L) in 1stSem 2026-2027 R827 despite masculine name/suffix 'Lyra Salvador II' |
| `ISKO-2526-0148` | `2nd Sem 2025-2026 final (R287)` | Ashley Hilario | `Male` | Marked Male (Col K) in 2nd Sem 2025-2026 final R287 despite feminine first name 'Ashley' |
| `ISKO-2526-0163` | `2nd Sem 2025-2026 final (R492)` | Marjorie Fernandez | `Male` | Marked Male (Col K) in 2nd Sem 2025-2026 final R492 despite feminine first name 'Marjorie' |
| `ISKO-2627-0588` | `1st New 2026-2027 (R22)` | Jayson Villasan | `Female` | Marked Female (Col L) in 1st New 2026-2027 R22 despite masculine name/suffix 'Jayson Villasan' |
| `ISKO-2627-0590` | `1st New 2026-2027 (R27)` | April Joy Trinidad | `Male` | Marked Male (Col K) in 1st New 2026-2027 R27 despite feminine first name 'April Joy' |
| `ISKO-2627-0605` | `WAITING CHANCE-2nd batch August (R32)` | Avril Anne Joy Alvior | `Male` | Marked Male (Col K) in WAITING CHANCE-2nd batch August R32 despite feminine first name 'Avril Anne Joy' |
| `ISKO-2627-0609` | `WAITING CHANCE-2nd batch August (R42)` | Erwina Nolasco | `Male` | Marked Male (Col K) in WAITING CHANCE-2nd batch August R42 despite feminine first name 'Erwina' |
| `ISKO-2627-0610` | `WAITING CHANCE-2nd batch August (R43)` | Marielle Fernandez | `Male` | Marked Male (Col K) in WAITING CHANCE-2nd batch August R43 despite feminine first name 'Marielle' |
| `ISKO-2627-0612` | `WAITING CHANCE-2nd batch August (R46)` | Jake Aldrich Ferrer | `Female` | Marked Female (Col L) in WAITING CHANCE-2nd batch August R46 despite masculine name/suffix 'Jake Aldrich Ferrer' |
| `ISKO-2627-0620` | `WAITING CHANCE-2nd batch August (R83)` | Joie Castelo Jr. | `Female` | Marked Female (Col L) in WAITING CHANCE-2nd batch August R83 despite masculine name/suffix 'Joie Castelo Jr.' |

### 5C. All Other Auto-Fixes (36 scholars)
| Import Key | Source | Raw Name | Cleaned Name | Auto-Fixes |
|---|---|---|---|---|
| `ISKO-2627-0031` | `1stSem 2026-2027 R394` | Regine Quitoriano | Regine Quitoriano | Fixed malformed amount '36.087.44' -> 36087.44 |
| `ISKO-2627-0043` | `1stSem 2026-2027 R435` | Halie Carter Herrera | Halie Carter Herrera | Irregular contact number '09385-126-1239' preserved as '09385-126-1239' |
| `ISKO-2627-0065` | `1stSem 2026-2027 R483` | Jel Anusencion | Jel Anusencion | Gender missing/both in 1stSem 2026-2027 R483; set 'Female' (verify) |
| `ISKO-2627-0108` | `1stSem 2026-2027 R906` | Angel Larriane Regaspi | Angel Larriane Regaspi | Split multi-contact '0951-244-2481/0951-244-9481' -> primary '0951-244-2481', alt in remarks |
| `ISKO-2627-0114` | `1stSem 2026-2027 R300` | Maila Superales Estigoy | Maila Superales Estigoy | Gender missing/both in 1stSem 2026-2027 R300; set 'Female' (verify) |
| `ISKO-2627-0135` | `1stSem 2026-2027 R388` | Rouie Bryan Ayroso | Rouie Bryan Ayroso | Fixed barangay typo 'Mapaet' -> 'Mapait' |
| `ISKO-2627-0148` | `1stSem 2026-2027 R429` | Lady Gwen Gudoy | Lady Gwen Gudoy | Fixed barangay typo 'Saingalat' -> 'Singalat' |
| `ISKO-2627-0186` | `1stSem 2026-2027 R550` | French Angel Alog | French Angel Alog | Irregular contact number '092-904-8355' preserved as '092-904-8355' |
| `ISKO-2627-0199` | `1stSem 2026-2027 R576` | Ezekiel Garcia | Ezekiel Garcia | Normalized year level '3rd-irre' -> '3rd Year' |
| `ISKO-2627-0212` | `1stSem 2026-2027 R795` | Jhonelle Barrientos | Jhonelle Barrientos | Split multi-contact '0927-496-9142/0931-960-7690' -> primary '0927-496-9142', alt in remarks |
| `ISKO-2627-0277` | `1stSem 2026-2027 R410` | Rose Angela Patrice Espanol | Rose Angela Patrice Espanol | Empty course -> NULL |
| `ISKO-2627-0299` | `1stSem 2026-2027 R475` | Aiza Mato | Aiza Mato | Irregular contact number '099-708-3652' preserved as '099-708-3652' |
| `ISKO-2627-0436` | `1stSem 2026-2027 R711` | JHILLEANE ROCHEANE GONZALES | Jhilleane Rocheane Gonzales | Out-of-range grade 9.0 in 1stSem 2026-2027 R711 -> cleared (NULL) |
| `ISKO-2627-0442` | `1stSem 2026-2027 R720` | Christine Mae A Sabado | Christine Mae A. Sabado | Recovered blank school 'Wesleyan University-Philippines' from statement 1st26-27 R1218 |
| `ISKO-2627-0446` | `1stSem 2026-2027 R724` | FIONA VALENTINO | Fiona Valentino | Normalized year level '!st Year' -> '1st Year' |
| `ISKO-2627-0471` | `1stSem 2026-2027 R751` | Ellaine Andrea S Domingo | Ellaine Andrea S. Domingo | Normalized year level '1st yeare' -> '1st Year' |
| `ISKO-2627-0478` | `1stSem 2026-2027 R788` | Rowel Hallig | Rowel Hallig | Split multi-contact '0909-837-6359/ 0970-241-1807' -> primary '0909-837-6359', alt in remarks |
| `ISKO-2627-0514` | `1stSem 2026-2027 R842` | Rhalp Andrew Baladad | Rhalp Andrew Baladad | Ambiguous school code 'ds' -> set 'To Be Verified (ds)' |
| `ISKO-2627-0570` | `1stSem 2026-2027 R938` | June Ashley Sese | June Ashley Sese | Split multi-contact '0963-611-0782/0985-1273879' -> primary '0963-611-0782', alt in remarks |
| `ISKO-2627-0573` | `1stSem 2026-2027 R941` | Adrian Halog | Adrian Halog | Split multi-contact '0919-856-4462/0970-710-6226' -> primary '0919-856-4462', alt in remarks |
| `ISKO-2627-0585` | `1stSem 2026-2027 R962` | Princee Cabling | Princee Cabling | Fixed barangay typo 'mapaet' -> 'Mapait' |
| `ISKO-2526-0119` | `2nd Sem 2025-2026 final R99` | Janelle Fajardo | Janelle Fajardo | Recovered Janelle Fajardo grade '10500' -> 82.50 from 1stSem R210 |
| `ISKO-2526-0127` | `2nd Sem 2025-2026 final R116` | Kian Christopher Pangilinan | Kian Christopher Pangilinan | Mapped 'transfer to neust' -> 'Nueva Ecija University of Science and Technology' |
| `ISKO-2526-0142` | `2nd Sem 2025-2026 final R216` | Ken- Kineth Velasquez | Ken Kineth Velasquez | Normalized stray hyphen in 'Ken- Kineth' |
| `ISKO-2526-0165` | `2nd Sem 2025-2026 final R498` | Ashley Nicole De Leon | Ashley Nicole De Leon | Fixed barangay typo 'Mapaet' -> 'Mapait' |
| `ISKO-2526-0174` | `2nd Sem 2025-2026 final R533` | John Arden Salazar | John Arden Salazar | Blank school -> set 'To Be Verified' |
| `ISKO-2627-0591` | `1st New 2026-2027 R40` | Nickol Sebastian | Nickol Sebastian | Empty amount in 1st New 2026-2027 R40 -> set 0.00 |
| `ISKO-2627-0601` | `WAITING CHANCE-2nd batch August R25` | Rizzabelle Cayanga | Rizzabelle Cayanga | Empty amount in WAITING CHANCE-2nd batch August R25 -> set 0.00 |
| `ISKO-2627-0605` | `WAITING CHANCE-2nd batch August R32` | Avril Anne Joy Alvior | Avril Anne Joy Alvior | Empty amount in WAITING CHANCE-2nd batch August R32 -> set 0.00 |
| `ISKO-2627-0606` | `WAITING CHANCE-2nd batch August R35` | Gian Paulo Ponce | Gian Paulo Ponce | Empty amount in WAITING CHANCE-2nd batch August R35 -> set 0.00 |
| `ISKO-2627-0609` | `WAITING CHANCE-2nd batch August R42` | Erwina Nolasco-Mayor | Erwina Nolasco | Non-official barangay '9306303741' -> set 'Other'; Empty amount in WAITING CHANCE-2nd batch August R42 -> set 0.00 |
| `ISKO-2627-0610` | `WAITING CHANCE-2nd batch August R43` | Marielle Fernandez -mayor | Marielle Fernandez | Empty amount in WAITING CHANCE-2nd batch August R43 -> set 0.00 |
| `ISKO-2627-0611` | `WAITING CHANCE-2nd batch August R44` | Charmaine Joy Martinez- mayor | Charmaine Joy Martinez | Empty amount in WAITING CHANCE-2nd batch August R44 -> set 0.00 |
| `ISKO-2627-0612` | `WAITING CHANCE-2nd batch August R46` | Jake Aldrich Ferrer | Jake Aldrich Ferrer | Empty amount in WAITING CHANCE-2nd batch August R46 -> set 0.00 |
| `ISKO-2627-0616` | `WAITING CHANCE-2nd batch August R59` | Ecn Drake Bambalan | Ecn Drake Bambalan | Empty amount in WAITING CHANCE-2nd batch August R59 -> set 0.00 |
| `ISKO-2627-0619` | `WAITING CHANCE-2nd batch August R82` | Mercy Sumallo | Mercy Sumallo | Empty amount in WAITING CHANCE-2nd batch August R82 -> set 0.00 |
