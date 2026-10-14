import { CaseRepository } from '../models/Case.js';
import { EvidenceRepository } from '../models/Evidence.js';

export async function seedDemoCaseIfEmpty() {
  const existingCount = await CaseRepository.countDocuments();
  if (existingCount > 0) return;

  const demoCaseId = 'CASE-DEMO-01';
  const claim = "In JavaScript, setTimeout(fn, 0) executes immediately before any other code in the call stack runs.";
  const now = new Date(Date.now() - 3600000); // 1 hour ago

  const demoEvidence = [
    {
      evidenceId: 'EVD-DEMO-01',
      caseId: demoCaseId,
      claimId: 'CLM-01',
      sourceTitle: 'Event Loop - MDN Web Docs',
      sourceURL: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop',
      sourceDomain: 'developer.mozilla.org',
      excerpt: 'Zero delay does not mean the callback will be executed immediately. The execution depends on the number of waiting tasks in the queue. In the examples below, setTimeout with 0ms delay executes only after all synchronous code in the call stack has emptied.',
      publishedAt: '2024-03-01',
      retrievedAt: now,
      evidenceDirection: 'contradicts',
      sourceType: 'official_doc',
      retrievalStatus: 'verified'
    },
    {
      evidenceId: 'EVD-DEMO-02',
      caseId: demoCaseId,
      claimId: 'CLM-01',
      sourceTitle: 'HTML Living Standard: Timers & Event Loop Speciﬁcation',
      sourceURL: 'https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html',
      sourceDomain: 'html.spec.whatwg.org',
      excerpt: 'The setTimeout method queues a task to run the timer callbacks after the specified delay. If the nesting level is greater than 5 and timeout is less than 4, timeout is clamped to 4ms. The task queue cannot preempt running execution contexts on the JavaScript call stack.',
      publishedAt: '2024-01-15',
      retrievedAt: now,
      evidenceDirection: 'contradicts',
      sourceType: 'code_spec',
      retrievalStatus: 'verified'
    }
  ];

  await EvidenceRepository.insertMany(demoEvidence);

  const demoCase = {
    caseId: demoCaseId,
    title: 'setTimeout(fn, 0) Execution Timing in JavaScript Call Stack',
    originalClaim: claim,
    category: 'programming',
    context: 'Common developer interview question regarding the browser event loop, call stack, and task queues.',
    sourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop',
    status: 'completed',
    currentStage: 'completed',
    createdAt: now,
    updatedAt: new Date(Date.now() - 3500000),
    completedAt: new Date(Date.now() - 3500000),
    evidenceReferences: ['EVD-DEMO-01', 'EVD-DEMO-02'],
    agentResults: {
      ghost: {
        agentName: 'Ghost Agent',
        originalClaim: claim,
        adversarialArgument: 'Adversarial Thesis: Modern V8 optimization treats 0ms timeouts as an immediate zero-cycle push directly onto the call stack before standard deferred microtasks, meaning synchronous loops are preempted if the timer fires in 0 ticks.',
        targetedStatements: [
          'Claiming setTimeout(fn, 0) preempts current synchronous frames on the call stack',
          'Conflating timer queueing with synchronous execution'
        ],
        potentialErrorType: 'Fundamental inversion of event loop run-to-completion semantics',
        investigationStatus: 'adversarial_argument_generated',
        limitations: 'Deliberately fabricated argument simulating developer misconceptions regarding timer priorities.'
      },
      prosecutor: {
        agentName: 'Prosecutor Agent',
        verificationStatus: 'objections_filed',
        objections: [
          {
            statement: 'setTimeout(fn, 0) preempts synchronous frames on the call stack',
            objection: 'Violates the foundational JavaScript run-to-completion invariant.',
            reasoning: 'JavaScript is single-threaded; execution on the stack never yields until the current stack frame completely unwinds.',
            requiredEvidence: 'MDN Event Loop documentation and WHATWG HTML Timer Specification.',
            severity: 'HIGH'
          }
        ]
      },
      defense: {
        agentName: 'Defense Agent',
        counterarguments: [
          {
            objectionTarget: 'Execution timing relative to other asynchronous tasks',
            defenseArgument: 'From the perspective of asynchronous scheduling, a 0ms timer executes in the earliest possible macrotask cycle, which intuitive explanations colloquially characterize as "as soon as possible".',
            conditionsWhereTrue: 'True only in comparison to timers with non-zero delays (>0ms).'
          }
        ],
        objectionsAccepted: ['Conceded that synchronous code currently executing always finishes before any queued timer task runs.'],
        objectionsChallenged: ['Overly rigid interpretation of casual terminology ("immediately").'],
        alternativeInterpretations: ['The author likely meant "before subsequent scheduled macrotasks", not synchronous preemption.'],
        remainingUncertainties: ['Browser 4ms clamping threshold after multiple nested calls.']
      },
      evidence: {
        agentName: 'Evidence Agent',
        retrievedCount: 2,
        verifiedCount: 2,
        summary: 'Retrieved 2 authoritative specifications (MDN and WHATWG) establishing strict macrotask queue behavior.',
        completedAt: now
      },
      factChecker: {
        agentName: 'Fact-Checker Agent',
        claimAssessments: [
          {
            claim: claim,
            supported: false,
            supportingEvidenceIds: [],
            contradictingEvidenceIds: ['EVD-DEMO-01', 'EVD-DEMO-02'],
            assessment: 'Decisively refuted. MDN and WHATWG confirm timer callbacks are queued as macrotasks and can NEVER preempt synchronous code on the active call stack.'
          }
        ],
        citationProblems: [],
        verificationLimitations: 'Specifications are unambiguous and authoritative across all compliant ECMAScript and HTML environments.',
        recommendedConclusion: 'The claim is demonstrably FALSE due to event loop task queuing mechanics.'
      },
      judge: {
        agentName: 'Judge Agent',
        verdict: 'FALSE',
        summary: 'The court finds the claim FALSE. setTimeout(fn, 0) does not execute immediately and cannot preempt code in the active call stack.',
        reasoning: 'Primary specifications from WHATWG and MDN decisively prove that setTimeout schedules a task on the macrotask queue. By architectural definition, queued tasks are only processed after the call stack has completely cleared and microtasks have executed.',
        supportingFindings: [],
        contradictingFindings: [
          'WHATWG Living Standard confirms timer tasks cannot preempt running execution contexts.',
          'MDN Event Loop documentation explicitly refutes immediate synchronous execution.'
        ],
        citedEvidenceIds: ['EVD-DEMO-01', 'EVD-DEMO-02'],
        unresolvedQuestions: [],
        confidenceAssessment: 'Highest certainty (Definitively refuted by normative standards)',
        confidenceLimitations: 'None. Normative specifications govern all major JavaScript runtimes.'
      }
    },
    verdict: {
      verdict: 'FALSE',
      summary: 'The court finds the claim FALSE. setTimeout(fn, 0) does not execute immediately and cannot preempt code in the active call stack.',
      reasoning: 'Primary specifications from WHATWG and MDN decisively prove that setTimeout schedules a task on the macrotask queue. By architectural definition, queued tasks are only processed after the call stack has completely cleared and microtasks have executed.',
      supportingFindings: [],
      contradictingFindings: [
        'WHATWG Living Standard confirms timer tasks cannot preempt running execution contexts.',
        'MDN Event Loop documentation explicitly refutes immediate synchronous execution.'
      ],
      citedEvidenceIds: ['EVD-DEMO-01', 'EVD-DEMO-02'],
      unresolvedQuestions: [],
      confidenceAssessment: 'Highest certainty (Definitively refuted by normative standards)',
      confidenceLimitations: 'None. Normative specifications govern all major JavaScript runtimes.'
    },
    investigationEvents: [
      {
        eventId: 'EVT-DEMO-01',
        stage: 'created',
        agentName: 'Courtroom Clerk',
        eventType: 'CASE_EMPANELLED',
        content: `Case CASE-DEMO-01 empanelled: "${claim}". Initiating multi-agent adversarial inquiry.`,
        timestamp: now
      },
      {
        eventId: 'EVT-DEMO-02',
        stage: 'ghost_analysis',
        agentName: 'Ghost Agent',
        eventType: 'ADVERSARIAL_ARGUMENT_FILED',
        content: 'Adversarial Thesis: Modern V8 optimization treats 0ms timeouts as an immediate zero-cycle push directly onto the call stack before standard deferred microtasks, meaning synchronous loops are preempted if the timer fires in 0 ticks.',
        timestamp: new Date(now.getTime() + 5000)
      },
      {
        eventId: 'EVT-DEMO-03',
        stage: 'evidence_retrieval',
        agentName: 'Evidence Agent',
        eventType: 'EVIDENCE_RETRIEVED',
        content: 'Retrieved 2 authoritative primary sources: WHATWG HTML Timer Specification and MDN Event Loop Documentation.',
        timestamp: new Date(now.getTime() + 10000)
      },
      {
        eventId: 'EVT-DEMO-04',
        stage: 'prosecution',
        agentName: 'Prosecutor Agent',
        eventType: 'OBJECTIONS_ENTERED',
        content: 'Prosecutor filed formal objection: Inversion of run-to-completion semantics. Synchronous call stack code cannot be preempted.',
        timestamp: new Date(now.getTime() + 15000)
      },
      {
        eventId: 'EVT-DEMO-05',
        stage: 'defense',
        agentName: 'Defense Agent',
        eventType: 'DEFENSE_ARGUMENTS_FILED',
        content: 'Defense conceded synchronous priority, but argued casual explanations use "immediately" to contrast with delayed timers.',
        timestamp: new Date(now.getTime() + 20000)
      },
      {
        eventId: 'EVT-DEMO-06',
        stage: 'fact_checking',
        agentName: 'Fact-Checker Agent',
        eventType: 'FACT_CHECK_REPORT_FILED',
        content: 'Independent audit confirms complete contradiction between claim and WHATWG spec. Zero delay schedules a macrotask, never synchronous execution.',
        timestamp: new Date(now.getTime() + 25000)
      },
      {
        eventId: 'EVT-DEMO-07',
        stage: 'judgment',
        agentName: 'Judge Agent',
        eventType: 'VERDICT_RENDERED',
        content: 'VERDICT: FALSE — Primary normative specifications decisively refute synchronous preemption by setTimeout(fn, 0).',
        timestamp: new Date(now.getTime() + 30000)
      }
    ]
  };

  await CaseRepository.create(demoCase);
  console.log('[Seed] Empanelled demo case CASE-DEMO-01.');
}
