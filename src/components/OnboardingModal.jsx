// src/components/OnboardingModal.jsx
import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { CheckCircle2, Sparkles } from "lucide-react";
import HabitTemplates, { HABIT_TEMPLATES } from "./HabitTemplates";

/**
 * First-time onboarding with starter packs and templates.
 */
const CATEGORY_GROUPS = [
  { id: "Fitness", label: "Fitness" },
  { id: "Productivity", label: "Productivity" },
  { id: "Wellness", label: "Wellness" },
  { id: "Health", label: "Health" },
  { id: "Learning", label: "Learning" },
  { id: "Mindfulness", label: "Mindfulness" },
  { id: "Nutrition", label: "Nutrition" },
  { id: "Digital Wellness", label: "Digital Wellness" },
];

export const OnboardingModal = ({ isOpen, onClose, onAddHabits }) => {
  const [selectedCats, setSelectedCats] = useState(["Fitness", "Productivity", "Wellness"]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [adding, setAdding] = useState(false);

  const starterPack = useMemo(() => {
    return HABIT_TEMPLATES.filter((t) => selectedCats.includes(t.category)).slice(0, 8);
  }, [selectedCats]);

  const toggleCat = (id) => {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleAddStarter = async () => {
    if (!onAddHabits) return;
    setAdding(true);
    try {
      const toAdd = starterPack.map((t) => ({
        title: t.title,
        type: t.type,
        category: t.category,
        isMeasurable: t.isMeasurable,
        unit: t.unit || "",
        goal: t.goal ?? null,
        scheduleType: t.scheduleType || "daily",
        scheduleDays: t.scheduleDays || [],
        scheduleFrequency: t.scheduleFrequency ?? null,
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
      }));
      await onAddHabits(toAdd);
      onClose?.();
    } finally {
      setAdding(false);
    }
  };

  const handleTemplateSelect = async (habitData) => {
    await onAddHabits([habitData]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="w-full max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle id="onboarding-title" className="flex items-center gap-2">
              <Sparkles size={18} /> Welcome! Start with a Starter Pack
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose categories to quickly add recommended habits. You can tweak or remove any habit later.
            </p>

            <div className="flex flex-wrap gap-2" aria-label="Starter categories">
              {CATEGORY_GROUPS.map((c) => (
                <Button
                  key={c.id}
                  variant={selectedCats.includes(c.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleCat(c.id)}
                  aria-pressed={selectedCats.includes(c.id)}
                >
                  {c.label}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-live="polite">
              {starterPack.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-3 py-2 rounded border dark:border-gray-700">
                  <div className="text-sm">
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-gray-500">{t.category}</div>
                  </div>
                  <Badge variant={t.type === "bad" ? "destructive" : "default"}>
                    {t.type === "bad" ? "Break" : "Build"}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              Prefer picking one-by-one? Browse templates instead.
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={onClose} aria-label="Skip onboarding">
              Skip for now
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowTemplates(true)} aria-label="Browse templates">
                Browse Templates
              </Button>
              <Button onClick={handleAddStarter} disabled={adding || starterPack.length === 0} aria-label="Add selected starter habits">
                <CheckCircle2 size={16} className="mr-1" /> Add Starter Habits
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      <HabitTemplates
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleTemplateSelect}
      />
    </div>
  );
};

export default OnboardingModal;

