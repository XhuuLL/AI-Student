import ChatClient from "./ChatClient";

export default function ChatPage({
  searchParams,
}: {
  searchParams?: { materialId?: string | string[] };
}) {
  const raw = searchParams?.materialId;
  const materialId = Array.isArray(raw) ? raw[0] : raw ?? "";
  return <ChatClient materialId={materialId} />;
}

