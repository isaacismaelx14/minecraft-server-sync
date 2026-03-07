import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import {
  PublishProfileResult,
  PublishProgressEvent,
  PublishSession,
} from './publish.types';

@Injectable()
export class PublishSessionStoreService implements OnModuleInit {
  private readonly publishSessionTtlMs = 15 * 60 * 1000;
  private readonly sessions = new Map<string, PublishSession>();

  onModuleInit() {
    setInterval(() => this.cleanup(), 60_000).unref();
  }

  create(jobId: string) {
    this.sessions.set(jobId, {
      createdAt: Date.now(),
      done: false,
      events: [],
      result: null,
      error: null,
      listeners: new Set(),
    });
  }

  open(
    jobId: string,
    handlers: {
      onProgress: (event: PublishProgressEvent) => void;
      onDone: (result: PublishProfileResult) => void;
      onError: (message: string) => void;
    },
  ): () => void {
    const session = this.sessions.get(jobId.trim());
    if (!session) {
      throw new NotFoundException('Publish job not found');
    }

    for (const event of session.events) {
      handlers.onProgress(event);
    }

    if (session.done) {
      if (session.error) {
        handlers.onError(session.error);
      } else if (session.result) {
        handlers.onDone(session.result);
      }
      return () => undefined;
    }

    const listener = (event: {
      type: 'progress' | 'done' | 'error';
      data: unknown;
    }) => {
      if (event.type === 'progress') {
        handlers.onProgress(event.data as PublishProgressEvent);
        return;
      }
      if (event.type === 'done') {
        handlers.onDone(event.data as PublishProfileResult);
        return;
      }
      if (typeof event.data === 'string' && event.data.trim().length > 0) {
        handlers.onError(event.data.trim());
        return;
      }
      if (event.data instanceof Error && event.data.message.trim().length > 0) {
        handlers.onError(event.data.message.trim());
        return;
      }
      handlers.onError('Publish failed');
    };

    session.listeners.add(listener);
    return () => {
      session.listeners.delete(listener);
    };
  }

  push(jobId: string, event: PublishProgressEvent) {
    const session = this.sessions.get(jobId);
    if (!session || session.done) {
      return;
    }
    session.events.push(event);
    for (const listener of session.listeners) {
      listener({ type: 'progress', data: event });
    }
  }

  finish(jobId: string, result: PublishProfileResult) {
    const session = this.sessions.get(jobId);
    if (!session || session.done) {
      return;
    }
    session.done = true;
    session.result = result;
    for (const listener of session.listeners) {
      listener({ type: 'done', data: result });
    }
  }

  fail(jobId: string, message: string) {
    const session = this.sessions.get(jobId);
    if (!session || session.done) {
      return;
    }
    session.done = true;
    session.error = message;
    for (const listener of session.listeners) {
      listener({ type: 'error', data: message });
    }
  }

  private cleanup() {
    const now = Date.now();
    for (const [jobId, session] of this.sessions.entries()) {
      if (now - session.createdAt > this.publishSessionTtlMs) {
        this.sessions.delete(jobId);
      }
    }
  }
}
