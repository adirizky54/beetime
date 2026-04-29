/** @jsxImportSource react */
import { Button, Container, Heading, Img, Preview, Section, Text } from "react-email";
import { BaseTemplate } from "../components/base-template";

interface EmailVerificationProps {
  verificationUrl: string;
}

export const EmailVerification = ({ verificationUrl }: EmailVerificationProps) => (
  <BaseTemplate>
    <Preview>Confirm your email address</Preview>
    <Container className="mx-auto my-0 px-5 py-0">
      <Section className="mt-8">
        <Img
          src="https://react-email-demo-8tpggc8r2-resend.vercel.app/static/slack-logo.png"
          width="120"
          height="36"
          alt="Slack"
        />
      </Section>
      <Heading className="mx-0 my-[30px] p-0 text-4xl leading-[42px] font-bold text-[#1d1c1d]">
        Verify your email address
      </Heading>
      <Text className="mb-7.5 text-xl">
        Thanks for signing up! Please click the button below to verify your email address and complete your account
        setup.
      </Text>

      <Section className="mb-2 text-center">
        <Button
          className="rounded bg-amber-600 px-[16px] py-[12px] text-center text-[16px] font-semibold text-white no-underline"
          href={verificationUrl}
        >
          Verify Email Address
        </Button>
      </Section>

      <Text className="text-center text-sm text-[#1d1c1d]">*This verification email is valid for 24 hours only.</Text>
    </Container>
  </BaseTemplate>
);

EmailVerification.PreviewProps = {
  verificationUrl: "https://example.com/verify",
} as EmailVerificationProps;

export default EmailVerification;
