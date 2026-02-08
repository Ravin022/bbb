#!/bin/bash
# GVM Build Script - Concatenates all source files into a single injectable bundle

set -e

DIST_DIR="dist"
SRC_DIR="src"
BUNDLE="$DIST_DIR/gvm.bundle.js"
BOOKMARKLET="$DIST_DIR/bookmarklet.txt"

mkdir -p "$DIST_DIR"

echo "[GVM Build] Building bundle..."

# Read CSS and escape for JS string embedding
CSS_FILE="$SRC_DIR/ui/styles.css"
CSS_CONTENT=$(cat "$CSS_FILE" | tr '\n' ' ' | sed "s/'/\\\\'/g")

# Concatenation order (dependency order)
FILES=(
  "$SRC_DIR/utils/natives.js"
  "$SRC_DIR/utils/type-checks.js"
  "$SRC_DIR/utils/safe-traverse.js"
  "$SRC_DIR/utils/iframe-access.js"
  "$SRC_DIR/core/object-walker.js"
  "$SRC_DIR/core/value-store.js"
  "$SRC_DIR/core/scanner.js"
  "$SRC_DIR/core/modifier.js"
  "$SRC_DIR/core/speed-hack.js"
  "$SRC_DIR/ui/scan-tab.js"
  "$SRC_DIR/ui/results-tab.js"
  "$SRC_DIR/ui/frozen-tab.js"
  "$SRC_DIR/ui/speed-tab.js"
  "$SRC_DIR/ui/overlay.js"
  "$SRC_DIR/main.js"
  "$SRC_DIR/loader.js"
)

# Start the bundle with an IIFE wrapper
echo "(function() {" > "$BUNDLE"
echo "'use strict';" >> "$BUNDLE"
echo "" >> "$BUNDLE"

# Concatenate all source files
for file in "${FILES[@]}"; do
  echo "// === $(basename "$file") ===" >> "$BUNDLE"
  cat "$file" >> "$BUNDLE"
  echo "" >> "$BUNDLE"
  echo "" >> "$BUNDLE"
done

# Close the IIFE
echo "})();" >> "$BUNDLE"

# Replace CSS placeholder with actual CSS
sed -i "s|@@CSS_PLACEHOLDER@@|${CSS_CONTENT}|g" "$BUNDLE"

echo "[GVM Build] Bundle created: $BUNDLE ($(wc -c < "$BUNDLE") bytes)"

# Generate bookmarklet (minified-ish version)
BOOKMARKLET_CONTENT="javascript:void("
BOOKMARKLET_CONTENT+=$(cat "$BUNDLE" | tr '\n' ' ' | sed 's/  */ /g')
BOOKMARKLET_CONTENT+=")"
echo "$BOOKMARKLET_CONTENT" > "$BOOKMARKLET"

echo "[GVM Build] Bookmarklet created: $BOOKMARKLET ($(wc -c < "$BOOKMARKLET") bytes)"
echo "[GVM Build] Done!"
