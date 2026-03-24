import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'AgentPilot <hello@aiagentpilot.org>'

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: 'Welcome to AgentPilot',
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#0D1117;color:#F8FAFC">
          <h1 style="font-size:24px;font-weight:700;margin:0 0 8px">Welcome to AgentPilot</h1>
          <p style="color:#94A3B8;margin:0 0 24px">Hi${name ? ' ' + name : ''}, your account is ready.</p>
          <p style="color:#CBD5E1;line-height:1.6">
            You can now create AI agents, manage leads, and automate your follow-ups from one place.
          </p>
          <a href="https://aiagentpilot.org/dashboard" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#6366F1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
            Go to Dashboard
          </a>
          <p style="margin-top:32px;font-size:12px;color:#475569">
            Questions? Reply to this email and we read every one.
          </p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[Email] Welcome email failed:', err)
  }
}

export async function sendSubscriptionConfirmationEmail(to: string, plan: string) {
  const planLabel = plan === 'pro' ? 'Pro ($79/mo)' : 'Basic ($29/mo)'
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: 'Your AgentPilot subscription is active',
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#0D1117;color:#F8FAFC">
          <h1 style="font-size:24px;font-weight:700;margin:0 0 8px">You are all set</h1>
          <p style="color:#94A3B8;margin:0 0 24px">Your <strong style="color:#F8FAFC">${planLabel}</strong> plan is now active.</p>
          <p style="color:#CBD5E1;line-height:1.6">
            Your 14-day trial has started. You will not be charged until the trial ends.
          </p>
          <a href="https://aiagentpilot.org/dashboard" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#6366F1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
            Go to Dashboard
          </a>
          <p style="margin-top:32px;font-size:12px;color:#475569">
            Manage your subscription anytime from Settings.
          </p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[Email] Subscription confirmation failed:', err)
  }
}
