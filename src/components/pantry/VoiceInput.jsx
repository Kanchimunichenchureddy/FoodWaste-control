import React, { useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

const VoiceInput = ({ onResult, isListening, setIsListening }) => {
    useEffect(() => {
        // Check if browser supports Web Speech API
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported in this browser');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        if (isListening) {
            recognition.start();
        } else {
            recognition.stop();
        }

        return () => {
            recognition.stop();
        };
    }, [isListening, onResult, setIsListening]);

    const toggleListening = () => {
        setIsListening(!isListening);
    };

    // Check browser support
    const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

    if (!isSupported) {
        return null; // Don't render if not supported
    }

    return (
        <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-xl transition-all ${isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
        >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
    );
};

export default VoiceInput;
