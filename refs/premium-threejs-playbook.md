# Premium Three.js motion graphics — playbook

Source: Matt Penny, "Claude + Three.js = Premium 3D Motion Graphics" (youtube.com/watch?v=CCUSpJkAfgU). The user's reference frames (`explainer-quad.webp`) are taken from this video.

## The 5 demos and what makes them premium
1. **Idea → App (glassmorphism)**, 15s 16:9 60fps, 4 stations + a final pull-back.
   - Background: deep violet void (#0f0a1c) with soft blue/pink radial light.
   - Light: an orange light trail running along a CatmullRom curve that links the stations.
   - Panels: frosted glass slabs (MeshPhysicalMaterial transmission ~0.95, roughness ~0.4, rounded extrusion). Text sits on the front face as a canvas texture.
   - Particles: small glass orbs with depth of field, plus dust.
   - Camera: drifts slowly inside each station, then whips with expo.inOut to the next one.
   - Type: monospace eyebrow (`STEP 01`), large sans-serif title, one orange accent (#ff8a4c).
2. **How an LLM writes**, 9:16.
   - Chrome spheres (metalness 1, roughness 0.05) over a reflective floor.
   - Neon arcs between tokens.
   - 3D histogram bars (matte grey with a neon highlight).
   - Prompt bar at the top with a typing cursor.
3. **RAG**.
   - White studio with a soft contact shadow (ShadowMaterial).
   - Cards as InstancedMesh with canvas textures.
   - 220 pastel spheres in clusters.
   - A transmission glass bubble around the nearest neighbours.
   - Low bloom, vignette, grain, depth of field.
   - Camera dollies: Embed → Search → Generate → Result.
4. **Neural network**.
   - Cream paper, Swiss/editorial layout.
   - Contour-line terrain coloured navy → magenta.
   - A pink metallic ball rolling down the valley.
   - Thin frames, corner brackets, coral step numbers, mono subtitles.
5. **Internet / globe**.
   - Black background with a HUD: cyan brackets and a latency timer.
   - 30k instanced points form the continents, with a brightness wave in a vertex shader.
   - Fresnel atmosphere and a 15° lat/long grid.
   - Glowing packets travel on arcs between cities.
   - Billboard labels show ping and a routing table.

## Rules
- **Prompt for each scene with exact timecodes** (0–3s, 3–6s …). State what happens and when.
- **Three.js + shaders**: fresnel, glow, grid sweeps, and particles on the GPU.
- **Materials**:
  - Frosted glass via transmission.
  - Liquid chrome on a real environment map.
  - Contact shadows.
  - InstancedMesh for anything large.
- **Post**:
  - HDR target with 4× MSAA.
  - **Gentle** bloom, only on emissive lines and badges.
  - Subtle depth of field.
  - Chromatic aberration only at the frame edges.
  - Light vignette and fine grain.
- **Camera**: continuous travel through one 3D space between stations, with expo.inOut. Never a 2D slideshow. Elements also move inside the frame.
- **Type and UI**:
  - Swiss/technical layout.
  - Monospace eyebrows and step counters (01, 02).
  - Thin rules and corner brackets.
  - HUD tags.
- **Briefing phrases that help**:
  - "professional, sleek, high-end"
  - "treat it as your showreel for a top motion-graphics studio role"
- **Verification loop before render**:
  - Overlapping elements.
  - Text that is too small.
  - Clipping planes.

| | Cheap | Premium |
|---|---|---|
| Dimension | flat 2D, DOM/SVG slides | real 3D depth, parallax, extrusion |
| Materials | flat hex fills | frosted glass, liquid chrome, contact shadows |
| Camera | static, 2D cuts | 3D sweeps, expo whips, pull-back reveals |
| Light | flat ambient | HDR env, key light, restrained emissive bloom, fresnel |
| Type/UI | centred default text | Swiss layout, mono eyebrows, counters, brackets, HUD tags |
