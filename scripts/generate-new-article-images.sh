#!/usr/bin/env bash
# Generate header images for the 10 newest articles using Nanobanana (Gemini CLI extension),
# then convert each to a 1536x1024 .webp in public/images/articles/ to match the existing set.
#
# Requires: gemini CLI + nanobanana extension installed, a VALID NANOBANANA_API_KEY in .env,
# and the project's `sharp` dependency (bundled with Next.js) for PNG->WEBP conversion.
#
# Run from anywhere:  ./scripts/generate-new-article-images.sh

# Note: intentionally NOT using `set -e` so a single failed generation doesn't abort the batch.
set -uo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

set -a
# shellcheck disable=SC1091
source .env
set +a

export GEMINI_API_KEY="${NANOBANANA_API_KEY:?NANOBANANA_API_KEY must be set in .env}"

ART_OUT="$PROJECT_ROOT/public/images/articles"
mkdir -p "$ART_OUT"

# Shared style guidance — appended to every prompt. Matches the existing article images:
# flat, minimalist vector illustration of a single simple subject, centered on a solid
# pastel background, soft rounded shapes, soft drop shadow, no text.
STYLE='Style: clean flat minimalist vector illustration in a soft modern flat-design style. A single simple, friendly, slightly rounded icon-like subject, centered, with a soft subtle drop shadow. Plain SOLID PASTEL background color filling the whole frame (no gradients across the scene, no scenery, no environment). Limited harmonious pastel color palette. NOT a photograph, no realism, no 3D render, no people, no text, no words, no letters, no logos, no watermarks. Wide 3:2 landscape composition with generous empty background space around the subject.'

# gen <slug> <subject-prompt>
# Retries up to 3 times; skips slugs that already have an image so reruns are idempotent.
gen() {
  local slug="$1"
  local subject="$2"
  local target="$ART_OUT/${slug}.webp"

  if [ -f "$target" ]; then
    echo "──> Skipping ${slug} (already exists)"
    return 0
  fi

  echo "──> Generating ${slug}"
  local attempt png tmp
  for attempt in 1 2 3; do
    tmp="$(mktemp -d)"
    (
      cd "$tmp"
      gemini --yolo --skip-trust -e nanobanana \
        -p "/generate \"${subject} ${STYLE}\" --count=1" >/dev/null 2>&1 || true
    )
    png="$(find "$tmp/nanobanana-output" -maxdepth 1 -name '*.png' 2>/dev/null | head -1 || true)"
    if [ -n "$png" ] && [ -f "$png" ]; then
      node -e "require('sharp')('$png').resize(1536,1024,{fit:'cover'}).webp({quality:85}).toFile('$target').then(()=>console.log('    ✓ wrote $target')).catch(e=>{console.error(e);process.exit(1)})"
      rm -rf "$tmp"
      return 0
    fi
    rm -rf "$tmp"
    echo "    … attempt ${attempt} produced no image, retrying"
  done
  echo "    ✗ FAILED after 3 attempts: ${slug}"
  return 0
}

gen "agentic-ai-autonomous-decisions" \
  "A friendly simple robot character standing beside a small branching signpost with arrows pointing in different directions, suggesting it is choosing a path on its own. Soft pastel lavender background."

gen "cost-training-frontier-ai-models" \
  "A single stylized computer microchip icon next to a small stack of gold coins, suggesting the cost of computing. Soft pastel peach background."

gen "on-device-small-language-models" \
  "A simple smartphone shown from the front with a small friendly chat bubble and a tiny sparkle on its screen, suggesting an on-device AI assistant. Soft pastel mint-green background."

gen "synthetic-data-model-training" \
  "A simple database cylinder icon with small glowing dots and sparkles flowing into it, suggesting generated synthetic data. Soft pastel sky-blue background."

gen "subscription-economy-tipping-point" \
  "A single credit card icon encircled by two curved recurring arrows, suggesting recurring subscription billing. Soft pastel coral background."

gen "tech-mergers-acquisitions-surge" \
  "Two simple rounded jigsaw puzzle pieces joining together, each a different soft color, suggesting two companies merging. Soft pastel butter-yellow background."

gen "creator-economy-grows-up" \
  "A small neat flat-lay cluster of creator icons: a video camera, a microphone and a play button, grouped together. Soft pastel pink background."

gen "edge-computing-goes-mainstream" \
  "A central rounded cloud icon connected by short lines to several small device and server node icons arranged around it, suggesting distributed edge computing. Soft pastel teal background."

gen "browser-privacy-wars" \
  "A simple rounded web browser window icon with a shield and padlock symbol in the center, suggesting browser privacy. Soft pastel periwinkle-blue background."

gen "open-source-hardware-breakout" \
  "A single stylized circuit board with a central processor chip and a small open padlock symbol, suggesting open-source hardware. Soft pastel sage-green background."

echo "Done. Generated and converted 10 article images into public/images/articles/."
