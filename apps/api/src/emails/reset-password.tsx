/** @jsxImportSource react */
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  pixelBasedPreset,
  Preview,
  Section,
  Tailwind,
  Text,
} from "react-email";

interface ResetPasswordProps {
  resetUrl: string;
}

export const ResetPassword = ({ resetUrl }: ResetPasswordProps) => (
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
        <Preview>Reset your password</Preview>
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
            Reset your password
          </Heading>
          <Text className="mb-7.5 text-xl">
            We received a request to reset the password for your account. Click the button below to choose a new
            password.
          </Text>

          <Section className="mb-2 text-center">
            <Button
              className="rounded bg-amber-600 px-[16px] py-[12px] text-center text-[16px] font-semibold text-white no-underline"
              href={resetUrl}
            >
              Reset Password
            </Button>
          </Section>

          <Text className="text-center text-sm text-[#1d1c1d]">*This link is valid for 1 hour only.</Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

ResetPassword.PreviewProps = {
  resetUrl: "https://example.com/reset-password?token=example-token",
} as ResetPasswordProps;

export default ResetPassword;
