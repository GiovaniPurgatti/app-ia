import AIIcon from "@/components/AIIcon";
import React, { useState } from "react";
import { View, Button } from "react-native";

export default function VoiceTestScreen() {
  const [isActive, setIsActive] = useState(false);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <AIIcon speaking={isActive}/>

      <View style={{ marginTop: 40, marginBottom:30 }}>
        <Button
          title={isActive ? "Parar" : "Ativar Animação"}
          onPress={() => setIsActive(!isActive)}
        />
      </View>
    </View>
  );
}
