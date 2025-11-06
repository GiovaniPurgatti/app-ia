import React, { useState, useEffect, useRef } from "react";
import { View, Alert } from "react-native";
import axios from "axios";
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
  useAudioPlayer,
} from "expo-audio";
import { IconButton } from "react-native-paper";
import SiriSphere from "@/components/AIIcon";
import { Directory, File, Paths } from "expo-file-system";

export default function VoiceTestScreen() {
  const [isActive, setIsActive] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const player = useAudioPlayer(); // ✅ Usar o hook do player
  const audioSetupDone = useRef(false);

  async function enviarAudio(uri: string) {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "gravacao.m4a",
        type: "audio/m4a",
      } as any);

      const response = await axios.post(
        "http://192.168.103.31:8000/ai",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Descrição do áudio:", response.data);
      console.log("URL do áudio:", response.data.audio_url);

      const audioUrl = response.data.audio_url;
      const audioDir = new Directory(Paths.cache, "audio");

      let output;
      try {
        if (!audioDir.exists) {
          await audioDir.create();
        }
        
        const fileName = `response_${Date.now()}.wav`;
        const outputFile = new File(audioDir, fileName);
        
        if (outputFile.exists) {
          await outputFile.delete();
        }
        
        output = await File.downloadFileAsync(audioUrl, outputFile);
        console.log("Arquivo existe:", output.exists);
        console.log("URI do arquivo:", output.uri);

        if (!output.exists) {
          throw new Error("Arquivo não foi baixado corretamente");
        }

        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: false, 
        });

        player.replace(output.uri);
        await player.play();
        
        console.log("Áudio começou a tocar");
      } catch (error) {
        console.error("Erro no download/reprodução:", error);
        Alert.alert("Erro", "Não foi possível reproduzir o áudio");
      }
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
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      await audioRecorder.prepareToRecordAsync();
      await audioRecorder.record();
      console.log("Gravação iniciada");
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
        Alert.alert("Erro", "URI do áudio não disponível");
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
          Alert.alert("Permissão negada", "Permissão para acessar o microfone foi negada");
          return;
        }

        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });

        audioSetupDone.current = true;
        setIsAudioReady(true);
        console.log("Setup de áudio concluído");
      } catch (error) {
        console.error("Erro ao configurar áudio:", error);
        Alert.alert("Erro", "Não foi possível configurar o áudio");
      }
    })();
  }, []);

  useEffect(() => {
    return () => {
      if (player) {
        player.remove();
      }
    };
  }, [player]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <SiriSphere speaking={isActive || player.playing} />

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