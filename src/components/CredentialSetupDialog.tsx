import { useState } from "react";
import { checkConnection, saveCredentials } from "../api/kandji";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2, CheckCircle2, Key } from "lucide-react";

interface Props {
  onComplete: (subdomain: string, region: string) => void;
}

export function CredentialSetupDialog({ onComplete }: Props) {
  const [subdomain, setSubdomain] = useState("");
  const [token, setToken] = useState("");
  const [region, setRegion] = useState<"us" | "eu">("us");
  const [testing, setTesting] = useState(false);
  const [tested, setTested] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!subdomain.trim() || !token.trim()) return;
    setTesting(true);
    setError(null);
    setTested(false);
    try {
      const result = await checkConnection(subdomain.trim(), token.trim(), region);
      if (!result.ok) {
        setError(result.error ?? "Connection failed — check subdomain and token.");
        return;
      }
      // Save credentials on successful test
      await saveCredentials(subdomain.trim(), token.trim(), region);
      setTested(true);
      setTimeout(() => onComplete(subdomain.trim(), region), 800);
    } catch (e: unknown) {
      setError(typeof e === "string" ? e : (e as Error).message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center">
            <Key className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Iru ADE Manager</h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter your Iru credentials to get started. They&apos;ll be
              stored securely in your macOS Keychain.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Iru Subdomain</Label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <Input
                value={subdomain}
                onChange={(e) => {
                  setSubdomain(e.target.value);
                  setTested(false);
                }}
                placeholder="yourcompany"
                className="border-0 rounded-none focus:ring-0 flex-1"
              />
              <span className="px-3 py-2 bg-gray-50 border-l border-gray-200 text-xs text-gray-400 shrink-0">
                .api{region === "eu" ? ".eu" : ""}.kandji.io
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>API Bearer Token</Label>
            <Input
              type="password"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setTested(false);
              }}
              placeholder="••••••••••••••••"
              className="font-mono"
            />
            <p className="text-xs text-gray-400">
              Found in Iru → Settings → Access → API Token
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Region</Label>
            <div className="flex gap-3">
              {(["us", "eu"] as const).map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                    region === r
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    checked={region === r}
                    onChange={() => {
                      setRegion(r);
                      setTested(false);
                    }}
                  />
                  <span className="text-sm font-medium uppercase">{r}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {/* CTA */}
        <Button
          className="w-full"
          onClick={handleTest}
          disabled={!subdomain.trim() || !token.trim() || testing || tested}
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing connection…
            </>
          ) : tested ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
              Connected!
            </>
          ) : (
            "Test & Save Credentials"
          )}
        </Button>
      </div>
    </div>
  );
}
