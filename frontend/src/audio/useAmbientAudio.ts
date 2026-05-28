import { useCallback, useRef, useState } from "react";

type AudioGraph = {
  context: AudioContext;
  cleanup: () => void;
  musicElement?: HTMLAudioElement;
  mediaSource?: MediaElementAudioSourceNode;
};

type WindowWithWebAudio = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

export function useAmbientAudio() {
  const [isAmbientOn, setIsAmbientOn] = useState(false);
  const graphRef = useRef<AudioGraph | null>(null);
  const musicPath = "/bgm/Cold Interrogation.mp3";

  const stopAmbient = useCallback(() => {
    const graph = graphRef.current;

    if (!graph) {
      return;
    }

    graph.cleanup();
    graphRef.current = null;
    setIsAmbientOn(false);
  }, []);

  const startAmbient = useCallback(async () => {
    if (graphRef.current) {
      return;
    }

    const AudioContextConstructor =
      window.AudioContext || (window as WindowWithWebAudio).webkitAudioContext;

    if (!AudioContextConstructor) {
      return;
    }

    const context = new AudioContextConstructor();
    await context.resume();

    const master = context.createGain();
    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.045, context.currentTime + 1.2);
    master.connect(context.destination);

    const lowDrone = createOscillator(context, "sine", 42);
    const secondDrone = createOscillator(context, "triangle", 57);
    const droneGain = context.createGain();
    droneGain.gain.value = 0.16;

    lowDrone.connect(droneGain);
    secondDrone.connect(droneGain);
    droneGain.connect(master);

    const noise = createNoiseSource(context);
    const highpass = context.createBiquadFilter();
    const lowpass = context.createBiquadFilter();
    const noiseGain = context.createGain();

    highpass.type = "highpass";
    highpass.frequency.value = 90;
    lowpass.type = "lowpass";
    lowpass.frequency.value = 620;
    lowpass.Q.value = 0.8;
    noiseGain.gain.value = 0.018;

    noise.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(noiseGain);
    noiseGain.connect(master);

    const lfo = createOscillator(context, "sine", 0.075);
    const lfoGain = context.createGain();
    lfoGain.gain.value = 0.012;
    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);

    lowDrone.start();
    secondDrone.start();
    noise.start();
    lfo.start();

    // Create and play background music (looped) at full volume, routed through the same master gain
    let musicElement: HTMLAudioElement | undefined;
    let mediaSource: MediaElementAudioSourceNode | undefined;
    try {
      musicElement = new Audio(musicPath);
      musicElement.loop = true;
      musicElement.volume = 1; // máximo

      // connect via WebAudio so master gain affects it
      mediaSource = context.createMediaElementSource(musicElement);
      mediaSource.connect(master);

      // play; browsers require a user gesture for autoplay — this will succeed when toggle is used
      void musicElement.play().catch(() => {
        // ignore play errors (autoplay blocked); user can press the toggle to start
      });
    }
    catch (err) {
      musicElement = undefined;
      mediaSource = undefined;
    }

    graphRef.current = {
      context,
      musicElement,
      mediaSource,
      cleanup: () => {
        const stopAt = context.currentTime + 0.35;
        lfoGain.gain.setValueAtTime(0, context.currentTime);
        master.gain.cancelScheduledValues(context.currentTime);
        master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), context.currentTime);
        master.gain.exponentialRampToValueAtTime(0.0001, stopAt);

        window.setTimeout(() => {
          lowDrone.stop();
          secondDrone.stop();
          noise.stop();
          lfo.stop();

          // stop and cleanup music element
          try {
            if (musicElement) {
              musicElement.pause();
              musicElement.currentTime = 0;
              if (mediaSource) {
                mediaSource.disconnect();
              }
              musicElement.src = "";
            }
          }
          catch (e) {
            // ignore
          }

          void context.close();
        }, 420);
      }
    };

    setIsAmbientOn(true);
  }, []);

  const toggleAmbient = useCallback(() => {
    if (graphRef.current) {
      stopAmbient();
      return;
    }

    void startAmbient();
  }, [startAmbient, stopAmbient]);

  return { isAmbientOn, toggleAmbient };
}

function createOscillator(
  context: AudioContext,
  type: OscillatorType,
  frequency: number
) {
  const oscillator = context.createOscillator();
  oscillator.type = type;
  oscillator.frequency.value = frequency;

  return oscillator;
}

function createNoiseSource(context: AudioContext) {
  const bufferSize = context.sampleRate * 2;
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < bufferSize; index += 1) {
    data[index] = (Math.random() * 2 - 1) * 0.32;
  }

  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  return source;
}
