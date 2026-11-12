# Submission: Paweł Nowicki

## Time Spent

Total time: **approximately 4.5 hours of active work**, excluding breaks.

## Ticket Triage

### Tickets I Addressed

1. **CFG-142**: Fixed price responses being discarded, stale responses and stale loading state. Both cart actions require a current price. The existing dimmed loading display is retained, covering **CFG-149** without a separate UI feature.
2. **CFG-148**: Removed unavailable add-ons when their dependencies change, without mutating state. Applied the same filtering to initial configurations and loaded drafts, and guarded the summary against missing add-ons.
3. **CFG-152**: Added native radio inputs for colors, keyboard-operable controls, accessible names, visible focus and modal focus management.
4. **CFG-145**: Added a scoped Ctrl+Enter shortcut. It shares the cart safeguards, ignores repeated key events and does not run in dialogs or text-editing fields. Validation must belong to the current configuration and product.
5. **CFG-147**: Fixed Unicode encoding, URL-safe serialization, product identification and configuration-name restoration. Preserved older links and rejected malformed payloads.
6. **CFG-143, partial**: Fixed the confirmed resize-listener leak. This does not establish that every cause of sluggishness during a long session has been resolved.

### Tickets I Deprioritized

| Ticket  | Reason                                                                                                                                          |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| CFG-144 | Conflicts with the newer, explicit demo requirement in CFG-145. Kept Quick Add pending Product confirmation.                                    |
| CFG-146 | The current code already formats saved timestamps in local time. A reproducible timezone case is needed before changing it.                     |
| CFG-150 | The missing screenshot and viewport details are needed. The picker uses flex layout; the calculated column variable is not consumed by its CSS. |
| CFG-151 | A complete error-message mapping and recovery flow were left for follow-up. Invalid share links do get an actionable message.                   |
| CFG-153 | A new comparison feature, estimated at weeks, does not fit the demo-stability scope.                                                            |
| CFG-154 | Pricing sources disagree about thresholds and percentages. Left the rules unchanged pending PM/Finance confirmation.                            |
| CFG-155 | Dark mode is useful but is not a demo blocker.                                                                                                  |
| CFG-156 | Used stable IDs in the color and add-on markup that changed for accessibility. Did not perform a separate sweep of every list.                  |
| CFG-157 | Corrected dirty-state updates while resolving lint issues, but did not implement the navigation-confirmation flow.                              |
| CFG-158 | `currentConfig` was already memoized and `product` came from a stable import. No evidence justified adding the suggested memoization.           |

### Tickets That Need Clarification

| Ticket            | Question                                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CFG-144 / CFG-145 | Does the Quick Add sunset apply to this demo, given TechStyle's explicit shortcut requirement?                                                                            |
| CFG-154           | What are the approved boundaries and percentages for every quantity tier? The code/context say 10% at the upper tier, while the ticket quotes public material saying 15%. |
| CFG-146 / CFG-150 | Can QA provide the failing timezone case and the missing mobile screenshot with viewport dimensions?                                                                      |

### Tickets With a Misleading Priority Label

| Ticket  | Label on board | My priority       | Why                                                                           |
| ------- | -------------- | ----------------- | ----------------------------------------------------------------------------- |
| CFG-152 | Low            | High              | Keyboard access is part of the client's stated compliance requirements.       |
| CFG-145 | High           | Demo requirement  | The description explicitly calls the shortcut mandatory for the demo.         |
| CFG-153 | Medium         | Deferred          | A multi-week feature would displace reliability fixes.                        |
| CFG-158 | High           | Investigate later | The proposed fix does not match the code; profiling evidence is needed first. |

### Tickets Where I Stopped to Ask Instead of Implementing

These are clarification questions for the team; no PM/Finance response was available during the exercise.

| Ticket            | Who I would ask                         | Question and decision                                                                                                                                                                                    |
| ----------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CFG-154           | PM and Finance                          | Confirm inclusive/exclusive thresholds and discount rates, including quantities 10 and 50. Both changing and retaining the current behavior carry financial risk; I did not choose a new pricing policy. |
| CFG-144 / CFG-145 | Product and the TechStyle account owner | Confirm whether removal is postponed or the demo is an exception. I retained Quick Add and implemented the explicit demo requirement.                                                                    |

## Technical Write-Up

### Critical Issues Found

#### Price responses were compared against an unrelated clock

**Tickets:** CFG-142, CFG-149.

**Bug:** The hook compared `Date.now()` with `response.timestamp`, but the mock API puts a small request counter in that field. Valid responses were discarded. An older request could also end the loading state of a newer one.

**Investigation:** Followed the response field from the API to the hook and checked responses completing out of order.

**Fix:** A local increasing request ID accepts only the latest result. Cleanup invalidates pending requests. A result is usable only for its configuration and product, so changing inputs immediately hides the old price and blocks cart actions.

**Reason:** This preserves the asynchronous API and does not depend on server clocks or the mock response field.

#### Dependency changes left invalid add-ons in state

**Ticket:** CFG-148.

**Bug:** Cleanup only covered select controls. Turning packaging off left Gift Wrap selected, while the summary looked it up in a map of available add-ons and read `.price` from `undefined`. The select cleanup also used `splice` on React state.

**Investigation:** Reproduced the packaging crash and checked engraving after a material change.

