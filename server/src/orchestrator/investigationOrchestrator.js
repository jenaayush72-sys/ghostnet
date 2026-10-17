import crypto from 'crypto';
import { CaseRepository } from '../models/Case.js';
import { runGhostAgent } from '../agents/ghostAgent.js';
import { runProsecutorAgent } from '../agents/prosecutorAgent.js';
import { runDefenseAgent } from '../agents/defenseAgent.js';
import { runEvidenceAgent } from '../agents/evidenceAgent.js';
import { runFactCheckerAgent } from '../agents/factCheckerAgent.js';
import { runJudgeAgent } from '../agents/judgeAgent.js';

class InvestigationOrchestrator {
  constructor() {
    // Map of caseId -> Set of response streams (Express res objects)
    this.sseClients = new Map();
  }

  // Register an SSE client for real-time streaming
  registerSseClient(caseId, res) {
    if (!this.sseClients.has(caseId)) {
      this.sseClients.set(caseId, new Set());
    }
    const clients = this.sseClients.get(caseId);
    clients.add(res);

    // Send immediate initial handshake and heartbeat
    res.write(`event: connected\ndata: ${JSON.stringify({ caseId, time: new Date() })}\n\n`);

    // Clean up when client disconnects
    res.on('close', () => {
      clients.delete(res);
      if (clients.size === 0) {
        this.sseClients.delete(caseId);
      }
    });
  }

  // Broadcast event to connected SSE clients and persist to DB
  async emitEvent(caseId, { stage, agentName, eventType, content, data = {} }) {
    const event = {
      eventId: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      stage,
      agentName,
      eventType,
      content,
      data,
      timestamp: new Date()
    };

    // 1. Persist to case in DB
    await CaseRepository.addEvent(caseId, event);

    // 2. Stream to active SSE clients
    const clients = this.sseClients.get(caseId);
    if (clients && clients.size > 0) {
      const payload = `event: investigation_event\ndata: ${JSON.stringify(event)}\n\n`;
      for (const res of clients) {
        try {
          res.write(payload);
        } catch (err) {
          console.warn(`[Orchestrator] Error writing to client for case ${caseId}:`, err.message);
        }
      }
    }

    return event;
  }

  // Send heartbeat to prevent proxy timeouts
  sendHeartbeat(caseId) {
    const clients = this.sseClients.get(caseId);
    if (clients && clients.size > 0) {
      for (const res of clients) {
        try {
          res.write(`event: heartbeat\ndata: ${JSON.stringify({ timestamp: new Date() })}\n\n`);
        } catch {}
      }
    }
  }

