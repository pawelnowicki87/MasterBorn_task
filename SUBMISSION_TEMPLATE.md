# Submission: Paweł Nowicki

## Time Spent

I spent about **4.5 hours** on the task, excluding breaks.

## Ticket Triage

### Tickets I Addressed

1. **CFG-142 / CFG-149:** Fixed price updates and loading state. Old responses cannot replace the current price, and cart actions wait for a current result.
2. **CFG-148:** Fixed the packaging crash and removed add-ons when their requirements stop being met. This also applies to loaded drafts and shared configurations.
3. **CFG-152:** Added keyboard support for colors and controls, visible focus and focus handling in dialogs.
4. **CFG-145:** Added Ctrl+Enter for Quick Add, with the same price and validation checks as the button. It also works from the page background when one configurator is present.
5. **CFG-147:** Fixed Unicode share links, restored the product and configuration name, and kept older links working.
6. **CFG-143, partial:** Added cleanup for the resize listener. I have not confirmed that this explains all reported performance problems.

### Tickets I Deprioritized

| Ticket  | Reason                                                                                                           |
| ------- | ---------------------------------------------------------------------------------------------------------------- |
| CFG-144 | Conflicts with the required Quick Add shortcut. I kept the feature for the demo.                                 |
| CFG-146 | Time is already formatted locally. I need a reproducible timezone case before changing it.                       |
| CFG-150 | The screenshot is missing. The picker uses flex; its calculated column variable is not used by CSS.              |
| CFG-151 | I left the general error-message cleanup for later. Invalid share links have a clear message.                    |
| CFG-153 | The estimated scope is weeks, so I left comparison out.                                                          |
| CFG-154 | The discount rules conflict. I did not change pricing policy without confirmation.                               |
| CFG-155 | I prioritized reliability and keyboard access over dark mode.                                                    |
| CFG-156 | I used stable IDs in the color and add-on markup I changed, but did not review every list.                       |
| CFG-157 | I corrected dirty-state updates, but did not add navigation confirmation.                                        |
| CFG-158 | `currentConfig` was already memoized and `product` was stable. I did not add more memoization without profiling. |

### Tickets That Need Clarification

- **CFG-144 / CFG-145:** Should Quick Add be removed after the demo, or retained for TechStyle?
- **CFG-154:** Which thresholds and rates are correct? The code/context use 10% for the upper tier, while the ticket mentions 15%.
- **CFG-146 / CFG-150:** I would ask QA for the timezone reproduction and the mobile screenshot with viewport dimensions.

### Tickets With a Misleading Priority Label

| Ticket  | Board label | My decision                                       |
| ------- | ----------- | ------------------------------------------------- |
| CFG-152 | Low         | High: the client requires keyboard accessibility. |
| CFG-145 | High        | Required for the demo, according to the ticket.   |
| CFG-153 | Medium      | Deferred: too large for this task.                |
| CFG-158 | High        | Deferred: the suggested fix was already present.  |

### Tickets Where I Stopped to Ask Instead of Implementing

I left these decisions open for confirmation; I did not receive a PM/Finance clarification during the exercise.

| Ticket            | Who I would ask         | Question                                                                                                                               |
| ----------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| CFG-154           | PM / Finance            | Confirm the discount rates and whether quantities 10 and 50 are included in their tiers. Changing either interpretation affects money. |
| CFG-144 / CFG-145 | Product / account owner | Confirm how the planned removal relates to the required demo shortcut. I followed the explicit demo requirement.                       |

## Technical Write-Up

### Critical Issues Found

#### Price updates — CFG-142

The hook compared `Date.now()` with an API field that actually contained a request counter. This discarded valid results. Older requests could also clear the loading state too early.

I replaced that comparison with a local request ID. A price is accepted only for the current configuration and product. Changing options immediately blocks the old price from being added to the cart.

#### Add-on crash — CFG-148

Dependency cleanup only handled select controls. Disabling packaging left Gift Wrap selected, and the summary read `.price` from a missing add-on. The previous cleanup also mutated state with `splice`.

