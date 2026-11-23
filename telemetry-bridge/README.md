# AEROFLY-ATC Telemetry Bridge (Phase 1)

This branch adds the server-side receiving contract for a future iOS bridge. It does **not** claim that Aerofly telemetry is connected yet.

## Network facts

- Aerofly FS Global's documented FSWidgets output uses the simulator device's LAN IP and UDP port `58585`.
- The iOS device running Aerofly is the sender/source.
- A compatible receiver must implement the FSWidgets connection/protocol. A generic UDP listener is not proof of a successful connection.
- Safari cannot directly bind a UDP socket. A native iOS bridge (or a compatible existing app that can forward data) is required.


## Important Aerofly FS Global distinction

A community report from the Aerofly forum confirms that the separate configurable UDP broadcast option available in Aerofly FS 4 is **not present in Aerofly FS Global on iPad/iOS**. Therefore, do not assume the ForeFlight `XGPS` broadcast stream or port 49002 is available in this mobile edition. The supported path documented for FS Global is the FSWidgets connection on port 58585.

This means the generic UDP Receiver app cannot be expected to show packets just by listening on local port 58585. The next engineering task is to obtain or establish the FSWidgets client handshake/wire format. Until that is known, do not send arbitrary test strings to the simulator and do not claim the bridge works.

## Worker endpoints added

- `POST /telemetry`: accepts a normalized JSON telemetry sample.
- `GET /telemetry/latest`: returns the most recent sample.
- Both endpoints require `Authorization: Bearer <ATC_TELEMETRY_TOKEN>`.
- Samples expire after 120 seconds in Cloudflare KV.

Normalized payload example:

```json
{
  "latitude": 37.6213,
  "longitude": -122.3790,
  "altitudeFt": 1200,
  "groundSpeedKts": 145,
  "indicatedAirspeedKts": 132,
  "headingDeg": 280,
  "verticalSpeedFpm": 900,
  "onGround": false
}
```

Only numeric finite values are accepted for numeric fields; latitude, longitude and heading are range-checked. At least one recognized measurement is required.

## Cloudflare configuration required

In the Worker settings:

1. Create a KV namespace, for example `AEROFLY_ATC_TELEMETRY`.
2. Add a KV Namespace binding named exactly `ATC_TELEMETRY`.
3. Add a Worker secret named `ATC_TELEMETRY_TOKEN` containing a long random value.
4. Deploy this Worker version.

Do not put the token in public GitHub files or send it in chat. The future native bridge and ATC client must be paired with the same token using a secure setup flow.

## Current status / next phase

Phase 1 is the authenticated server endpoint and short-lived storage. Phase 2 is a native iOS receiver that can establish the documented FSWidgets connection on the local network, decode its actual payload format, normalize it, and POST it to this Worker. The FSWidgets wire format has not been reverse-engineered or assumed here.

A native iOS app needs local-network permission. Apple documents Network.framework / BSD sockets for UDP and notes that broadcast/multicast has additional entitlement constraints. We must test the actual Aerofly transport rather than assume ordinary UDP unicast.

## Safety

- Never use telemetry to claim real-world ATC surveillance or clearances.
- If telemetry is stale or absent, the ATC companion must label it unavailable and fall back to pilot voice reports.
- Do not invent latitude, altitude, speed, heading, or on-ground state.
