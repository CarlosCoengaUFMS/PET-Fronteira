import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

import { ThemedView } from '@/components/themed-view';
import { supabase } from '../utils/supabase';

// --- ÍCONES ---
const BackIconSvg = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke="#F0502D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UserIconSvg = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#2a2b3d" stroke="#F0502D" strokeWidth="2" />
    <Circle cx="12" cy="9" r="3" fill="#F0502D" />
    <Path d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="#F0502D" />
  </Svg>
);

const FileIconSvg = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2v6h6" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UploadIconSvg = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 16V4m0 0L7 9m5-5l5 5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M4 20h16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const LockIconSvg = () => (
  <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="11" width="16" height="10" rx="2" stroke="#F0502D" strokeWidth="2" />
    <Path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// --- TIPOS ---
interface Petiano {
  id: string;
  nome: string;
  cargo: string;
  avatar_url: string | null;
}

interface Relatorio {
  uuid: string;
  petiano_id: string;
  nome_arquivo: string;
  arquivo_url: string;
  created_at: string;
}

const formatarDataHora = (iso: string) => {
  const data = new Date(iso);
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function RelatoriosScreen() {
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [logado, setLogado] = useState(false);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);

  const [petianos, setPetianos] = useState<Petiano[]>([]);
  const [carregandoPetianos, setCarregandoPetianos] = useState(true);

  const [petianoSelecionado, setPetianoSelecionado] = useState<Petiano | null>(null);
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [carregandoRelatorios, setCarregandoRelatorios] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    verificarSessao();
  }, []);

  const verificarSessao = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setLogado(true);
      setUsuarioId(session.user.id);
      buscarPetianos();
    } else {
      setLogado(false);
    }
    setCarregandoSessao(false);
  };

  const buscarPetianos = async () => {
    setCarregandoPetianos(true);
    const { data, error } = await supabase
      .from('petianos')
      .select('id, nome, cargo, avatar_url')
      .neq('cargo', 'Tutor');

    if (!error && data) {
      setPetianos(data as Petiano[]);
    } else if (error) {
      console.error('Erro ao buscar petianos:', error);
    }
    setCarregandoPetianos(false);
  };

  const abrirPetiano = async (petiano: Petiano) => {
    setPetianoSelecionado(petiano);
    setCarregandoRelatorios(true);

    const { data, error } = await supabase
      .from('relatorios')
      .select('*')
      .eq('petiano_id', petiano.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRelatorios(data as Relatorio[]);
    } else if (error) {
      console.error('Erro ao buscar relatórios:', error);
    }
    setCarregandoRelatorios(false);
  };

  const voltarParaLista = () => {
    setPetianoSelecionado(null);
    setRelatorios([]);
  };

  const enviarRelatorio = async () => {
    if (!usuarioId) return;

    const resultado = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (resultado.canceled) return;

    const arquivo = resultado.assets[0];
    setEnviando(true);

    try {
      const resposta = await fetch(arquivo.uri);
      const blob = await resposta.blob();

      const caminhoArquivo = `${usuarioId}/${Date.now()}-${arquivo.name}`;

      const { error: erroUpload } = await supabase.storage
        .from('relatorios')
        .upload(caminhoArquivo, blob, {
          contentType: arquivo.mimeType || 'application/octet-stream',
        });

      if (erroUpload) {
        throw new Error('Falha ao enviar o arquivo. Verifique se o bucket "relatorios" foi criado e está como Public.');
      }

      const { data: urlData } = supabase.storage.from('relatorios').getPublicUrl(caminhoArquivo);

      const { error: erroInsert } = await supabase.from('relatorios').insert({
        petiano_id: usuarioId,
        nome_arquivo: arquivo.name,
        arquivo_url: urlData.publicUrl,
      });

      if (erroInsert) throw erroInsert;

      if (petianoSelecionado) {
        abrirPetiano(petianoSelecionado);
      }

      if (Platform.OS === 'web') {
        window.alert('Relatório enviado com sucesso!');
      } else {
        Alert.alert('Sucesso', 'Relatório enviado com sucesso!');
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro ao enviar', error.message || 'Falha ao conectar com o servidor.');
    } finally {
      setEnviando(false);
    }
  };

  const abrirArquivo = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o arquivo.');
    });
  };

  if (carregandoSessao) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#F0502D" />
      </View>
    );
  }

  if (!logado) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <BackIconSvg />
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.lockedContainer}>
            <LockIconSvg />
            <Text style={styles.lockedTitle}>Área restrita</Text>
            <Text style={styles.lockedText}>Você precisa estar logado para ver os relatórios dos petianos.</Text>
            <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/login')}>
              <Text style={styles.loginBtnText}>Fazer Login</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Relatórios', headerShown: false }} />

      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={petianoSelecionado ? voltarParaLista : () => router.back()}
              style={styles.backButton}
            >
              <BackIconSvg />
              <Text style={styles.backButtonText}>
                {petianoSelecionado ? 'Voltar para a lista' : 'Voltar'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

            {!petianoSelecionado ? (
              <>
                <View style={styles.titleSection}>
                  <Text style={styles.title}>
                    Relatórios<Text style={styles.orangeHighlight}>.</Text>
                  </Text>
                  <Text style={styles.subtitle}>Escolha um petiano para ver os relatórios enviados</Text>
                </View>

                {carregandoPetianos ? (
                  <ActivityIndicator color="#F0502D" size="large" style={{ marginVertical: 30 }} />
                ) : petianos.length > 0 ? (
                  <View style={styles.petianosGrid}>
                    {petianos.map((petiano) => (
                      <TouchableOpacity
                        key={petiano.id}
                        style={styles.petianoCard}
                        onPress={() => abrirPetiano(petiano)}
                      >
                        {petiano.avatar_url ? (
                          <Image source={{ uri: petiano.avatar_url }} style={styles.petianoAvatar} />
                        ) : (
                          <UserIconSvg size={56} />
                        )}
                        <Text style={styles.petianoNome}>{petiano.nome}</Text>
                        <Text style={styles.petianoCargo}>{petiano.cargo}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>Nenhum petiano cadastrado ainda.</Text>
                )}
              </>
            ) : (
              <>
                <View style={styles.selectedHeader}>
                  {petianoSelecionado.avatar_url ? (
                    <Image source={{ uri: petianoSelecionado.avatar_url }} style={styles.selectedAvatar} />
                  ) : (
                    <UserIconSvg size={64} />
                  )}
                  <View>
                    <Text style={styles.selectedNome}>{petianoSelecionado.nome}</Text>
                    <Text style={styles.selectedCargo}>{petianoSelecionado.cargo}</Text>
                  </View>
                </View>

                {petianoSelecionado.id === usuarioId && (
                  <TouchableOpacity
                    style={[styles.uploadBtn, enviando && styles.uploadBtnDisabled]}
                    onPress={enviarRelatorio}
                    disabled={enviando}
                  >
                    {enviando ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <UploadIconSvg />
                        <Text style={styles.uploadBtnText}>Enviar novo relatório</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {carregandoRelatorios ? (
                  <ActivityIndicator color="#F0502D" size="large" style={{ marginVertical: 30 }} />
                ) : relatorios.length > 0 ? (
                  <View style={styles.relatoriosLista}>
                    {relatorios.map((relatorio) => (
                      <TouchableOpacity
                        key={relatorio.uuid}
                        style={styles.relatorioCard}
                        onPress={() => abrirArquivo(relatorio.arquivo_url)}
                      >
                        <FileIconSvg />
                        <View style={styles.relatorioInfo}>
                          <Text style={styles.relatorioNome} numberOfLines={1}>{relatorio.nome_arquivo}</Text>
                          <Text style={styles.relatorioData}>Enviado em {formatarDataHora(relatorio.created_at)}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>
                    {petianoSelecionado.id === usuarioId
                      ? 'Você ainda não enviou nenhum relatório.'
                      : 'Este petiano ainda não enviou nenhum relatório.'}
                  </Text>
                )}
              </>
            )}

          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#11121C' },
  center: { justifyContent: 'center', alignItems: 'center' },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#2a2b3d' },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backButtonText: { color: '#F0502D', fontSize: 16, fontWeight: '500' },
  scrollContainer: { flexGrow: 1, padding: 20 },

  titleSection: { alignItems: 'center', marginBottom: 30 },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  orangeHighlight: { color: '#F0502D' },
  subtitle: { color: '#AAAAAA', fontSize: 15, textAlign: 'center' },
  emptyText: { color: '#666', fontSize: 14, textAlign: 'center', marginTop: 20 },

  petianosGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 18 },
  petianoCard: {
    width: 140,
    alignItems: 'center',
    backgroundColor: '#1c1d2b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2a2b3d',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  petianoAvatar: { width: 56, height: 56, borderRadius: 28 },
  petianoNome: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginTop: 10, marginBottom: 4 },
  petianoCargo: { color: '#AAAAAA', fontSize: 12, textAlign: 'center' },

  selectedHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  selectedAvatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#F0502D' },
  selectedNome: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  selectedCargo: { color: '#F0502D', fontSize: 13, fontWeight: 'bold' },

  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#F0502D',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 24,
  },
  uploadBtnDisabled: { opacity: 0.7 },
  uploadBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },

  relatoriosLista: { gap: 12 },
  relatorioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#1c1d2b',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2b3d',
    padding: 14,
  },
  relatorioInfo: { flex: 1 },
  relatorioNome: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  relatorioData: { color: '#888', fontSize: 12, marginTop: 2 },

  lockedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 30 },
  lockedTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  lockedText: { color: '#AAAAAA', fontSize: 14, textAlign: 'center' },
  loginBtn: { backgroundColor: '#F0502D', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 8, marginTop: 10 },
  loginBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});