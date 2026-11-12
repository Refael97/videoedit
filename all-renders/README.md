# כל הסרטונים שרונדרו

כל הקבצים בתיקייה הזו הם עותקים של הרינדורים הסופיים (60fps, 1080×1920). הם מאורגנים לפי סוג:

| תיקייה | מה יש בה |
|---|---|
| `01-theme-previews/` | תצוגה מקדימה של כל אחת מ-9 הערכות, על הקליפ של Kowalski (17 שניות) |
| `02-rafael-video/` | הסרטון שלך (IMG_5381, 71 שניות) בשלוש ערכות: headline, night ו-paper |
| `03-effects-demo/` | דמו של שלושת אפקטי החתימה, בערכת paper ובערכת night (20 שניות) |
| `04-early-tests/` | הבדיקות הראשונות: glass על Kowalski, ו-paper על קליפ באנגלית |

## איפה הסקיל

הכול נמצא בריפו `Refael97/videoedit`, בענף `claude/great-allen-1f4zef`.

| מה | נתיב בריפו |
|---|---|
| **הסקיל עצמו** | `.claude/skills/video-themes/` |
| הוראות הסקיל (נקודת הכניסה) | `.claude/skills/video-themes/SKILL.md` |
| 9 הערכות | `.claude/skills/video-themes/themes/<שם>/` (README, language, theme, tokens, theme.css, motion.js, fx.css, fonts, sfx) |
| אפקטי החתימה המשותפים | `.claude/skills/video-themes/effects/` |
| בודק האיכות | `.claude/skills/video-themes/scripts/qa/` (הפקודה: `qa <project>`) |
| סקריפטים נוספים | `.claude/skills/video-themes/scripts/` (use_theme, synth_sfx, face_track, face_anchor) |
| פרויקטי העריכה (קוד המקור של כל סרטון) | `videos/` |
| סרטוני הרפרנס והניתוחים | `references/` |

## על המחשב שלך

ב-GitHub Desktop: עוברים לענף `claude/great-allen-1f4zef`, לוחצים **Fetch origin** ואז **Pull origin**.
אחרי זה הכול נמצא בתיקייה שבה שמרת את הריפו. ברירת המחדל של GitHub Desktop היא:

- Mac: `~/Documents/GitHub/videoedit/`
- Windows: `C:\Users\<שם>\Documents\GitHub\videoedit\`

הסרטונים יהיו ב-`videoedit/all-renders/`, והסקיל ב-`videoedit/.claude/skills/video-themes/`.
