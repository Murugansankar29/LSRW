interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare const webkitSpeechRecognition: {
  new (): SpeechRecognition;
};

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean;
  private onTranscriptUpdate: ((transcript: string, isFinal: boolean) => void) | null = null;
  private config = {
    lang: 'en-IN',
    maxAlternatives: 3,
    continuous: true,
    interimResults: true,
  };

  constructor() {
    // Check for browser support
    this.isSupported = typeof window !== 'undefined' && !!(window as any).webkitSpeechRecognition;
    
    if (this.isSupported) {
      this.recognition = new webkitSpeechRecognition();
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    // Use an accent-friendly default. Adjust if needed.
    this.recognition.lang = this.config.lang;
    // Consider multiple alternatives to better handle fast speech and accent variation
    this.recognition.maxAlternatives = this.config.maxAlternatives;
  }

  private finalTranscript = '';
  private interimTranscript = '';
  private isCurrentlyRecording = false;

  // Allow runtime configuration overrides for a session
  configure(options: Partial<{ lang: string; maxAlternatives: number; continuous: boolean; interimResults: boolean }>) {
    this.config = { ...this.config, ...options };
    if (this.recognition) {
      this.setupRecognition();
    }
  }

  // New method for live transcription with callback
  startLiveRecording(onTranscriptUpdate: (transcript: string, isFinal: boolean) => void, options?: Partial<{ lang: string; maxAlternatives: number; continuous: boolean; interimResults: boolean }>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition || !this.isSupported) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      // Apply per-session overrides if provided
      if (options) {
        this.configure(options);
      }

      this.finalTranscript = '';
      this.interimTranscript = '';
      this.isCurrentlyRecording = true;
      this.onTranscriptUpdate = onTranscriptUpdate;

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = this.finalTranscript;
        let lastInterimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          // Choose the alternative with the highest confidence
          let bestAlt: SpeechRecognitionAlternative | null = null;
          for (let j = 0; j < res.length; j++) {
            const alt = res[j];
            if (!bestAlt || (alt.confidence ?? 0) > (bestAlt.confidence ?? 0)) {
              bestAlt = alt;
            }
          }
          const bestTranscript = (bestAlt?.transcript || '').trim();

          if (res.isFinal) {
            if (bestTranscript) finalTranscript += bestTranscript + ' ';
          } else {
            // Avoid repeating the same interim chunk to reduce jitter
            if (bestTranscript && bestTranscript !== lastInterimChunk) {
              interimTranscript = bestTranscript;
              lastInterimChunk = bestTranscript;
            }
          }
        }

        this.finalTranscript = finalTranscript;
        this.interimTranscript = interimTranscript;

        // Call the callback with the combined transcript
        const fullTranscript = (finalTranscript + interimTranscript).trim();
        this.onTranscriptUpdate?.(fullTranscript, false);
      };

      this.recognition.onend = () => {
        // Restart recognition if we're still supposed to be recording
        if (this.isCurrentlyRecording) {
          try {
            this.recognition?.start();
          } catch (error) {
            // Handle restart errors gracefully
            console.warn('Failed to restart recognition:', error);
          }
        } else {
          // Send final transcript when recording stops
          this.onTranscriptUpdate?.(this.finalTranscript.trim(), true);
          resolve();
        }
      };

      this.recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
          // Ignore no-speech error and continue recording
          if (this.isCurrentlyRecording) {
            try {
              this.recognition?.start();
            } catch (error) {
              console.warn('Failed to restart after no-speech:', error);
            }
          }
        } else if (event.error === 'aborted') {
          // Handle aborted error gracefully
          resolve();
        } else {
          reject(new Error(`Speech recognition error: ${event.error}`));
        }
      };

      try {
        this.recognition.start();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Legacy method for backward compatibility
  async startRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition || !this.isSupported) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      this.finalTranscript = '';
      this.isCurrentlyRecording = true;

      this.recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            this.finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
      };

      this.recognition.onend = () => {
        // Restart recognition if we're still supposed to be recording
        if (this.isCurrentlyRecording) {
          this.recognition?.start();
        } else {
          resolve(this.finalTranscript.trim());
        }
      };

      this.recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
          // Ignore no-speech error and continue recording
          if (this.isCurrentlyRecording) {
            this.recognition?.start();
          }
        } else {
          reject(new Error(`Speech recognition error: ${event.error}`));
        }
      };

      try {
        this.recognition.start();
      } catch (error) {
        reject(error);
      }
    });
  }

  stopRecording() {
    this.isCurrentlyRecording = false;
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  getCurrentTranscript(): string {
    return (this.finalTranscript + this.interimTranscript).trim();
  }

  getFinalTranscript(): string {
    return this.finalTranscript.trim();
  }

  isRecognitionSupported(): boolean {
    return this.isSupported;
  }
}

export const speechService = new SpeechRecognitionService();