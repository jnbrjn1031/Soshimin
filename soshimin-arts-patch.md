# ARTS & SPORTS PATCH: 「소시민」 — 예체능의 길

## How this document relates to the others
- **Main spec** (soshimin-prompt.md): simulation, systems, data, build order.
- **Visual spec** (soshimin-visual-spec.md): everything the player sees and touches.
- **Sub-prompt** (soshimin-sub-prompt.md): Amendment 1 (assets) and Amendment 2 (emotional design).
- **Prep patch** (soshimin-prep-patch.md): the preparation system (준비도, methods, tests).
- **This patch:** a standalone addition. Build it as Stage 「6.6」, after the prep patch. It overrides the main spec where they conflict (notably §10.2 track 5 「예체능」 and jobs 50–59 in Appendix D); visuals follow the visual spec.

## 1. Purpose

A person who chose music, acting, art, webtoons, writing, film, content, or sports should **not** simply drift into an ordinary office job. Their life should feel different: years of practice, auditions and rejections, a first stage, a small fan base, side jobs to pay the rent, the rare breakthrough, the slow fade, and a second act that still lives inside their field. Most will not become famous — the statistics are harsh, and the game keeps them true — but **almost none of these lives should feel ordinary**.

Design rules:
- **Success odds stay true to real statistics** (§9). Big success is rare.
- **The middle is rich.** Most arts and sports people survive in many small, real ways: teaching, session work, small stages, commissions, coaching. These are full, distinct careers with their own events, not failure states.
- **Leaving the field is always possible but never automatic.** Moving into an ordinary job happens only by the player's decision (§6), never by default drift.
- **Adjacent second acts first.** When a performer stops performing, the default transitions stay inside the world they know (teaching, producing, coaching, planning, writing about it).

## 2. Real names policy

The player chose real names for organizations. Follow these rules strictly:
- **Real organizations may appear** in neutral or positive roles: entertainment agencies (하이브, SM엔터테인먼트, JYP엔터테인먼트, YG엔터테인먼트), broadcasters (KBS, MBC, SBS, EBS, JTBC, tvN, Mnet), webtoon platforms (네이버웹툰, 카카오웹툰), publishers (문학동네, 창비, 민음사), newspapers running 신춘문예, KBO's ten teams (LG 트윈스, 두산 베어스, SSG 랜더스, 키움 히어로즈, KT 위즈, 삼성 라이온즈, 롯데 자이언츠, 한화 이글스, KIA 타이거즈, NC 다이노스), K리그 clubs, KBL and V-리그 clubs, 국립극단, 시립 교향악단, 국립현대미술관, 예술의전당.
- **Never attach negative events to a real organization:** no contract disputes, unpaid wages, abuse, scandals, bankruptcy, match-fixing, or lawsuits. Every negative organizational event uses a **fictional** organization (e.g., 「가온엔터 · 가상」, 「새벽기획 · 가상」, 「하늘FC · 가상 K3」), clearly labeled 가상.
- **Never use real people.** No real idols, actors, athletes, coaches, authors, or directors appear, are named, or are imitated. Teammates, rivals, and mentors are fictional.
- **No real song, film, book, or webtoon titles** as the character's works; generate original titles.
- Salaries and contract terms for real organizations are 「게임 설정」 bands derived from the averages in §9, never claims about a specific organization's actual pay.

## 3. Entry: how a person gets onto these paths

Talents reveal themselves in childhood (main spec §4.10 aptitudes: artistic, physical, verbal). Entry points follow real Korean routes:

