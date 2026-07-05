import { useEffect, useRef, useState } from "react";
import {
  Download,
  RefreshCw,
  WifiOff,
  X
} from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";

export default function PwaBanner() {
  const deferredPrompt = useRef(null);
  const isBrowser = typeof window !== "undefined";

  const [canInstall, setCanInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
  });

  const isStandalone = isBrowser
    ? window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    : false;

  useEffect(() => {
    const beforeInstall = (e) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setCanInstall(true);
    };

    const installed = () => {
      deferredPrompt.current = null;
      setCanInstall(false);

      localStorage.setItem("klaso-installed", "true");
    };

    window.addEventListener(
      "beforeinstallprompt",
      beforeInstall
    );

    window.addEventListener(
      "appinstalled",
      installed
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        beforeInstall
      );

      window.removeEventListener(
        "appinstalled",
        installed
      );
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt.current) return;

    deferredPrompt.current.prompt();

    const { outcome } =
      await deferredPrompt.current.userChoice;

    if (outcome === "accepted") {
      deferredPrompt.current = null;
      setCanInstall(false);
    }
  };

  const refresh = async () => {
    await updateServiceWorker(true);
  };

  if (
    dismissed ||
    isStandalone ||
    (isBrowser && localStorage.getItem("klaso-installed") === "true")
  ) {
    return null;
  }

  if (!canInstall && !needRefresh && !offlineReady) {
    return null;
  }

  const title = needRefresh
    ? "Update Available"
    : offlineReady
      ? "Offline Ready"
      : "Install Klaso";

  const description = needRefresh
    ? "A new version of Klaso is ready."
    : offlineReady
      ? "Klaso can now work without internet."
      : "Install Klaso for faster loading, offline access and a native app experience.";

  const buttonText = needRefresh
    ? "Update"
    : offlineReady
      ? "Awesome!"
      : "Install";

  const buttonAction = needRefresh
    ? refresh
    : offlineReady
      ? () => setOfflineReady(false)
      : install;

  const icon = needRefresh ? (
    <RefreshCw size={18} />
  ) : offlineReady ? (
    <WifiOff size={18} />
  ) : (
    <Download size={18} />
  );

  const buttonColor = needRefresh
    ? "bg-black hover:bg-gray-800"
    : offlineReady
      ? "bg-green-600 hover:bg-green-700"
      : "bg-sky-600 hover:bg-sky-700";

  return (
    <div className="fixed bottom-5 right-5 left-5 md:left-auto md:w-[420px] bg-white rounded-3xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in slide-in-from-bottom-5 duration-500">

      <div className="flex items-start p-5">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
            {icon}
          </div>

        <div className="flex-1 ml-4">

          <div className="flex justify-between">

            <div>

              <h3 className="font-bold text-gray-900">
                {title}
              </h3>

              <p className="mt-1 text-sm text-gray-600 leading-6">
                {description}
              </p>

            </div>

            <button
              onClick={() => {
                setDismissed(true);
                setNeedRefresh(false);
                setOfflineReady(false);
              }}
            >
              <X size={18} />
            </button>

          </div>

          <div className="flex gap-3 mt-5">

            <button
              onClick={buttonAction}
              className={`${buttonColor} transition text-white px-5 py-2.5 rounded-full font-semibold`}
            >
              {buttonText}
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="border border-gray-300 rounded-full px-5 py-2.5 font-medium hover:bg-gray-50"
            >
              Later
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
