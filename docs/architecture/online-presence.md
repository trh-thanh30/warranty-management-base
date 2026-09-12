# Online presence

The Admin dashboard shows separate Web and Admin online badges next to the operations overview label.

Presence belongs to the existing `AnalyticsModule`. Its dedicated `AnalyticsPresenceController`, use cases and Redis repository live inside `modules/analytics`; there is no standalone presence module. Admin reuses `analyticsService`. Routes are `/analytics/presence/web/heartbeat`, `/analytics/presence/admin/heartbeat` and `/analytics/presence/online`.

- Web: approximate unique browsers, including anonymous visitors. A random UUID in localStorage deduplicates tabs on the same origin. Different browsers/devices count separately. If storage is unavailable, a temporary per-mount identity is used.
- Admin: unique authenticated accounts, deduplicated across tabs/devices by the server-verified user ID. Login pages do not send heartbeats.
- Visible, online tabs send a heartbeat immediately and at most once every 30 seconds. Reading an open foreground page counts as activity; this is presence, not a measure of keyboard/mouse interactions.
- A heartbeat remains active for 120 seconds. Closing/hiding a tab or signing out stops heartbeats; counts expire within two minutes rather than removing a shared identity that another tab might still be using.
- Redis sorted sets use Redis server time, prune expired members atomically, and expire after inactivity. No new database table, IP address, email, page URL, or persistent activity history is stored.
- Counts are polled every 30 seconds by dashboard users with `DASHBOARD_VIEW`. The count endpoint requires authentication and that permission. Only the Web heartbeat endpoint is public; global rate limiting still applies.
- Failed presence requests do not block either app. Badges show `—` when counts cannot be loaded, rather than reporting zero.

These are approximate operational metrics, not analytics-grade unique people. Anonymous heartbeat IDs can be reset or spoofed, and background tabs expire intentionally. All API replicas must share the same Redis instance. No WebSocket or extra infrastructure is required.
