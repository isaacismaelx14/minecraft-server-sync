use tauri::{AppHandle, Emitter};

use crate::types::{GameSessionStatus, SyncErrorEvent, SyncProgressEvent};

pub const EVENT_QUIT_REQUESTED: &str = "app://quit-requested";

pub fn emit_sync_progress(app: &AppHandle, payload: &SyncProgressEvent) {
  let _ = app.emit("sync://progress", payload);
}

pub fn emit_sync_error(app: &AppHandle, payload: &SyncErrorEvent) {
  let _ = app.emit("sync://error", payload);
}

pub fn emit_session_status(app: &AppHandle, payload: &GameSessionStatus) {
  let _ = app.emit("session://status", payload);
}

pub fn emit_quit_requested(app: &AppHandle) {
  let _ = app.emit(EVENT_QUIT_REQUESTED, ());
}
