// src/components/VoiceInput.jsx
import React, { useState, useEffect, useRef } from "react";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { Mic, MicOff, Volume2, X } from "lucide-react";

export const VoiceInput = ({ isOpen, onClose, onCommand, habits = [] }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState("");

  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  // Check if Web Speech API is supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = "";
          let interimTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            const confidence = event.results[i][0].confidence;

            if (event.results[i].isFinal) {
              finalTranscript += transcript;
              setConfidence(confidence);
            } else {
              interimTranscript += transcript;
            }
          }

          setTranscript(finalTranscript || interimTranscript);

          if (finalTranscript) {
            processVoiceCommand(finalTranscript, confidence);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          setError(`Speech recognition error: ${event.error}`);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const processVoiceCommand = (command, confidence) => {
    const lowercaseCommand = command.toLowerCase().trim();
    console.log("Processing voice command:", {
      command: lowercaseCommand,
      confidence,
    });

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Parse different types of commands
    const parsedCommand = parseVoiceCommand(lowercaseCommand);

    if (parsedCommand) {
      // Show success feedback
      setError("");

      // Auto-close after showing result
      timeoutRef.current = setTimeout(() => {
        onCommand(parsedCommand);
        onClose();
      }, 1500);
    } else {
      setError(
        'Command not recognized. Try saying something like "I completed my workout" or "Mark water as done"'
      );
    }
  };

  const parseVoiceCommand = (command) => {
    // Define command patterns
    const patterns = [
      // Completion patterns
      {
        regex:
          /(?:i (?:completed|finished|did)|mark|completed?) (.+?)(?:\s+(?:as )?(?:done|complete|finished))?$/i,
        action: "complete",
      },
      // Specific habit patterns
      {
        regex: /(?:did|completed|finished) (?:my )?(.+?)$/i,
        action: "complete",
      },
      // Value-based patterns for measurable habits
      {
        regex: /(?:i (?:drank|had|did|completed)) (\d+) (.+?)$/i,
        action: "log_value",
      },
      // Avoided bad habits
      {
        regex: /(?:i )?(?:avoided|didn't do|skipped) (.+?)$/i,
        action: "avoid",
      },
    ];

    for (const pattern of patterns) {
      const match = command.match(pattern.regex);
      if (match) {
        const habitName = match[1]?.trim();
        const value = match[0].match(/\d+/)?.[0];

        // Find matching habit
        const matchingHabit = findMatchingHabit(habitName);

        if (matchingHabit) {
          return {
            action: pattern.action,
            habit: matchingHabit,
            value: value ? parseInt(value) : null,
            originalCommand: command,
          };
        }
      }
    }

    return null;
  };

  const findMatchingHabit = (spokenName) => {
    const normalizedSpoken = spokenName.toLowerCase().trim();

    // Find exact matches first
    let match = habits.find(
      (habit) => habit.title.toLowerCase() === normalizedSpoken
    );

    if (match) return match;

    // Find partial matches
    match = habits.find(
      (habit) =>
        habit.title.toLowerCase().includes(normalizedSpoken) ||
        normalizedSpoken.includes(habit.title.toLowerCase())
    );

    if (match) return match;

    // Find matches with common variations
    const variations = {
      water: ["drink water", "hydrate", "h2o"],
      workout: ["exercise", "gym", "fitness", "training"],
      meditation: ["meditate", "mindfulness"],
      reading: ["read", "book"],
      sleep: ["rest", "bedtime", "go to bed"],
    };

    for (const [key, synonyms] of Object.entries(variations)) {
      if (
        normalizedSpoken.includes(key) ||
        synonyms.some((syn) => normalizedSpoken.includes(syn))
      ) {
        match = habits.find(
          (habit) =>
            habit.title.toLowerCase().includes(key) ||
            synonyms.some((syn) => habit.title.toLowerCase().includes(syn))
        );
        if (match) return match;
      }
    }

    return null;
  };

  const startListening = () => {
    if (!isSupported) {
      setError("Speech recognition is not supported in this browser");
      return;
    }

    setError("");
    setTranscript("");
    setIsListening(true);

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      setError("Failed to start speech recognition");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Mic size={20} className="text-purple-600" />
              Voice Command
            </h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          {!isSupported ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 mb-4">
                Speech recognition is not supported in this browser.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Try using Chrome, Edge, or Safari for voice commands.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Microphone Button */}
              <div className="flex justify-center">
                <Button
                  onClick={isListening ? stopListening : startListening}
                  className={`w-20 h-20 rounded-full ${
                    isListening
                      ? "bg-red-500 hover:bg-red-600 animate-pulse"
                      : "bg-purple-600 hover:bg-purple-700"
                  } text-white`}
                >
                  {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                </Button>
              </div>

              {/* Status */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isListening
                    ? "Listening... Speak now!"
                    : "Tap the microphone to start"}
                </p>
              </div>

              {/* Transcript */}
              {transcript && (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    You said:
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 mt-1">
                    "{transcript}"
                  </p>
                  {confidence > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Confidence: {Math.round(confidence * 100)}%
                    </p>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* Example Commands */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                  Example commands:
                </p>
                <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                  <p>• "I completed my workout"</p>
                  <p>• "Mark water as done"</p>
                  <p>• "I drank 8 glasses of water"</p>
                  <p>• "I avoided smoking"</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
