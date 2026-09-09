import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';

import { ThemedView } from '@/components/themed-view';
import { supabase } from '../utils/supabase';

const BackIconSvg = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke="#F0502D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const HomeIconSvg = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M3 11l9-8 9 8" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CrownIconSvg = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M2 8l4 4 6-8 6 8 4-4-2 12H4L2 8z" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(240,80,45,0.15)" />
  </Svg>
);

interface MeuProjeto {
  tipo_responsavel: string;
  projeto: {
    uuid: string;
    titulo: string;
    ano: number | null;
    status: string | null;
  };
}

export default function MeusProjetosScreen() {
  const [carregando, setCarregando] = useState(true);
  const [projetos, setProjetos] = useState<MeuProjeto[]>([]);

  useEffect(() => {
    buscarMeusProjetos();
  }, []);

  const voltar = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const irParaHome = () => {
    router.push('/');
  };

  const buscarMeusProjetos = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      Alert.alert('Erro', 'Você precisa estar logado.');
      router.replace('/login');
      return;
    }

    const { data, error } = await supabase
      .from('petianos_has_projeto')
      .select('tipo_responsavel, projeto:projeto_uuid(uuid, titulo, ano, status)')
      .eq('petiano_id', session.user.id);

    if (!error && data) {
      setProjetos(data as any as MeuProjeto[]);
    } else if (error) {
      console.error('Erro ao buscar meus projetos:', error);
    }
    setCarregando(false);
  };

  const abrirProjeto = (item: MeuProjeto) => {
    router.push({
      pathname: '/projetos',
      params: {
        projeto: item.projeto.uuid,
        ano: item.projeto.ano ? String(item.projeto.ano) : '',
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Meus Projetos', headerShown: false }} />

      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={voltar} style={styles.backButton}>
              <BackIconSvg />
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={irParaHome} style={styles.homeBtn}>
              <HomeIconSvg />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>
              Meus Projetos<Text style={styles.orangeHighlight}>.</Text>
            </Text>
            <Text style={styles.subtitle}>Projetos dos quais você faz parte</Text>

            {carregando ? (
              <ActivityIndicator color="#F0502D" size="large" style={{ marginVertical: 30 }} />
            ) : projetos.length > 0 ? (
              <View style={styles.lista}>
                {projetos.map((item) => (
                  <TouchableOpacity
                    key={item.projeto.uuid}
                    style={styles.card}
                    onPress={() => abrirProjeto(item)}
                  >
                    <View style={styles.cardTopo}>
                      <Text style={styles.cardTitulo}>{item.projeto.titulo}</Text>
                      {item.tipo_responsavel === 'lider' && <CrownIconSvg />}
                    </View>
                    <View style={styles.cardInfoRow}>
                      {item.projeto.ano ? <Text style={styles.cardInfo}>{item.projeto.ano}</Text> : null}
                      {item.projeto.status ? <Text style={styles.cardInfo}>{item.projeto.status}</Text> : null}
                      <Text style={styles.cardInfo}>{item.tipo_responsavel === 'lider' ? 'Líder' : 'Membro'}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>Você ainda não faz parte de nenhum projeto.</Text>
            )}
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#11121C' },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#2a2b3d' },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backButtonText: { color: '#F0502D', fontSize: 16, fontWeight: '500' },
  homeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1c1d2b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2b3d',
  },
  scrollContainer: { flexGrow: 1, padding: 20 },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  orangeHighlight: { color: '#F0502D' },
  subtitle: { color: '#AAAAAA', fontSize: 15, textAlign: 'center', marginBottom: 30 },
  emptyText: { color: '#666', fontSize: 14, textAlign: 'center', marginTop: 20 },

  lista: { gap: 12 },
  card: { backgroundColor: '#1c1d2b', borderRadius: 12, borderWidth: 1, borderColor: '#2a2b3d', padding: 16 },
  cardTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardTitulo: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', flex: 1 },
  cardInfoRow: { flexDirection: 'row', gap: 14 },
  cardInfo: { color: '#AAAAAA', fontSize: 12 },
});