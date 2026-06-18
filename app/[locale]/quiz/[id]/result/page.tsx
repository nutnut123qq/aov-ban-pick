"use client"
import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, XCircle, Trophy, RotateCcw, Home, Circle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

import {
    queryTrainingQuiz,
    getTrainingQuizAttempt,
    quizResultStorageKey,
    type QuizResultSummary,
    type QuizAttemptEnvelope,
} from "@/modules/api"
import { useAuthToken } from "@/hooks"
import type { QuizEntity } from "@/modules/api"


const QuizResultPage = () => {
    const params = useParams()
    const searchParams = useSearchParams()
    const quizId = params.id as string
    const attemptId = searchParams.get("attempt")
    const token = useAuthToken().token

    const [quiz, setQuiz] = useState<QuizEntity | null>(null)
    const [summary, setSummary] = useState<QuizResultSummary | null>(null)
    const [envelope, setEnvelope] = useState<QuizAttemptEnvelope | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // sessionStorage fallback (immediate display when no attemptId / offline).
    useEffect(() => {
        if (typeof window === "undefined") return
        const raw = sessionStorage.getItem(quizResultStorageKey(quizId))
        if (raw) {
            try {
                setSummary(JSON.parse(raw) as QuizResultSummary)
            } catch {
                setSummary(null)
            }
        }
    }, [quizId])

    useEffect(() => {
        if (!token) {
            setIsLoading(false)
            return
        }
        let cancelled = false
        const load = async () => {
            try {
                const [quizData, attemptData] = await Promise.all([
                    queryTrainingQuiz({ id: quizId, token }),
                    attemptId
                        ? getTrainingQuizAttempt({ attemptId, token }).catch(() => null)
                        : Promise.resolve(null),
                ])
                if (cancelled) return
                setQuiz(quizData)
                setEnvelope(attemptData)
            } catch (error) {
                console.error("Error loading quiz result:", error)
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }
        load()
        return () => {
            cancelled = true
        }
    }, [quizId, token, attemptId])

    // Map of questionId → the learner's answer for the review section.
    const answersByQuestion = useMemo(() => {
        const map = new Map<
            string,
            { selectedOptionIds: string[]; answerText: string | null; autoScore: number }
        >()
        for (const a of envelope?.answers ?? []) {
            map.set(a.questionId, {
                selectedOptionIds: a.selectedOptionIds ?? [],
                answerText: a.answerText ?? null,
                autoScore: Number(a.autoScore ?? 0),
            })
        }
        return map
    }, [envelope])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-full max-w-2xl px-4">
                    <Skeleton className="h-64 w-full mb-6" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        )
    }

    if (!quiz) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h1 className="text-2xl font-bold mb-2">Không tìm thấy kết quả</h1>
                    <Link href="/">
                        <Button variant="outline" className="gap-2">
                            <Home className="w-4 h-4" />
                            Quay về trang chủ
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    const totalPoints = quiz.questions.reduce((acc, q) => acc + q.points, 0)
    const totalQuestions = quiz.questions.length

    // Prefer server-verified values from the attempt; fall back to sessionStorage.
    const attempt = envelope?.attempt
    const percentage = attempt
        ? Math.round(Number(attempt.percentage ?? 0))
        : summary?.percentage ?? 0
    const earnedPoints = attempt ? Number(attempt.score ?? 0) : summary?.earnedPoints ?? 0
    const passed = attempt
        ? attempt.passed ?? percentage >= quiz.passingScore
        : summary?.passed ?? false
    const correctAnswers = envelope
        ? (envelope.answers ?? []).filter((a) => Number(a.autoScore ?? 0) > 0).length
        : summary?.correctAnswers ?? 0

    const canReview = !!envelope && quiz.questions.length > 0

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="text-center mb-8"
                >
                    <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                        passed ? "bg-green-100" : "bg-red-100"
                    }`}>
                        {passed ? (
                            <Trophy className="w-12 h-12 text-yellow-500" />
                        ) : (
                            <XCircle className="w-12 h-12 text-red-500" />
                        )}
                    </div>

                    <Badge variant={passed ? "default" : "destructive"} className="mb-4">
                        {passed ? "Đạt yêu cầu" : "Chưa đạt"}
                    </Badge>

                    <h1 className="text-3xl font-bold mb-2">
                        {passed ? "Chúc mừng bạn!" : "Rất tiếc!"}
                    </h1>
                    <p className="text-muted-foreground">
                        {passed
                            ? "Bạn đã hoàn thành bài kiểm tra với kết quả tốt."
                            : `Bạn cần đạt tối thiểu ${quiz.passingScore}% để vượt qua bài kiểm tra này.`
                        }
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                >
                    <Card className="mb-6">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-center">Kết quả bài kiểm tra</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
                                <div className="p-4 bg-muted rounded-lg">
                                    <div className={`text-3xl font-bold ${passed ? "text-green-600" : "text-red-600"}`}>
                                        {percentage}%
                                    </div>
                                    <div className="text-sm text-muted-foreground">Điểm số</div>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <div className="text-3xl font-bold">
                                        {earnedPoints}/{totalPoints}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Điểm đạt được</div>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <div className="text-3xl font-bold">
                                        {correctAnswers}/{totalQuestions}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Câu đúng</div>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <div className="text-3xl font-bold">
                                        {quiz.passingScore}%
                                    </div>
                                    <div className="text-sm text-muted-foreground">Yêu cầu</div>
                                </div>
                            </div>
                            <Progress value={percentage} className="h-3" />
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Per-question review (only when we have the server attempt) */}
                {canReview && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
                        className="mb-6"
                    >
                        <h2 className="text-lg font-semibold mb-3">Xem lại bài làm</h2>
                        <div className="space-y-4">
                            {quiz.questions.map((q, qi) => {
                                const mine = answersByQuestion.get(q.id)
                                const isText = q.type === "ESSAY" || q.type === "FILL_BLANK"
                                const earned = mine?.autoScore ?? 0
                                const correct = earned > 0
                                return (
                                    <Card key={q.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <p className="font-medium">
                                                    <span className="text-muted-foreground">Câu {qi + 1}. </span>
                                                    {q.text}
                                                </p>
                                                {isText ? (
                                                    <Badge variant="secondary" className="shrink-0">
                                                        {earned}/{q.points} điểm
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        className={`shrink-0 border-0 ${
                                                            correct
                                                                ? "bg-green-500/10 text-green-600"
                                                                : "bg-red-500/10 text-red-600"
                                                        }`}
                                                    >
                                                        {correct ? "Đúng" : "Sai"}
                                                    </Badge>
                                                )}
                                            </div>

                                            {isText ? (
                                                <div className="text-sm">
                                                    <p className="text-muted-foreground mb-1">Câu trả lời của bạn:</p>
                                                    <p className="rounded-lg bg-muted p-3 whitespace-pre-line">
                                                        {mine?.answerText || "(Bỏ trống)"}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {q.options?.map((opt) => {
                                                        const chosen = mine?.selectedOptionIds.includes(opt.id)
                                                        const isCorrect = opt.isCorrect
                                                        return (
                                                            <div
                                                                key={opt.id}
                                                                className={`flex items-center gap-2 rounded-lg border p-2.5 text-sm ${
                                                                    isCorrect
                                                                        ? "border-green-300 bg-green-500/5"
                                                                        : chosen
                                                                            ? "border-red-300 bg-red-500/5"
                                                                            : ""
                                                                }`}
                                                            >
                                                                {isCorrect ? (
                                                                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                                                                ) : chosen ? (
                                                                    <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                                                                ) : (
                                                                    <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                                                                )}
                                                                <span className="flex-1">{opt.text}</span>
                                                                {chosen && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        Bạn chọn
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}

                                            {q.explanation && (
                                                <p className="text-xs text-muted-foreground mt-3">
                                                    💡 {q.explanation}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                    className="mt-8"
                >
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href={`/courses/${quiz.course?.slug}`} className="flex-1">
                            <Button variant="outline" className="w-full gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Quay lại khóa học
                            </Button>
                        </Link>
                        <Link href={`/quiz/${quizId}`} className="flex-1">
                            <Button className="w-full gap-2">
                                <RotateCcw className="w-4 h-4" />
                                Làm lại
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default QuizResultPage
