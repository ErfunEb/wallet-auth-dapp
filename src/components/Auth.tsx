import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAccount, useSignMessage } from "wagmi";

const Auth = () => {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [authenticated, setAuthenticated] = useState<boolean>();
  const [loading, setLoading] = useState<boolean>();

  const fetchMe = async () => {
    setLoading(true);

    try {
      let result = await fetch("/api/me");

      if (result.status === 401) {
        const refreshResult = await fetch("/api/refresh", { method: "POST" });
        if (refreshResult.ok) {
          result = await fetch("/api/me");
        }
      }

      if (result.ok) {
        const user = await result.json();
        setAuthenticated(!!user?.address);
      } else {
        setAuthenticated(false);
      }
    } catch (err) {
      toast.error("An unknown error occurred!");
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const authenticate = async () => {
    setLoading(true);
    try {
      const nonceResponse = await fetch("/api/nonce", {
        method: "POST",
        body: JSON.stringify({ address }),
        headers: { "Content-Type": "application/json" },
      });

      const { nonce } = await nonceResponse.json();
      const signature = await signMessageAsync({
        message: nonce,
      });

      const verifyResponse = await fetch("/api/verify", {
        method: "POST",
        body: JSON.stringify({ address, signature }),
        headers: { "Content-Type": "application/json" },
      });

      const responseData = await verifyResponse.json();

      if (verifyResponse?.ok && responseData?.success) {
        await fetchMe();
      } else {
        toast.error(responseData.message);
      }
    } catch (error) {
      console.log({ error });
      toast.error(error.shortMessage);
    }

    setLoading(false);
  };

  const disconnect = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });
      const result = await response.json();
      if (response.ok && result.success === true) {
        setAuthenticated(false);
      } else {
        toast.error(result.message);
      }
    } catch (_) {
      toast.error("An unknown error occured!");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (isConnected) {
      fetchMe();
    }
  }, [isConnected]);

  return (
    <div className="authentication-section">
      {loading && <div className="loading" />}
      {isConnected && !loading ? (
        <>
          {authenticated ? (
            <>
              <p className="title">You are Authenticated!</p>
              <button
                type="button"
                className="btn-disconnect"
                onClick={disconnect}
              >
                Disconnect
              </button>
            </>
          ) : (
            <>
              <p className="title">You are not Authenticated!</p>
              <button
                type="button"
                className="btn-authenticate"
                onClick={authenticate}
              >
                Authenticate
              </button>
            </>
          )}
        </>
      ) : null}
    </div>
  );
};

export default Auth;
