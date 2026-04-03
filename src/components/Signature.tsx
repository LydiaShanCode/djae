import { useState } from "react";
import { Twitter, Linkedin, Mail, Check } from "lucide-react";

const EMAIL = "Lydiashan.c@gmail.com";

export const Signature = () => {
  const [copied, setCopied] = useState(false);

  const handleEmailClick = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for browsers that block clipboard API
      const el = document.createElement("textarea");
      el.value = EMAIL;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2 text-[11px] text-muted-foreground/50 font-sans tracking-wide select-none">
      <span>Made by Lydia</span>

      <div className="flex items-center gap-0">
        <a
          href="https://x.com/lydia_shann"
          target="_blank"
          rel="noopener noreferrer"
          title="Twitter / X"
          className="p-1 inline-flex items-center justify-center hover:text-foreground/60 transition-colors"
          aria-label="Twitter"
        >
          <Twitter className="w-3 h-3" />
        </a>

        <a
          href="https://www.linkedin.com/in/lydiashan/"
          target="_blank"
          rel="noopener noreferrer"
          title="LinkedIn"
          className="p-1 inline-flex items-center justify-center hover:text-foreground/60 transition-colors"
          aria-label="LinkedIn"
        >
          <Linkedin className="w-3 h-3" />
        </a>

        <div className="relative inline-flex items-center justify-center">
          <button
            onClick={handleEmailClick}
            title={copied ? "Copied!" : `Copy ${EMAIL}`}
            className="p-1 inline-flex items-center justify-center hover:text-foreground/60 transition-colors cursor-pointer"
            aria-label="Copy email address"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Mail className="w-3 h-3" />
            )}
          </button>
          {copied && (
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-0.5 rounded whitespace-nowrap pointer-events-none">
              Copied!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