**Fix:** Filter selected IDs against the next selections for every option change. Reuse the filter when restoring configurations and drafts. The summary also handles a missing add-on safely.

**Reason:** Fixing the state invariant avoids retaining or charging for an invalid add-on. A null check alone would only hide the crash.

#### Share links did not support Unicode or fully restore state

**Ticket:** CFG-147.

**Bug:** `btoa` received JSON containing Unicode directly. Standard Base64 was inserted into a query string without URL-safe handling. The configuration name was not restored, and the payload did not identify the product.

**Investigation:** Reproduced the supplied Polish/emoji example. This is an encoding issue, not a development-only build issue.

**Fix:** Added versioned UTF-8/Base64URL encoding, legacy decoding, payload-shape checks and URL construction through `URL.searchParams`. Names survive sharing and draft save/load. The demo resolves its two known products, and the widget rejects links for a different product.

**Reason:** New links are unambiguous while existing ASCII and Latin-1 links remain readable, including old query strings where `+` became a space.

### Other Changes Made

- Used native radio inputs and a button-based switch. Add-on labels now operate their checkboxes directly.
- Used native modal dialogs with explicit Tab/Shift+Tab wrapping, Escape handling and focus restoration after closing, saving or loading.
- Removed the unused debounced pricing hook, replaced two `any` types and resolved the existing lint errors without disabling rules.
- Moved dirty-state updates to change handlers and URL restoration to initialization. Share URLs are derived rather than copied into state by an effect.
- Removed the resize listener using the same handler reference during effect cleanup.

## Validation

- `pnpm lint` and `pnpm build` pass.
- Prettier checks pass for the changed files. The repository-wide `pnpm format:check` still reports formatting differences in 19 unchanged template files; those were left out of scope.
- Browser checks covered out-of-order price responses, stale failures, refetching, unmounting, and cart safeguards while price or validation is pending.
- Checked keyboard navigation, disabled/read-only controls, modal focus boundaries and restoration, and a mobile dialog viewport.
- Checked Ctrl+Enter inside and outside the widget, repeated keys, text editing, dialogs and invalid configurations.
- Checked the exact share-link example in a production bundle, legacy links, invalid payloads, product selection and draft-name persistence.
- Across 25 StrictMode mount/unmount cycles, all 50 resize registrations were removed. A mounted widget had one active resize handler.

With `pnpm dev` running, [open the ticket's T-shirt example](http://localhost:5173/?config=v1.eyJwIjoicHJvZF90c2hpcnRfMDAxIiwicyI6eyJzaXplIjoiMTBfbGFyZ2UiLCJjb2xvciI6ImJsdWVfY3VzdG9tXzMiLCJxdWFudGl0eSI6MX0sImEiOltdLCJxIjo1LCJuIjoixbvDs8WCxIcgdGVzdCDwn46oIn0). It restores `10" Large`, `Blue (Custom #3)`, quantity 5 and the name `Żółć test 🎨`; the total is `$159.95`.

Browser checks used temporary local harnesses, including controlled API responses; no test framework or test dependencies were added to the repository. External placeholder-image requests were blocked in those checks. This was not a full WCAG audit or a 20-minute performance profile.

## Code Quality Notes

### Things I Noticed But Didn't Fix

| Issue                                    | Why I Left It                                                                                                                                   |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Large component                          | A broad extraction would increase regression risk within this time budget.                                                                      |
| Product-specific validation gaps         | The shared-payload checks validate structure, not every product choice and quantity limit. Server-side/domain validation needs a separate pass. |
| Floating-point price arithmetic          | Cent-based calculations deserve follow-up alongside confirmed pricing rules.                                                                    |
| Requests on name edits                   | Price, preview and validation still react to configuration-name changes. Optimize their inputs after profiling.                                 |
| Mobile color layout and technical errors | Kept these separate from the demonstrated crashes and stale-state bugs.                                                                         |

### Potential Improvements for the Future

1. Add a maintained regression-test setup for request ordering, dependencies and URL compatibility.
2. Profile a sustained session and separate pricing inputs from unrelated configuration metadata.
3. Complete product validation, error recovery and a broader accessibility review.

## Questions for the Team

1. Who owns the authoritative pricing specification, and can PM/Finance confirm it before CFG-154 changes?
2. Is Quick Add retained for TechStyle only or for all clients?
3. Can QA provide the missing timezone and mobile-layout reproductions?

## Assumptions Made

1. Reliability and the explicit TechStyle demo requirements take priority over new features and visual polish.
2. Unavailable add-ons should be removed when their requirements stop being met; re-enabling a requirement should not silently reselect them.
3. A malformed or mismatched share link should show an error and leave the default configuration available. Legacy links without a product ID remain tied to the host's product.
4. The demo can select either known mock product from a new share link. Production embedding would resolve products through the host/catalog.

## Self-Assessment

### What went well?

The changes stayed focused on reproducible failures and were split into small commits. The pricing API and existing component architecture were retained.

### What was challenging?

Ticket labels and suggested fixes did not always match the code or the demo requirements. Pricing needed an explicit decision to wait for clarification.

### What would I do differently with more time?

Add repeatable repository tests, profile longer sessions and validate the full keyboard flow with assistive technology and additional browsers.

## Additional Notes

Code changes are on `fix/configurator`. The PR compares against `task-base`, which points to the initial template commit, so the complete solution is reviewable even though some fixes were already committed to `main`.
