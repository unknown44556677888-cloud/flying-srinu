# Flying Srinu

A small, beginner-friendly browser game. It runs locally without installing anything and can be deployed as a static site to Vercel.

## Play on Windows

1. Open this folder in File Explorer.
2. Double-click `index.html` to play in Edge or Chrome.
3. Click/tap the game or press **Space** to fly. Avoid the green gates. Use the **Fly again** button or press **R** after a crash.

The game remembers the best score in that browser. The attached voice recording plays when the character crashes.

## Files

- `index.html` — game page and sound controls
- `style.css` — layout and colors
- `game.js` — gameplay, scoring, collision, and audio behavior
- `assets/friend-photo.jpeg` — character photo
- `assets/crash-reaction.ogg` — crash voice recording
- `assets/long-shawarma.png` — transparent long-shawarma obstacle art
- `assets/flying-music.mp3` — the supplied flying music loop

## Optional flying music

The song reference is **“Kasih Sayang Kepada Orang Tua (Live)” by Mawang** ([YouTube lyric video](https://www.youtube.com/watch?v=VLhe4T7q-4M), [Apple Music](https://music.apple.com/us/song/1613364619)). The game does not download or embed that copyrighted recording. The supplied track is included at `assets/flying-music.mp3`. It loops while the character is flying and stops on crash.

## Put it online with Vercel

1. Create a GitHub repository and upload the contents of this folder.
2. Sign in to Vercel, choose **Add New → Project**, and import that repository.
3. Keep the framework preset as **Other**. Leave Build Command and Output Directory empty; the project is plain static HTML.
4. Choose **Deploy**. Vercel will give you a shareable URL.

You can also install the Vercel CLI and run `vercel` from this folder, then follow its prompts. No build step is required.

## Customize

Replace `assets/friend-photo.jpeg` with another photo (keep the same filename) to change the character. Replace `assets/crash-reaction.ogg` with a voice recording you may use (keep the same filename). For the photo, a square, face-centered crop looks best.
