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

export const EmailVerification = ({
  verificationUrl,
}: EmailVerificationProps) => (
  <Html>
    <Head />
    <Tailwind
      config={{
        presets: [pixelBasedPreset],
        theme: {
          fontFamily: {
            sans:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
          }
        }
      }}
    >
      <Body className="bg-white font-sans mx-auto my-0">
        <Preview>Confirm your email address</Preview>
        <Container className="mx-auto my-0 py-0 px-5">
          <Section className="mt-8">
            <Img
              src="https://react-email-demo-8tpggc8r2-resend.vercel.app/static/slack-logo.png"
              width="120"
              height="36"
              alt="Slack"
            />
          </Section>
          <Heading className="text-[#1d1c1d] text-4xl font-bold my-[30px] mx-0 p-0 leading-[42px]">
            Verify your email address
          </Heading>
          <Text className="text-xl mb-7.5">
            Thanks for signing up! Please click the button below to verify your
            email address and complete your account setup.
          </Text>

          <Section className="mt-[32px] mb-[32px] text-center">
            <Button
              className="rounded bg-amber-600 px-[16px] py-[12px] text-center font-semibold text-[16px] text-white no-underline"
              href={verificationUrl}
            >
              Verify Email Address
            </Button>
          </Section>

          <Text className="text-[14px] text-black leading-[24px]">
            or copy and paste this URL into your browser:{' '}
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
  verificationUrl: 'https://example.com/verify',
} as EmailVerificationProps;

export default EmailVerification;
