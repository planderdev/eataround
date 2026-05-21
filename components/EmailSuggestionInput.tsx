"use client";

import { useId, useMemo, useState, type ChangeEvent, type FocusEvent, type InputEvent, type InputHTMLAttributes, type KeyboardEvent } from "react";

const DEFAULT_EMAIL_DOMAINS = ["gmail.com", "naver.com", "kakao.com", "daum.net", "hanmail.net", "nate.com", "outlook.com"];

type EmailSuggestionInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  domains?: string[];
};

export function EmailSuggestionInput({
  domains = DEFAULT_EMAIL_DOMAINS,
  defaultValue,
  id,
  onBlur,
  onChange,
  onFocus,
  onInput,
  ...props
}: EmailSuggestionInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listboxId = `${inputId}-suggestions`;
  const [value, setValue] = useState(String(defaultValue ?? ""));
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const suggestions = useMemo(() => {
    const atIndex = value.lastIndexOf("@");
    const hasSingleAt = atIndex > 0 && value.indexOf("@") === atIndex;

    if (!hasSingleAt) return [];

    const localPart = value.slice(0, atIndex).trim();
    const domainPart = value.slice(atIndex + 1).toLowerCase();
    if (!localPart || domainPart.includes(" ")) return [];

    return domains
      .filter((domain) => domain.startsWith(domainPart) && domain !== domainPart)
      .slice(0, 5)
      .map((domain) => `${localPart}@${domain}`);
  }, [domains, value]);

  const showSuggestions = focused && suggestions.length > 0;
  const activeSuggestion = suggestions[Math.min(activeIndex, suggestions.length - 1)];

  function updateValue(nextValue: string, event?: ChangeEvent<HTMLInputElement>) {
    setValue(nextValue);
    setActiveIndex(0);
    onChange?.(event as ChangeEvent<HTMLInputElement>);
  }

  function selectSuggestion(nextValue: string) {
    setValue(nextValue);
    setActiveIndex(0);
    setFocused(false);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    updateValue(event.target.value, event);
  }

  function handleInput(event: InputEvent<HTMLInputElement>) {
    setValue(event.currentTarget.value);
    setActiveIndex(0);
    onInput?.(event);
  }

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    setFocused(true);
    onFocus?.(event);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    setFocused(false);
    onBlur?.(event);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + suggestions.length) % suggestions.length);
    }

    if (event.key === "Enter" && activeSuggestion) {
      event.preventDefault();
      selectSuggestion(activeSuggestion);
    }

    if (event.key === "Escape") {
      setFocused(false);
    }
  }

  return (
    <span className="email-suggestion-field">
      <input
        {...props}
        aria-autocomplete="list"
        aria-controls={showSuggestions ? listboxId : undefined}
        aria-expanded={showSuggestions}
        autoComplete={props.autoComplete ?? "email"}
        id={inputId}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={handleFocus}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        type="email"
        value={value}
      />
      {showSuggestions ? (
        <span className="email-suggestion-list" id={listboxId} role="listbox">
          {suggestions.map((suggestion, index) => (
            <button
              aria-selected={index === activeIndex}
              className="email-suggestion-option"
              data-active={index === activeIndex ? "true" : "false"}
              key={suggestion}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectSuggestion(suggestion)}
              role="option"
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </span>
      ) : null}
    </span>
  );
}
