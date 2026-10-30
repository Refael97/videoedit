# מפה של כל הפרויקט

כל הנתיבים יחסיים לתיקיית הריפו `videoedit/`. במק, ברירת המחדל של GitHub Desktop היא `~/Documents/GitHub/videoedit/`.
הענף: `claude/great-allen-1f4zef`. התיקייה `.claude` מוסתרת: ב-Finder לוחצים **Cmd+Shift+.** כדי לראות אותה.

## 1. הסרטונים שרונדרו: `all-renders/`
| תיקייה | מה יש בה |
|---|---|
| `all-renders/01-theme-previews/` | 9 הערכות על הקליפ של Kowalski |
| `all-renders/02-rafael-video/` | הסרטון שלך (IMG_5381) ב-headline, night ו-paper |
| `all-renders/03-effects-demo/` | שלושת אפקטי החתימה ב-paper וב-night |
| `all-renders/04-early-tests/` | הבדיקות הראשונות |

## 2. הסקיל: `.claude/skills/video-themes/`
| נתיב | מה זה |
|---|---|
| `SKILL.md` | נקודת הכניסה: טבלת הערכות, שיטת העבודה והחוקים |
| `themes/<ערכה>/` | ערכה אחת: README (פרומפט העריכה ומדריך צילום), language (השפה), theme (מדידות ויעדים), קבצי קוד, פונטים וסאונד |
| `effects/` | אפקטי החתימה המשותפים, ומיקום ביחס לפנים (`face.js`, `fx.js`) |
| `scripts/qa/` | בודק האיכות (`qa <project>`) ומדידת העוגנים (`anchor.py`) |
| `scripts/` | `use_theme.sh`, `synth_sfx.py`, `face_track.py`, `face_anchor.py` |

## 3. הרפרנסים ששלחת: `references/`
כל ערכה בנויה על יוצר-עוגן אחד. מה שחוזר בלפחות 3 סרטונים שלו הופך לחוק.

| ערכה | תיקייה | העוגן (הסרטונים של אותו יוצר) | תורמים (יוצרים אחרים) |
|---|---|---|---|
| glass | `references/glass/` | 20957, 73421, 30868 | — |
| paper | `references/paper/` | 15422 (עוד סרטונים שלו בחיפוש) | 33407, 82014 |
| night | `references/night/` | 50462, 19647, 33830, 41438 | 32135, 9041, 29402 |
| editorial | `references/editorial/` | 66150, 72005, 90553 (7451 הוא עותק) | 9953 |
| headline | `references/headline/` | 97418, 75789, 81754, 89398, 98315 | — |
| arcade | `references/arcade/` | 5777, 208, 58260, 95186 | 81673 |
| neon-studio | `references/neon-studio/` | 70647, 10899, 1191, 49478 | — |
| hooks | `references/hooks/` | 7784, 28202, 68494, 93864 | — |
| board | `references/board/` | 31455, 42755 | 70856, 9561, 67166 |
| בודדים | `references/singles/` | 18919, 21341, 62285, 79121, 98850, 93867 | רק השראה לאלמנטים |

| עוד | נתיב |
|---|---|
| הצילומים שלך | `references/inbox/IMG_5381.mov` (מבחן הערכות), `references/own/IMG_5297.MOV` |
| הקבצים ששלחת בצ'אט | `references/from-chat/`: חוברת Brody (PDF), רילס REEL KIT (57259), alexhormozi.mov, הקלטת מסך מ-26.10 |
| ניתוחים והשוואות עוגן מול ערכה | `references/_analysis/`: `styles.md` (המיון), `*-compare.jpg` |

> חוברת Brody היא של יוצר אחר. היא שמורה כאן רק כרפרנס פרטי. לא מעתיקים ממנה טקסט למוצר.

## 4. פרויקטי העריכה (קוד המקור): `videos/`
| נתיב | מה זה |
|---|---|
| `videos/theme-<ערכה>-preview/` | התצוגה של כל ערכה על קליפ Kowalski |
| `videos/rafael-test/` | הסרטון שלך: תמלול, סטוריבורד, `facts.yaml`, מעקב פנים |
| `videos/rafael-test-<ערכה>/` | העריכה של הסרטון שלך בכל ערכה, כולל דוח הבודק `qa-report.md` |
| `videos/fx-demo/` | הדמו של אפקטי החתימה |
