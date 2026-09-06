import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Circle, Path } from 'react-native-svg';

import { supabase } from '../utils/supabase';

const UserIconSvg = ({ size = 80 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#2a2b3d" stroke="#F0502D" strokeWidth="2" />
    <Circle cx="12" cy="9" r="3" fill="#F0502D" />
    <Path d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="#F0502D" />
  </Svg>
);

export default function EditarPerfilScreen() {
  const [loading, setLoading] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);
  
  const [nomeReal, setNomeReal] = useState('');
  const [nomePersonalizado, setNomePersonalizado] = useState('');
  const [sobre, setSobre] = useState('');
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [novaImagemLocal, setNovaImagemLocal] = useState<string | null>(null);

  useEffect(() => {
    const carregarDadosUsuario = async () => {
      const { data, error } = await supabase.auth.getUser();
      
      if (data?.user) {
        const metadata = data.user.user_metadata;
        setNomeReal(metadata?.full_name || '');
        setNomePersonalizado(metadata?.custom_name || '');
        setAvatarUrl(metadata?.avatar_url || null);

        // Busca o "sobre" salvo na tabela petianos
        const { data: petiano, error: erroPetiano } = await supabase
          .from('petianos')
          .select('sobre')
          .eq('id', data.user.id)
          .single();

        if (!erroPetiano && petiano) {
          setSobre(petiano.sobre || '');
        }
      } else {
        Alert.alert('Erro', 'Usuário não encontrado. Faça login novamente.');
        router.replace('/login');
      }
      setCarregandoDados(false);
    };

    carregarDadosUsuario();
  }, []);

  const escolherImagem = async () => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissao.granted === false) {
      Alert.alert('Permissão negada', 'Precisamos de acesso às suas fotos para mudar o perfil.');
      return;
    }

    let resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!resultado.canceled) {
      setNovaImagemLocal(resultado.assets[0].uri);
    }
  };

  const handleSalvar = async () => {
    if (!nomeReal.trim()) {
      Alert.alert('Erro', 'O nome real é obrigatório.');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado.');
      }

      let urlFinalDaImagem: string | null = avatarUrl;

      if (novaImagemLocal) {
        console.log('Iniciando upload da imagem...');
        
        const respostaFoto = await fetch(novaImagemLocal);
        const blobFoto = await respostaFoto.blob();
        
        const caminhoArquivo = `${user.id}/${Date.now()}.jpg`;

        const { data: dataUpload, error: erroUpload } = await supabase.storage
          .from('avatars')
          .upload(caminhoArquivo, blobFoto, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (erroUpload) {
          throw new Error('Falha ao enviar a imagem. Verifique se o bucket "avatars" foi criado e está como Public.');
        }

        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(caminhoArquivo);
        urlFinalDaImagem = urlData.publicUrl;
      }

      // 1. Atualiza o auth (usado no header, menu, etc.)
      const { error: erroUpdate } = await supabase.auth.updateUser({
        data: {
          full_name: nomeReal,
          custom_name: nomePersonalizado,
          avatar_url: urlFinalDaImagem,
        }
      });

      if (erroUpdate) throw erroUpdate;

      // 2. Atualiza a tabela petianos (usada na Home para Tutor/Membros)
      const { error: erroPetiano } = await supabase
        .from('petianos')
        .update({
          nome: nomeReal,
          avatar_url: urlFinalDaImagem,
          sobre: sobre,
        })
        .eq('id', user.id);

      if (erroPetiano) {
        console.error('Erro ao atualizar petiano:', erroPetiano);
      }

      if (Platform.OS === 'web') {
        window.alert('Perfil atualizado com sucesso!');
      } else {
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      }
      
      router.replace('/');
      
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro ao Salvar', error.message || 'Falha ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const previewNomePrincipal = nomePersonalizado.trim() !== '' ? nomePersonalizado : nomeReal;
  const previewNomeSecundario = nomePersonalizado.trim() !== '' ? `"${nomeReal}"` : '';
  
  const imagemExibida = novaImagemLocal || avatarUrl;

  if (carregandoDados) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#F0502D" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Editar Perfil', headerShown: false }} />
      
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              
              {/* Botão Corrigido para ir direto para a Home */}
              <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Voltar para o Início</Text>
              </TouchableOpacity>

              <View style={styles.headerTitle}>
                <Text style={styles.title}>Editar Perfil</Text>
                <Text style={styles.subtitle}>Personalize como você aparece no app</Text>
              </View>

              <View style={styles.avatarSection}>
                <TouchableOpacity onPress={escolherImagem} style={styles.avatarContainer} disabled={loading}>
                  {imagemExibida ? (
                    <Image source={{ uri: imagemExibida }} style={styles.avatarImage} />
                  ) : (
                    <UserIconSvg size={100} />
                  )}
                  <View style={styles.editBadge}>
                    <Text style={styles.editBadgeText}>📷</Text>
                  </View>
                </TouchableOpacity>
                <Text style={styles.avatarHint}>Toque na foto para alterar</Text>
              </View>

              <View style={styles.previewBox}>
                <Text style={styles.previewLabel}>Como as pessoas vão te ver:</Text>
                <View style={styles.previewNameContainer}>
                  <Text style={styles.previewMainName}>{previewNomePrincipal || 'Seu Nome'}</Text>
                  {previewNomeSecundario ? (
                    <Text style={styles.previewSubName}>{previewNomeSecundario}</Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.formContainer}>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nome de Usuário Personalizado</Text>
                  <Text style={styles.inputHint}>Seu apelido ou nome social (Opcional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Ninja, Gui, Mari..."
                    placeholderTextColor="#666"
                    value={nomePersonalizado}
                    onChangeText={setNomePersonalizado}
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nome Real / Completo</Text>
                  <Text style={styles.inputHint}>Usado para certificados e registros</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Seu nome verdadeiro"
                    placeholderTextColor="#666"
                    value={nomeReal}
                    onChangeText={setNomeReal}
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Sobre</Text>
                  <Text style={styles.inputHint}>Uma breve descrição sobre você (aparece publicamente caso você seja o Tutor)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Conte um pouco sobre sua área de atuação, experiência..."
                    placeholderTextColor="#666"
                    value={sobre}
                    onChangeText={setSobre}
                    editable={!loading}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                  onPress={handleSalvar}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                  )}
                </TouchableOpacity>

              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#11121C' },
  center: { justifyContent: 'center', alignItems: 'center' },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  backButton: { marginBottom: 15, paddingVertical: 8, alignSelf: 'flex-start' },
  backButtonText: { color: '#F0502D', fontSize: 16, fontWeight: '500' },
  headerTitle: { marginBottom: 20 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { color: '#999', fontSize: 15 },
  
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#1c1d2b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F0502D',
    marginBottom: 10,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#F0502D',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#11121C',
  },
  editBadgeText: {
    fontSize: 14,
  },
  avatarHint: {
    color: '#666',
    fontSize: 13,
  },

  previewBox: { backgroundColor: '#1c1d2b', borderRadius: 12, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: '#2a2b3d', borderLeftWidth: 4, borderLeftColor: '#F0502D' },
  previewLabel: { color: '#999', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  previewNameContainer: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 },
  previewMainName: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  previewSubName: { color: '#888', fontSize: 16, fontStyle: 'italic' },

  formContainer: { flex: 1 },
  inputGroup: { marginBottom: 20 },
  label: { color: '#CCCCCC', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  inputHint: { color: '#666', fontSize: 12, marginBottom: 8 },
  input: { backgroundColor: '#1c1d2b', borderRadius: 8, padding: 16, color: '#FFFFFF', fontSize: 16, borderWidth: 1, borderColor: '#2a2b3d' },
  textArea: { minHeight: 100, paddingTop: 16 },
  saveButton: { backgroundColor: '#F0502D', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});