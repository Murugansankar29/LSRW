import React, { useState, useEffect } from 'react';
// Predefined pool of 100 valid sentences (12-15 words)
const PREDEFINED_SPEAKING_SENTENCES = [
  "Effective communication helps teams deliver projects on time and maintain high quality standards throughout development",
  "Engineers who update their skills regularly can solve complex problems and adapt to new industry trends quickly",
  "A successful product launch requires careful planning, thorough testing, and clear documentation from every team member",
  "Collaborative brainstorming sessions often lead to innovative solutions that benefit the entire organization and its goals",
  "User feedback helps engineers improve software features and address potential issues before they become major obstacles",
  "Project managers coordinate resources and schedules to ensure that all deliverables are completed within the agreed timeline",
  "Continuous learning and professional development are essential for engineers to stay competitive in a rapidly changing industry",
  "Clear documentation allows new team members to understand the system architecture and contribute effectively from the start",
  "Regular team meetings provide opportunities to discuss progress, address challenges, and celebrate recent achievements together",
  "Testing software thoroughly before release helps prevent bugs and ensures a positive experience for all end users involved",
  "Engineers must balance technical requirements with business goals to deliver solutions that meet both user needs and company objectives",
  "Mentoring junior engineers helps build a strong team culture and accelerates the professional growth of everyone involved",
  "Effective time management allows engineers to prioritize tasks and meet project deadlines without sacrificing quality or accuracy",
  "Cross-functional teams bring together diverse skills and perspectives to solve complex problems more efficiently and creatively",
  "Automating repetitive tasks frees up time for engineers to focus on more challenging and rewarding aspects of their work",
  "Regular code reviews help maintain high standards, catch potential issues early, and promote knowledge sharing among team members",
  "Engineers who communicate clearly with stakeholders can better understand requirements and deliver solutions that exceed expectations",
  "A positive work environment encourages collaboration, innovation, and continuous improvement across all levels of the organization",
  "Learning from past project experiences helps teams avoid repeating mistakes and improve their processes for future success",
  "Engineers often use version control systems to track changes, collaborate with others, and maintain a reliable codebase",
  "Setting clear goals and milestones helps teams measure progress and stay motivated throughout the duration of a project",
  "Participating in industry conferences and workshops allows engineers to learn about new technologies and best practices",
  "Effective problem-solving requires both analytical thinking and creativity to develop practical and innovative solutions",
  "Engineers must consider security and privacy concerns when designing systems that handle sensitive user data or financial information",
  "Providing constructive feedback helps team members grow professionally and contributes to a culture of continuous improvement",
  "Engineers who document their work thoroughly make it easier for others to maintain and extend the system in the future",
  "Collaboration between engineers and designers ensures that products are both functional and visually appealing to end users",
  "Engineers often participate in code sprints to rapidly develop and test new features for upcoming software releases",
  "A well-organized workspace can improve focus, productivity, and overall job satisfaction for engineers and other professionals",
  "Engineers who stay curious and open to new ideas are more likely to drive innovation within their teams and organizations",
  "Regularly updating project documentation helps keep everyone informed about changes and reduces confusion during development",
  "Engineers must be adaptable and willing to learn new tools and technologies as industry standards evolve over time",
  "Participating in peer code reviews helps engineers learn from each other and maintain consistent coding standards",
  "Engineers who communicate project risks early can help teams develop contingency plans and avoid potential setbacks",
  "A strong sense of ownership motivates engineers to deliver high-quality work and take pride in their contributions",
  "Engineers often use agile methodologies to manage projects, prioritize tasks, and respond quickly to changing requirements",
  "Continuous integration and deployment practices help teams deliver updates to users more frequently and with greater confidence",
  "Engineers who seek feedback from users can identify areas for improvement and deliver more valuable solutions",
  "A diverse team brings together unique perspectives that can lead to more creative and effective problem-solving",
  "Engineers must balance short-term project needs with long-term system maintainability and scalability goals",
  "Participating in hackathons allows engineers to experiment with new ideas and technologies in a fast-paced environment",
  "Engineers who mentor others help build a supportive and knowledgeable team culture",
  "Regularly scheduled breaks can improve focus and prevent burnout during long periods of intense work",
  "Engineers often collaborate with product managers to define requirements and ensure alignment with business objectives",
  "A clear project roadmap helps teams stay organized and track progress toward key milestones",
  "Engineers who embrace change are better equipped to handle unexpected challenges and adapt to new situations",
  "Effective delegation allows team leads to distribute tasks according to each member's strengths and expertise",
  "Engineers who participate in open-source projects can learn from others and contribute to the broader technology community",
  "A strong professional network provides engineers with valuable resources and support throughout their careers",
  "Engineers who practice active listening can better understand stakeholder needs and deliver more effective solutions",
  "Regularly updating technical skills helps engineers remain competitive in a rapidly evolving job market",
  "Engineers who take initiative often identify opportunities for improvement and drive positive change within their teams",
  "A well-documented onboarding process helps new engineers become productive more quickly and with less frustration",
  "Engineers who value diversity and inclusion contribute to a more innovative and welcoming workplace",
  "Participating in team-building activities can strengthen relationships and improve collaboration among engineers",
  "Engineers who communicate project updates clearly help keep stakeholders informed and engaged throughout development",
  "A strong focus on quality assurance helps engineers deliver reliable and user-friendly products",
  "Engineers who are open to feedback can continuously improve their skills and performance over time",
  "Regularly scheduled team retrospectives provide opportunities to reflect on successes and identify areas for growth",
  "Engineers who stay organized can manage multiple projects and deadlines more effectively",
  "A positive attitude helps engineers overcome challenges and maintain motivation during difficult projects",
  "Engineers who participate in professional organizations can access valuable resources and networking opportunities",
  "Regularly reviewing project goals helps teams stay aligned and focused on delivering value to users",
  "Engineers who document lessons learned can help future teams avoid common pitfalls and improve project outcomes",
  "A strong commitment to ethical standards helps engineers build trust with users and stakeholders",
  "Engineers who collaborate with cross-functional teams can deliver more comprehensive and effective solutions",
  "Regularly updating system documentation helps ensure that knowledge is preserved and accessible to all team members",
  "Engineers who seek out mentorship can accelerate their professional growth and development",
  "A focus on continuous improvement helps engineers deliver better results with each new project",
  "Engineers who participate in training programs can learn new skills and stay current with industry trends",
  "Regularly scheduled one-on-one meetings help managers support the growth and well-being of their engineers",
  "Engineers who contribute to knowledge sharing help build a stronger and more capable team",
  "A strong sense of curiosity drives engineers to explore new technologies and approaches",
  "Engineers who communicate effectively with non-technical stakeholders can bridge gaps and ensure project success",
  "Regularly updating personal development plans helps engineers set and achieve meaningful career goals",
  "Engineers who participate in design reviews can help ensure that solutions are both functional and user-friendly",
  "A commitment to lifelong learning helps engineers remain adaptable and resilient in a changing industry",
  "Engineers who practice empathy can better understand the needs and perspectives of their colleagues and users",
  "Regularly scheduled team check-ins help maintain alignment and address issues before they escalate",
  "Engineers who take responsibility for their work build trust and credibility with their teams",
  "A focus on user experience helps engineers deliver products that are both effective and enjoyable to use",
  "Engineers who participate in community events can expand their networks and learn from others in the field",
  "Regularly updating project timelines helps teams manage expectations and deliver on commitments",
  "Engineers who embrace feedback can turn challenges into opportunities for growth and improvement",
  "A strong sense of purpose motivates engineers to pursue excellence in their work",
  "Engineers who collaborate with external partners can access new resources and expertise",
  "Regularly reviewing code quality helps maintain high standards and prevent technical debt",
  "Engineers who participate in brainstorming sessions can generate creative solutions to complex problems",
  "A commitment to transparency helps engineers build trust with users and stakeholders",
  "Engineers who stay informed about industry trends can anticipate changes and adapt their strategies accordingly",
  "Regularly scheduled knowledge sharing sessions help teams stay up to date and aligned",
  "Engineers who value open communication can resolve conflicts and build stronger working relationships",
  "A focus on sustainability helps engineers design solutions that are environmentally responsible and efficient",
  "Engineers who participate in cross-training can develop new skills and increase their versatility",
  "Regularly updating technical documentation helps ensure that systems are maintainable and scalable",
  "Engineers who seek out challenging projects can accelerate their learning and career growth",
  "A strong sense of accountability helps engineers deliver on their commitments and build trust with others",
  "Engineers who participate in user research can deliver solutions that better meet customer needs",
  "Regularly scheduled project reviews help teams celebrate successes and identify areas for improvement",
  "Engineers who practice mindfulness can improve focus, reduce stress, and enhance overall well-being",
  "A commitment to diversity and inclusion helps engineers create more innovative and effective solutions",
  "Engineers who participate in technical communities can learn from others and share their own expertise",
  "Regularly updating skills and certifications helps engineers remain competitive in the job market",
  "Engineers who communicate project requirements clearly can help ensure successful outcomes for all stakeholders"
];
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
  return wc >= 12 && wc <= 15; // allow 12-15 words
      });
  };

  const speakingSentences = React.useMemo(() => {
    let sanitized = sanitizeSpeakingSentences(prompts.speakingSentences);
    if (sanitized.length === 0) {
      // Randomly select 5 from the predefined pool
      const shuffled = PREDEFINED_SPEAKING_SENTENCES.sort(() => 0.5 - Math.random());
      sanitized = shuffled.slice(0, 5);
    }
    return sanitized;
  }, [prompts.speakingSentences]);

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