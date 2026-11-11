import { useEffect, useRef, useState } from "react";
import dropin from "braintree-web-drop-in";

export default function BraintreeDropIn({ clientToken, onInstance }) {
  const containerRef = useRef(null);
  const [initError, setInitError] = useState("");
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (!clientToken || !containerRef.current) return;
    let instanceRef = null;
    let cancelled = false;

    setInitializing(true);
    setInitError("");

    dropin.create(
      {
        authorization: clientToken,
        container: containerRef.current,
      },
      (err, instance) => {
        if (cancelled) {
          instance?.teardown().catch(() => {});
          return;
        }
        setInitializing(false);
        if (err) {
          setInitError(err.message || "Failed to initialize payment gateway");
          onInstance(null);
          return;
        }
        instanceRef = instance;
        onInstance(instance);
      }
    );

    return () => {
      cancelled = true;
      onInstance(null);
      if (instanceRef) {
        instanceRef.teardown().catch(() => {});
      }
    };
  }, [clientToken, onInstance]);

  return (
    <div className="braintree-glass-wrap">
      {initializing && (
        <div style={{ padding: "12px 0", fontSize: "0.9rem", color: "#475569" }}>
          Loading secure Braintree Drop-In...
        </div>
      )}
      {initError && (
        <div style={{ padding: "10px 0", fontSize: "0.88rem", color: "#be123c" }}>
          {initError}
        </div>
      )}
      <div ref={containerRef} />
    </div>
  );
}
