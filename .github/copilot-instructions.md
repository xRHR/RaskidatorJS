# RaskidatorJS - AI Coding Agent Instructions

## Project Overview
**Raskidator** is a vanilla JavaScript expense-splitting calculator for group bills. It tracks shared items, assigns portions to individuals, and calculates who owes what.

## Architecture

### Core Data Model
Two main state arrays in `src/main.js`:
- **`bill`**: Global items with `{name, price, quantity}` - everything purchased
- **`people`**: Individuals with `{name, items: [{name, price, quantity}]}` - what each person consumed

Key distinction: `bill` is the master list; `people.items` represents consumed portions. Remaining items are calculated via `getRemainingItems()`.

### Data Flow
1. User adds items to global bill (form submission)
2. User adds people 
3. User assigns items from bill to specific people (modal-based picker)
4. `getRemainingItems()` calculates unassigned items by subtracting consumed quantities
5. "Calculate Debt" calculates total cost per person

### Critical Business Logic
- **No unassigned items allowed** when calculating debt - `calcDebtBtn.onclick()` alerts if `getRemainingItems().length > 0`
- **Item deduplication**: Same item name across bill and person.items must match exactly (case-sensitive)
- **Quantity tracking**: Fractional quantities not supported (integer math only)

## Development Workflow

### Setup & Running
```bash
npm install          # Install Vite (devDependency only)
npm run dev          # Start dev server (--host flag for network access)
npm run build        # Production build to dist/
npm run preview      # Preview production build
```

### Project Stack
- **Vite 7.2.4** (modern bundler, no build config file required)
- **Vanilla JS** (no frameworks - direct DOM manipulation)
- **CSS** in `src/style.css` (CSS Variables in `:root`, dark theme by default)
- **Module setup**: `package.json` has `"type": "module"` (ES6 imports)

## Code Patterns & Conventions

### Rendering Pattern
All UI updates follow the render chain pattern:
```javascript
renderBill()        // Updates bill display, calls renderRemaining()
renderPeople()      // Updates people display, calls renderRemaining()
renderRemaining()   // Updates unassigned items
```
Never manipulate DOM directly outside render functions. Always mutate state array first, then call corresponding render function.

### Modal Implementation
Item assignment uses an imperative modal pattern (`showAddItemToPerson`):
- Creates modal div with class `modal`
- Populates dropdown from `getRemainingItems()` 
- Uses inline event handlers for form submission
- Removes modal on cancel or submit

### Form Handling
All forms prevent default and validate inline:
- Names: `.trim()` and truthiness check
- Numbers: `parseFloat()` / `parseInt()` with `isNaN()` validation
- Price/Quantity: `> 0` and `<= available` checks

### Internationalization
All UI text is in Russian (Cyrillic). Preserve language in UI strings when modifying forms or alerts.

## Key Files
- **`index.html`**: HTML structure with form IDs and section containers - modifying form IDs breaks `main.js` selectors
- **`src/main.js`**: All logic (no separate modules yet) - 200+ lines
- **`src/style.css`**: Styling including modal class (`.modal`, `.modal-form`)

## Common Modifications
- **New fields**: Add to state objects (`bill` or `people.items`), update form inputs in HTML, update render functions
- **New calculations**: Implement in `calcDebtBtn.onclick()` or create helper function using `people` array
- **Validation rules**: Check in form event listeners and `calcDebtBtn` logic
- **UI text**: Russian strings only - check `index.html` placeholders and `main.js` template literals
