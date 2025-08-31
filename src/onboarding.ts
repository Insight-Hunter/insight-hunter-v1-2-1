import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';

type Env = {
  ONBOARDING_WORKFLOW: Workflow;
  // ...your other bindings (KV/D1/Queues/AI, etc.)
};

type Params = { userId: string; email: string; plan?: string };

export class OnboardingWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const { userId, email, plan } = event.payload;

    const tenant = await step.do('create-tenant', async () => {
      // create workspace/tenant in Supabase or D1, return identifiers
      return { workspaceId: `ws_${userId}` };
    });

    await step.do('seed-defaults', { retries: { limit: 8, delay: '10 seconds', backoff: 'exponential' } }, async () => {
      // put default settings in KV/R2, attach plan, create demo rows, etc.
    });

    await step.do('send-verification-email', async () => {
      // call your email API
    });

    // Wait (up to 24h) for a verification event sent from your webhook
    await step.waitForEvent('await-email-verify', { type: 'email-verified', timeout: '24 hours' });

    await step.do('generate-first-report', async () => {
      // generate initial dashboard/report artifacts
    });

    // Nudge in 24 hours if they haven’t finished checklist
    await step.sleep('follow-up-delay', '24 hours');
    await step.do('send-follow-up', async () => {
      // email or in-app notification
    });

    return { workspaceId: tenant.workspaceId };
  }
}
