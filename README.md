# GVM Engine - Game Value Modifier

A browser-based game value modifier engine (like Cheat Engine for web games). Scan, find, and modify JavaScript variable values in browser games.

## Features

- **Value Scanner** - Search for exact values, ranges, or unknown values in game memory
- **Narrowing Scans** - Filter results by increased/decreased/changed/unchanged to pinpoint the right variable
- **Value Modifier** - Set any found value to a new value instantly
- **Value Freezer** - Lock values in place so they can't change (infinite health, ammo, etc.)
- **Speed Hack** - Control game speed from 0.1x (slow motion) to 10x (fast forward)
- **Shadow DOM Isolation** - UI is fully isolated from game CSS, won't break the game
- **Iframe Support** - Scans same-origin iframes where games are often embedded
- **Zero Dependencies** - Pure vanilla JS, no build tools required

## Usage

### Option 1: Bookmarklet

1. Run `bash build.sh` to generate the bundle
2. Copy the contents of `dist/bookmarklet.txt`
3. Create a new bookmark and paste the contents as the URL
4. Navigate to a web game and click the bookmark

### Option 2: Console Paste

1. Run `bash build.sh`
2. Copy the contents of `dist/gvm.bundle.js`
3. Open DevTools (F12) on the game page
4. Paste into the Console and press Enter

### Option 3: Test Harness

1. Open `test/test-harness.html` in a browser (via a local server)
2. Click "Load GVM Engine" to inject the panel
3. Test scanning/modifying the simulated RPG game values

## How It Works

The engine follows the classic Cheat Engine scan workflow:

1. **First Scan** - You know a value in the game (e.g., your health is 100). Search for `100`.
2. **Change the value** - Play the game until the value changes (take damage, spend gold, etc.)
3. **Next Scan** - Filter results: search for the new exact value, or use "Decreased"/"Increased"
4. **Repeat** - Narrow down until you find the right variable (usually 1-5 results)
5. **Modify/Freeze** - Set it to whatever you want, or freeze it to keep it locked

## Architecture

```
src/
  utils/
    type-checks.js      # Type detection helpers
    safe-traverse.js     # Safe property access (handles proxies, getters)
    iframe-access.js     # Same-origin iframe window enumeration
  core/
    object-walker.js     # BFS object traversal with cycle detection
    value-store.js       # State management for candidates and frozen values
    scanner.js           # First scan + narrowing scan engine
    modifier.js          # Value modification and Object.defineProperty freezing
    speed-hack.js        # Time function overrides for speed control
  ui/
    styles.css           # All styling (injected into Shadow DOM)
    overlay.js           # Shadow DOM host, draggable panel, tab system
    scan-tab.js          # Scan controls UI
    results-tab.js       # Results display with inline editing
    frozen-tab.js        # Frozen values management
    speed-tab.js         # Speed multiplier controls
  main.js               # Module initialization
  loader.js             # Entry point with idempotency guard

test/
  test-harness.html     # Interactive test page
  test-game.js          # Simulated RPG with changing values

dist/                   # Build output
  gvm.bundle.js         # Single-file injectable bundle
  bookmarklet.txt       # Bookmarklet URL
```

## Building

```bash
bash build.sh
```

Produces `dist/gvm.bundle.js` (single injectable file) and `dist/bookmarklet.txt` (bookmarklet URL).

## Scan Types

| First Scan | Description |
|---|---|
| Exact Value | Find all variables matching a specific number/string |
| Value Range | Find numbers within a min-max range |
| Greater Than | Find numbers above a threshold |
| Less Than | Find numbers below a threshold |
| Text Search | Find strings containing text (case-insensitive) |
| Unknown | Capture all values (use Next Scan to filter) |

| Next Scan | Description |
|---|---|
| Exact Value | Filter to candidates matching a new value |
| Increased | Keep only values that went up |
| Decreased | Keep only values that went down |
| Changed | Keep only values that are different |
| Unchanged | Keep only values that stayed the same |

## Keyboard Shortcuts

- **Drag** the title bar to reposition the panel
- **Minimize** with the `_` button
- **Close** with the `X` button (re-run bookmarklet to reopen)
- **Enter** in a result input field to set the value
