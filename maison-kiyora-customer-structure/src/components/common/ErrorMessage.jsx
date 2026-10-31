import { useId } from "react";
import {
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  X,
} from "lucide-react";

// MAISON KIYORA — Reusable error and validation feedback.
// Inline, banner, and compact variants. No external toast dependency.

const STYLES = `
  .mk-error-message {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    width: 100%;
    padding: 15px 17px;
    border: 1px solid rgba(160, 60, 60, .22);
    border-radius: 2px;
    background: #fff5f2;
    color: #8f3434;
    font-family: "Manrope", sans-serif;
    text-align: left;
  }

  .mk-error-message__icon {
    display: inline-flex;
    flex: 0 0 auto;
    margin-top: 1px;
    color: #a34747;
  }

  .mk-error-message__content {
    flex: 1;
    min-width: 0;
  }

  .mk-error-message__title {
    margin: 0 0 5px;
    color: #802d2d;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.5;
    letter-spacing: .01em;
  }

  .mk-error-message__description {
    margin: 0;
    font-size: 12px;
    line-height: 1.7;
    overflow-wrap: anywhere;
  }

  .mk-error-message__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-top: 12px;
  }

  .mk-error-message__retry {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 33px;
    padding: 7px 11px;
    border: 1px solid currentColor;
    border-radius: 2px;
    background: transparent;
    color: inherit;
    font: 700 10px/1.4 "Manrope", sans-serif;
    letter-spacing: .09em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 180ms ease;
  }

  .mk-error-message__retry:hover:not(:disabled) {
    background: rgba(160, 60, 60, .08);
  }

  .mk-error-message__retry:disabled {
    opacity: .55;
    cursor: not-allowed;
  }

  .mk-error-message__dismiss {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .mk-error-message__dismiss:hover {
    background: rgba(160, 60, 60, .08);
  }

  .mk-error-message__retry:focus-visible,
  .mk-error-message__dismiss:focus-visible {
    outline: 2px solid #b69a69;
    outline-offset: 3px;
  }

  .mk-error-message--warning {
    border-color: rgba(182, 154, 105, .4);
    background: #fcf8ed;
    color: #796036;
  }

  .mk-error-message--warning .mk-error-message__title,
  .mk-error-message--warning .mk-error-message__icon {
    color: #84683b;
  }

  .mk-error-message--warning .mk-error-message__retry:hover:not(:disabled),
  .mk-error-message--warning .mk-error-message__dismiss:hover {
    background: rgba(182, 154, 105, .12);
  }

  .mk-error-message--compact {
    gap: 8px;
    padding: 9px 11px;
  }

  .mk-error-message--compact .mk-error-message__title,
  .mk-error-message--compact .mk-error-message__description {
    font-size: 11px;
  }

  .mk-error-message--inline {
    gap: 7px;
    padding: 0;
    border: none;
    background: transparent;
  }

  .mk-error-message--inline .mk-error-message__title,
  .mk-error-message--inline .mk-error-message__description {
    font-size: 11px;
    line-height: 1.5;
  }

  .mk-error-message--inline .mk-error-message__actions {
    margin-top: 7px;
  }

  @media (prefers-reduced-motion: reduce) {
    .mk-error-message__retry {
      transition: none;
    }
  }
`;

function getErrorText(value) {
  if (typeof value === "string") return value.trim();
  if (value instanceof Error) return value.message?.trim() || "";
  if (value && typeof value === "object") {
    if (typeof value.message === "string") return value.message.trim();
    if (typeof value.error_description === "string") {
      return value.error_description.trim();
    }
  }
  return "";
}

/**
 * Reusable accessible error message.
 *
 * @param {object} props
 * @param {string|Error|object} [props.error]
 * @param {string} [props.message] Overrides the error object's message.
 * @param {string} [props.title]
 * @param {"error"|"warning"} [props.type]
 * @param {"default"|"banner"|"compact"|"inline"} [props.variant]
 * @param {()=>void} [props.onRetry]
 * @param {()=>void} [props.onDismiss]
 * @param {boolean} [props.retrying]
 * @param {boolean} [props.dismissible]
 * @param {boolean} [props.showIcon]
 * @param {string} [props.retryLabel]
 * @param {string} [props.className]
 * @param {string} [props.id]
 * @param {boolean} [props.announce] Announce dynamically added errors.
 */
export default function ErrorMessage({
  error,
  message,
  title,
  type = "error",
  variant = "default",
  onRetry,
  onDismiss,
  retrying = false,
  dismissible = false,
  showIcon = true,
  retryLabel = "Try Again",
  className = "",
  id,
  announce = true,
}) {
  const generatedId = useId();
  const text =
    typeof message === "string" ? message.trim() : getErrorText(error);

  // Empty errors do not render an empty alert.
  if (!text && !title) return null;

  const safeType = type === "warning" ? "warning" : "error";
  const safeVariant = ["default", "banner", "compact", "inline"].includes(variant)
    ? variant
    : "default";
  const messageId = id || generatedId;
  const Icon = safeType === "warning" ? AlertTriangle : AlertCircle;
  const canDismiss = typeof onDismiss === "function" && dismissible;

  return (
    <>
      <style>{STYLES}</style>
      <div
        id={messageId}
        className={[
          "mk-error-message",
          `mk-error-message--${safeType}`,
          `mk-error-message--${safeVariant}`,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        role={announce ? (safeType === "error" ? "alert" : "status") : undefined}
        aria-live={announce ? (safeType === "error" ? "assertive" : "polite") : undefined}
        aria-atomic={announce ? "true" : undefined}
      >
        {showIcon && (
          <span className="mk-error-message__icon" aria-hidden="true">
            <Icon size={safeVariant === "inline" ? 15 : 18} strokeWidth={1.6} />
          </span>
        )}

        <div className="mk-error-message__content">
          {title && <p className="mk-error-message__title">{title}</p>}
          {text && <p className="mk-error-message__description">{text}</p>}

          {typeof onRetry === "function" && (
            <div className="mk-error-message__actions">
              <button
                type="button"
                className="mk-error-message__retry"
                onClick={onRetry}
                disabled={retrying}
                aria-busy={retrying}
              >
                <RefreshCw size={13} strokeWidth={1.6} aria-hidden="true" />
                {retrying ? "Trying..." : retryLabel}
              </button>
            </div>
          )}
        </div>

        {canDismiss && (
          <button
            type="button"
            className="mk-error-message__dismiss"
            onClick={onDismiss}
            aria-label="Dismiss message"
          >
            <X size={16} strokeWidth={1.6} aria-hidden="true" />
          </button>
        )}
      </div>
    </>
  );
}

export { getErrorText };
