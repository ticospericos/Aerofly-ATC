# AEROFLY-ATC Next Gen

Development branch: `feature/atc-next-gen`

This branch is intentionally isolated. It is not merged into `main` or `feature/atc-immersion-v1`, and no deployment is implied.

## Implemented in this development pass

### Voice recognition
- Continuous recognition rather than one short recognition session.
- Up to five recognition alternatives, with preference for aviation vocabulary.
- Preservation of final and interim speech segments.
- Duplicate final-segment guard.
- Automatic restart after transient browser speech-recognition shutdowns, with capped backoff.
- Clear handling of microphone permission, audio-capture, network and no-speech errors.
- Normalization of spoken runway designators and common spoken altitude values.
- Recognition remains review-before-transmit; no incomplete phrase is transmitted automatically.

### Simulation core
- Session-persistent fictional traffic scenario with aircraft callsigns, types, altitudes and evolving operational stages.
- Center traffic advisories advance between radio exchanges.
- Tower can hold a departure when the simulated traffic scenario reports base/final occupancy.
- Structured flight lifecycle metadata records phase, station, prior phase, pilot call, transition count and the explicit absence of simulator telemetry.
- Approach flow now distinguishes vectors, localizer, glideslope, final, RNAV, visual and missed-approach reports.
- Missed approach instructions defer to the pilot's published chart; the core avoids inventing fixes or procedure altitudes.

## Existing features retained from the immersion branch
- Simulated session weather and ATIS.
- Station-specific controller style guidance.
- Emergency recognition and emergency-services coordination.
- Clearance readback checks and ILS-aware approach guidance.

## Important limitations / next engineering work

- Traffic is simulated, not live ADS-B or official radar traffic.
- Aerofly position, altitude, speed and runway occupancy telemetry are not connected. The flight lifecycle is inferred from pilot radio reports.
- Published approach charts, ILS frequencies, RNAV waypoints, minima and airport taxiway routing are not bundled or independently verified.
- Ground vehicle/airport operations, a complete post-flight scoring report, and end-to-end handoff/traffic tests still require implementation.
- Browser speech recognition quality and availability depend on the browser, operating system, microphone, network and speech service. The app cannot guarantee recognition accuracy.
- The current development changes have syntax validation, but still need browser/device tests and scenario-level behavioral tests.

## Validation performed
- Main HTML JavaScript parsed with `new Function`.
- Worker module body parsed with `new Function`.
- Speech-normalization helper tested against spoken runway and altitude examples.

## Deployment
No Cloudflare Worker deployment or GitHub Pages deployment was performed as part of this work.
