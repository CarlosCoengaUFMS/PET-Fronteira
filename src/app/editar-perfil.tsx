import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ThemedView } from '@/components/themed-view';
import { useAppAlert } from '@/components/app-alert';

import { supabase } from '../utils/supabase';

const extensaoDoMime = (mime: string | null | undefined) => {
  if (!mime) return 'jpg';
  const partes = mime.split('/');
  return partes[1] || 'jpg';
};

export default function EditarPerfilScreen() {
  const { mostrarAlerta } = useAppAlert();
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [ehPetiano, setEhPetiano] = useState(false);
  const [cargo, setCargo] = useState('');

  const [nome, setNome] = useState('');
  const [sobre, setSobre] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [novaFotoLocal, setNovaFotoLocal] = useState<ImagePicker.ImagePickerAsset | null>(null);

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      mostrarAlerta({ titulo: 'Erro', mensagem: 'Você precisa estar logado.', tipo: 'erro' });
      router.replace('/login');
      return;
    }

    setUsuarioId(session.user.id);
    setEmail(session.user.email || '');

    // Primeiro tenta como petiano
    const { data: petiano } = await supabase
      .from('petianos')
      .select('nome, sobre, avatar_url, cargo')
      .eq('id', session.user.id)
      .single();

    if (petiano) {
      setEhPetiano(true);
      setCargo(petiano.cargo || '');
      setNome(petiano.nome || '');
      setSobre(petiano.sobre || '');
      setAvatarUrl(petiano.avatar_url || null);
      setCarregando(false);
      return;
    }

    // Se não é petiano, tenta como usuário externo (visitante)
    const { data: externo } = await supabase
      .from('usuarios_externos')
      .select('nome, avatar_url')
      .eq('id', session.user.id)
      .single();

    if (externo) {
      setEhPetiano(false);
      setNome(externo.nome || '');
      setAvatarUrl(externo.avatar_url || null);
    }

    setCarregando(false);
  };

  const escolherFoto = async () => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      mostrarAlerta({ titulo: 'Permissão negada', mensagem: 'Precisamos de acesso às suas fotos.', tipo: 'erro' });
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!resultado.canceled) {
      setNovaFotoLocal(resultado.assets[0]);
    }
  };

  const voltar = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const salvarPerfil = async () => {
    if (!nome.trim()) {
      mostrarAlerta({ titulo: 'Erro', mensagem: 'Digite seu nome.', tipo: 'erro' });
      return;
    }

    if (!usuarioId) return;

    setSalvando(true);
    try {
      let urlFinal = avatarUrl;

      if (novaFotoLocal) {
        const resposta = await fetch(novaFotoLocal.uri);
        const blob = await resposta.blob();
        const extensao = extensaoDoMime(novaFotoLocal.mimeType);
        const caminho = `${usuarioId}/${Date.now()}.${extensao}`;

        const { error: erroUpload } = await supabase.storage
          .from('avatars')
          .upload(caminho, blob, { contentType: novaFotoLocal.mimeType || 'image/jpeg' });

        if (erroUpload) {
          throw new Error('Falha ao enviar a foto. Verifique se o bucket "avatars" permite seu envio.');
        }

        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(caminho);
        urlFinal = urlData.publicUrl;
      }

      // Auth (comum aos dois tipos de conta)
      const { error: erroAuth } = await supabase.auth.updateUser({
        data: { full_name: nome, avatar_url: urlFinal },
      });
      if (erroAuth) console.error('Erro ao atualizar auth:', erroAuth);

      // Tabela certa dependendo do tipo de conta
      if (ehPetiano) {
        const { error: erroPetiano } = await supabase
          .from('petianos')
          .update({ nome, sobre, avatar_url: urlFinal })
          .eq('id', usuarioId);

        if (erroPetiano) throw erroPetiano;
      } else {
        const { error: erroExterno } = await supabase
          .from('usuarios_externos')
          .update({ nome, avatar_url: urlFinal })
          .eq('id', usuarioId);

        if (erroExterno) throw erroExterno;
      }

      setAvatarUrl(urlFinal);
      setNovaFotoLocal(null);
      mostrarAlerta({ titulo: 'Sucesso', mensagem: 'Perfil atualizado com sucesso!', tipo: 'sucesso' });
    } catch (error: any) {
      console.error(error);
      mostrarAlerta({ titulo: 'Erro', mensagem: error.message || 'Não foi possível salvar o perfil.', tipo: 'erro' });
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#F0502D" />
      </View>
    );
  }

  const primeiroNome = nome.split(' ')[0] || '';
  const restoNome = nome.split(' ').slice(1).join(' ');

  return (
    <>
      <Stack.Screen options={{ title: 'Editar Perfil', headerShown: false }} />

      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={voltar} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Voltar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>
              Editar Perfil<Text style={styles.orangeHighlight}>.</Text>
            </Text>

            <TouchableOpacity onPress={escolherFoto} style={styles.avatarPicker}>
              {novaFotoLocal ? (
                <Image source={{ uri: novaFotoLocal.uri }} style={styles.avatarImage} />
              ) : avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>📷</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Toque na foto para trocar</Text>

            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>Pré-visualização</Text>
              <View style={styles.previewNameContainer}>
                <Text style={styles.previewMainName}>{primeiroNome || 'Seu'}</Text>
                {restoNome ? <Text style={styles.previewSubName}>{restoNome}</Text> : null}
              </View>
              <Text style={styles.previewSubName}>{ehPetiano ? cargo : 'Visitante'}</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Seu nome completo"
                  placeholderTextColor="#666"
                  value={nome}
                  onChangeText={setNome}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput style={[styles.input, styles.inputDesabilitado]} value={email} editable={false} />
                <Text style={styles.inputHint}>O e-mail não pode ser alterado por aqui.</Text>
              </View>

              {ehPetiano && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Sobre você</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Fale um pouco sobre você"
                    placeholderTextColor="#666"
                    value={sobre}
                    onChangeText={setSobre}
                    multiline
                  />
                </View>
              )}

              <TouchableOpacity
                style={[styles.saveButton, salvando && styles.saveButtonDisabled]}
                onPress={salvarPerfil}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                )}
              </TouchableOpacity>
            </View>
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
  header: { paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#2a2b3d' },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backButtonText: { color: '#F0502D', fontSize: 16, fontWeight: '500' },
  scrollContainer: { flexGrow: 1, padding: 20, alignItems: 'center' },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  orangeHighlight: { color: '#F0502D' },

  avatarPicker: { marginBottom: 8 },
  avatarImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#F0502D' },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1c1d2b',
    borderWidth: 1,
    borderColor: '#2a2b3d',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: { fontSize: 32 },
  avatarHint: { color: '#F0502D', fontSize: 13, fontWeight: '600', marginBottom: 20 },

  previewBox: {
    backgroundColor: '#1c1d2b',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#2a2b3d',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  previewLabel: { color: '#999', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  previewNameContainer: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 },
  previewMainName: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  previewSubName: { color: '#888', fontSize: 14, fontStyle: 'italic' },

  formContainer: { width: '100%', maxWidth: 400 },
  inputGroup: { marginBottom: 20 },
  label: { color: '#CCCCCC', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  inputHint: { color: '#666', fontSize: 12, marginTop: 8 },
  input: {
    backgroundColor: '#1c1d2b',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2a2b3d',
  },
  inputDesabilitado: { opacity: 0.5 },
  textArea: { minHeight: 100, paddingTop: 16, textAlignVertical: 'top' },

  saveButton: {
    backgroundColor: '#F0502D',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});