| Field | Early routes (7–18) | Later routes (19+) |
|---|---|---|
| 음악 (클래식·실용) | 개인 레슨, 예중·예고, 콩쿠르, 교내 밴드 | 음대·실용음악과, 버스킹, 인디 레이블, 세션 |
| 아이돌·가수 | 댄스·보컬 학원, 기획사 오디션, 연습생 (from about 12) | 오디션 프로그램, 소규모 기획사, 솔로·인디 |
| 연기 | 연기 학원, 예고 연극영화과, 아역 오디션 | 연극영화과, 극단, 독립영화, 단역 → 조연 |
| 미술·디자인 | 미술 학원, 예중·예고, 공모전 | 미대, 전시, 레지던시, 디자인 스튜디오, 프리랜서 |
| 웹툰·일러스트 | 그림 연습, SNS 연재, 도전만화·베스트도전 | 만화애니과, 어시스턴트, 공모전, 정식 연재 |
| 문학 | 백일장, 교내 문예 | 문예창작과, 신춘문예·문예지 등단, 웹소설 |
| 영상·콘텐츠 | 영상 편집, 채널 운영 | 영상학과, 단편영화, 외주 편집, 크리에이터 |
| 스포츠 (야구·축구·농구·배구·골프·수영·태권도 등) | 초중고 운동부, 유소년 클럽, 체육중·고 | 대학·실업팀, 프로 드래프트·입단, 육성선수 |

- **Student athletes and trainees still attend school:** model reduced academic time and the minimum-academic-standard pressure on student athletes (game setting), and the cost of leaving school (자퇴) for trainees.
- **Family support matters:** lessons, instruments, equipment, camps, and 연습실 cost money; lower-income families can fund less, and the person may need side jobs earlier. Scholarships and team sponsorship can offset it.

## 4. The arts & sports career model

Replace the corporate ladder (main spec §10.5) with a field-specific state machine. Each person on an arts or sports path has:

