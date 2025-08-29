from typing import Dict, List, Any, Optional, Tuple
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import re
from loguru import logger
from app.core.config import settings
from app.models.user import MoodState
from datetime import datetime

class MoodDetector:
    def __init__(self):
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
        
        # Crisis keywords and phrases
        self.crisis_keywords = {
            'high_risk': [
                'kill myself', 'suicide', 'end my life', 'not worth living',
                'better off dead', 'want to die', 'no point in living',
                'end it all', 'overdose', 'jump off', 'hang myself',
                'cut myself', 'self harm', 'hurt myself'
            ],
            'medium_risk': [
                'hopeless', 'worthless', 'can\'t go on', 'give up',
                'no hope', 'hate myself', 'hate my life', 'unbearable',
                'can\'t take it', 'falling apart', 'breaking down'
            ],
            'warning_signs': [
                'depressed', 'anxious', 'panic', 'scared', 'alone',
                'isolated', 'nobody cares', 'burden', 'trapped',
                'overwhelmed', 'exhausted', 'numb', 'empty'
            ]
        }
        
        # Positive indicators
        self.positive_keywords = [
            'better', 'improved', 'happy', 'grateful', 'hopeful',
            'excited', 'proud', 'accomplished', 'peaceful', 'calm',
            'confident', 'motivated', 'energized', 'blessed', 'content'
        ]
        
        # Emotion categories
        self.emotion_categories = {
            'anxiety': ['anxious', 'worried', 'nervous', 'panic', 'stressed', 'tense', 'afraid', 'fearful'],
            'depression': ['sad', 'depressed', 'down', 'hopeless', 'empty', 'numb', 'worthless'],
            'anger': ['angry', 'furious', 'irritated', 'frustrated', 'annoyed', 'rage', 'mad'],
            'joy': ['happy', 'joyful', 'excited', 'elated', 'cheerful', 'delighted', 'pleased'],
            'fear': ['scared', 'terrified', 'frightened', 'alarmed', 'horrified', 'petrified'],
            'sadness': ['sad', 'upset', 'disappointed', 'hurt', 'sorrowful', 'miserable'],
            'disgust': ['disgusted', 'revolted', 'repulsed', 'sickened', 'nauseated'],
            'surprise': ['surprised', 'amazed', 'astonished', 'shocked', 'stunned']
        }
    
    def detect_mood(self, text: str) -> Dict[str, Any]:
        """Detect mood and emotional state from text"""
        try:
            # Clean and normalize text
            text_lower = text.lower().strip()
            
            # Get sentiment scores
            sentiment_scores = self.sentiment_analyzer.polarity_scores(text)
            
            # Detect crisis indicators
            crisis_level, crisis_keywords = self._detect_crisis_level(text_lower)
            
            # Detect emotions
            emotions = self._detect_emotions(text_lower)
            
            # Calculate overall mood state
            mood_state = self._calculate_mood_state(
                sentiment_scores,
                crisis_level,
                emotions
            )
            
            # Detect positive indicators
            positive_indicators = self._detect_positive_indicators(text_lower)
            
            return {
                'mood_state': mood_state,
                'sentiment_scores': sentiment_scores,
                'emotions': emotions,
                'crisis_level': crisis_level,
                'crisis_keywords_detected': crisis_keywords,
                'positive_indicators': positive_indicators,
                'confidence': self._calculate_confidence(sentiment_scores),
                'timestamp': datetime.utcnow()
            }
            
        except Exception as e:
            logger.error(f"Mood detection error: {e}")
            return {
                'mood_state': MoodState.NEUTRAL,
                'sentiment_scores': {'compound': 0.0},
                'emotions': {},
                'crisis_level': 'low',
                'error': str(e)
            }
    
    def _detect_crisis_level(self, text: str) -> Tuple[str, List[str]]:
        """Detect crisis level and keywords"""
        detected_keywords = []
        
        # Check high risk keywords
        for keyword in self.crisis_keywords['high_risk']:
            if keyword in text:
                detected_keywords.append(keyword)
        
        if detected_keywords:
            return 'critical', detected_keywords
        
        # Check medium risk keywords
        for keyword in self.crisis_keywords['medium_risk']:
            if keyword in text:
                detected_keywords.append(keyword)
        
        if len(detected_keywords) >= 2:
            return 'high', detected_keywords
        elif detected_keywords:
            return 'medium', detected_keywords
        
        # Check warning signs
        warning_count = 0
        for keyword in self.crisis_keywords['warning_signs']:
            if keyword in text:
                detected_keywords.append(keyword)
                warning_count += 1
        
        if warning_count >= 3:
            return 'medium', detected_keywords
        elif warning_count >= 1:
            return 'low', detected_keywords
        
        return 'none', []
    
    def _detect_emotions(self, text: str) -> Dict[str, float]:
        """Detect specific emotions in text"""
        emotion_scores = {}
        
        for emotion, keywords in self.emotion_categories.items():
            score = 0
            keyword_count = 0
            
            for keyword in keywords:
                if keyword in text:
                    keyword_count += 1
                    # Weight by position in text (earlier = stronger)
                    position = text.find(keyword)
                    position_weight = 1.0 - (position / len(text)) * 0.3
                    score += position_weight
            
            if keyword_count > 0:
                emotion_scores[emotion] = min(score / len(keywords), 1.0)
        
        # Normalize scores
        total = sum(emotion_scores.values())
        if total > 0:
            emotion_scores = {k: v/total for k, v in emotion_scores.items()}
        
        return emotion_scores
    
    def _detect_positive_indicators(self, text: str) -> List[str]:
        """Detect positive indicators in text"""
        found_indicators = []
        
        for indicator in self.positive_keywords:
            if indicator in text:
                found_indicators.append(indicator)
        
        return found_indicators
    
    def _calculate_mood_state(
        self,
        sentiment_scores: Dict[str, float],
        crisis_level: str,
        emotions: Dict[str, float]
    ) -> MoodState:
        """Calculate overall mood state"""
        
        # Crisis overrides everything
        if crisis_level == 'critical':
            return MoodState.CRISIS
        
        compound_score = sentiment_scores['compound']
        
        # Check for high negative emotions
        negative_emotions = sum([
            emotions.get('anxiety', 0),
            emotions.get('depression', 0),
            emotions.get('anger', 0),
            emotions.get('fear', 0),
            emotions.get('sadness', 0)
        ])
        
        positive_emotions = sum([
            emotions.get('joy', 0),
            emotions.get('surprise', 0) * 0.5  # Surprise can be neutral
        ])
        
        # Weighted mood calculation
        if crisis_level in ['high', 'medium']:
            return MoodState.VERY_NEGATIVE
        elif compound_score < -0.5 or negative_emotions > 0.7:
            return MoodState.VERY_NEGATIVE
        elif compound_score < -0.1 or negative_emotions > 0.5:
            return MoodState.NEGATIVE
        elif compound_score > 0.5 or positive_emotions > 0.7:
            return MoodState.VERY_POSITIVE
        elif compound_score > 0.1 or positive_emotions > 0.5:
            return MoodState.POSITIVE
        else:
            return MoodState.NEUTRAL
    
    def _calculate_confidence(self, sentiment_scores: Dict[str, float]) -> float:
        """Calculate confidence in mood detection"""
        # Higher absolute compound score = higher confidence
        confidence = abs(sentiment_scores['compound'])
        
        # Adjust based on neutrality
        if sentiment_scores['neu'] > 0.8:
            confidence *= 0.7  # Lower confidence for highly neutral text
        
        return min(confidence, 1.0)
    
    def analyze_mood_progression(self, mood_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze mood progression over time"""
        if not mood_history:
            return {'trend': 'insufficient_data'}
        
        try:
            # Extract mood values (convert to numeric)
            mood_values = []
            for entry in mood_history:
                mood_state = entry.get('mood_state')
                if isinstance(mood_state, str):
                    # Convert mood state to numeric value
                    mood_map = {
                        'very_positive': 2,
                        'positive': 1,
                        'neutral': 0,
                        'negative': -1,
                        'very_negative': -2,
                        'crisis': -3
                    }
                    mood_values.append(mood_map.get(mood_state, 0))
            
            if len(mood_values) < 2:
                return {'trend': 'insufficient_data'}
            
            # Calculate trend
            recent_avg = sum(mood_values[-3:]) / len(mood_values[-3:])
            older_avg = sum(mood_values[:-3]) / max(len(mood_values[:-3]), 1)
            
            trend_value = recent_avg - older_avg
            
            if trend_value > 0.5:
                trend = 'improving'
            elif trend_value < -0.5:
                trend = 'declining'
            else:
                trend = 'stable'
            
            # Calculate volatility
            changes = [abs(mood_values[i] - mood_values[i-1]) 
                      for i in range(1, len(mood_values))]
            volatility = sum(changes) / len(changes) if changes else 0
            
            return {
                'trend': trend,
                'trend_value': trend_value,
                'volatility': volatility,
                'current_mood': mood_values[-1] if mood_values else 0,
                'average_mood': sum(mood_values) / len(mood_values),
                'mood_range': max(mood_values) - min(mood_values) if mood_values else 0
            }
            
        except Exception as e:
            logger.error(f"Mood progression analysis error: {e}")
            return {'trend': 'error', 'error': str(e)}

class CrisisInterventionSystem:
    def __init__(self):
        self.mood_detector = MoodDetector()
        
        # Crisis resources
        self.crisis_resources = {
            'us': {
                'hotline': '988',
                'text': 'Text HOME to 741741',
                'emergency': '911',
                'resources': [
                    {'name': 'National Suicide Prevention Lifeline', 'contact': '988'},
                    {'name': 'Crisis Text Line', 'contact': 'Text HOME to 741741'},
                    {'name': 'NAMI Helpline', 'contact': '1-800-950-NAMI (6264)'},
                    {'name': 'SAMHSA National Helpline', 'contact': '1-800-662-4357'}
                ]
            }
        }
        
        # De-escalation phrases
        self.de_escalation_phrases = [
            "I hear that you're going through a really difficult time.",
            "Your feelings are valid and I'm here to support you.",
            "Let's take this one step at a time together.",
            "You don't have to face this alone.",
            "There is help available and people who care about you.",
            "This feeling is temporary, even though it doesn't feel that way right now."
        ]
    
    def assess_crisis(self, text: str, user_history: Optional[Dict] = None) -> Dict[str, Any]:
        """Assess crisis level and provide intervention"""
        
        # Detect mood and crisis indicators
        mood_analysis = self.mood_detector.detect_mood(text)
        
        crisis_level = mood_analysis['crisis_level']
        
        # Enhance assessment with user history
        if user_history:
            if user_history.get('recent_crisis_flags', 0) > 2:
                if crisis_level == 'medium':
                    crisis_level = 'high'
            
            if user_history.get('risk_level') == 'high':
                if crisis_level == 'low':
                    crisis_level = 'medium'
        
        # Generate intervention response
        intervention = self._generate_intervention(crisis_level, mood_analysis)
        
        return {
            'crisis_level': crisis_level,
            'requires_immediate_intervention': crisis_level in ['critical', 'high'],
            'mood_analysis': mood_analysis,
            'intervention': intervention,
            'timestamp': datetime.utcnow()
        }
    
    def _generate_intervention(self, crisis_level: str, mood_analysis: Dict) -> Dict[str, Any]:
        """Generate appropriate intervention based on crisis level"""
        
        intervention = {
            'level': crisis_level,
            'immediate_actions': [],
            'resources': [],
            'de_escalation_message': '',
            'follow_up_required': False
        }
        
        if crisis_level == 'critical':
            intervention['immediate_actions'] = [
                'Display crisis resources prominently',
                'Send alert to support team',
                'Offer immediate connection to crisis hotline',
                'Maintain engagement with de-escalation techniques'
            ]
            intervention['resources'] = self.crisis_resources['us']['resources']
            intervention['de_escalation_message'] = self._get_crisis_message()
            intervention['follow_up_required'] = True
            
        elif crisis_level == 'high':
            intervention['immediate_actions'] = [
                'Show crisis resources',
                'Engage with supportive dialogue',
                'Assess immediate safety',
                'Offer coping strategies'
            ]
            intervention['resources'] = self.crisis_resources['us']['resources'][:2]
            intervention['de_escalation_message'] = self._get_supportive_message()
            intervention['follow_up_required'] = True
            
        elif crisis_level == 'medium':
            intervention['immediate_actions'] = [
                'Provide emotional support',
                'Suggest coping techniques',
                'Monitor for escalation'
            ]
            intervention['resources'] = [self.crisis_resources['us']['resources'][0]]
            intervention['de_escalation_message'] = self._get_encouraging_message()
            
        return intervention
    
    def _get_crisis_message(self) -> str:
        """Get crisis intervention message"""
        return """I'm deeply concerned about what you're sharing. Your life has value and this pain you're feeling can be addressed with proper support.

Please reach out for immediate help:
• Call 988 (Suicide & Crisis Lifeline) - available 24/7
• Text HOME to 741741 (Crisis Text Line)
• Call 911 if you're in immediate danger

You don't have to go through this alone. Trained counselors are available right now who want to help you through this difficult moment."""
    
    def _get_supportive_message(self) -> str:
        """Get supportive intervention message"""
        return """I can see you're going through an incredibly difficult time. These feelings you're experiencing are real and valid, and it's important that you get the support you deserve.

Would you like to talk more about what you're experiencing? I'm here to listen without judgment. 

Remember, help is always available:
• Crisis Line: 988
• Text Support: Text HOME to 741741"""
    
    def _get_encouraging_message(self) -> str:
        """Get encouraging message"""
        return """I understand you're facing some challenges right now. It takes courage to reach out and share what you're going through. 

Let's work together to find some strategies that might help you feel better. What specific aspect would you like to focus on first?"""

# Singleton instances
mood_detector = MoodDetector()
crisis_intervention = CrisisInterventionSystem()