# Public Quick Chat Design

## Goal

Add a floating quick-chat form to every public website page. The form reuses
the existing contact-submission API and validation behavior instead of creating
a separate submission type.

## Placement

- Mount the quick-chat component once in the public website layout.
- Display a fixed chat trigger at the bottom-right of the viewport.
- Do not render a second trigger inside individual pages.

## Interaction

- Clicking the trigger opens a branded quick-chat panel.
- The panel springs open from its bottom-right anchor with a restrained
  overshoot, then closes with a short scale-and-fade transition without moving
  vertically.
- The panel closes through its close icon or the Escape key.
- Closing and reopening the panel preserves unfinished form values during the
  current page session.
- Successful submission replaces the form with the existing success state.

## Form

Use the same form logic as the Contact page through a `quickChat` variant:

- Full name
- Phone number
- Consultation topic
- Province / city
- Message content

The shared logic includes:

- Zod and React Hook Form validation
- Vietnam province loading through the Locations service
- Pending-phone conflict handling
- API rate-limit handling
- Loading, error, and success states

The request uses `POST /public/contact-submissions` and omits `sourcePath`.

## Responsive UI

- Desktop panel width: approximately 400px.
- Desktop and mobile panels use a viewport-relative maximum height with
  internal scrolling.
- Mobile panel keeps a 16px viewport inset and uses at most 80dvh.
- The trigger and close controls have accessible labels and at least a 44px
  touch target.
- Styling uses the existing FUJITEK red, `rounded-md`, existing form controls,
  and no oversized decorative card treatment.

## Component Boundary

- Keep submission behavior in the existing contact-form component boundary.
- Add a visual variant rather than duplicating service calls, schema, error
  mapping, province loading, or success handling.
- Keep floating-panel state in a public shared component under
  `apps/web/src/components/common`.
- Keep the route layout thin and limited to composing the shared quick-chat
  component.

## Verification

- Regression test confirms the public layout mounts quick chat once.
- Form tests cover both page and quick-chat variants.
- Tests confirm quick chat omits `sourcePath`.
- Keyboard test coverage verifies Escape closes the panel.
- Responsive source assertions verify the mobile inset, maximum height, and
  full-width mobile submit control.
