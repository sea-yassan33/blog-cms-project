"use client";

import { useEffect, useState } from "react";

type LivePreviewMessage<T> = {
  data: T;
  fieldSchemaJSON?: string;
};

export function useLivePreview<T>(props: {
  initialData: T;
  serverURL: string;
  depth?: number;
}): { data: T; isLoading: boolean } {
  const { initialData, serverURL } = props;
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<LivePreviewMessage<T>>) => {
      if (event.origin !== serverURL) return;

      if (event.data && typeof event.data === "object" && "data" in event.data) {
        setData(event.data.data);
        setIsLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);

    // Payload Admin に準備完了を通知
    window.parent?.postMessage(
      { type: "PAYLOAD_LIVE_PREVIEW_READY" },
      serverURL
    );

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [serverURL]);

  return { data, isLoading };
}