---
workflow: general-video
flow: automation
storyboard: no
message: "אפשר ליצור סרטון שלם בקול שלכם בלי לפתוח מצלמה — Claude מתזמר ElevenLabs, HeyGen, Higgsfield ו-HyperFrames"
destination: instagram-reels
aspect: "9:16"
language: he
length: 80s
---

## Intent
ריל אנרגטי בעברית שמסביר איך בונים "אולפן תוכן AI": שכפול קול ב-ElevenLabs, אווטאר ב-HeyGen,
ויזואלים ב-Higgsfield ועריכה עם סקיל HyperFrames — ו-Claude מנהל את כל התהליך. סיום ב-CTA: "תגיבו 'אני'".

## Assets
- קריינות: הקול המשוכפל "רפאל" (ElevenLabs, eleven_v3) — `assets/audio/vo.mp3`
- תזמון מילים: `data/captions.json` (מתוך יישור ElevenLabs)
- סרטוני אווירה: 7 קליפים מ-Higgsfield (Seedance 2.5, 9:16) — `assets/video/b0*.mp4`
- מוזיקה: ElevenLabs Music v2.5, אינסטרומנטלי — `assets/audio/music.mp3`, מגולפת מתחת לקריינות
- אפקטים קוליים: מסונתזים ב-ffmpeg — `assets/audio/*.wav`

## Customizations
- בלי אווטאר — הכול אילוסטרציות, מושן גרפיקס, מעברים וסרטוני אווירה (בקשת המשתמש)
- כתוביות עבריות מילה-מילה עם הדגשה כתומה למילות מפתח
- פלטה: רקע #0c0e0f, טקסט #f6efe6, אקסנט כתום #ff7a2f, טורקיז משני
- פונטים: Rubik (עברית/לטינית), Frank Ruhl Libre לכותרות סריף, Space Mono לתוויות

## Notes
- `index.html` נוצר מ-`src/template.html` + `data/captions.json` ע"י `python3 build.py`. לערוך את התבנית, לא את index.html.
