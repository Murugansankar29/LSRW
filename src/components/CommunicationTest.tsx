import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Clock, FileText, Volume2, ArrowLeft } from 'lucide-react';
import { CommunicationTest as CommunicationTestType } from '../types';
import { ttsService } from '../services/ttsService';
import { speechService } from '../services/speechService';
import { ScoringService } from '../services/scoringService';

interface CommunicationTestProps {
  prompts: {
    speakingSentences: string[];
    listeningAudio: string[];
    writingTopic: string;
  };
  onComplete: (result: CommunicationTestType) => void;
}

export const CommunicationTest: React.FC<CommunicationTestProps> = ({ prompts, onComplete }) => {
  // General state
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    'Self Introduction',
    'Speaking Test',
    'Listening Test',
    'Writing Test',
  ];
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  // Self intro
  const [introPrepTime, setIntroPrepTime] = useState(15);
  const [introSpeakingTime, setIntroSpeakingTime] = useState(60);
  const [isRecording, setIsRecording] = useState(false);
  const [selfIntroTranscript, setSelfIntroTranscript] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');

  // Speaking test
  const [currentSpeakingIndex, setCurrentSpeakingIndex] = useState(0);
  const [speakingPrepTime, setSpeakingPrepTime] = useState(5);
  const [speakingRecordTime, setSpeakingRecordTime] = useState(15);
  const [speakingTranscripts, setSpeakingTranscripts] = useState<string[]>([]);
  const [liveSpeakingTranscripts, setLiveSpeakingTranscripts] = useState<string[]>([]);

  // Listening test
  const [currentListeningIndex, setCurrentListeningIndex] = useState(0);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [listeningRecordTime, setListeningRecordTime] = useState(15);
  const [listeningTranscripts, setListeningTranscripts] = useState<string[]>([]);
  const [liveListeningTranscripts, setLiveListeningTranscripts] = useState<string[]>([]);
  // Removed unused currentPlayingIndex state

  // Writing test
  const [essay, setEssay] = useState('');

  // Error
  const [recordingError, setRecordingError] = useState('');

  // Sanitize speaking sentences to be simple declarative sentences (runtime guard)
  const sanitizeSpeakingSentences = (sentences: string[]) => {
    const banned = /\b(describe|tell|explain|discuss|talk|why|how|what|should|could|would|please)\b/i;
    return (sentences || [])
      .map(s => (s || '').replace(/["“”]+/g, '').trim())
      .filter(s => s.length > 0 && !banned.test(s) && !/[?]/.test(s))
      .map(s => s.replace(/[.!?]+$/g, '')) // remove trailing punctuation
      .map(s => s.replace(/\s+/g, ' ').trim())
      .filter(s => {
        const wc = s.split(' ').filter(Boolean).length;
        return wc >= 8 && wc <= 15; // keep moderate length
      });
  };

  const speakingSentences = React.useMemo(() => sanitizeSpeakingSentences(prompts.speakingSentences), [prompts.speakingSentences]);

  // Timer for overall test
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Self intro timers
  useEffect(() => {
    if (currentStep !== 0) return;
    if (introPrepTime > 0) {
      const prepTimer = setInterval(() => {
        setIntroPrepTime((prev) => prev > 0 ? prev - 1 : 0);
      }, 1000);
      return () => clearInterval(prepTimer);
    }
    if (introPrepTime === 0 && introSpeakingTime > 0 && isRecording) {
      const speakTimer = setInterval(() => {
        setIntroSpeakingTime((prev) => {
          if (prev === 1) stopRecording();
          return prev > 0 ? prev - 1 : 0;
        });
      }, 1000);
      return () => clearInterval(speakTimer);
    }
  }, [currentStep, introPrepTime, introSpeakingTime, isRecording]);

  // Speaking test timers
  useEffect(() => {
    if (currentStep !== 1) return;
    
    if (speakingPrepTime > 0) {
      const prepTimer = setInterval(() => {
        setSpeakingPrepTime((prev) => prev > 0 ? prev - 1 : 0);
      }, 1000);
      return () => clearInterval(prepTimer);
    }
  }, [currentStep, speakingPrepTime, currentSpeakingIndex]);

  // Speaking recording timer
  useEffect(() => {
    if (currentStep === 1 && speakingPrepTime === 0 && speakingRecordTime > 0 && isRecording) {
      const recordTimer = setInterval(() => {
        setSpeakingRecordTime((prev) => {
          if (prev === 1) stopRecording();
          return prev > 0 ? prev - 1 : 0;
        });
      }, 1000);
      return () => clearInterval(recordTimer);
    }
  }, [currentStep, speakingPrepTime, speakingRecordTime, isRecording]);

  // Listening test timers
  useEffect(() => {
    if (currentStep !== 2) return;
    if (audioPlayed && listeningRecordTime > 0 && isRecording) {
      const recordTimer = setInterval(() => {
        setListeningRecordTime((prev) => {
          if (prev === 1) stopRecording();
          return prev > 0 ? prev - 1 : 0;
        });
      }, 1000);
      return () => clearInterval(recordTimer);
    }
  }, [currentStep, audioPlayed, listeningRecordTime, isRecording]);

  // Recording logic with live transcription
  const startRecording = async (type: 'intro' | 'speaking' | 'listening') => {
    try {
      setRecordingError('');
      setIsRecording(true);
      
      // Clear live transcript at start
      if (type === 'intro') {
        setLiveTranscript('');
      } else if (type === 'speaking') {
        const newLiveTranscripts = [...liveSpeakingTranscripts];
        newLiveTranscripts[currentSpeakingIndex] = '';
        setLiveSpeakingTranscripts(newLiveTranscripts);
      } else if (type === 'listening') {
        const newLiveTranscripts = [...liveListeningTranscripts];
        newLiveTranscripts[currentListeningIndex] = '';
        setLiveListeningTranscripts(newLiveTranscripts);
      }

      // Start live recording with callback for real-time updates
      await speechService.startLiveRecording((transcript: string, isFinal: boolean) => {
        if (type === 'intro') {
          setLiveTranscript(transcript);
          if (isFinal) {
            setSelfIntroTranscript(transcript);
          }
        } else if (type === 'speaking') {
          const newLiveTranscripts = [...liveSpeakingTranscripts];
          newLiveTranscripts[currentSpeakingIndex] = transcript;
          setLiveSpeakingTranscripts(newLiveTranscripts);
          if (isFinal) {
            const newTranscripts = [...speakingTranscripts];
            newTranscripts[currentSpeakingIndex] = transcript;
            setSpeakingTranscripts(newTranscripts);
          }
        } else if (type === 'listening') {
          const newLiveTranscripts = [...liveListeningTranscripts];
          newLiveTranscripts[currentListeningIndex] = transcript;
          setLiveListeningTranscripts(newLiveTranscripts);
          if (isFinal) {
            const newTranscripts = [...listeningTranscripts];
            newTranscripts[currentListeningIndex] = transcript;
            setListeningTranscripts(newTranscripts);
          }
        }
      }, {
        // Enhance recognition for Indian English accents and better alternatives
        lang: 'en-IN',
        maxAlternatives: 5,
        continuous: true,
        interimResults: true,
      });
    } catch (error) {
      setRecordingError('Recording failed. Please try again.');
      setIsRecording(false);
    }
  };

  // Stop recording on unmount as a safety cleanup
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      } else {
        speechService.stopRecording();
      }
    };
  }, []);

  const stopRecording = () => {
    speechService.stopRecording();
    setIsRecording(false);
    
    // Update final transcripts from live transcripts
    if (currentStep === 0) {
      setSelfIntroTranscript(liveTranscript);
    } else if (currentStep === 1) {
      const newTranscripts = [...speakingTranscripts];
      newTranscripts[currentSpeakingIndex] = liveSpeakingTranscripts[currentSpeakingIndex] || '';
      setSpeakingTranscripts(newTranscripts);
    } else if (currentStep === 2) {
      const newTranscripts = [...listeningTranscripts];
      newTranscripts[currentListeningIndex] = liveListeningTranscripts[currentListeningIndex] || '';
      setListeningTranscripts(newTranscripts);
    }
  };

  // Audio play logic

  const playAudio = async (text: string) => {
    if (audioPlayed) return;
    ttsService.stop();
    await new Promise(resolve => setTimeout(resolve, 200));
    await ttsService.speak(text);
    setAudioPlayed(true);
  };

  // Section complete logic
  const handleComplete = () => {
    // Ensure we use the most current transcripts (including any live transcripts that haven't been finalized)
    const finalSelfIntro = selfIntroTranscript || liveTranscript;
    const finalSpeakingTranscripts = speakingTranscripts.map((transcript, index) => 
      transcript || liveSpeakingTranscripts[index] || ''
    );
    const finalListeningTranscripts = listeningTranscripts.map((transcript, index) => 
      transcript || liveListeningTranscripts[index] || ''
    );

    const result = ScoringService.scoreCommunication(
      finalSelfIntro,
      finalSpeakingTranscripts,
      finalListeningTranscripts,
      essay,
      prompts.listeningAudio,
      speakingSentences
    );
    result.speaking.sentences = speakingSentences;
    result.listening.audioFiles = prompts.listeningAudio;
    result.writing.topic = prompts.writingTopic;
    onComplete(result);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Add state for current question index per section
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Back button functionality
  const handlePrevious = () => {
    if (currentStep > 0) {
      // Ensure any ongoing recording is stopped before changing steps
      if (isRecording) {
        stopRecording();
      }
      setCurrentStep(prev => prev - 1);
      // Reset states for previous step
      if (currentStep === 1) {
        // Going back to self intro
        setIntroPrepTime(15);
        setIntroSpeakingTime(60);
      } else if (currentStep === 2) {
        // Going back to speaking test
        setSpeakingPrepTime(5);
        setSpeakingRecordTime(15);
        if (currentSpeakingIndex > 0) {
          setCurrentSpeakingIndex(prev => prev - 1);
        }
      } else if (currentStep === 3) {
        // Going back to listening test
        setListeningRecordTime(15);
        setAudioPlayed(false);
        if (currentListeningIndex > 0) {
          setCurrentListeningIndex(prev => prev - 1);
        }
      }
      setIsRecording(false);
    }
  };

  // Update handleNextStep to go to next question or next section
  const handleNextStep = () => {
    const currentQuestions = getQuestionsForCurrentStep(); // Helper to get questions for current step
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentQuestionIndex(0); // Reset for next section
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };

  // Helper to get questions for current step
  function getQuestionsForCurrentStep() {
    switch (steps[currentStep]) {
      case "Self Introduction":
        return selfIntroQuestions;
      case "Speaking Test":
        return speakingQuestions;
      case "Listening Test":
        return listeningQuestions;
      case "Writing Test":
        return writingQuestions;
      default:
        return [];
    }
  }

  // Example question arrays (replace with your actual data)
  const selfIntroQuestions = ["Tell us about yourself."];
  const speakingQuestions = ["Describe a challenge you overcame.", "What motivates you?"];
  // Listening questions: keep prompts short for <10s audio
  const listeningQuestions = [
    "Say: The sky is blue.",
    "Say: I like reading books.",
    "Say: Good morning!"
  ];
  const writingQuestions = ["Write about your favorite hobby."];

  // Self intro renderer
  const renderSelfIntroduction = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-yellow-400 mb-4">Self Introduction</h3>
        <p className="text-yellow-200">Please introduce yourself in 2-3 minutes. Talk about your background, skills, and career aspirations.</p>
        <p className="text-yellow-300 text-sm mt-2">(10 marks)</p>
      </div>
      <div className="bg-gray-700/50 rounded-xl p-6 text-center">
        {introPrepTime > 0 ? (
          <div className="mb-6">
            <h4 className="text-yellow-300 text-lg mb-2">Prepare your thoughts...</h4>
            <p className="text-yellow-200 text-xl">Starting in {introPrepTime} seconds</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (!isRecording && introPrepTime === 0) {
                    startRecording('intro');
                  } else if (isRecording) {
                    stopRecording();
                  }
                }}
                disabled={!speechService.isRecognitionSupported() || introPrepTime > 0}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
                  introPrepTime > 0 
                    ? 'bg-gray-600 opacity-50 cursor-not-allowed'
                    : isRecording 
                      ? 'bg-red-500 animate-pulse hover:bg-red-600' 
                      : 'bg-green-600 hover:bg-green-700'
                } ${!speechService.isRecognitionSupported() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isRecording ? <Square className="w-10 h-10 text-white" /> : <Mic className="w-10 h-10 text-white" />}
              </motion.button>
              <p className="text-yellow-300 mt-4">
                {introPrepTime > 0 ? `Prepare to speak... ${introPrepTime}s` : isRecording ? `Recording... (${introSpeakingTime}s left)` : 'Click to start recording'}
              </p>
              {!speechService.isRecognitionSupported() && (
                <p className="text-red-400 text-sm mt-2">Speech recognition not supported in this browser</p>
              )}
            </div>
            {recordingError && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                <p className="text-red-400 text-sm">{recordingError}</p>
              </div>
            )}
            <div className="bg-gray-800 rounded-lg p-4 mt-4">
              <h4 className="text-yellow-300 font-semibold mb-2">
                {isRecording ? 'Live Transcription:' : 'Your Introduction:'}
              </h4>
              <textarea
                className={`w-full bg-gray-900 text-yellow-100 rounded-lg p-3 border focus:outline-none resize-none ${
                  isRecording ? 'border-green-500/50 animate-pulse' : 'border-yellow-500/30'
                }`}
                value={isRecording ? liveTranscript : selfIntroTranscript}
                readOnly
                rows={6}
                aria-label="Recognized self introduction text (not editable)"
                placeholder={isRecording ? "Your speech will appear here in real-time..." : "Your recognized introduction will appear here..."}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-yellow-400 text-sm">
                  Word count: {(isRecording ? liveTranscript : selfIntroTranscript) ? (isRecording ? liveTranscript : selfIntroTranscript).split(' ').filter(w => w.length > 0).length : 0}
                </p>
                {isRecording && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-400 text-sm font-medium">LIVE</span>
                  </div>
                )}
              </div>
              <p className="text-yellow-200 text-xs mt-1">
                {isRecording ? 'Speaking in real-time - text updates as you speak' : 'This text is generated from your voice and cannot be edited.'}
              </p>
            </div>
          </>
        )}
      </div>
      <div className="flex justify-end mt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNextStep}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold"
        >
          {currentQuestionIndex < selfIntroQuestions.length - 1 ? "Next" : "Next Section"}
        </motion.button>
      </div>
    </motion.div>
  );

  const renderSpeakingTest = () => {
    const currentSentence = speakingSentences[currentSpeakingIndex];
    const isCompleted = currentSpeakingIndex >= speakingSentences.length;
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold text-yellow-400 mb-4">Speaking Test</h3>
          <p className="text-yellow-200">Read each simple sentence aloud clearly and naturally.</p>
          <p className="text-yellow-300 text-sm mt-2">(5 marks)</p>
        </div>
        {!isCompleted && currentSentence && (
          <div className="bg-gray-700/50 rounded-xl p-6">
            <p className="text-lg text-yellow-200 mb-4 text-center">Sentence {currentSpeakingIndex + 1} of {speakingSentences.length}</p>
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <p className="text-xl text-yellow-100 leading-relaxed text-center">"{currentSentence}"</p>
            </div>
            <div className="text-center space-y-4">
              {speakingPrepTime > 0 ? (
                <p className="text-yellow-300 text-lg">Prepare to speak... {speakingPrepTime}s</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-yellow-300 text-lg">
                    {speakingPrepTime > 0 ? `Prepare to speak... ${speakingPrepTime}s` : isRecording ? `Recording... ${speakingRecordTime}s` : 'Click to start recording'}
                  </p>
                </div>
              )}
              <motion.button 
                onClick={() => {
                  if (!isRecording && speakingPrepTime === 0) {
                    startRecording('speaking');
                  } else if (isRecording) {
                    stopRecording();
                  }
                }}
                disabled={speakingPrepTime > 0 || !speechService.isRecognitionSupported()}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                  speakingPrepTime > 0 
                    ? 'bg-gray-600 opacity-50 cursor-not-allowed'
                    : isRecording 
                      ? 'bg-red-500 animate-pulse hover:bg-red-600' 
                      : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isRecording ? <Square className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
              </motion.button>
              {!speechService.isRecognitionSupported() && (
                <p className="text-red-400 text-sm mt-2">Speech recognition not supported in this browser</p>
              )}
              {recordingError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                  <p className="text-red-400 text-sm">{recordingError}</p>
                </div>
              )}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-yellow-300 font-semibold mb-2">
                  {isRecording ? 'Live Transcription:' : 'You said:'}
                </h4>
                <textarea
                  className={`w-full bg-gray-900 text-yellow-100 rounded-lg p-3 border focus:outline-none resize-none ${
                    isRecording ? 'border-green-500/50 animate-pulse' : 'border-yellow-500/30'
                  }`}
                  value={isRecording ? (liveSpeakingTranscripts[currentSpeakingIndex] || '') : (speakingTranscripts[currentSpeakingIndex] || '')}
                  readOnly
                  rows={4}
                  aria-label="Recognized speaking test text (not editable)"
                  placeholder={isRecording ? "Your speech will appear here in real-time..." : "Your recognized speech will appear here..."}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-yellow-400 text-sm">
                    Word count: {(isRecording ? (liveSpeakingTranscripts[currentSpeakingIndex] || '') : (speakingTranscripts[currentSpeakingIndex] || '')).split(' ').filter(w => w.length > 0).length}
                  </p>
                  {isRecording && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-400 text-sm font-medium">LIVE</span>
                    </div>
                  )}
                </div>
                <p className="text-yellow-200 text-xs mt-1">
                  {isRecording ? 'Speaking in real-time - text updates as you speak' : 'This text is generated from your voice and cannot be edited.'}
                </p>
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }} 
                  onClick={() => {
                    // If recording is in progress, stop it
                    if (isRecording) {
                      stopRecording();
                    }
                    
                    // If this is the last sentence, move to next section
                    if (currentSpeakingIndex === speakingSentences.length - 1) {
                      setCurrentStep(prev => prev + 1);
                    } else {
                      // Otherwise, move to next sentence
                      setCurrentSpeakingIndex(prev => prev + 1);
                      setSpeakingPrepTime(5);
                      setSpeakingRecordTime(15);
                    }
                  }} 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mt-3"
                >
                  {currentSpeakingIndex === speakingSentences.length - 1 ? "Next Section" : "Next Sentence"}
                </motion.button>
              </div>
            </div>
          </div>
        )}
        {isCompleted && (
          <div className="text-center text-yellow-300 bg-gray-700/50 rounded-xl p-6">
            <h4 className="text-xl font-semibold mb-4">Speaking Test Completed!</h4>
            <p>All {speakingSentences.length} sentences recorded successfully.</p>
          </div>
        )}
      </motion.div>
    );
  };

  const renderListeningTest = () => {
    const currentAudio = prompts.listeningAudio[currentListeningIndex];
    const isCompleted = currentListeningIndex >= prompts.listeningAudio.length;
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold text-yellow-400 mb-4">Listening Test</h3>
          <p className="text-yellow-200">Listen to the audio and repeat the sentences as accurately as possible.</p>
          <p className="text-yellow-300 text-sm mt-2">(5 marks)</p>
        </div>
        {!isCompleted && currentAudio && (
          <div className="bg-gray-700/50 rounded-xl p-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-lg text-yellow-200">Audio {currentListeningIndex + 1} of {prompts.listeningAudio.length}</p>
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }} 
                  onClick={() => playAudio(currentAudio)} 
                  disabled={isRecording || audioPlayed} 
                  className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors font-semibold ${
                    isRecording || audioPlayed ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 text-black'
                  }`}
                >
                  <Volume2 className="w-5 h-5" />
                  {isRecording ? 'Recording...' : audioPlayed ? 'Audio Played' : 'Play Audio'}
                </motion.button>
              </div>
            </div>
            <div className="text-center space-y-4">
              <p className="text-yellow-300 text-lg">
                {!audioPlayed ? 'Play audio first' : isRecording ? `Recording... ${listeningRecordTime}s` : 'Click to start recording'}
              </p>
              <motion.button 
                onClick={() => {
                  if (!isRecording && audioPlayed) {
                    startRecording('listening');
                  } else if (isRecording) {
                    stopRecording();
                  }
                }}
                disabled={!audioPlayed || !speechService.isRecognitionSupported()}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                  !audioPlayed 
                    ? 'bg-gray-600 opacity-50 cursor-not-allowed'
                    : isRecording 
                      ? 'bg-red-500 animate-pulse hover:bg-red-600' 
                      : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isRecording ? <Square className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
              </motion.button>
              {!speechService.isRecognitionSupported() && (
                <p className="text-red-400 text-sm mt-2">Speech recognition not supported in this browser</p>
              )}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-yellow-300 font-semibold mb-2">
                  {isRecording ? 'Live Transcription:' : 'You said:'}
                </h4>
                <textarea
                  className={`w-full bg-gray-900 text-yellow-100 rounded-lg p-3 border focus:outline-none resize-none ${
                    isRecording ? 'border-green-500/50 animate-pulse' : 'border-yellow-500/30'
                  }`}
                  value={isRecording ? (liveListeningTranscripts[currentListeningIndex] || '') : (listeningTranscripts[currentListeningIndex] || '')}
                  readOnly
                  rows={4}
                  aria-label="Recognized listening test text (not editable)"
                  placeholder={isRecording ? "Your speech will appear here in real-time..." : "Your recognized speech will appear here..."}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-yellow-400 text-sm">
                    Word count: {(isRecording ? (liveListeningTranscripts[currentListeningIndex] || '') : (listeningTranscripts[currentListeningIndex] || '')).split(' ').filter(w => w.length > 0).length}
                  </p>
                  {isRecording && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-400 text-sm font-medium">LIVE</span>
                    </div>
                  )}
                </div>
                <p className="text-yellow-200 text-xs mt-1">
                  {isRecording ? 'Speaking in real-time - text updates as you speak' : 'This text is generated from your voice and cannot be edited.'}
                </p>
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }} 
                  onClick={() => {
                    // If recording is in progress, stop it
                    if (isRecording) {
                      stopRecording();
                    }
                    
                    // If this is the last audio, move to next section
                    if (currentListeningIndex === prompts.listeningAudio.length - 1) {
                      setCurrentStep(prev => prev + 1);
                    } else {
                      // Otherwise, move to next audio
                      setCurrentListeningIndex(prev => prev + 1);
                      setAudioPlayed(false);
                      setListeningRecordTime(15);
                    }
                  }} 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mt-3"
                >
                  {currentListeningIndex === prompts.listeningAudio.length - 1 ? "Next Section" : "Next Audio"}
                </motion.button>
              </div>
            </div>
          </div>
        )}
        {isCompleted && (
          <div className="text-center text-yellow-300 bg-gray-700/50 rounded-xl p-6">
            <h4 className="text-xl font-semibold mb-4">Listening Test Completed!</h4>
            <p>All {prompts.listeningAudio.length} audio clips completed successfully.</p>
          </div>
        )}
      </motion.div>
    );
  };

  const renderWritingTest = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-yellow-400 mb-4">Writing Test</h3>
        <p className="text-yellow-200">Write a paragraph of 150-200 words on the given topic.</p>
        <p className="text-yellow-300 text-sm mt-2">(10 marks)</p>
      </div>
      <div className="bg-gray-700/50 rounded-xl p-6">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <p className="text-lg text-yellow-100 leading-relaxed">
            <FileText className="w-5 h-5 inline mr-2" />
            {prompts.writingTopic}
          </p>
        </div>
        <textarea
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          onPaste={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
          onDragOver={(e) => e.preventDefault()}
          placeholder="Write your essay here... (Copy/Paste disabled)"
          className="w-full h-64 bg-gray-800 text-yellow-200 rounded-lg p-4 border border-yellow-500/30 focus:border-yellow-500 focus:outline-none resize-none"
        />
        <div className="flex justify-between mt-4 text-sm">
          <span className={`${essay.split(' ').filter(word => word.length > 0).length >= 150 ? 'text-green-400' : 'text-yellow-300'}`}>Word count: {essay.split(' ').filter(word => word.length > 0).length}</span>
          <span className="text-yellow-300">Target: 150-200 words</span>
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNextStep}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold"
        >
          {currentQuestionIndex < writingQuestions.length - 1 ? "Next" : "Finish"}
        </motion.button>
      </div>
    </motion.div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              {/* Back Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 ${
                  currentStep > 0
                    ? 'bg-gray-600 hover:bg-gray-500 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </motion.button>
              <h1 className="text-2xl font-bold text-yellow-400">Communication Assessment</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-yellow-300">
                <Clock className="w-5 h-5" />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-yellow-500 text-black`}>{index + 1}</div>
                {index < steps.length - 1 && <div className="w-8 h-1 bg-yellow-400 mx-2 rounded" />}
              </div>
            ))}
          </div>
        </motion.div>
        {/* Section rendering */}
        {currentStep === 0 && renderSelfIntroduction()}
        {currentStep === 1 && renderSpeakingTest()}
        {currentStep === 2 && renderListeningTest()}
        {currentStep === 3 && renderWritingTest()}
      </div>
    </div>
  );
}