// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
//
// Three separate n8n webhooks:
//
//   submit
//     -> initial registration
//     -> multipart/form-data because two files are uploaded
//
//   request_changes
//     -> student disapproves / requests changes
//     -> JSON containing the COMPLETE current plan + feedback
//
//   approve
//     -> student approves the plan
//     -> JSON containing the COMPLETE current plan
//
// Add these to your .env:
//
// VITE_N8N_SUBMIT_WEBHOOK_URL=...
// VITE_N8N_REQUEST_CHANGES_WEBHOOK_URL=...
// VITE_N8N_APPROVE_WEBHOOK_URL=...

export const SUBMIT_WEBHOOK_URL =
  import.meta.env.VITE_N8N_SUBMIT_WEBHOOK_URL as string | undefined;

export const REQUEST_CHANGES_WEBHOOK_URL =
  import.meta.env.VITE_N8N_REQUEST_CHANGES_WEBHOOK_URL as string | undefined;

export const APPROVE_WEBHOOK_URL =
  import.meta.env.VITE_N8N_APPROVE_WEBHOOK_URL as string | undefined;