  /**
   * Main investigation runner: deterministic 7-stage workflow
   */
  async runInvestigation(caseId) {
    const caseDoc = await CaseRepository.findOneByCaseId(caseId);
    if (!caseDoc) {
      throw new Error(`Case ${caseId} not found`);
    }

    // Heartbeat interval during long pipeline stages
    const heartbeatTimer = setInterval(() => this.sendHeartbeat(caseId), 8000);

    try {
      // Update status to in_progress
      await CaseRepository.updateByCaseId(caseId, {
        status: 'in_progress',
        currentStage: 'ghost_analysis'
      });

      // STAGE 1: Case Initiation Event
      await this.emitEvent(caseId, {
        stage: 'created',
        agentName: 'Courtroom Clerk',
        eventType: 'CASE_EMPANELLED',
        content: `Case empanelled. Claim entered into court docket: "${caseDoc.originalClaim}". Initiating multi-agent adversarial inquiry.`
      });

      // STAGE 2: GHOST & EVIDENCE ANALYSIS (Concurrent execution permitted for independent inputs)
      await CaseRepository.updateByCaseId(caseId, { currentStage: 'ghost_analysis' });
      await this.emitEvent(caseId, {
        stage: 'ghost_analysis',
        agentName: 'Ghost Agent',
        eventType: 'STAGE_STARTED',
        content: 'Ghost Agent is formulating a clever counter-argument to test the claim...'
      });

      const [ghostResult, evidenceResult] = await Promise.all([
        runGhostAgent({
          claim: caseDoc.originalClaim,
          context: caseDoc.context,
          category: caseDoc.category
        }),
        runEvidenceAgent({
          caseId,
          claim: caseDoc.originalClaim,
          category: caseDoc.category
        })
      ]);

      await this.emitEvent(caseId, {
        stage: 'ghost_analysis',
        agentName: 'Ghost Agent (Groq)',
        eventType: 'ADVERSARIAL_ARGUMENT_FILED',
        content: `[Ghost Agent — Groq]: "${ghostResult.adversarialArgument}"`,
        data: {
          targetedStatements: ghostResult.targetedStatements,
          potentialErrorType: ghostResult.potentialErrorType,
          limitations: ghostResult.limitations,
          disclaimer: ghostResult.disclaimer
        }
      });

      await this.emitEvent(caseId, {
        stage: 'evidence_retrieval',
        agentName: 'Evidence Agent',
        eventType: 'EVIDENCE_RETRIEVED',
        content: evidenceResult.summary,
        data: {
          count: evidenceResult.retrievedCount,
          verified: evidenceResult.verifiedCount,
          records: evidenceResult.evidenceRecords
        }
      });

      // Store initial agent results
      await CaseRepository.updateByCaseId(caseId, {
        'agentResults.ghost': ghostResult,
        'agentResults.evidence': evidenceResult,
        evidenceReferences: evidenceResult.evidenceRecords.map(e => e.evidenceId)
      });

      // STAGE 3: PROSECUTION
      await CaseRepository.updateByCaseId(caseId, { currentStage: 'prosecution' });
      await this.emitEvent(caseId, {
        stage: 'prosecution',
        agentName: 'Prosecutor Agent (Sarvam AI)',
        eventType: 'STAGE_STARTED',
        content: 'Prosecutor Agent (Sarvam AI) is questioning the assumptions and pointing out misleading claims...'
      });

      const prosecutorResult = await runProsecutorAgent({
        claim: caseDoc.originalClaim,
        ghostArgument: ghostResult.adversarialArgument,
        targetedStatements: ghostResult.targetedStatements
      });

      const firstObj = prosecutorResult?.objections?.[0];
      const spokenProsecution = firstObj
        ? `The Prosecution formally objects to "${firstObj.statement}": ${firstObj.objection} ${firstObj.reasoning}`
        : `Prosecutor filed formal objections against unsupported premises.`;

      await this.emitEvent(caseId, {
        stage: 'prosecution',
        agentName: 'Prosecutor Agent (Sarvam AI)',
        eventType: 'OBJECTIONS_ENTERED',
        content: `[Prosecutor — Sarvam 105B]: "${spokenProsecution}"`,
        data: { objections: prosecutorResult?.objections || [] }
      });

      await CaseRepository.updateByCaseId(caseId, {
        'agentResults.prosecutor': prosecutorResult
      });

      // STAGE 4: DEFENSE
      await CaseRepository.updateByCaseId(caseId, { currentStage: 'defense' });
      await this.emitEvent(caseId, {
        stage: 'defense',
        agentName: 'Defense Agent (Groq)',
        eventType: 'STAGE_STARTED',
        content: 'Defense Agent (Groq) is stepping in to explain where and why this claim actually makes sense...'
      });

      const defenseResult = await runDefenseAgent({
        claim: caseDoc.originalClaim,
        objections: prosecutorResult?.objections || [],
        ghostArgument: ghostResult.adversarialArgument
      });

      const firstDefense = defenseResult?.counterarguments?.[0];
      const spokenDefense = firstDefense
        ? `Defense Counsel clarifies: ${firstDefense.defenseArgument} (Valid when: ${firstDefense.conditionsWhereTrue})`
        : `Defense presented contextual boundaries.`;

      await this.emitEvent(caseId, {
        stage: 'defense',
        agentName: 'Defense Agent (Groq)',
        eventType: 'DEFENSE_ARGUMENTS_FILED',
        content: `[Defense — Groq]: "${spokenDefense}"`,
        data: {
          counterarguments: defenseResult?.counterarguments || [],
          acceptedObjections: defenseResult?.objectionsAccepted || [],
          challengedObjections: defenseResult?.objectionsChallenged || [],
          remainingUncertainties: defenseResult?.remainingUncertainties || []
        }
      });

      await CaseRepository.updateByCaseId(caseId, {
        'agentResults.defense': defenseResult
      });

      // STAGE 5: FACT-CHECKING
      await CaseRepository.updateByCaseId(caseId, { currentStage: 'fact_checking' });
      await this.emitEvent(caseId, {
        stage: 'fact_checking',
        agentName: 'Fact-Checker Agent (Sarvam AI)',
        eventType: 'STAGE_STARTED',
        content: 'Fact-Checker Agent (Sarvam AI) is checking the facts and code rules against verified sources...'
      });

      const factCheckerResult = await runFactCheckerAgent({
        claim: caseDoc.originalClaim,
        ghostArgument: ghostResult.adversarialArgument,
        evidenceRecords: evidenceResult.evidenceRecords
      });

      await this.emitEvent(caseId, {
        stage: 'fact_checking',
        agentName: 'Fact-Checker Agent (Sarvam AI)',
        eventType: 'FACT_CHECK_REPORT_FILED',
        content: `[Auditor — Sarvam]: "${factCheckerResult.recommendedConclusion || 'Evidence audit completed.'}"`,
        data: {
          claimAssessments: factCheckerResult.claimAssessments,
          citationProblems: factCheckerResult.citationProblems,
          limitations: factCheckerResult.verificationLimitations
        }
      });

      await CaseRepository.updateByCaseId(caseId, {
        'agentResults.factChecker': factCheckerResult
      });

      // STAGE 6: JUDGMENT
      await CaseRepository.updateByCaseId(caseId, { currentStage: 'judgment' });
      await this.emitEvent(caseId, {
        stage: 'judgment',
        agentName: 'Gemma 4 Judge',
        eventType: 'STAGE_STARTED',
        content: 'Supreme Judge Gemma 4 has entered the courtroom to deliver the final, plain-English ruling...'
      });

      const judgeResult = await runJudgeAgent({
        claim: caseDoc.originalClaim,
        ghostResult,
        prosecutorResult,
        defenseResult,
        evidenceRecords: evidenceResult.evidenceRecords,
        factCheckerResult
      });

      await this.emitEvent(caseId, {
        stage: 'judgment',
        agentName: 'Gemma 4 Judge',
        eventType: 'VERDICT_RENDERED',
        content: `[Gemma 4 Supreme Ruling]: VERDICT: ${judgeResult.verdict.toUpperCase()} — ${judgeResult.takeaway || judgeResult.summary}`,
        data: {
          verdict: judgeResult.verdict,
          takeaway: judgeResult.takeaway,
          summary: judgeResult.summary,
          reasoning: judgeResult.reasoning,
          truthBreakdown: judgeResult.truthBreakdown,
          supportingFindings: judgeResult.supportingFindings,
          contradictingFindings: judgeResult.contradictingFindings,
          citedEvidenceIds: judgeResult.citedEvidenceIds,
          unresolvedQuestions: judgeResult.unresolvedQuestions,
          confidenceAssessment: judgeResult.confidenceAssessment,
          confidenceLimitations: judgeResult.confidenceLimitations
        }
      });

      // STAGE 7: COMPLETION
      const completedDoc = await CaseRepository.updateByCaseId(caseId, {
        status: 'completed',
        currentStage: 'completed',
        completedAt: new Date(),
        'agentResults.judge': judgeResult,
        verdict: judgeResult
      });

      await this.emitEvent(caseId, {
        stage: 'completed',
        agentName: 'Courtroom Clerk',
        eventType: 'CASE_CLOSED',
        content: `Case ${caseId} proceedings concluded and entered into legal precedent vault.`,
        data: { verdict: judgeResult.verdict }
      });

      // Broadcast completion signal
      const clients = this.sseClients.get(caseId);
      if (clients) {
        for (const res of clients) {
          try {
            res.write(`event: investigation_complete\ndata: ${JSON.stringify({ caseId, status: 'completed' })}\n\n`);
          } catch {}
        }
      }

      return completedDoc;
    } catch (err) {
      console.error(`[Orchestrator] Error running investigation for case ${caseId}:`, err);
      const errorDetails = {
        message: err.message,
        stage: caseDoc.currentStage,
        timestamp: new Date()
      };

      await CaseRepository.updateByCaseId(caseId, {
        status: 'failed',
        currentStage: 'failed',
        errorDetails
      });

      await this.emitEvent(caseId, {
        stage: 'failed',
        agentName: 'Courtroom Clerk',
        eventType: 'INVESTIGATION_FAILED',
        content: `Investigation halted due to operational failure: ${err.message}`,
        data: errorDetails
      });

      // Send error signal to SSE
      const clients = this.sseClients.get(caseId);
      if (clients) {
        for (const res of clients) {
          try {
            res.write(`event: investigation_error\ndata: ${JSON.stringify(errorDetails)}\n\n`);
          } catch {}
        }
      }

      throw err;
    } finally {
      clearInterval(heartbeatTimer);
    }
  }