- **실력 (skill, 0–100, per discipline):** grows with practice hours, coaching, aptitude, and condition (use the prep patch's growth curve with diminishing returns). Peaks and declines by age differently per field (§5).
- **인지도 (recognition, 0–100):** grows with performances, releases, wins, media appearances, and viral moments; decays without activity. Show it as a small follower or audience number (「구독자 1.2만」, 「관객 평균 40명」, 「팬카페 3,100명」).
- **작품·기록 (portfolio):** songs, roles, exhibitions, episodes, books, films, game records — each a named entry with its reception.
- **연줄 (network):** mentors, colleagues, producers, scouts, editors — people in the social network (main spec §7.3) who open doors.
- **생계 (livelihood):** the share of income from the art itself versus side work (§7). Shown honestly on the money panel.
- **지속 의지 (resolve, hidden):** falls with rejection, poverty, injury, and family pressure; rises with small wins and support. Drives the "keep going?" decision (§6).

**Stages** (each field names them in its own words):
1. **지망생** — practice, auditions, applications, side jobs.
2. **첫 발** — debut, signing, first draft pick, 등단, first 연재, first exhibition, first role with a name.
3. **활동기** — steady work at some level; most people stay here for years.
4. **도약** (rare) — a hit, a lead role, a starting spot, a bestseller, a long-running series, national team selection.
5. **정체·하락** — fewer offers, younger competition, injury, shifting tastes.
6. **두 번째 막** — teaching, producing, coaching, scouting, directing, writing, running a studio or academy; or a deliberate move elsewhere.

## 5. Field details

### 5.1 아이돌·가수
- **연습생:** about 963 trainees at 211 agencies in 2024, 63.7% of them aspiring singers (대중문화예술산업 실태조사). Monthly evaluations (실력, 외모 관리 pressure, 체중 관리 — model the pressure as stress, never as a goal to diet toward), debut team reshuffles, being cut.
- **Contracts:** model the standard exclusive contract (전속계약) with a maximum term of 7 years (게임 설정 wording: 「표준전속계약 기준 최대 7년」) and settlement only after debut costs are recouped.
- **Debut and after:** most groups disband or go quiet within a few years (game setting); members pivot to solo, acting, musicals, 보컬 트레이너, 안무가, 기획.
- **Income distribution (2021, tax filings):** 7,720 singers averaged 6,679만 a year, but the top 1% (77 people) averaged 46억 1,800만, leaving the other 90% at roughly 2,000만 or less (derived). Use this skew.
- **Other singers:** 인디 밴드 (small stages, 100-seat clubs, festivals), 세션 연주자, 웨딩·행사 가수, 뮤지컬 앙상블, 보컬 레슨.

### 5.2 연기
- About 4,709 actors worked under agency contracts in 2024. Top 1% of actors (160 people) averaged 22억 6,600만 in 2021, while most earn little.
- Path: 단역 (often per-day pay), 보조 출연, 독립영화, 극단 (대학로), 웹드라마, 광고, 조연, 주연 (rare). 성우 and 연기 강사 as adjacent careers.
- **Age dynamics:** roles shift with age; some actors bloom in their 40s–60s as character actors (game setting: a small chance of late recognition).

### 5.3 클래식 음악
- 콩쿠르 results, 음대 입시 (실기), 유학 option (costly), 오케스트라 단원 audition (시립·도립 교향악단 — rare openings, stable once in), 실내악, 레슨, 반주, 교회 반주, 학원 운영, 대학 강사.
- International competition winners can qualify for 예술요원 (alternative military service for top-ranked winners of designated competitions) — model as a rare, real rule (details as 「게임 설정」).

### 5.4 미술·디자인
- 작가 path: 졸업 전시, 단체전, 공모전, 레지던시, 첫 개인전, 갤러리 전속 (rare), 작품 판매 (irregular, mostly small). Artists' income from fine art averaged 603만 a year in 2024 (예술인 실태조사), so side work is the norm: 미술 학원 강사, 방과후 강사, 일러스트 외주, 벽화, 굿즈 판매, 공방.
- Design: 디자인 스튜디오, 인하우스 디자이너, 프리랜서, 브랜드 런칭.

### 5.5 웹툰·일러스트
- Path: SNS·도전만화 연재 → 공모전 → 어시스턴트 → 정식 연재 계약 → 완결 → 차기작. Weekly deadlines drive stress and health (wrist, back, eyes).
- **Income (2024 웹툰산업 실태조사):** average 4,268만, median 3,400만; 24.7% earned 5,000만+; average fee per episode 86만 8,000. A rare hit adds 2차 판권 (드라마·영화화) income and big recognition.
- 웹소설 belongs here too (similar mechanics, text instead of art).

### 5.6 문학
- 등단: 신춘문예 (January results; one winner per category per newspaper, huge competition — game setting odds), 문예지 신인상, 출판사 공모 (some with large prizes), or self-publishing and 웹소설.
- **Books (2025 출판 통계):** 64,491 new titles averaging about 1,132 copies each at an average list price of 19,897원 — so a typical first printing at a 10% royalty earns about 225만 (game-setting royalty rate). Most writers keep other work: 강의, 편집자, 방송작가, 카피라이터, 번역.
- Rare: a prize, a bestseller, adaptation rights.

### 5.7 영상·콘텐츠
- Film: 단편영화 → 영화제 → 조감독·연출부 (long hours, low pay) → 장편 데뷔 (rare). Broadcasting: 방송작가, 조연출, PD (through 공채 at real broadcasters, neutral role).
- **Creators (2024 tax filings):** 34,806 people declared income as one-person media creators, averaging 7,100만; the top 1% averaged 12억 9,339만, while the bottom 50% averaged 2,463만. Model channel growth as noisy with rare viral spikes and slow decay; burnout is common.

### 5.8 스포츠
- **Youth to pro:** school or club teams from elementary school; 체육중·고; national youth teams (rare).
- **Baseball (2026):** 1,261 players applied for the KBO draft and 110 were picked (8.7%). First-round signing bonuses can reach about 2억 6,000만, second round about 1억 3,000만, third about 1억, fourth about 8,000만 (one club's 2026 signings). Minimum salary 3,000만 in 2026 and 3,300만 from 2027; each club may hold 68 players. Team average salaries in 2026 ranged from about 1억 to 2억 800만, and the top salary was 42억. Undrafted players can try 육성선수, independent leagues, or university and try again.
- **Football (2025):** K리그1 players averaged about 3억 1,000만 a year (top earners over 15억); lower leagues and K3·K4 pay far less (game setting).
- Other sports (basketball, volleyball, golf, swimming, taekwondo, athletics): similar structure with 실업팀 (corporate and municipal teams) as a key stable middle tier.
- **Military:** 국군체육부대 (상무) lets athletes keep playing during service (selection needed); Olympic medalists and Asian Games gold medalists receive 예술·체육요원 alternative service (a real rule; keep details as 「게임 설정」).
- **Career span and injuries:** peak in the mid-20s to early 30s depending on the sport; injuries (십자인대, 어깨, 허리) are frequent events with surgery and rehab decisions; most retire by their early-to-mid 30s.
- **Second acts:** 코치 (school, club, pro), 트레이너, 스카우트, 심판, 해설, 체육 교사 (임용), 생활체육지도자, 유소년 아카데미 운영, 피트니스 센터 창업.

## 6. Decisions unique to these paths

Each is a decision card (main spec §8 format) with a real-stat note.
1. **진로 선택 (12–18):** 연습생 / 예고·체육고 / 일반고에서 병행 / 취미로만.
2. **기획사·팀 제안:** an offer from a real large agency or club (neutral) or a small fictional one with riskier terms; show contract length, settlement, and conditions.
3. **오디션 프로그램 출연:** exposure versus the risk of a bad edit or early elimination.
4. **드래프트에서 지명받지 못했을 때:** 대학 진학 / 육성선수 / 독립리그 / 그만두기.
5. **유학·콩쿠르 도전:** cost and family burden versus skill and recognition.
6. **생계와 꿈의 비율 (yearly):** how many hours go to side work versus practice and creation.
7. **계속할까, 그만둘까:** offered after repeated rejection, at ages 25, 30, and 35, after injuries, and when money runs low. Options: 계속한다 / 형태를 바꾼다 (teach, produce, coach) / 완전히 다른 길로 간다. The third option is the only way into an ordinary job.
8. **부상 치료:** surgery and full rehab (slow, safer) / quick return (fast, risky).
9. **흥행 이후:** after a hit — 같은 스타일로 계속 / 새로운 시도 / 잠시 쉬기.
10. **은퇴 시점 (athletes):** at peak / play out the contract / move abroad or down a league.

## 7. Livelihood: surviving in the middle

Side and adjacent work keeps people in their field. Each has its own pay band (game setting unless noted) and events:
- 음악: 레슨 강사, 세션, 행사·웨딩, 교회 반주, 실용음악 학원, 뮤지컬 앙상블, 음향 엔지니어.
- 연기: 단역·보조출연, 연기 학원 강사, 성우, 광고 모델, 행사 MC.
- 미술·웹툰: 학원·방과후 강사, 외주 일러스트, 어시스턴트, 굿즈·플리마켓, 공방, 벽화.
- 문학: 글쓰기 강의, 출판 편집, 방송작가, 카피라이터, 번역, 웹소설.
- 영상: 외주 편집, 웨딩·행사 촬영, 광고 조감독, 유튜브 편집자.
- 스포츠: 레슨 코치, 생활체육지도자, 트레이너, 유소년 클럽 코치, 심판.
- Plus ordinary part-time jobs (편의점, 카페, 배달) during lean years — shown as part-time, not as a career change.

Artists' average income from art was 1,055만 a year in 2024, 41.3% of the national average; 47.5% held a second job; 23% had a career break of a year or more (main spec A.13). The money panel shows the split: 「예술 수입 28% · 레슨 52% · 아르바이트 20%」.

## 8. Events (add to the yearly six, main spec §7)

Write at least **80 field-specific event templates** across the eight fields, at every stage. Examples:
- 첫 무대 (관객 23명), 첫 버스킹에서 만 원 받은 날, 오디션 3차 탈락, 연습생 월말 평가, 데뷔 쇼케이스, 음원 차트 진입 (rare), 공연 취소, 장비 도난.
- 첫 대사가 있는 배역, 대학로 공연 막공, 촬영장 대기 14시간, 광고 섭외.
- 콩쿠르 본선 진출, 악기 수리비, 오케스트라 오디션.
- 첫 개인전, 작품이 처음 팔린 날, 레지던시 선정, 갤러리 계약.
- 연재 계약, 휴재 공지, 댓글 폭주, 완결, 드라마화 제안 (rare).
- 신춘문예 낙선 통보, 등단 소식, 첫 책 출간, 서점 매대에서 자기 책을 본 날, 절판.
- 영화제 초청, 구독자 1만 돌파, 알고리즘 추천으로 폭증, 채널 정체.
- 지명 전화 (or the silence), 첫 1군 등록, 첫 안타·첫 골, 부상, 재활, 트레이드, 방출 통보, 은퇴식.
Each feeds memories and the diary (Amendment 2): these lives produce many vivid memories.

## 9. Statistics to use

| Area | Data | Source |
|---|---|---|
| Artists overall | Art income 1,055만 a year average (41.3% of the national average); full-time 52.5%, second job 47.5%; by field: 건축 4,261만, 만화 2,684만, 방송·연예 2,485만, 음악 901만, 무용 802만, 미술 603만, 문학 454만, 사진 334만 | 2024 예술인 실태조사 |
| Entertainment industry | 963 trainees at 211 agencies (63.7% aspiring singers); 12,092 people under agency contracts — singers 5,020, actors 4,709, broadcasters 1,264 | 대중문화예술산업 실태조사, 2024 base |
| Singers and actors | 2021: 7,720 singers averaged 6,679만; top 1% of singers averaged 46억 1,800만; top 1% of actors averaged 22억 6,600만 | 국세청 data via National Assembly, 2023 |
| Webtoon | Average 4,268만, median 3,400만; 5,000만+ 24.7%; 3,000만–5,000만 39.3%; fee per episode 86만 8,000 | 2024 웹툰산업 실태조사 |
| Creators | 34,806 filers; average 7,100만; top 1% 12억 9,339만; bottom 50% 2,463만 | 국세청, 2024 income |
| Publishing | 64,491 new titles; 73,028,500 copies (about 1,132 per title); average price 19,897원 | 2025 출판생산 통계 |
| KBO | Draft: 1,261 applicants, 110 drafted (8.7%); minimum salary 3,000만 (2026), 3,300만 (2027); roster 68; club averages 1억–2억 800만; top salary 42억; sample signing bonuses 2억 6,000만 (R1) to 8,000만 (R4) | KBO via news, 2025–2026 |
| K리그 | K리그1 average 3억 1,176만 (2025); top domestic salary 15억 9,000만 | 프로축구연맹 via news |

Values not listed (e.g., debut rates, contract settlement, odds of a hit) are 「게임 설정」 and must be labeled so in the UI.

## 10. Interface additions (in the visual spec's style)

- **「활동」 tab** for arts and sports people (replaces the 직업 tab's corporate ladder view): current stage, 실력 per discipline, 인지도 with the audience number, the portfolio list (works or records), income split, and the next audition, deadline, game, or release.
- **On the road:** a guitar case or instrument on the back, a sketchbook, a sports bag and bat or ball; roadside stages, small clubs, galleries, stadium lights, a studio window lit late at night; on a breakthrough, a slightly larger crowd along the road; when recognition fades, the crowd thins.
- **The 「되돌아가는 길」 ending** (Amendment 2 §2.10) should favor these lives' signature moments: the first stage, the first hit, the draft call, the last game.

## 11. Calibration additions (`runMany`)
- Share of all simulated people who ever enter an arts or sports path seriously (beyond hobby): 5–10% (game setting).
- Among them: reaching the 「첫 발」 stage 30–60%; reaching 「도약」 1–5%; still earning at least half their income inside their field at age 40: 35–55% (all game settings).
- Among those entering the KBO draft: drafted share 8.7% ± 2pp.
- Income distributions within ±20% of the averages and medians in §9 for webtoon artists, creators, and artists overall; top-1% shares visibly extreme.
- Share of arts and sports people who end up in an ordinary office job: under 25%, and only through decision 7 in §6.
