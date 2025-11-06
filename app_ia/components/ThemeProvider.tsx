import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { useState, ReactNode } from "react";
import { Fab, FabIcon } from "./ui/fab";
import { GluestackUIProvider } from "./ui/gluestack-ui-provider";
import { Icon, MoonIcon, SunIcon } from "./ui/icon";
import { Button } from "./ui/button";

interface ThemeProviderComponentProps {
  children: ReactNode;
}

export default function ThemeProviderComponent({
  children,
}: ThemeProviderComponentProps) {
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");

  return (
    <GluestackUIProvider mode={colorMode}>
      <ThemeProvider value={colorMode === "dark" ? DarkTheme : DefaultTheme}>
        {children}

        {/* Botão flutuante para alternar tema */}
        <Button
          onPress={() => setColorMode(colorMode === "dark" ? "light" : "dark")}
          variant="outline"
          className="
            absolute top-0 right-0
            mr-6 
            mt-32
            w-14 h-14 
            rounded-full 
            items-center justify-center 
            active:opacity-100
          "
        >
          <Icon as={colorMode === 'dark' ? SunIcon : MoonIcon}/>
        </Button>
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
