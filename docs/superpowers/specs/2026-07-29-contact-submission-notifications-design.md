# Contact Submission Notifications Design

## Goal

Notify active Admin and Moderator users when a public contact submission is
created, surface the unread count in both the notification bell and the
`Lời nhắn liên hệ` sidebar item, and preserve the notification bell's current
click behavior.

## Scope

- Publish one notification for each successfully created contact submission.
- Deliver it to active users with the `ADMIN` or `MODERATOR` role.
- Count unread contact-submission notifications in the shared unread response.
- Display that count beside the Admin contact-submissions navigation item.
- Show the notification in the existing notification bell and notifications
  directory.
- Clicking the notification only marks it as read. It does not navigate.
- Status changes do not publish additional notifications.

## Architecture

The contact-submissions module will reuse the existing notification subsystem.
A feature-owned `ContactSubmissionNotificationService` will translate a
created contact submission into a system notification, while
`CreateSystemNotificationUseCase` continues to own recipient resolution and
notification persistence.

The notification type will be
`CONTACT_SUBMISSION_CREATED`. The shared unread response will expose a
`contactSubmissions` counter, calculated from unread notifications of that
type. Admin navigation will bind its badge to this counter through
`notificationBadgeKey`.

No contact-specific polling endpoint or direct database count will be added.
The bell and sidebar will use the same unread-notification source so their
counts remain consistent.

## Creation Flow

1. Validate and normalize the public contact payload.
2. Reject duplicate pending phone numbers using the existing business rule.
3. Persist the contact submission.
4. Publish a role-scoped system notification for Admin and Moderator users.
5. Return the contact submission response.

Notification publishing is fail-soft. If notification creation fails, the
service logs a warning and the public contact request still succeeds. A
notification failure must never cause a customer message to be lost or
reported as failed after it was persisted.

## Notification Payload

The notification uses:

- Type: `CONTACT_SUBMISSION_CREATED`
- Scope: `ROLE`
- Target roles: `ADMIN`, `MODERATOR`
- Title: identifies a new contact submission and the sender
- Content: states that a new consultation request was submitted
- Metadata:
  - `submissionId`
  - `fullName`
  - `phone`
  - `consultationTopic`
  - `provinceCode`
  - `provinceName`
  - `status`

Metadata is informational in this iteration. Notification click handling will
not read `submissionId` or navigate to the detail route.

## Read And Badge Behavior

The notification bell keeps its existing interaction:

- An unread notification contributes to the bell total.
- Clicking it marks that recipient notification as read.
- The click does not change routes.
- Once read, it no longer contributes to either the bell count or the
  `Lời nhắn liên hệ` sidebar badge.

The sidebar badge therefore represents unread new-submission notifications,
not the total number of submissions in `NEW` or `IN_PROGRESS`.

## Error And Concurrency Behavior

- Duplicate pending-phone submissions do not create notifications.
- Database unique collisions mapped to
  `CONTACT_SUBMISSION_PHONE_PENDING` do not create notifications.
- Notification persistence errors are logged and swallowed after the contact
  submission has been stored.
- Retrying notification delivery is outside this iteration because the
  existing warranty notification services also use fail-soft publication.

## Testing

- Shared notification constants and unread response include the new type and
  counter.
- Contact creation publishes exactly one notification after persistence.
- Duplicate or invalid submissions publish no notification.
- Contact creation still succeeds when notification publishing fails.
- Unread count increments `unread` and `contactSubmissions` for the new type.
- Reading the notification removes it from both counts through the existing
  notification-recipient behavior.
- Dashboard configuration binds the contact-submissions item to
  `contactSubmissions`.
- Existing notification bell behavior remains unchanged and no navigation is
  introduced.
