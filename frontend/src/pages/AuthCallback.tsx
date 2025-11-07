import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    
    console.log("[AUTH_CALLBACK] AuthCallback component mounted");
    console.log("[AUTH_CALLBACK] Received session_id from backend:", sessionId);

    if (sessionId) {
      // Store the session_id securely in localStorage
      localStorage.setItem("session_id", sessionId);
      console.log("[AUTH_CALLBACK] Session ID stored in localStorage");

      toast({
        title: "Login successful",
        description: "You've been successfully authenticated with Spotify",
      });

      console.log("[AUTH_CALLBACK] Redirecting to main page (/)");
      // Redirect to the main page
      navigate("/", { replace: true });
    } else {
      // Handle error case
      console.error("[AUTH_CALLBACK] No session_id received from backend");
      toast({
        title: "Authentication failed",
        description: "No session ID received from Spotify",
        variant: "destructive",
      });

      // Redirect to main page after a short delay
      console.log("[AUTH_CALLBACK] Redirecting to main page after 2 second delay");
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
    }
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;