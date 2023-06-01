import { ChatCtxProvider } from '@/context/ChatCtx';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <ChatCtxProvider>
        <body>{children}</body>
      </ChatCtxProvider>
    </html>
  );
}
