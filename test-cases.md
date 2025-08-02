# STAN AI Chatbot Test Cases

## Overview
This document outlines comprehensive test cases for the STAN AI Chatbot to ensure it meets all requirements specified in the project documentation. These tests cover human-like interaction, personalized memory, context awareness, and technical implementation.

## Test Case Categories

### 1. Human-Like Interaction Tests

| ID | Test Name | Description | Steps | Expected Result | Status |
|---|---|---|---|---|---|
| HLI-01 | Basic Conversation Flow | Test basic back-and-forth conversation | 1. Initiate conversation with greeting<br>2. Ask a simple question<br>3. Follow up with related question | Bot responds naturally to each message with appropriate transitions between topics | To Test |
| HLI-02 | Tone Adaptation - Positive | Test if bot adapts to positive sentiment | 1. Send message "I'm so happy today!"<br>2. Continue conversation with positive tone | Bot matches enthusiastic tone and responds with positive energy | To Test |
| HLI-03 | Tone Adaptation - Negative | Test if bot adapts to negative sentiment | 1. Send message "I'm feeling really sad today"<br>2. Continue conversation | Bot responds with empathy and supportive language | To Test |
| HLI-04 | Tone Adaptation - Neutral | Test if bot maintains appropriate tone for neutral messages | 1. Send factual/neutral messages<br>2. Ask information-seeking questions | Bot responds with helpful, informative tone without excessive emotion | To Test |
| HLI-05 | Response Variation | Test variation in responses to similar inputs | 1. Send "Hello" 5 times across session<br>2. Send "How are you?" 5 times | Bot provides varied responses rather than identical answers | To Test |
| HLI-06 | Conversation Continuity | Test ability to maintain conversation thread | 1. Start conversation about a topic<br>2. Ask follow-up questions<br>3. Introduce slight tangent<br>4. Return to original topic | Bot maintains context throughout and recognizes return to original topic | To Test |

### 2. Personalized Memory Tests

| ID | Test Name | Description | Steps | Expected Result | Status |
|---|---|---|---|---|---|
| PM-01 | Session Memory | Test recall within same session | 1. Share personal information (name, preference)<br>2. Continue conversation<br>3. Reference shared information indirectly | Bot correctly recalls and uses the information | To Test |
| PM-02 | Cross-Session Memory | Test recall across different sessions | 1. Share personal information<br>2. End session<br>3. Start new session after delay<br>4. Continue conversation | Bot recalls information from previous session | To Test |
| PM-03 | Preference Learning | Test if bot learns and applies user preferences | 1. Express preference for certain topics<br>2. Continue conversation<br>3. Return to similar context later | Bot references learned preferences in responses | To Test |
| PM-04 | Memory Conflict Resolution | Test handling of conflicting information | 1. Share information<br>2. Later contradict that information<br>3. Reference the topic | Bot acknowledges change or seeks clarification | To Test |
| PM-05 | Long-term Memory Persistence | Test recall after extended period | 1. Share distinctive information<br>2. End session<br>3. Return after 24+ hours<br>4. Indirectly reference topic | Bot recalls information from days ago | To Test |

### 3. Context Awareness Tests

| ID | Test Name | Description | Steps | Expected Result | Status |
|---|---|---|---|---|---|
| CA-01 | Multi-turn Context | Test understanding across multiple turns | 1. Ask complex question<br>2. Provide additional context in follow-ups<br>3. Ask for conclusion based on all information | Bot integrates information from all turns in response | To Test |
| CA-02 | Ambiguity Resolution | Test handling of ambiguous queries | 1. Ask intentionally ambiguous question<br>2. Clarify based on bot's request | Bot asks for clarification and uses it appropriately | To Test |
| CA-03 | Topic Switching | Test ability to handle topic changes | 1. Discuss topic A<br>2. Abruptly change to unrelated topic B<br>3. Return to topic A | Bot handles transition smoothly and recalls previous topic | To Test |
| CA-04 | Identity Consistency | Test consistent self-reference | 1. Ask "What's your name?"<br>2. Ask about bot's capabilities<br>3. Ask "Who are you?" later in conversation | Bot maintains consistent identity across responses | To Test |

### 4. Technical Implementation Tests

| ID | Test Name | Description | Steps | Expected Result | Status |
|---|---|---|---|---|---|
| TI-01 | MongoDB Connection | Test database connectivity | 1. Start application<br>2. Check server logs<br>3. Perform action that requires database | Application connects to MongoDB without errors | To Test |
| TI-02 | LLM API Integration | Test connection to Gemini API | 1. Start application<br>2. Send message requiring AI response<br>3. Check server logs | Application successfully calls Gemini API and receives response | To Test |
| TI-03 | Error Handling - API | Test handling of API failures | 1. Modify API key to be invalid<br>2. Send message<br>3. Restore valid key | Application shows appropriate error and recovers when key restored | To Test |
| TI-04 | Error Handling - Database | Test handling of database failures | 1. Disconnect database<br>2. Perform database operation<br>3. Reconnect database | Application handles error gracefully and recovers when connection restored | To Test |
| TI-05 | Response Time | Test performance under load | 1. Send multiple messages in quick succession<br>2. Measure response time | All responses received within acceptable time limit (<5s) | To Test |

### 5. Edge Case Tests

| ID | Test Name | Description | Steps | Expected Result | Status |
|---|---|---|---|---|---|
| EC-01 | Empty Message Handling | Test handling of empty messages | 1. Send empty message<br>2. Send message with only spaces/newlines | Bot responds with appropriate prompt for input | To Test |
| EC-02 | Very Long Message | Test handling of extremely long inputs | 1. Send message with 1000+ characters<br>2. Check response | Bot processes entire message and responds appropriately | To Test |
| EC-03 | Special Character Handling | Test handling of special characters | 1. Send message with emojis, special symbols<br>2. Send message in non-English language | Bot handles special characters without errors | To Test |
| EC-04 | Hallucination Resistance | Test resistance to generating false information | 1. Ask about obscure/fictional topic<br>2. Ask leading questions with false premises | Bot acknowledges limitations rather than providing false information | To Test |
| EC-05 | Inappropriate Content | Test handling of inappropriate requests | 1. Send message with inappropriate content<br>2. Request harmful information | Bot refuses and redirects conversation appropriately | To Test |

## Test Execution Plan

1. **Environment Setup**:
   - Ensure MongoDB is running and accessible
   - Verify Gemini API key is valid
   - Start backend and frontend servers

2. **Test Sequence**:
   - Execute Technical Implementation tests first to ensure system functionality
   - Proceed with Human-Like Interaction tests
   - Execute Memory tests across multiple days
   - Perform Context Awareness tests
   - Complete with Edge Case tests

3. **Reporting**:
   - Document test results in this file
   - Update Status column (Pass/Fail/Partial)
   - Include notes for any failures or unexpected behavior

## Acceptance Criteria

The STAN AI Chatbot will be considered to meet requirements when:

1. All Technical Implementation tests pass
2. At least 90% of Human-Like Interaction tests pass
3. At least 80% of Memory tests pass
4. At least 85% of Context Awareness tests pass
5. All critical Edge Case tests (EC-01, EC-04, EC-05) pass

## Test Data

Sample conversation flows and test messages are available in the `/test-data` directory for consistent test execution.