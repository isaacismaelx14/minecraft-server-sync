import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { inspect } from 'node:util';
import { ProfileLock } from '@minerelay/shared';
import {
  GenerateLockfileDto,
  PublishProfileDto,
  PublishProfileResultDto,
  PublishProgressEventDto,
} from '../admin.dto';
import { LockPayloadBuilderService } from './lock-payload-builder.service';
import { PublishSessionStoreService } from './publish-session-store.service';
import { PublishWorkflowService } from './publish-workflow.service';

@Injectable()
export class AdminPublishContextService {
  private readonly logger = new Logger(AdminPublishContextService.name);

  constructor(
    private readonly lockBuilder: LockPayloadBuilderService,
    private readonly workflow: PublishWorkflowService,
    private readonly sessions: PublishSessionStoreService,
  ) {}

  generateLockfile(input: GenerateLockfileDto): Promise<ProfileLock> {
    return this.lockBuilder.buildLockPayload({
      profileId: input.profileId,
      version: input.version ?? 1,
      serverName: input.serverName,
      serverAddress: input.serverAddress,
      minecraftVersion: input.minecraftVersion,
      loaderVersion: input.loaderVersion,
      mods: input.mods,
      resources: input.resources ?? [],
      shaders: input.shaders ?? [],
      fancyMenu: input.fancyMenu ?? {},
    });
  }

  startPublishProfile(
    input: PublishProfileDto,
    requestOrigin: string,
  ): { jobId: string } {
    const jobId = randomBytes(12).toString('hex');
    this.sessions.create(jobId);

    void this.workflow
      .publishProfile(input, requestOrigin, {
        onProgress: (event) => this.sessions.push(jobId, event),
      })
      .then((result) => {
        this.sessions.finish(jobId, result);
      })
      .catch((error) => {
        const detail = this.formatErrorDetails(error);
        this.logger.error(
          `[publish:${jobId}] failed (${input.minecraftVersion}/${input.loaderVersion}) ${detail}`,
          error instanceof Error ? error.stack : undefined,
        );
        this.sessions.fail(jobId, detail || 'Publish failed');
      });

    return { jobId };
  }

  openPublishStream(
    jobId: string,
    handlers: {
      onProgress: (event: PublishProgressEventDto) => void;
      onDone: (result: PublishProfileResultDto) => void;
      onError: (message: string) => void;
    },
  ): () => void {
    return this.sessions.open(jobId, handlers);
  }

  publishProfile(
    input: PublishProfileDto,
    requestOrigin: string,
    options?: { onProgress?: (event: PublishProgressEventDto) => void },
  ): Promise<PublishProfileResultDto> {
    return this.workflow.publishProfile(input, requestOrigin, options);
  }

  private formatErrorDetails(error: unknown): string {
    if (!error) {
      return 'Unknown error';
    }
    if (error instanceof Error) {
      const causeCode = (error as Error & { cause?: { code?: string } }).cause
        ?.code;
      if (typeof causeCode === 'string' && causeCode.trim().length > 0) {
        return `${error.message} [${causeCode}]`;
      }
      return error.message || error.name;
    }
    if (typeof error === 'string') {
      return error;
    }
    try {
      return JSON.stringify(error);
    } catch {
      return inspect(error);
    }
  }
}
