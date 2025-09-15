export class TTSService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices() {
    // Load voices immediately if available
    this.voices = this.synth.getVoices();
    
    // If voices aren't loaded yet, wait for the event
    if (this.voices.length === 0) {
      this.synth.addEventListener('voiceschanged', () => {
        this.voices = this.synth.getVoices();
        this.isInitialized = true;
      });
    } else {
      this.isInitialized = true;
    }
  }

  async speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Cancel any ongoing speech first
        this.stop();

        // Wait a bit to ensure previous speech is stopped
        setTimeout(() => {
          try {
            this.currentUtterance = new SpeechSynthesisUtterance(text);
            
            // Find a good English voice
            const englishVoice = this.voices.find(voice => 
              voice.lang.startsWith('en') && voice.localService
            ) || this.voices.find(voice => voice.lang.startsWith('en'));

            if (englishVoice) {
              this.currentUtterance.voice = englishVoice;
            }

            // Set speech parameters
            this.currentUtterance.rate = 0.9;
            this.currentUtterance.pitch = 1;
            this.currentUtterance.volume = 1;

            // Set up event handlers
            this.currentUtterance.onstart = () => {
              console.log('Speech started');
            };

            this.currentUtterance.onend = () => {
              console.log('Speech ended');
              this.currentUtterance = null;
              resolve();
            };
            
            this.currentUtterance.onerror = (error) => {
              console.error('TTS Error:', error);
              this.currentUtterance = null;
              
              // Don't reject on 'interrupted' error, just resolve
              if (error.error === 'interrupted') {
                resolve();
              } else {
                reject(error);
              }
            };

            this.currentUtterance.onpause = () => {
              console.log('Speech paused');
            };

            this.currentUtterance.onresume = () => {
              console.log('Speech resumed');
            };

            // Start speaking
            this.synth.speak(this.currentUtterance);

          } catch (error) {
            console.error('Error creating utterance:', error);
            reject(error);
          }
        }, 100);

      } catch (error) {
        console.error('TTS Error:', error);
        reject(error);
      }
    });
  }

  stop() {
    try {
      if (this.synth.speaking || this.synth.pending) {
        this.synth.cancel();
      }
      this.currentUtterance = null;
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }

  pause() {
    try {
      if (this.synth.speaking) {
        this.synth.pause();
      }
    } catch (error) {
      console.error('Error pausing speech:', error);
    }
  }

  resume() {
    try {
      if (this.synth.paused) {
        this.synth.resume();
      }
    } catch (error) {
      console.error('Error resuming speech:', error);
    }
  }

  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  isSpeaking(): boolean {
    return this.synth.speaking;
  }

  isPaused(): boolean {
    return this.synth.paused;
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }
}

export const ttsService = new TTSService();