"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Award, X } from "lucide-react";
import { useState } from "react";

import { generateQuiz, type QuizQuestion } from "@/app/actions/quiz";
import { Button } from "@/components/ui/button";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterText: string;
  onNextChapter?: () => void;
  hasNextChapter?: boolean;
}

export function QuizModal({
  isOpen,
  onClose,
  chapterText,
  onNextChapter,
  hasNextChapter,
}: QuizModalProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "quiz" | "results">("idle");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);

  const handleStartQuiz = async () => {
    setStatus("loading");
    const result = await generateQuiz(chapterText);
    if (result.success && result.data) {
      setQuestions(result.data);
      setStatus("quiz");
    } else {
      // Handle error (could add an error state)
      setStatus("idle");
      alert("Failed to generate quiz. Please try again.");
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) return;

    setUserAnswers((prev) => [...prev, selectedAnswer]);

    if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
      setScore((prev) => prev + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      setStatus("results");
    }
  };

  const resetQuiz = () => {
    setStatus("idle");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setUserAnswers([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-zinc-900/80 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden relative"
      >
        <button
          onClick={resetQuiz}
          className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-300 transition-colors z-10 hover:cursor-pointer"
          aria-label="Close quiz"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="p-6">
          {status === "idle" && (
            <div className="text-center space-y-4">
              <h2 className="text-xl font-mono tracking-[0.2em] text-zinc-100 uppercase">
                Chapter Complete!
              </h2>
              <p className="text-zinc-400">
                Would you like to take a quick quiz to test your comprehension?
              </p>
              <div className="flex gap-3 justify-center mt-6 flex-wrap">
                {hasNextChapter && onNextChapter && (
                  <Button
                    variant="outline"
                    onClick={onNextChapter}
                    className="w-32 border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                  >
                    Next Chapter
                  </Button>
                )}
                <Button
                  onClick={handleStartQuiz}
                  className="w-32 bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/50"
                >
                  Take Quiz
                </Button>
              </div>
            </div>
          )}

          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
              <p className="text-zinc-400 animate-pulse">Generating questions...</p>
            </div>
          )}

          {status === "quiz" && questions.length > 0 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center font-mono text-xs tracking-widest uppercase text-zinc-500 pr-10">
                <span>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span>Score: {score}</span>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-zinc-100 leading-relaxed">
                  {questions[currentQuestionIndex].question}
                </h3>

                <div className="space-y-3 pt-2">
                  {questions[currentQuestionIndex].options.map((option, idx) => {
                    const isSelected = selectedAnswer === option;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswerSelect(option)}
                        className={`w-full p-4 text-left rounded-md transition-all border text-zinc-300 hover:cursor-pointer
                          ${
                            isSelected
                              ? "bg-rose-500/20 border-rose-500 text-rose-100"
                              : "bg-zinc-800/50 border-zinc-700 hover:bg-rose-500/10 hover:border-rose-500/50"
                          }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleNextQuestion}
                  disabled={!selectedAnswer}
                  className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-500"
                >
                  {currentQuestionIndex === questions.length - 1 ? "Finish" : "Next"}
                </Button>
              </div>
            </div>
          )}

          {status === "results" && (
            <div className="text-center space-y-6 py-6">
              <div className="flex justify-center">
                <Award
                  className={`w-16 h-16 ${
                    score === questions.length ? "text-rose-400" : "text-zinc-500"
                  }`}
                />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-zinc-100">Quiz Complete!</h2>
                <p className="text-2xl text-zinc-400 font-mono tracking-widest">
                  {String(score).padStart(2, "0")} / {String(questions.length).padStart(2, "0")}
                </p>
              </div>

              <div className="space-y-4 text-left max-h-[40vh] overflow-y-auto pr-2">
                {questions.map((q, idx) => {
                  const userAnswer = userAnswers[idx];
                  const isCorrect = userAnswer === q.correctAnswer;

                  if (isCorrect) return null;

                  return (
                    <div
                      key={idx}
                      className="bg-zinc-800/50 p-4 rounded-lg border border-red-500/20"
                    >
                      <p className="text-sm font-medium text-zinc-200 mb-2">
                        <span className="text-zinc-500 mr-2">{idx + 1}.</span>
                        {q.question}
                      </p>
                      <div className="space-y-1 text-sm">
                        <p className="text-red-400">
                          <span className="text-zinc-500 uppercase text-xs tracking-wider mr-2">
                            You selected:
                          </span>
                          {userAnswer}
                        </p>
                        <p className="text-emerald-400">
                          <span className="text-zinc-500 uppercase text-xs tracking-wider mr-2">
                            Correct answer:
                          </span>
                          {q.correctAnswer}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={resetQuiz}
                  className="flex-1 bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                >
                  Back to Reading
                </Button>
                {hasNextChapter && onNextChapter && (
                  <Button
                    onClick={onNextChapter}
                    className="flex-1 bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/50"
                  >
                    Next Chapter
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
