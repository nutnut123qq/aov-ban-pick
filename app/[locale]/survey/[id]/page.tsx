"use client"
import React, { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { 
    ArrowLeft, 
    Send,
    ChevronRight,
    ChevronLeft,
    FileText,
    Star,
    CheckCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

import {
    queryTrainingSurvey,
    submitTrainingSurvey,
} from "@/modules/api"
import { useKeycloak } from "@/hooks/singleton"
import type { SurveyEntity, SurveyQuestionEntity } from "@/modules/api"

const RatingStars = ({ 
    value, 
    onChange,
}: { 
    value: number
    onChange: (rating: number) => void
}) => {
    return (
        <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
                <button
                    key={rating}
                    type="button"
                    onClick={() => onChange(rating)}
                    className="p-1 hover:scale-110 transition-transform"
                >
                    <Star
                        className={`w-8 h-8 ${
                            rating <= value
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                        }`}
                    />
                </button>
            ))}
        </div>
    )
}

const SurveyQuestionCard = ({
    question,
    index,
    answer,
    onAnswerChange
}: {
    question: SurveyQuestionEntity
    index: number
    answer?: string | string[] | number
    onAnswerChange: (questionId: string, answer: string | string[] | number) => void
}) => {
    const renderQuestion = () => {
        switch (question.type) {
            case "RATING":
                return (
                    <div className="space-y-4">
                        <p className="text-muted-foreground text-center">Click on the stars to rate</p>
                        <div className="flex justify-center">
                            <RatingStars
                                value={(answer as number) || 0}
                                onChange={(rating) => onAnswerChange(question.id, rating)}
                            />
                        </div>
                    </div>
                )

            case "SINGLE_CHOICE":
                return (
                    <RadioGroup
                        value={(answer as string) || ""}
                        onValueChange={(value) => onAnswerChange(question.id, value)}
                        className="space-y-3"
                    >
                        {question.options?.map((option) => (
                            <div
                                key={option.id}
                                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                            >
                                <RadioGroupItem value={option.id} id={option.id} />
                                <Label htmlFor={option.id} className="flex-1 cursor-pointer font-medium">
                                    {option.text}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                )

            case "MULTIPLE_CHOICE":
                return (
                    <div className="space-y-3">
                        {question.options?.map((option) => {
                            const selected = Array.isArray(answer) && answer.includes(option.id)
                            return (
                                <div
                                    key={option.id}
                                    className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                                >
                                    <Checkbox
                                        id={option.id}
                                        checked={selected}
                                        onCheckedChange={(checked) => {
                                            const current = Array.isArray(answer) ? answer : []
                                            if (checked) {
                                                onAnswerChange(question.id, [...current, option.id])
                                            } else {
                                                onAnswerChange(question.id, current.filter(id => id !== option.id))
                                            }
                                        }}
                                    />
                                    <Label htmlFor={option.id} className="flex-1 cursor-pointer font-medium">
                                        {option.text}
                                    </Label>
                                </div>
                            )
                        })}
                    </div>
                )

            case "TEXT":
                return (
                    <Textarea
                        placeholder="Enter your response..."
                        value={(answer as string) || ""}
                        onChange={(e) => onAnswerChange(question.id, e.target.value)}
                        className="min-h-[120px]"
                    />
                )

            default:
                return <p className="text-muted-foreground">Unsupported question type</p>
        }
    }

    return (
        <Card className="mb-4">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <Badge variant="outline" className="mb-2">
                            Question {index + 1}
                            {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </Badge>
                        <CardTitle className="text-lg leading-relaxed">{question.text}</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {renderQuestion()}
            </CardContent>
        </Card>
    )
}

const SurveyPage = () => {
    const params = useParams()
    const surveyId = params.id as string
    const token = useKeycloak().token
    
    const [survey, setSurvey] = useState<SurveyEntity | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({})
    const [surveyStarted, setSurveyStarted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    useEffect(() => {
        const loadSurvey = async () => {
            try {
                if (!token) {
                    setSurvey(null)
                    return
                }

                const surveyData = await queryTrainingSurvey({
                    id: surveyId,
                    token,
                })
                setSurvey(surveyData)
            } catch (error) {
                console.error("Error loading survey:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadSurvey()
    }, [surveyId, token])

    const handleAnswerChange = useCallback((questionId: string, answer: string | string[] | number) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answer }))
    }, [])

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            if (!token) return

            await submitTrainingSurvey({
                id: surveyId,
                token,
                details: Object.entries(answers).map(([questionId, answer]) => ({
                    questionId,
                    selectedOptionIds: Array.isArray(answer)
                        ? answer
                        : survey?.questions.find((question) => question.id === questionId)?.type === "SINGLE_CHOICE" && typeof answer === "string"
                            ? [answer]
                            : undefined,
                    answerText: survey?.questions.find((question) => question.id === questionId)?.type === "TEXT" && typeof answer === "string"
                        ? answer
                        : undefined,
                    numericValue: typeof answer === "number" ? answer : undefined,
                })),
            })
            setIsSubmitted(true)
        } finally {
            setIsSubmitting(false)
        }
    }

    const answeredCount = Object.keys(answers).length
    const totalQuestions = survey?.questions.length || 0
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

    if (!survey) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h1 className="text-2xl font-bold mb-2">Survey not found</h1>
                    <Link href="/">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Go back home
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md px-4"
                >
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Thank you!</h1>
                    <p className="text-muted-foreground mb-6">
                        Your response has been submitted successfully.
                    </p>
                    <Link href="/">
                        <Button className="gap-2">Back to Home</Button>
                    </Link>
                </motion.div>
            </div>
        )
    }

    if (!surveyStarted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-lg">
                    <CardHeader className="text-center pb-2">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">{survey.title}</CardTitle>
                        {survey.description && (
                            <p className="text-muted-foreground mt-2">{survey.description}</p>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold">{totalQuestions}</div>
                                <div className="text-sm text-muted-foreground">Questions</div>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold">{survey.responseCount || 0}</div>
                                <div className="text-sm text-muted-foreground">Responses</div>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                            {survey.isAnonymous && (
                                <p className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    This survey is anonymous
                                </p>
                            )}
                        </div>

                        <Separator />

                        <div className="flex gap-3">
                            {survey.course && (
                                <Link href={`/courses/${survey.course.slug}`} className="flex-1">
                                    <Button variant="outline" className="w-full gap-2">
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Course
                                    </Button>
                                </Link>
                            )}
                            <Button onClick={() => setSurveyStarted(true)} className="flex-1 gap-2">
                                Start Survey
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const question = survey.questions[currentQuestion]
    const isLastQuestion = currentQuestion === totalQuestions - 1

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="sticky top-0 z-10 bg-background border-b">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href={`/courses/${survey.course?.slug}`}>
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="font-semibold line-clamp-1">{survey.title}</h1>
                                <div className="text-sm text-muted-foreground">
                                    Question {currentQuestion + 1} of {totalQuestions}
                                </div>
                            </div>
                        </div>
                        
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                            <Send className="w-4 h-4" />
                            Submit
                        </Button>
                    </div>
                    <Progress value={progress} className="mt-3" />
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 max-w-3xl">
                {question && (
                    <SurveyQuestionCard
                        key={question.id}
                        question={question}
                        index={currentQuestion}
                        answer={answers[question.id]}
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
                        Previous
                    </Button>

                    {isLastQuestion ? (
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                            {isSubmitting ? "Submitting..." : "Submit Survey"}
                            <Send className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setCurrentQuestion((prev) => Math.min(totalQuestions - 1, prev + 1))}
                            className="gap-2"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                <Card className="mt-8">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Question Navigator</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-6 md:grid-cols-10 gap-2">
                            {survey.questions.map((q, index) => {
                                const isAnswered = answers[q.id] !== undefined
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
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default SurveyPage
