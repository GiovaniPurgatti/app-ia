import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { Easing } from "react-native-reanimated";

interface SiriSphereProps {
  speaking?: boolean;
}

export default function SiriSphere({ speaking = false }: SiriSphereProps) {
  const initialSize = 80;
  const maxSize = 130;

  const [animate, setAnimate] = useState(false);

  const [colors, setColors] = useState<readonly [string, string]>([
    "#4b6cb7",
    "#6eb1ff",
  ]);

  const randomGradient = (): readonly [string, string] => {
    const palette: readonly [string, string][] = [
      ["#ff5e78", "#ffbc42"],
      ["#4b6cb7", "#9d4edd"],
      ["#00ffea", "#0080ff"],
      ["#ff4d4d", "#ffbb00"],
      ["#6a11cb", "#2575fc"],
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  };

  useEffect(() => {
    if (speaking) {
      setAnimate(true);
    } else {
      setAnimate(false);
      setColors(randomGradient());
    }
  }, [speaking]);

  return (
    <View style={styles.container}>
      <MotiView
        animate={{
          scale: animate ? maxSize / initialSize : 1,
          rotate: animate ? "360deg" : "0deg",
        }}
        transition={{
          type: "timing",
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }}
        style={[
          styles.sphereWrapper,
          {
            width: initialSize,
            height: initialSize,
            borderRadius: initialSize / 2,
          },
        ]}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sphere}
        />

        {/* Ondas saindo da esfera */}
        {animate &&
          Array.from({ length: 3 }).map((_, i) => (
            <MotiView
              key={i}
              from={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2 + i * 0.5, opacity: 0 }}
              transition={{
                type: "timing",
                duration: 1200 + i * 200,
                loop: true,
                easing: Easing.out(Easing.ease),
              }}
              style={[
                styles.wave,
                {
                  backgroundColor: colors[0] + "80", // mesma cor da esfera, mas mais transparente
                  width: initialSize,
                  height: initialSize,
                  borderRadius: initialSize / 2,
                },
              ]}
            />
          ))}
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sphereWrapper: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  sphere: {
    width: "100%",
    height: "100%",
    borderRadius: 1000,
  },
  wave: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
});
