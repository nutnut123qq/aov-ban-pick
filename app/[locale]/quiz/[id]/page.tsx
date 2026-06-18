"use client"
import React, { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
    ArrowLeft, 
    Clock, 
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    CheckCircle,
    FileQuestion,
    Send,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

import {
    queryTrainingQuiz,
    queryMyEnrollments,
    startTrainingQuizAttempt,
    submitTrainingQuizAttempt,
    quizResultStorageKey,
    type QuizAnswerInput,
    type QuizResultSummary,
} from "@/modules/api"
import { useAuthToken } from "@/hooks"
import { toastError } from "@/modules/toast"
import type { QuizEntity, QuizQuestionEntity } from "@/modules/api"

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
}

const QuestionCard = ({
    question,
    index,
    selectedAnswer,
    onAnswerChange,
}: {
    question: QuizQuestionEntity
    index: number
    selectedAnswer?: string | string[]
    onAnswerChange: (questionId: string, answer: string | string[]) => void
}) => {
    const isMultiSelect = question.type === "MULTIPLE_CHOICE"

    const handleSingleChange = (value: string) => {
        onAnswerChange(question.id, value)
    }

    const handleMultiChange = (optionId: string, checked: boolean) => {
        const current = Array.isArray(selectedAnswer) ? selectedAnswer : []
        if (checked) {
            onAnswerChange(question.id, [...current, optionId])
        } else {
            onAnswerChange(question.id, current.filter(id => id !== optionId))
        }
    }

    return (
        <Card className="mb-4">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <Badge variant="outline" className="mb-2">Câu {index + 1}</Badge>
                        <CardTitle className="text-lg leading-relaxed">{question.text}</CardTitle>
                    </div>
                    <Badge variant="secondary">{question.points} điểm</Badge>
                </div>
            </CardHeader>
            <CardContent>
                {question.type === "ESSAY" || question.type === "FILL_BLANK" ? (
                    <Textarea
                        placeholder="Nhập câu trả lời của bạn..."
                        value={(selectedAnswer as string) || ""}
                        onChange={(e) => onAnswerChange(question.id, e.target.value)}
                        className="min-h-[150px]"
                    />
                ) : (
                    <div className="space-y-3">
                        {question.options?.map((option) => {
                            const isSelected = Array.isArray(selectedAnswer) 
                                ? selectedAnswer.includes(option.id)
                                : selectedAnswer === option.id

                            return (
                                <div
                                    key={option.id}
                                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                                        isSelected ? "bg-primary/5 border-primary" : "hover:bg-muted/50"
                                    }`}
                                    onClick={() => {
                                        if (isMultiSelect) {
                                            handleMultiChange(option.id, !isSelected)
                                        } else {
                                            handleSingleChange(option.id)
                                        }
                                    }}
                                >
                                    {isMultiSelect ? (
                                        <Checkbox
                                            id={option.id}
                                            checked={isSelected}
                                            onCheckedChange={(checked) => handleMultiChange(option.id, !!checked)}
                                        />
                                    ) : (
                                        <RadioGroup
                                            value={(selectedAnswer as string) || ""}
                                            onValueChange={handleSingleChange}
                                        >
                                            <RadioGroupItem value={option.id} id={option.id} />
                                        </RadioGroup>
                                    )}
                                    <label htmlFor={option.id} className="flex-1 cursor-pointer font-medium">
                                        {option.text}
                                    </label>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

const QuizPage = () => {
    const params = useParams()
    const router = useRouter()
    const quizId = params.id as string
    const token = useAuthToken().token
    
    const [quiz, setQuiz] = useState<QuizEntity | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
    const [timeLeft, setTimeLeft] = useState(0)
    const [quizStarted, setQuizStarted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [enrollmentId, setEnrollmentId] = useState<string | null>(null)
    const [attemptId, setAttemptId] = useState<string | null>(null)
    const [isStarting, setIsStarting] = useState(false)
    const [actionError, setActionError] = useState<string | null>(null)

    useEffect(() => {
        const loadQuiz = async () => {
            try {
                if (!token) {
                    setQuiz(null)
                    return
                }

                const quizData = await queryTrainingQuiz({
                    id: quizId,
                    token,
                })
                setQuiz(quizData)
                if (quizData) {
                    setTimeLeft(quizData.duration)
                }

                // Resolve the learner's enrollment for this quiz's course (required to attempt).
                if (quizData?.courseId) {
                    try {
                        const res = await queryMyEnrollments({ token })
                        const match = res.data?.myEnrollments?.data?.find(
                            (e) => e.courseId === quizData.courseId,
                        )
                        setEnrollmentId(match?.id ?? null)
                    } catch (enrollErr) {
                        console.error("Error loading enrollments:", enrollErr)
                    }
                }
            } catch (error) {
                console.error("Error loading quiz:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadQuiz()
    }, [quizId, token])

    useEffect(() => {
        if (!quizStarted || timeLeft <= 0) return

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    handleSubmit()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [quizStarted, timeLeft])

    const handleAnswerChange = useCallback((questionId: string, answer: string | string[]) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answer }))
    }, [])

    const handleStart = async () => {
        if (!token || !quiz) return
        if (!enrollmentId) {
            setActionError("Bạn cần ghi danh khóa học này trước khi làm bài kiểm tra.")
            return
        }
        setActionError(null)
        setIsStarting(true)
        try {
            const attempt = await startTrainingQuizAttempt({
                quizId,
                enrollmentId,
                token,
            })
            if (!attempt?.id) {
                setActionError("Không thể bắt đầu bài kiểm tra. Vui lòng thử lại.")
                return
            }
            setAttemptId(attempt.id)
            setQuizStarted(true)
        } catch (error) {
            console.error("Error starting quiz attempt:", error)
            setActionError(
                error instanceof Error && error.message.includes("Max attempts")
                    ? "Bạn đã hết số lần làm bài cho phép."
                    : "Không thể bắt đầu bài kiểm tra. Vui lòng thử lại.",
            )
        } finally {
            setIsStarting(false)
        }
    }

    const handleSubmit = async () => {
        if (!token || !quiz || !attemptId || isSubmitting) return
        setIsSubmitting(true)
        try {
            const payload: QuizAnswerInput[] = quiz.questions
                .map((q): QuizAnswerInput | null => {
                    const value = answers[q.id]
                    if (value === undefined) return null
                    if (q.type === "ESSAY" || q.type === "FILL_BLANK") {
                        const text = typeof value === "string" ? value.trim() : ""
                        if (!text) return null
                        return { questionId: q.id, answerText: text }
                    }
                    const ids = Array.isArray(value) ? value : value ? [value] : []
                    if (ids.length === 0) return null
                    return { questionId: q.id, selectedOptionIds: ids }
                })
                .filter((item): item is QuizAnswerInput => item !== null)

            const result = await submitTrainingQuizAttempt({
                attemptId,
                answers: payload,
                token,
            })

            const totalPoints = quiz.questions.reduce((acc, q) => acc + q.points, 0)
            const earnedPoints = Number(result?.attempt.score ?? 0)
            const percentage = Math.round(Number(result?.attempt.percentage ?? 0))
            const correctAnswers = (result?.answers ?? []).filter(
                (a) => Number(a.autoScore ?? 0) > 0,
            ).length

            const summary: QuizResultSummary = {
                percentage,
                earnedPoints,
                totalPoints,
                passed: result?.attempt.passed ?? percentage >= quiz.passingScore,
                correctAnswers,
                totalQuestions: quiz.questions.length,
                passingScore: quiz.passingScore,
            }

            if (typeof window !== "undefined") {
                sessionStorage.setItem(
                    quizResultStorageKey(quizId),
                    JSON.stringify(summary),
                )
            }
            // Pass attemptId so the result page can verify the score from the server.
            router.push(
                `/quiz/${quizId}/result${attemptId ? `?attempt=${attemptId}` : ""}`,
            )
        } catch (error) {
            console.error("Error submitting quiz:", error)
            setActionError("Không thể nộp bài. Vui lòng thử lại.")
            toastError("Không thể nộp bài. Vui lòng thử lại.")
            setIsSubmitting(false)
        }
    }

    const answeredCount = Object.keys(answers).length
    const totalQuestions = quiz?.questions.length || 0
    const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-full max-w-3xl px-4">
                    <Skeleton className="h-12 w-1/2 mb-6" />
                    <Skeleton className="h-64 w-full mb-4" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        )
    }

    if (!quiz) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <FileQuestion className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h1 className="text-2xl font-bold mb-2">Không tìm thấy bài kiểm tra</h1>
                    <Link href="/">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Quay về trang chủ
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    if (!quizStarted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-lg">
                    <CardHeader className="text-center pb-2">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileQuestion className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                        {quiz.description && (
                            <p className="text-muted-foreground mt-2">{quiz.description}</p>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold">{totalQuestions}</div>
                                <div className="text-sm text-muted-foreground">Câu hỏi</div>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold">{formatTime(quiz.duration)}</div>
                                <div className="text-sm text-muted-foreground">Thời gian</div>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold">{quiz.passingScore}%</div>
                                <div className="text-sm text-muted-foreground">Điểm đạt</div>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold">{quiz.maxAttempts}</div>
                                <div className="text-sm text-muted-foreground">Lần thi tối đa</div>
                            </div>
                        </div>

                        <Alert>
                            <AlertCircle className="w-4 h-4" />
                            <AlertDescription>
                                <strong>Lưu ý:</strong> Bạn sẽ có {formatTime(quiz.duration)} để hoàn thành bài kiểm tra.
                                Hệ thống sẽ tự động nộp bài khi hết thời gian.
                            </AlertDescription>
                        </Alert>

                        {actionError && (
                            <Alert variant="destructive">
                                <AlertCircle className="w-4 h-4" />
                                <AlertDescription>{actionError}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex gap-3">
                            <Link href={`/courses/${quiz.course?.slug}`} className="flex-1">
                                <Button variant="outline" className="w-full gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Quay lại
                                </Button>
                            </Link>
                            <Button
                                onClick={handleStart}
                                disabled={isStarting}
                                className="flex-1 gap-2"
                            >
                                {isStarting ? "Đang chuẩn bị..." : "Bắt đầu làm bài"}
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const question = quiz.questions[currentQuestion]
    const isLastQuestion = currentQuestion === totalQuestions - 1

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="sticky top-0 z-10 bg-background border-b">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href={`/courses/${quiz.course?.slug}`}>
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="font-semibold line-clamp-1">{quiz.title}</h1>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>Câu {currentQuestion + 1} / {totalQuestions}</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span className={timeLeft < 60 ? "text-red-500 font-medium" : ""}>
                                            {formatTime(timeLeft)}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                            <Send className="w-4 h-4" />
                            Nộp bài
                        </Button>
                    </div>
                    <Progress value={progress} className="mt-3" />
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 max-w-3xl">
                {question && (
                    <QuestionCard
                        key={question.id}
                        question={question}
                        index={currentQuestion}
                        selectedAnswer={answers[question.id]}
                        onAnswerChange={handleAnswerChange}
                    />
                )}

                <div className="flex items-center justify-between mt-6">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                        disabled={currentQuestion === 0}
                        className="gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Câu trước
                    </Button>

                    {isLastQuestion ? (
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                            {isSubmitting ? "Đang nộp..." : "Nộp bài"}
                            <Send className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setCurrentQuestion((prev) => Math.min(totalQuestions - 1, prev + 1))}
                            className="gap-2"
                        >
                            Câu tiếp
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                <Card className="mt-8">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Điều hướng câu hỏi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-6 md:grid-cols-10 gap-2">
                            {quiz.questions.map((q, index) => {
                                const isAnswered = !!answers[q.id]
                                const isCurrent = index === currentQuestion

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentQuestion(index)}
                                        className={`aspect-square rounded-md flex items-center justify-center text-sm font-medium transition-colors ${
                                            isCurrent
                                                ? "bg-primary text-primary-foreground"
                                                : isAnswered
                                                ? "bg-green-100 text-green-700 border border-green-300"
                                                : "bg-muted hover:bg-muted/80 text-muted-foreground"
                                        }`}
                                    >
                                        {index + 1}
                                    </button>
                                )
                            })}
                        </div>
                        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-primary" />
                                Hiện tại
                            </span>
                            <span className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
                                Đã trả lời
                            </span>
                            <span className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-muted" />
                                Chưa trả lời
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default QuizPage
