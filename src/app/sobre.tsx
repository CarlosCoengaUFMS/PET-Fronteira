import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SobreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Link href="/" asChild>
          <Ionicons name="arrow-back" size={28} color="#F0502D" />
        </Link>
        <Text style={styles.title}>Sobre Nós</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.text}>
          O PT Fronteira do Campus de Ponta Porã é uma organização política que atua na defesa dos direitos dos trabalhadores, estudantes e moradores da região de fronteira entre Brasil e Paraguai. Nossa missão é promover a justiça social, a educação pública de qualidade, a cultura e o desenvolvimento sustentável.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#11121C' },
  header: { padding: 20, paddingTop: 30, flexDirection: 'row', alignItems: 'center', gap: 15, borderBottomWidth: 1, borderBottomColor: '#2a2b3d' },
  title: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  content: { padding: 20, flex: 1 },
  text: { color: '#DDD', fontSize: 16, lineHeight: 24 },
});