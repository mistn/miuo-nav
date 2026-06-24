import {
  Code2,
  Globe,
  Server,
  HardDrive,
  ShieldCheck,
  Box,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FlowLink {
  label: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const LINKS: FlowLink[] = [
  { label: "GitHub", icon: <Code2 className="size-5" />, href: "https://github.com", color: "hover:bg-gray-100" },
  { label: "Vercel", icon: <Globe className="size-5" />, href: "https://vercel.com", color: "hover:bg-gray-100" },
  { label: "1Panel", icon: <Server className="size-5" />, href: "http://localhost:8080", color: "hover:bg-gray-100" },
  { label: "Alist", icon: <HardDrive className="size-5" />, href: "http://localhost:5244", color: "hover:bg-gray-100" },
  { label: "Vault", icon: <ShieldCheck className="size-5" />, href: "http://localhost:8080", color: "hover:bg-gray-100" },
  { label: "Docker", icon: <Box className="size-5" />, href: "http://localhost:9000", color: "hover:bg-gray-100" },
];

export function DailyFlowCard() {
  return (
    <Card className="rounded-2xl border-gray-100/50 bg-white/80 backdrop-blur-md shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">Daily Flow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center gap-2 rounded-2xl p-4 transition-all duration-300 hover:scale-105 ${link.color}`}
            >
              <div className="text-gray-600">{link.icon}</div>
              <span className="text-xs text-gray-500">{link.label}</span>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
