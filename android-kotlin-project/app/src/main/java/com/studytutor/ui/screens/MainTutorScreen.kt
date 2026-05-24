package com.studytutor.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.studytutor.StudyTutorViewModel
import com.studytutor.StudyTopic

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainTutorScreen(viewModel: StudyTutorViewModel) {
    val activeTopic by viewModel.activeTopic
    val isGenerating by viewModel.isGenerating

    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        text = activeTopic?.title ?: "Study Tutor Native",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                ),
                navigationIcon = {
                    if (activeTopic != null) {
                        IconButton(onClick = { viewModel.activeTopic.value = null }) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                        }
                    }
                }
            )
        },
        bottomBar = {
            if (activeTopic == null) {
                BottomAppBar {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        IconButton(onClick = { /* Navigate Dashboard */ }) {
                            Icon(Icons.Default.Home, contentDescription = "Home")
                        }
                        IconButton(onClick = { /* Navigate Plan */ }) {
                            Icon(Icons.Default.Book, contentDescription = "Lessons")
                        }
                    }
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(Color(0xFFFAFBFD))
        ) {
            if (activeTopic == null) {
                DashboardContent(viewModel)
            } else {
                TopicDetailsContent(viewModel, activeTopic!!)
            }
        }
    }
}

@Composable
fun DashboardContent(viewModel: StudyTutorViewModel) {
    var newTopicName by remember { mutableStateOf("") }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Welcome and Streak Indicator
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Ready to Learn Kotlin?", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text("Generate individual revision modules in seconds.", fontSize = 12.sp)
                    }
                    Text("🔥 ${viewModel.streakCount.value} Days", fontWeight = FontWeight.ExtraBold)
                }
            }
        }

        // Custom Subject Creator
        item {
            Card(
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Curate New Study Material",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = newTopicName,
                        onValueChange = { newTopicName = it },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text("Topic name...") },
                        maxLines = 1
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Button(
                        onClick = {
                            viewModel.addCustomTopic(newTopicName)
                            newTopicName = ""
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Generate Plan with Gemini AI")
                    }
                }
            }
        }

        // Active Lessons list headers
        item {
            Text("Your Study Modules", fontWeight = FontWeight.Bold, fontSize = 14.sp)
        }

        items(viewModel.topics) { topic ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { viewModel.activeTopic.value = topic },
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(topic.title, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(topic.overview, fontSize = 12.sp, color = Color.Gray, maxLines = 2)
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "${topic.flashcards.size} Flashcards • ${topic.quizQuestions.size} Quizzes",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Button(onClick = { viewModel.activeTopic.value = topic }) {
                            Text("Open", fontSize = 11.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun TopicDetailsContent(viewModel: StudyTutorViewModel, topic: StudyTopic) {
    var curTab by remember { mutableStateOf("overview") }

    Column(modifier = Modifier.fillMaxSize()) {
        TabRow(selectedTabIndex = when(curTab) {
            "overview" -> 0
            "flashcards" -> 1
            "test" -> 2
            else -> 0
        }) {
            Tab(selected = curTab == "overview", onClick = { curTab = "overview" }) {
                Text("Overview", modifier = Modifier.padding(12.dp), fontSize = 12.sp)
            }
            Tab(selected = curTab == "flashcards", onClick = { curTab = "flashcards" }) {
                Text("Flashcards", modifier = Modifier.padding(12.dp), fontSize = 12.sp)
            }
            Tab(selected = curTab == "test", onClick = { curTab = "test" }) {
                Text("Test Quiz", modifier = Modifier.padding(12.dp), fontSize = 12.sp)
            }
        }

        Box(modifier = Modifier.fillMaxSize().padding(16.dp)) {
            when (curTab) {
                "overview" -> {
                    Column {
                        Text(topic.title, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(topic.overview, fontSize = 13.sp, lineHeight = 18.sp)
                    }
                }
                "flashcards" -> {
                    var cardIdx by remember { mutableStateOf(0) }
                    var revealState by remember { mutableStateOf(false) }

                    if (topic.flashcards.isNotEmpty()) {
                        val card = topic.flashcards[cardIdx]
                        Column(
                            modifier = Modifier.fillMaxSize(),
                            verticalArrangement = Arrangement.SpaceBetween,
                            alignment = Alignment.CenterHorizontally
                        ) {
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .weight(1f)
                                    .clickable { revealState = !revealState },
                                colors = CardDefaults.cardColors(containerColor = Color.White)
                            ) {
                                Box(modifier = Modifier.fillMaxSize().padding(20.dp), contentAlignment = Alignment.Center) {
                                    if (!revealState) {
                                        Text(card.question, fontSize = 16.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                                    } else {
                                        Text(card.answer, fontSize = 13.sp, color = MaterialTheme.colorScheme.primary, textAlign = TextAlign.Center)
                                    }
                                }
                            }
                            Spacer(modifier = Modifier.height(10.dp))
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Button(
                                    onClick = { if (cardIdx > 0) cardIdx-- },
                                    enabled = cardIdx > 0
                                ) {
                                    Text("Previous")
                                }
                                Button(
                                    onClick = { if (cardIdx < topic.flashcards.size - 1) cardIdx++ },
                                    enabled = cardIdx < topic.flashcards.size - 1
                                ) {
                                    Text("Next")
                                }
                            }
                        }
                    }
                }
                "test" -> {
                    Text("Interactive multi-choice evaluation loaded successfully for ${topic.title}!", fontSize = 13.sp)
                }
            }
        }
    }
}