  /**
   * Challenge & Replay: add counter-evidence and rerun investigation
   */
  async challengeInvestigation(caseId, { counterEvidence, counterUrl, reason }) {
    const caseDoc = await CaseRepository.findOneByCaseId(caseId);
    if (!caseDoc) throw new Error(`Case ${caseId} not found`);

    const challengeNote = `[APPELLATE COUNTER-EVIDENCE]: ${counterEvidence}${counterUrl ? ` (Reference Source: ${counterUrl})` : ''}${reason ? ` - ${reason}` : ''}`;
    const updatedContext = caseDoc.context ? `${caseDoc.context}\n\n${challengeNote}` : challengeNote;

    await CaseRepository.updateByCaseId(caseId, {
      context: updatedContext,
      status: 'queued',
      currentStage: 'created',
      verdict: null,
      errorDetails: null
    });

    await this.emitEvent(caseId, {
      stage: 'created',
      agentName: 'Appellate Clerk',
      eventType: 'CHALLENGE_REPLAY_INITIATED',
      content: `Challenge & Replay initiated. Counter-evidence lodged on docket: "${counterEvidence.slice(0, 180)}..."`,
      data: { counterEvidence, counterUrl, reason }
    });

    // Re-run asynchronously
    setTimeout(() => {
      this.runInvestigation(caseId).catch(err => {
        console.error(`[Orchestrator] Challenge rerun error for ${caseId}:`, err);
      });
    }, 50);

    return { caseId, status: 'queued', message: 'Counter-evidence admitted. Replay empanelled.' };
  }
}

export const orchestrator = new InvestigationOrchestrator();
