# Natal Wheel Audit

## Planet Validation

Planet markers bind to stored `astrology.planets.*.longitude`. Lilith binds to stored sign and degree because its compact storage contract does not include longitude.

## House Validation

House cusps bind to `astrology.placidusHouses.house1..house12.longitude`, with `astrology.houses` as the existing compatibility source.

## Aspect Validation

Aspect lines support both `p1/p2` and `planet1/planet2`, and render only when both stored planet endpoints exist.

## Visual Validation

The wheel contains twelve zodiac sectors, twelve stored house cusps, planet markers, major aspect lines, and stored ASC/MC labels. DSC and IC are represented by the opposite House 7 and House 4 cusps; no new angle values are calculated.

## Parity %

Parity is calculated from fields present in the stored blueprint. Missing stored longitude or cusp data is omitted rather than synthesized.

TypeScript and production build validation passed. Browser screenshot verification was blocked by the host browser sandbox.
