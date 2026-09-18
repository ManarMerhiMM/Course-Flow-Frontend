// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
//
// One fixed n8n webhook + one per-execution link:
//
//   submit (fixed, from .env)
//     -> initial registration
//     -> multipart/form-data because two files are uploaded
//     -> responds with the plan AND a "RespondURL"
//
//   RespondURL (dynamic, returned by the submit response)
//     -> the resume URL of the Wait node in THIS workflow execution
//     -> changes on every execution, so it is kept in component state
//     -> used for both request_changes and approve (the "action" field
//        in the JSON body tells the workflow which one it is)
//
// Add this to your .env:
//
// VITE_N8N_SUBMIT_WEBHOOK_URL=...

export const SUBMIT_WEBHOOK_URL =
  import.meta.env.VITE_N8N_SUBMIT_WEBHOOK_URL as string | undefined;