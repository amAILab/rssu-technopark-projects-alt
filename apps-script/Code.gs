const SPREADSHEET_ID = 'PUT_SPREADSHEET_ID_HERE';
const AGENT_WEBHOOK_URL = ''; // optional

function doPost(e) {
  const payload = JSON.parse(e.postData.contents || '{}');
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const eventType = payload.event_type || inferEventType_(payload);

  if (eventType === 'chat.note.created') appendChatNote_(ss, payload);
  else if (eventType === 'vote.started') appendVote_(ss, payload);
  else if (eventType === 'vote.response.created') appendVoteResponse_(ss, payload);
  else appendRequest_(ss, payload);

  enqueueAgentEvent_(ss, eventType, payload);
  tryNotifyAgent_({ event_type: eventType, created_at: new Date().toISOString(), source: 'website', page: payload.page || 'unknown', author: payload.author || {}, payload });
  return json_({ ok: true, event_type: eventType });
}

function doGet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return json_({
    ok: true,
    projects: readSheet_(ss, 'Projects'),
    people: readSheet_(ss, 'People'),
    grants: readSheet_(ss, 'Grants'),
    agenda: readSheet_(ss, 'NTS_Agenda')
  });
}

function appendRequest_(ss, payload) {
  const sh = getOrCreate_(ss, 'Requests');
  ensureHeader_(sh, ['request_id','created_at','name','email','telegram','category','type','project_id','lab','text','nts_required','status']);
  sh.appendRow([Utilities.getUuid(), new Date(), payload.name || payload.author?.name || '', payload.email || payload.author?.email || '', payload.telegram || payload.author?.telegram || '', payload.category || '', payload.type || '', payload.project_id || payload.project || '', payload.lab || '', payload.text || payload.payload?.text || '', Boolean(payload.nts_required || payload.nts), 'new']);
}

function appendChatNote_(ss, payload) {
  const sh = getOrCreate_(ss, 'ChatNotes');
  ensureHeader_(sh, ['note_id','created_at','page','entity_type','entity_id','author','text','agent_status']);
  sh.appendRow([Utilities.getUuid(), new Date(), payload.page || '', payload.entity_type || '', payload.entity_id || '', payload.author?.name || payload.author || '', payload.text || '', 'pending']);
}

function appendVote_(ss, payload) {
  const sh = getOrCreate_(ss, 'Votes');
  ensureHeader_(sh, ['vote_id','agenda_id','question','options','status','created_at','closed_at','qr_url']);
  sh.appendRow([Utilities.getUuid(), payload.agenda_id || '', payload.question || '', JSON.stringify(payload.options || ['за','против','воздержался']), 'active', new Date(), '', payload.qr_url || '']);
}

function appendVoteResponse_(ss, payload) {
  const sh = getOrCreate_(ss, 'VoteResponses');
  ensureHeader_(sh, ['response_id','vote_id','participant_name','participant_role','answer','created_at']);
  sh.appendRow([Utilities.getUuid(), payload.vote_id || '', payload.participant_name || '', payload.participant_role || '', payload.answer || '', new Date()]);
}

function enqueueAgentEvent_(ss, type, payload) {
  const sh = getOrCreate_(ss, 'AgentQueue');
  ensureHeader_(sh, ['event_id','created_at','event_type','payload','status','processed_at']);
  sh.appendRow([Utilities.getUuid(), new Date(), type, JSON.stringify(payload), 'pending', '']);
}

function inferEventType_(payload) {
  if (payload.page && payload.text && payload.entity_type) return 'chat.note.created';
  if (payload.vote_id && payload.answer) return 'vote.response.created';
  if (payload.agenda_id && payload.question) return 'vote.started';
  if (payload.nts_required || payload.nts) return 'new_nts_question';
  return 'request.created';
}

function tryNotifyAgent_(event) {
  if (!AGENT_WEBHOOK_URL) return;
  UrlFetchApp.fetch(AGENT_WEBHOOK_URL, { method: 'post', contentType: 'application/json', payload: JSON.stringify(event), muteHttpExceptions: true });
}

function readSheet_(ss, name) {
  const sh = ss.getSheetByName(name);
  if (!sh) return [];
  const rows = sh.getDataRange().getValues();
  const headers = rows.shift() || [];
  return rows.map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
}

function ensureHeader_(sh, header) { if (sh.getLastRow() === 0) sh.appendRow(header); }
function getOrCreate_(ss, name) { return ss.getSheetByName(name) || ss.insertSheet(name); }
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
