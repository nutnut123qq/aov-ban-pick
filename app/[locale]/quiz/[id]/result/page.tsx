"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, XCircle, Trophy, RotateCcw, Home } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

import { queryTrainingQuiz } from "@/modules/api"
import { useKeycloak } from "@/hooks/singleton"
import type { QuizEntity } from "@/modules/api"


const QuizResultPage = () => {
    const params = useParams()
    const quizId = params.id as string
    const token = useKeycloak().token
    
    const [quiz, setQuiz] = useState<QuizEntity | null>(null)
    const [isLoading, setIsLoading] = useState(true)

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
            } catch (error) {
                console.error("Error loading quiz:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadQuiz()
    }, [quizId, token])

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

    // Mock result data
    const percentage = 0
    const totalPoints = quiz.questions.reduce((acc, q) => acc + q.points, 0)
    const earnedPoints = 0
    const passed = false
    const correctAnswers = 0
    const totalQuestions = quiz.questions.length

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
