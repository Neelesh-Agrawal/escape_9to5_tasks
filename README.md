# After Hours — Escape 9 to 5

A Three.js office heist through a 1,200m glass atrium at sunset. The route has three physical objective stations: reception access card (240m), backup server (610m), and elevator fuse box (1,010m). The elevator unlocks after all three jobs. There is no countdown.

A/D or left/right arrows change lanes. Space/W/up jumps; S/down slides. At a station, move to its marked lane and hold E (or the contextual button). The runner stops for the interaction. Releasing early resets progress. Coffee absorbs one hit; optional files earn points. Obstacles always leave a clear lane. Three unprotected hits end the run.

Phones support swipes plus essential move/jump/slide controls. A single Menu button pauses and contains sound and graphics switches, continue and home. There are no repeated message pop-ups, score-copy actions or stapler/fire controls.

The office uses locally hosted Three.js, procedural textures, a dusk sky shader, continuous window/roof framing, floor reflections, instanced scenery and a character with a visible briefcase inventory and coffee shield. Graphics can be reduced in Menu. Reduced motion suppresses incidental effects; gameplay continues.

Serve the arcade root and open `Day33/escape_9to5_tasks.html`. No build, API key or paid model is needed.

Checks: `node check-after-hours.mjs` from this repository. The arcade workspace also has `Day33/check-office-games.mjs` for cross-game regressions. Focused checks cover the full objective/extraction flow, alignment/hold rules, no time-out, fair routes, pickup/damage behavior, pause/replay, portrait framing and WebGL context loss. These checks do not certify physical-device FPS or subjective enjoyment.
