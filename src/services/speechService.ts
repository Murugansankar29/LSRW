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

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;
  }

  private finalTranscript = '';
  private interimTranscript = '';
  private isCurrentlyRecording = false;

  // New method for live transcription with callback
  startLiveRecording(onTranscriptUpdate: (transcript: string, isFinal: boolean) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition || !this.isSupported) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      this.finalTranscript = '';
      this.interimTranscript = '';
      this.isCurrentlyRecording = true;
      this.onTranscriptUpdate = onTranscriptUpdate;

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = this.finalTranscript;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
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