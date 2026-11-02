import "./globals.css";

export const metadata = {
  title: "10KDAY — Hit your 10,000 steps, every day",
  description:
    "10KDAY tracks your daily steps and nudges you throughout the day so you hit your 10K goal.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
