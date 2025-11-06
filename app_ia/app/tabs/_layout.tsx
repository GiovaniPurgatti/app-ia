export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

import ThemeProviderComponent from "@/components/ThemeProvider";
import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <ThemeProviderComponent>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProviderComponent>
  );
}