I now filter add-ons against the new selections for all option changes. I reuse this when loading data and guard the summary against missing entries. This removes the invalid add-on and its cost, rather than only hiding the crash.

#### Share links — CFG-147

`btoa` could not encode the supplied Polish/emoji name. The URL also omitted the product ID, and the widget did not restore the name.

I added versioned UTF-8/Base64URL encoding, kept legacy decoding and checked the payload shape. The link restores the product and name, preserves other URL parameters and shows an error for invalid data. The demo can open either of its two known products.

### Other Changes Made

- Used native radio inputs, a button-based switch and labels for add-on checkboxes.
- Added modal focus wrapping, Escape handling and focus return after closing, saving or loading.
- Removed the unused debounced price hook, replaced two `any` types and fixed the existing lint errors.
- Moved dirty-state updates into handlers and URL loading into initialization.
- Removed the resize listener in effect cleanup.
- Kept parent notifications tied to configuration changes while using the latest callback.
- Limited drafts to the current product and rejected mismatched drafts before changing state.

## Validation

- `pnpm lint` and `pnpm build` pass. Changed files pass Prettier.
- Full `pnpm format:check` still fails on **19 unchanged template files**. I left those outside this change.
- Browser checks covered response ordering, cart safeguards, add-on dependencies, keyboard controls, dialogs, Ctrl+Enter and share-link compatibility.
- In 25 StrictMode mount/unmount cycles, all resize listeners were removed.
- Rechecked inline parent callbacks and cross-product draft loading, including a draft changed in another tab.
- Checked the main Enter key with left Ctrl, right Ctrl and both together, with focus on Quick Add and on the page background. Also checked Enter, Space and shortcut blocking during calculation or text editing.

The browser checks used temporary local harnesses with controlled responses where needed. No test framework was added. External placeholder images were blocked during those checks. I did not carry out a full WCAG audit or a long-session performance profile.

With `pnpm dev` running, [open the T-shirt example](http://localhost:5173/?config=v1.eyJwIjoicHJvZF90c2hpcnRfMDAxIiwicyI6eyJzaXplIjoiMTBfbGFyZ2UiLCJjb2xvciI6ImJsdWVfY3VzdG9tXzMiLCJxdWFudGl0eSI6MX0sImEiOltdLCJxIjo1LCJuIjoixbvDs8WCxIcgdGVzdCDwn46oIn0). It should restore `10" Large`, `Blue (Custom #3)`, quantity 5 and `Żółć test 🎨`, with a total of `$159.95`.

## Code Quality Notes

### Things I Noticed But Didn't Fix

- The component is still large. I avoided a broad refactor within the time limit.
- URL checks cover data structure, but full product-choice and quantity-limit validation still needs work.
- Prices still use floating-point arithmetic.
- Editing a configuration name still triggers pricing, preview and validation requests.

### Potential Improvements for the Future

1. Add repeatable regression tests to the repository.
2. Profile a longer session before further performance changes.
3. Extend product validation, error recovery and accessibility testing.

## Questions for the Team

My main questions are the pricing policy, the future of Quick Add and the missing QA reproductions listed above.

## Assumptions Made

- Demo reliability and explicit client requirements come first.
- Invalid add-ons should be removed, and should not be reselected automatically when a requirement is enabled again.
- Invalid share links show an error and leave the default configuration available. Older links without a product ID use the host's product.
- The demo resolves its two mock products. In production, the host/catalog would resolve the product.

## Self-Assessment

### What went well?

I kept the fixes focused and split them into separate commits.

### What was challenging?

Some ticket labels and suggested fixes did not match the code. I had to leave the conflicting pricing rules for clarification.

### What would I do differently with more time?

I would add repository tests and check longer sessions, more browsers and assistive technology.

## Additional Notes

The PR compares `fix/configurator` with `task-base`, the initial template commit, because some changes had already been committed to `main`.
