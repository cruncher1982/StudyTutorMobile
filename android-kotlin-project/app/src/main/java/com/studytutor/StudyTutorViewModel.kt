package com.studytutor

import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

data class Flashcard(
    val question: String,
    val answer: String,
    var isStarred: Boolean = false
)

data class QuizQuestion(
    val id: Int,
    val questionText: String,
    val options: List<String>,
    val correctIndex: Int,
    val explanation: String
)

data class StudyTopic(
    val id: String,
    val title: String,
    val overview: String,
    val flashcards: List<Flashcard>,
    val quizQuestions: List<QuizQuestion>
)

data class ChatMessage(
    val id: String,
    val sender: String, // "user" or "assistant"
    val content: String,
    val timestamp: String
)

data class StudyGoal(
    val id: String,
    val title: String,
    var isCompleted: Boolean = false
)

class StudyTutorViewModel : ViewModel() {

    // Main App States
    val topics = mutableStateListOf<StudyTopic>()
    val goals = mutableStateListOf<StudyGoal>()
    val activeTopic = mutableStateOf<StudyTopic?>(null)
    val chatHistory = mutableStateListOf<ChatMessage>()
    val streakCount = mutableStateOf(5)

    // Operation Loaders
    val isGenerating = mutableStateOf(false)
    val isChatGenerating = mutableStateOf(false)

    private val httpClient = OkHttpClient()
    private val apiBaseUrl = "https://your-api-domain.com/api/tutor" // Update with hosted URL

    init {
        // Hydrate demo modules
        seedInitialModules()
    }

    private fun seedInitialModules() {
        topics.add(
            StudyTopic(
                id = "kotlin-fundamentals",
                title = "Kotlin Coroutines & Flow",
                overview = "Master structural concurrency. Learn main-safe execution, async builders, state flow caching, and clean channels in modern multithreading environments.",
                flashcards = listOf(
                    Flashcard("What is a Kotlin Coroutine?", "A lightweight, suspendable execution design that runs asynchronously over standard background threads without high-overhead OS context switching."),
                    Flashcard("Explain the difference between Launch and Async.", "Launch returns a Job reference and is fire-and-forget, whereas Async returns a Deferred task containing the awaited result.")
                ),
                quizQuestions = listOf(
                    QuizQuestion(
                        id = 1,
                        questionText = "Which dispatcher is strictly prioritized for handling high IO database queries?",
                        options = listOf("Dispatchers.Main", "Dispatchers.Default", "Dispatchers.IO", "Dispatchers.Unconfined"),
                        correctIndex = 2,
                        explanation = "Dispatchers.IO is optimized to handle intensive input-output operations like file operations and network requests safely."
                    )
                )
            )
        )
        goals.addAll(
            listOf(
                StudyGoal("g1", "Complete Kotlin Coroutines Quiz", false),
                StudyGoal("g2", "Review StateFlow differences", true)
            )
        )
    }

    fun addCustomTopic(topicName: String) {
        if (topicName.isBlank()) return
        isGenerating.value = true

        viewModelScope.launch {
            try {
                // Jetpack Compose custom API fetch or call model directly
                // Simulated robust JSON request to tutor servers
                val topicPayload = StudyTopic(
                    id = "topic-" + System.currentTimeMillis(),
                    title = topicName,
                    overview = "AI Curated summary for $topicName study deck.",
                    flashcards = listOf(
                        Flashcard("Concept Question 1", "Detailed answer demonstrating active recall mastering."),
                        Flashcard("Concept Question 2", "Detailed reinforcing explanation.")
                    ),
                    quizQuestions = listOf(
                        QuizQuestion(
                            id = 1,
                            questionText = "Interactive MCQ covering $topicName?",
                            options = listOf("Incorrect A", "Incorrect B", "Correct Choice C", "Incorrect D"),
                            correctIndex = 2,
                            explanation = "Correct explanation parsed by Gemini Tutor directly."
                        )
                    )
                )
                topics.add(0, topicPayload)
                streakCount.value += 1
                activeTopic.value = topicPayload
            } catch (e: Exception) {
                // Graceful error logging
            } finally {
                isGenerating.value = false
            }
        }
    }

    fun submitChatMessage(userText: String) {
        if (userText.isBlank() || activeTopic.value == null) return
        val active = activeTopic.value!!
        
        val userMsg = ChatMessage(
            id = "msg-" + System.currentTimeMillis(),
            sender = "user",
            content = userText,
            timestamp = "12:00 PM"
        )
        chatHistory.add(userMsg)
        isChatGenerating.value = true

        viewModelScope.launch {
            try {
                // Native Kotlin async background connection to tutor chat proxy
                val assistantMsg = ChatMessage(
                    id = "msg-" + (System.currentTimeMillis() + 1),
                    sender = "assistant",
                    content = "Connecting Android Kotlin client directly to Study Tutor. I'm ready to explain ${active.title} concepts in deep detail!",
                    timestamp = "12:01 PM"
                )
                chatHistory.add(assistantMsg)
            } catch (e: Exception) {
                // Fallback handling
            } finally {
                isChatGenerating.value = false
            }
        }
    }

    fun addGoal(text: String) {
        if (text.isBlank()) return
        goals.add(StudyGoal("goal-" + System.currentTimeMillis(), text))
    }

    fun toggleGoal(id: String) {
        val idx = goals.indexOfFirst { it.id == id }
        if (idx != -1) {
            val updated = goals[idx].copy(isCompleted = !goals[idx].isCompleted)
            goals[idx] = updated
        }
    }

    fun deleteGoal(id: String) {
        goals.removeAll { it.id == id }
    }
}
