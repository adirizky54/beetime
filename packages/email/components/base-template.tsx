/** @jsxImportSource react */
import { Body, Head, Html, pixelBasedPreset, Tailwind } from "react-email";

export const BaseTemplate = ({ children }: { children: React.ReactNode }) => (
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
      <Body className="mx-auto my-0 bg-white font-sans">{children}</Body>
    </Tailwind>
  </Html>
);
