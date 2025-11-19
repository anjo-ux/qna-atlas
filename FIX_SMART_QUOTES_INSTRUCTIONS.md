# Fix Smart Quotes in parseReferenceText.ts

## The Problem
The file `src/utils/parseReferenceText.ts` contains smart quotes (curly quotes: ' ' " ") instead of straight quotes (' "), causing TypeScript build errors.

## Solution Options

### Option 1: Run the Fix Script (Recommended)
Run this command in your terminal:
```bash
node fix-smart-quotes.js
```

### Option 2: Manual Find & Replace in Your Editor
If you're using VS Code or another editor:

1. Open `src/utils/parseReferenceText.ts`
2. Use Find & Replace (Ctrl+H or Cmd+H)
3. Find and replace these characters:

   **Find:** `'` (left single quote - copy this exactly)
   **Replace:** `'` (straight single quote)

   **Find:** `'` (right single quote - copy this exactly)  
   **Replace:** `'` (straight single quote)

   **Find:** `"` (left double quote - copy this exactly)
   **Replace:** `"` (straight double quote)

   **Find:** `"` (right double quote - copy this exactly)
   **Replace:** `"` (straight double quote)

### Option 3: Fix Specific Lines
The errors are on these lines. Replace the smart quotes with straight quotes:

- Line 3850: `'core-surgical': {`
- Line 3851: `'anesthesia':`
- Line 3945: `'perioperative-care':`
- Line 4018: `'critical-care':`
- Line 4150: `'trauma':`
- Line 4193: `'transplantation':`
- Line 4228: `'statistics-ethics-practice':`

## After Fixing
The build errors should disappear once all smart quotes are replaced with straight quotes.
