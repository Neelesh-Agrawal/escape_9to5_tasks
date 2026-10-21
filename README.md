# After Hours — Escape 9 to 5

Escape from the top office floor to the street in five complete levels. Each floor lasts 900–1,100 metres, with a faster pace and denser obstacle patterns on the next floor. There is no timer and no mid-floor upgrade interruption.

At the end of a floor, move to the centre lane and press E or tap **Enter lift**. The runner walks into the lift, the doors close, and you choose one upgrade. The lift descends one floor before the run resumes. Four lift breaks separate the five floors; the ground floor ends at the street exit instead of another upgrade. Upgrades persist for the rest of the escape.

A/D or left/right arrows change lanes. Space/W/up jumps; S/down slides. Phones support swipes and move/jump/slide buttons. Coffee absorbs a collision and files earn points. Three unprotected hits end the run; a second-wind upgrade can add a life. Every obstacle row has a route without a solid blocker, though it may require jumping or sliding.

The existing Three.js office, reflections, skyline and locally hosted assets are retained. The city rises relative to the runner as the lift descends. Pause works during the run and lift animations; focus loss pauses automatically. Graphics can be reduced in the pause menu.

Serve the arcade root and open `Day33/escape_9to5_tasks.html`. No build, API key or paid model is needed.

Run `node Day33/check-after-hours.mjs` for renderer-independent checks of all five floors, exactly four upgrades, centre-lane lift entry, descent, final escape, difficulty progression, pause/replay, collision, bounded hazards, fair routes, mobile camera framing and context loss. These checks do not certify physical-device performance or subjective enjoyment.
