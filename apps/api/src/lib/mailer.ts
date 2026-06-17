import { render, toPlainText } from "react-email";
import { Resend } from "resend";
import * as v from "valibot";
import type { Env } from "@/env";

import EmailVerification from "@/emails/email-verification";
import ResetPassword from "@/emails/reset-password";
import Invitation from "@/emails/invitation";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  from?: string;
}

function createResendClient(apiKey: string): Resend {
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is required");
  }
  return new Resend(apiKey);
}

/**
 * Send an email using the Resend client.
 *
 * @param env Environment variables containing Resend configuration
 * @param options Email configuration
 */
export async function sendEmail(env: Pick<Env, "RESEND_API_KEY" | "RESEND_EMAIL_FROM">, options: EmailOptions) {
  const resend = createResendClient(env.RESEND_API_KEY);

  if (!env.RESEND_EMAIL_FROM) {
    throw new Error("RESEND_EMAIL_FROM environment variable is required");
  }

  // Validate all recipients before sending
  const recipients = Array.isArray(options.to) ? options.to : [options.to];
  for (const email of recipients) {
    const result = v.safeParse(v.pipe(v.string(), v.email()), email);
    if (!result.success) {
      throw new Error(`Invalid email address: ${email}`);
    }
  }

  if (!options.text && !options.html) {
    throw new Error("Either text or html content is required");
  }

  if (options.html && !options.text) {
    throw new Error("Plain text version required when sending HTML email.");
  }

  try {
    const result = await resend.emails.send({
      from: options.from ?? env.RESEND_EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (result.error) {
      throw new Error(`Resend API error: ${result.error.message || "Unknown error"}`);
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Send email verification message.
 *
 * @param env Environment variables
 * @param options User and verification URL (should be time-limited, signed token)
 */
export async function sendVerificationEmail(
  env: Pick<Env, "RESEND_API_KEY" | "RESEND_EMAIL_FROM">,
  options: {
    user: { email: string; name?: string };
    url: string;
  },
) {
  const component = EmailVerification({
    verificationUrl: options.url,
  });

  const html = await render(component);
  const text = toPlainText(html);

  return sendEmail(env, {
    to: options.user.email,
    subject: "Verify your email address",
    html,
    text,
  });
}

/**
 * Send password reset email.
 *
 * @param env Environment variables
 * @param options User and reset URL (time-limited, 1 hour)
 */
export async function sendResetPasswordEmail(
  env: Pick<Env, "RESEND_API_KEY" | "RESEND_EMAIL_FROM">,
  options: {
    user: { email: string; name?: string };
    url: string;
  },
) {
  const component = ResetPassword({
    resetUrl: options.url,
  });

  const html = await render(component);
  const text = toPlainText(html);

  return sendEmail(env, {
    to: options.user.email,
    subject: "Reset your password",
    html,
    text,
  });
}

/**
 * Send organization invitation email.
 *
 * @param env Environment variables
 * @param options Invitation payload from Better Auth sendInvitationEmail hook
 */
export async function sendInvitationEmail(
  env: Pick<Env, "RESEND_API_KEY" | "RESEND_EMAIL_FROM" | "APP_ORIGIN">,
  options: {
    invitation: { id: string; email: string; role: string };
    inviter: { user: { name: string } };
    organization: { name: string };
  },
) {
  const acceptUrl = `${env.APP_ORIGIN}/organization-invitations?token=${options.invitation.id}`;

  const component = Invitation({
    inviterName: options.inviter.user.name,
    organizationName: options.organization.name,
    role: options.invitation.role,
    acceptUrl,
  });

  const html = await render(component);
  const text = toPlainText(html);

  return sendEmail(env, {
    to: options.invitation.email,
    subject: `You've been invited to join ${options.organization.name}`,
    html,
    text,
  });
}
