interface BackgroundLayerProps {
  url: string;
  enabled: boolean;
}

export function BackgroundLayer({ url, enabled }: BackgroundLayerProps) {
  if (!enabled || !url) return null;

  return (
    <div
      className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${url})` }}
    />
  );
}
