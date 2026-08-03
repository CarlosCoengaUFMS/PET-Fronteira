import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          title: 'PT Fronteira - Campus de Ponta Porã',
        }} 
      />
    </Stack>
  );
}