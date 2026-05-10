import { useEffect, useState } from "react";
import { loadCredentials, clearCredentials } from "./api/kandji";
import { CredentialSetupDialog } from "./components/CredentialSetupDialog";
import AdeTokensPage from "./pages/AdeTokensPage";
import { Settings, LogOut } from "lucide-react";
import { Button } from "./components/ui/button";

type AppState = "loading" | "setup" | "ready";

export default function App() {
  const [appState, setAppState] = useState<AppState>("loading");
  const [subdomain, setSubdomain] = useState<string>("");
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  useEffect(() => {
    loadCredentials()
      .then((creds) => {
        if (creds) {
          setSubdomain(creds.subdomain);
          setAppState("ready");
        } else {
          setAppState("setup");
        }
      })
      .catch(() => setAppState("setup"));
  }, []);

  const handleCredentialsComplete = (sub: string) => {
    setSubdomain(sub);
    setAppState("ready");
  };

  const handleSignOut = async () => {
    await clearCredentials();
    setSubdomain("");
    setAppState("setup");
    setShowSettingsMenu(false);
  };

  if (appState === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (appState === "setup") {
    return <CredentialSetupDialog onComplete={handleCredentialsComplete} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">ADE</span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 text-sm leading-none">
              Iru ADE Manager
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">{subdomain}.kandji.io</p>
          </div>
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettingsMenu((v) => !v)}
            className="text-gray-500"
          >
            <Settings className="w-4 h-4" />
          </Button>

          {showSettingsMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSettingsMenu(false)}
              />
              <div className="absolute right-0 top-10 z-20 bg-white rounded-xl shadow-lg border border-gray-200 py-1 min-w-[160px]">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Change Credentials
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <AdeTokensPage />
        </div>
      </main>
    </div>
  );
}
