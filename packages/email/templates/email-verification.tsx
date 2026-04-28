/** @jsxImportSource react */
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  pixelBasedPreset,
  Preview,
  Section,
  Tailwind,
  Text,
} from "react-email";

interface EmailVerificationProps {
  verificationUrl: string;
}

export const EmailVerification = ({ verificationUrl }: EmailVerificationProps) => (
  <Html>
    <Head />
    <Tailwind
      config={{
        presets: [pixelBasedPreset],
        theme: {
          fontFamily: {
            sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
          },
        },
      }}
    >
      <Body className="mx-auto my-0 bg-white font-sans">
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

          <Section className="mt-[32px] mb-[32px] text-center">
            <Button
              className="rounded bg-amber-600 px-[16px] py-[12px] text-center text-[16px] font-semibold text-white no-underline"
              href={verificationUrl}
            >
              Verify Email Address
            </Button>
          </Section>

          <Text className="text-[14px] leading-[24px] text-black">
            or copy and paste this URL into your browser:{" "}
            <Link href={verificationUrl} className="text-blue-600 no-underline">
              {verificationUrl}
            </Link>
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

EmailVerification.PreviewProps = {
  verificationUrl: "https://example.com/verify",
} as EmailVerificationProps;

export default EmailVerification;
