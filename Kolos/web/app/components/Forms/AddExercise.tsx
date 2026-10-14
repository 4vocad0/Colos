"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { getUserIdFromToken } from "@/lib/auth";

const EXERCISE_TYPES = [
  { value: "WEIGHTED", label: "Weighted" },
  { value: "BODY_WEIGHTED", label: "BodyWeighted" },
  { value: "TIMED", label: "Timed" },
] as const;

type BodyPart = { id: number; name: string };

function BodyPartAutocomplete({
  label,
  value,
  onChange,
  bodyParts,
  disabled,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  bodyParts: BodyPart[];
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return bodyParts.filter((part) => part.name.toLowerCase().includes(q));
  }, [bodyParts, value]);

  return (
    <label className="block mb-4 relative">
      {label}
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          // małe opóźnienie, żeby klik w sugestię zdążył zadziałać
          window.setTimeout(() => setIsOpen(false), 150);
        }}
        className="w-full p-2 border rounded mt-1"
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete="off"
      />
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-10 left-0 right-0 mt-1 max-h-40 overflow-auto rounded border border-neutral-600 bg-neutral-800 text-white shadow-lg">
          {suggestions.map((part) => (
            <li key={part.id}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-neutral-700"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(part.name);
                  setIsOpen(false);
                }}
              >
                {part.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </label>
  );
}

export default function AddExercise() {
  const [name, setName] = useState("");
  const [type, setType] = useState<(typeof EXERCISE_TYPES)[number]["value"]>("WEIGHTED");
  const [linkUrl, setLinkUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);
  const [primaryName, setPrimaryName] = useState("");
  const [secondaryName, setSecondaryName] = useState("");

  useEffect(() => {
    api
      .get("/api/workouts/body-parts/")
      .then((res) => setBodyParts(res.data))
      .catch(() => setError("Nie udało się pobrać partii ciała."));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim() || !primaryName.trim()) {
      setError("Podaj nazwę i główną partię ciała.");
      return;
    }

    if (!getUserIdFromToken()) {
      setError("Błąd autoryzacji. Zaloguj się ponownie.");
      return;
    }

    setIsSubmitting(true);

    try {
      const primaryPart = bodyParts.find(
        (part) => part.name.toLowerCase() === primaryName.trim().toLowerCase()
      );
      const secondaryPart = secondaryName.trim()
        ? bodyParts.find(
            (part) => part.name.toLowerCase() === secondaryName.trim().toLowerCase()
          )
        : null;

      if (!primaryPart) {
        setError("Nie znaleziono głównej partii ciała.");
        return;
      }

      if (secondaryName.trim() && !secondaryPart) {
        setError("Nie znaleziono pobocznej partii ciała.");
        return;
      }

      await api.post("/api/workouts/exercises/", {
        name: name.trim(),
        type,
        primary: primaryPart.id,
        secondary: secondaryPart?.id ?? null,
        ...(linkUrl.trim() ? { link_url: linkUrl.trim() } : {}),
      });

      setName("");
      setType("WEIGHTED");
      setPrimaryName("");
      setSecondaryName("");
      setLinkUrl("");
      setSuccess(true);
    } catch (err: unknown) {
      console.error("Błąd podczas dodawania ćwiczenia:", err);

      const axiosData =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: unknown } }).response?.data
          : null;

      if (axiosData && typeof axiosData === "object") {
        const messages = Object.entries(axiosData as Record<string, unknown>)
          .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
          .join(" | ");
        setError(messages || "Nie udało się dodać ćwiczenia.");
      } else {
        setError("Nie udało się dodać ćwiczenia.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-500 rounded-lg shadow-md max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Dodaj ćwiczenie</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Nazwa
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded mt-1 mb-4"
            placeholder="np. Bench Press"
            disabled={isSubmitting}
            required
          />
        </label>

        <label className="block mb-4">
          Typ
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            disabled={isSubmitting}
            className="w-full p-2 border rounded mt-1"
          >
            {EXERCISE_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <BodyPartAutocomplete
          label="Primary (główna partia)"
          value={primaryName}
          onChange={setPrimaryName}
          bodyParts={bodyParts}
          disabled={isSubmitting}
          required
          placeholder="Zacznij pisać, np. Biceps"
        />

        <BodyPartAutocomplete
          label="Secondary (opcjonalnie)"
          value={secondaryName}
          onChange={setSecondaryName}
          bodyParts={bodyParts}
          disabled={isSubmitting}
          placeholder="Zacznij pisać, np. Triceps"
        />

        

        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">Ćwiczenie dodane.</p>}

        <button
          type="submit"
          disabled={isSubmitting || !name.trim() || !primaryName.trim()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {isSubmitting ? "Zapisywanie..." : "Dodaj ćwiczenie"}
        </button>
      </form>
    </div>
  );
}
