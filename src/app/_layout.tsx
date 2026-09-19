import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { AppAlertProvider } from '@/components/app-alert';

export default function RootLayout() {
  return (
    <AppAlertProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{
            title: 'PET Fronteira - Campus de Ponta Porã',
          }} 
        />
      </Stack>
    </AppAlertProvider>
  );
}