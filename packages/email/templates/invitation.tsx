/** @jsxImportSource react */
import { Button, Container, Heading, Preview, Section, Text } from "react-email";
import { BaseTemplate } from "../components/base-template";

interface InvitationProps {
  inviterName: string;
  organizationName: string;
  role: string;
  acceptUrl: string;
}

export const Invitation = ({ inviterName, organizationName, role, acceptUrl }: InvitationProps) => {
  const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <BaseTemplate>
      <Preview>You&apos;ve been invited to join {organizationName}</Preview>
      <Container className="mx-auto my-0 px-5 py-0">
        <Heading className="mx-0 my-[30px] p-0 text-4xl leading-[42px] font-bold text-[#1d1c1d]">
          You&apos;ve been invited to join {organizationName}
        </Heading>
        <Text className="mb-7.5 text-xl">
          {inviterName} has invited you to join {organizationName} as a <strong>{formattedRole}</strong>.
        </Text>

        <Section className="mb-2 text-center">
          <Button
            className="rounded bg-amber-600 px-[16px] py-[12px] text-center text-[16px] font-semibold text-white no-underline"
            href={acceptUrl}
          >
            Accept Invitation
          </Button>
        </Section>

        <Text className="text-center text-sm text-[#1d1c1d]">*This invitation expires in 2 days.</Text>
      </Container>
    </BaseTemplate>
  );
};

Invitation.PreviewProps = {
  inviterName: "John Doe",
  organizationName: "Acme Corp",
  role: "member",
  acceptUrl: "https://example.com/join?token=example-token",
} as InvitationProps;

export default Invitation;
