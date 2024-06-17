import { Navbar, Title } from "@/app/ui";

export default async function Layout({
  children,
  saveBlockModal,
}: Readonly<{
  children: React.ReactNode;
  saveBlockModal: React.ReactNode;
}>) {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main className="flex flex-1 flex-col items-center justify-start gap-4 px-2">
        <Title />
        {children}
        {saveBlockModal}
      </main>
    </>
  );
}
