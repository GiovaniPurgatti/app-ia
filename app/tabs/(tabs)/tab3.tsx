import React, { useState, useEffect, useRef } from "react";
import { View, Alert } from "react-native";
import axios from "axios";
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
} from "expo-audio";
import { IconButton } from "react-native-paper";
import SiriSphere from '@/components/AIIcon'
export default function VoiceTestScreen() {
  const [isActive, setIsActive] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const audioSetupDone = useRef(false);

  async function enviarAudio(uri: string) {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "gravacao.m4a",
        type: "audio/m4a",
      } as any);

      const response = await axios.post("http://<API>:PORT/ROUTE", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      Alert.alert("Áudio processado com sucesso!");

      console.log("Descrição do áudio:", response.data.description);
    } catch (error: any) {
      Alert.alert("Erro ao processar áudio na API!");
      console.error("Erro ao enviar o áudio:", error.response?.data || error);
    }
  }

  const record = async () => {
    if (!isAudioReady) {
      Alert.alert("Aguarde", "Configurando áudio...");
      return;
    }

    try {
      await audioRecorder.prepareToRecordAsync();
      await audioRecorder.record();
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
      Alert.alert("Erro ao iniciar gravação");
      setIsActive(false);
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      console.log("Arquivo salvo em:", audioRecorder.uri);
      if (audioRecorder.uri) {
        await enviarAudio(audioRecorder.uri);
      } else {
        Alert.alert("Erro ao salvar áudio!");
      }
    } catch (error) {
      console.error("Erro ao parar gravação:", error);
      Alert.alert("Erro ao parar gravação");
    }
  };

  useEffect(() => {
    if (audioSetupDone.current) return;

    (async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (!status.granted) {
          Alert.alert("Permissão para acessar o microfone foi negada");
          return;
        }

        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });

        audioSetupDone.current = true;
        setIsAudioReady(true); // ✅ Sinaliza que está pronto
      } catch (error) {
        console.error("Erro ao configurar áudio:", error);
      }
    })();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <SiriSphere speaking={isActive} />

      <View style={{ marginTop: 40, marginBottom: 30 }}>
        <IconButton
          icon={recorderState.isRecording ? "microphone-off" : "microphone"}
          size={32}
          mode="contained"
          disabled={!isAudioReady && !recorderState.isRecording}
          onPress={() => {
            if (recorderState.isRecording) {
              stopRecording();
              setIsActive(false);
            } else {
              setIsActive(true);
              record();
            }
          }}
        />
      </View>
    </View>
  );
}