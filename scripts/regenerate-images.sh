#!/usr/bin/env bash
# Regenerate all article + advertisement images using Nanobanana (Gemini CLI extension).
# Requires: gemini CLI + nanobanana extension installed, and a valid NANOBANANA_API_KEY in .env.

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

set -a
# shellcheck disable=SC1091
source .env
set +a

export GEMINI_API_KEY="${NANOBANANA_API_KEY:?NANOBANANA_API_KEY must be set in .env}"

ART_OUT="$PROJECT_ROOT/public/images/articles"
AD_OUT="$PROJECT_ROOT/public/images/advertisements"

mkdir -p "$ART_OUT" "$AD_OUT"

# Shared editorial style guidance — appended to every prompt.
STYLE='Style: editorial photojournalism for a serious daily newspaper (The New York Times, Wall Street Journal). Documentary photography, natural light, cinematic, restrained slightly desaturated color, shallow depth of field, real human subjects or real-world scenes (no cartoons, no illustration, no flat vectors, no infographic icons). Composition leaves headline space at top and right. Wide aspect 3:2, no text, no logos, no watermarks.'

gen() {
  local filename="$1"
  local out_dir="$2"
  local prompt="$3"
  local full_prompt="Use the nanobanana /generate tool to create one photorealistic image and save it to ${out_dir}/${filename}. Subject: ${prompt} ${STYLE}"
  echo "──> Generating ${filename}"
  gemini --yolo --skip-trust -p "$full_prompt" 2>&1 | tail -3 || echo "    (failed: ${filename})"
  echo
}

# ARTICLE IMAGES (14)
gen "future-ai-journalism.png" "$ART_OUT" \
  "A modern newsroom: a journalist at a clean desk with multiple monitors showing news feeds and an AI assistant interface, soft natural window light, other editors out of focus in the background."

gen "tech-companies-climate-initiative.png" "$ART_OUT" \
  "Executives at a press conference podium with subtle climate/sustainability iconography on the screen behind them, professional editorial photography."

gen "independent-media-platforms.png" "$ART_OUT" \
  "An independent journalist working from a small home studio with podcast microphone, laptop and notebook; books on shelves; warm side light."

gen "cybersecurity-trends-2025.png" "$ART_OUT" \
  "A security analyst in a darkened operations center, glowing screens reflecting on glass, lines of monitoring dashboards visible but unreadable, moody chiaroscuro lighting."

gen "digital-privacy-modern-age.png" "$ART_OUT" \
  "Anonymous hands holding a smartphone in a city café window, reflections on the glass, candid documentary photograph."

gen "machine-learning-healthcare.png" "$ART_OUT" \
  "A physician studying a medical scan on a high-resolution monitor in a quiet hospital reading room, clinical light, calm focused mood."

gen "startup-funding-record-high.png" "$ART_OUT" \
  "A founder shaking hands across a glass conference-room table, financial papers visible, glass office tower outside, candid business photojournalism."

gen "chatgpt-conversational-ai.png" "$ART_OUT" \
  "A person at a wooden desk typing on a laptop with an AI chat interface partially visible, coffee cup, warm afternoon light, shallow depth of field."

gen "5g-networks-mobile-connectivity.png" "$ART_OUT" \
  "Telecom engineer in a high-visibility vest installing equipment on a city rooftop with antennas, skyline at dusk, documentary photography."

gen "blockchain-beyond-crypto.png" "$ART_OUT" \
  "Close-up of a logistics worker scanning a package barcode in a warehouse with shelving stretching into the distance, blue-grey palette."

gen "cloud-computing-data-storage.png" "$ART_OUT" \
  "Interior of a modern data center, long cool-blue lit aisle of server racks, single technician walking down the corridor in soft focus."

gen "evolution-social-media.png" "$ART_OUT" \
  "Young people sitting on a city park bench, faces lit by phone screens at golden hour, candid editorial documentary frame."

gen "future-remote-work-strategies.png" "$ART_OUT" \
  "A remote worker at a clean modern home office with video call open on the laptop, plants in the background, warm soft natural light."

gen "quantum-computing-breakthrough.png" "$ART_OUT" \
  "Close detail of a quantum computer chandelier in a research lab — gold-plated copper cabling and cylindrical chamber, blue ambient light, magazine-quality photograph."

# ADVERTISEMENT IMAGES (2)
gen "cloud-solutions.png" "$AD_OUT" \
  "Sleek modern enterprise data infrastructure: server room close-up with one engineer in profile checking a laptop, professional documentary-style commercial photograph."

gen "professional-development-courses.png" "$AD_OUT" \
  "A small group of professionals around a table during a workshop, one presenting at a screen, all engaged, natural conference-room light, candid corporate editorial."

echo "All generations complete. Converting PNG to WEBP and updating references…"

# Convert PNGs to WEBP to match existing site references and replace originals.
if command -v cwebp >/dev/null 2>&1; then
  for d in "$ART_OUT" "$AD_OUT"; do
    for f in "$d"/*.png; do
      [ -f "$f" ] || continue
      out="${f%.png}.webp"
      cwebp -q 85 "$f" -o "$out" >/dev/null && rm "$f"
    done
  done
  echo "Converted to .webp"
else
  echo "cwebp not found — install with: brew install webp.  Leaving .png files in place; update data.ts to reference them."
fi

echo "Done."
