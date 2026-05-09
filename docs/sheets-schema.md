# Google Sheets schema

## Projects
`project_id, title, lab, status, priority, goal, tasks, description, responsible, team, partners, nearest_dates, drive_url, hours_needed, hours_allocated, grant_related, nts_required, completeness`

## People
`person_id, name, category, email, telegram, competencies, lab, hours_total_week, hours_busy_week, hours_free_week, availability, comment, status`

## ResourceAllocations
`allocation_id, week, person_id, project_id, role, task, hours, status`

## Requests
`request_id, created_at, name, email, telegram, category, type, project_id, lab, text, nts_required, status`

## Grants
`grant_id, title, fund, amount, deadline, status, stage, responsible, related_projects, drive_url, description`

## GrantTimeline
`item_id, grant_id, stage, start_date, end_date, responsible, status`

## NTS_Agenda
`agenda_id, nts_date, topic, type, project_id, reporter, time_limit, vote_required, decision, responsible, deadline, status`

## Votes
`vote_id, agenda_id, question, options, status, created_at, closed_at, qr_url`

## VoteResponses
`response_id, vote_id, participant_name, participant_role, answer, created_at`

## ChatNotes
`note_id, created_at, page, entity_type, entity_id, author, text, agent_status`

## AgentQueue
`event_id, created_at, event_type, payload, status, processed_at`

## Optional service sheets

### NTSMeetings
`meeting_id, number, date, title, status, protocol_url, created_at, updated_at`

### ProtocolDraft
`draft_id, meeting_id, section, source_type, source_id, text, status, created_at`

### PassportQuality
`project_id, completeness, status, missing_drive_url, missing_responsible, missing_nearest_dates, missing_description, updated_at`
