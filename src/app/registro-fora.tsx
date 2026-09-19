import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, Stack, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ThemedView } from '@/components/themed-view';
import { useAppAlert } from '@/components/app-alert';

import { supabase } from '../utils/supabase';

export default function RegistroForaScreen() {
  const { mostrarAlerta } = useAppAlert();
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [fotoLocal, setFotoLocal] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const extensaoDoMime = (mime: string | null | undefined) => {
    if (!mime) return 'jpg';
    const partes = mime.split('/');
    return partes[1] || 'jpg';
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
      setFotoLocal(resultado.assets[0]);
    }
  };

  const handleRegistro = async () => {
    if (!form.nome || !form.email || !form.senha || !form.confirmarSenha) {
      mostrarAlerta({ titulo: 'Erro', mensagem: 'Por favor, preencha todos os campos', tipo: 'erro' });
      return;
    }

    if (form.nome.length < 3) {
      mostrarAlerta({ titulo: 'Erro', mensagem: 'O nome deve ter no mínimo 3 caracteres', tipo: 'erro' });
      return;
    }

    if (!form.email.includes('@')) {
      mostrarAlerta({ titulo: 'Erro', mensagem: 'Por favor, insira um e-mail válido', tipo: 'erro' });
      return;
    }

    if (form.senha.length < 3) {
      mostrarAlerta({ titulo: 'Erro', mensagem: 'A senha deve ter no mínimo 3 caracteres', tipo: 'erro' });
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      mostrarAlerta({ titulo: 'Erro', mensagem: 'As senhas não coincidem', tipo: 'erro' });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.senha,
        options: {
          data: {
            full_name: form.nome,
          },
        },
      });

      if (error) {
        mostrarAlerta({ titulo: 'Erro ao criar conta', mensagem: error.message, tipo: 'erro' });
        return;
      }

      if (data.user) {
        let avatarUrl: string | null = null;

        if (fotoLocal) {
          try {
            const resposta = await fetch(fotoLocal.uri);
            const blob = await resposta.blob();
            const extensao = extensaoDoMime(fotoLocal.mimeType);
            const caminho = `${data.user.id}/${Date.now()}.${extensao}`;

            const { error: erroUpload } = await supabase.storage
              .from('avatars')
              .upload(caminho, blob, { contentType: fotoLocal.mimeType || 'image/jpeg' });

            if (!erroUpload) {
              const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(caminho);
              avatarUrl = urlData.publicUrl;
            } else {
              console.error('Erro ao enviar foto de perfil:', erroUpload);
            }
          } catch (erroFoto) {
            console.error('Erro ao processar foto:', erroFoto);
          }
        }

        const { error: erroExterno } = await supabase.from('usuarios_externos').insert({
          id: data.user.id,
          nome: form.nome,
          email: form.email,
          avatar_url: avatarUrl,
        });

        if (erroExterno) {
          console.error('Erro ao criar usuário externo:', erroExterno);
        }
      }

      mostrarAlerta({
        titulo: 'Conta criada!',
        mensagem: 'Sua conta foi criada com sucesso. Faça login para continuar.',
        tipo: 'sucesso',
        textoBotao: 'Fazer Login',
      });
      router.replace('/login');
    } catch (error) {
      console.error('Erro grave de conexão:', error);
      mostrarAlerta({ titulo: 'Erro', mensagem: 'Falha ao conectar com o servidor.', tipo: 'erro' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Cadastro',
          headerShown: false,
        }}
      />

      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Voltar</Text>
              </TouchableOpacity>

              <View style={styles.logoContainer}>
                <Image
                  source={require('@/assets/images/icon.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.title}>Criar Conta</Text>
                <Text style={styles.subtitle}>Acompanhe os projetos e eventos do PET Fronteira</Text>
              </View>

              <View style={styles.formContainer}>
                {/* --- FOTO DE PERFIL (opcional) --- */}
                <View style={styles.fotoContainer}>
                  <TouchableOpacity onPress={escolherFoto} style={styles.fotoPicker}>
                    {fotoLocal ? (
                      <Image source={{ uri: fotoLocal.uri }} style={styles.fotoPreview} />
                    ) : (
                      <View style={styles.fotoPlaceholder}>
                        <Text style={styles.fotoPlaceholderText}>📷</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <Text style={styles.fotoLabel}>
                    {fotoLocal ? 'Trocar foto de perfil' : 'Adicionar foto de perfil (opcional)'}
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nome Completo</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Digite seu nome completo"
                    placeholderTextColor="#666"
                    value={form.nome}
                    onChangeText={(text) => setForm({ ...form, nome: text })}
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>E-mail</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="seu@email.com"
                    placeholderTextColor="#666"
                    value={form.email}
                    onChangeText={(text) => setForm({ ...form, email: text })}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Senha</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Digite sua senha"
                      placeholderTextColor="#666"
                      value={form.senha}
                      onChangeText={(text) => setForm({ ...form, senha: text })}
                      secureTextEntry={!mostrarSenha}
                      editable={!loading}
                    />
                    <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.eyeButton}>
                      <Text style={styles.eyeButtonText}>{mostrarSenha ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirmar Senha</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Digite sua senha novamente"
                      placeholderTextColor="#666"
                      value={form.confirmarSenha}
                      onChangeText={(text) => setForm({ ...form, confirmarSenha: text })}
                      secureTextEntry={!mostrarConfirmarSenha}
                      editable={!loading}
                    />
                    <TouchableOpacity onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)} style={styles.eyeButton}>
                      <Text style={styles.eyeButtonText}>{mostrarConfirmarSenha ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                  onPress={handleRegistro}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.registerButtonText}>Criar Conta</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Já tem uma conta? </Text>
                  <Link href="/login" asChild>
                    <TouchableOpacity>
                      <Text style={styles.loginLink}>Faça Login</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
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
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 30 },
  backButton: { marginBottom: 12, paddingVertical: 8 },
  backButtonText: { color: '#F0502D', fontSize: 16, fontWeight: '500' },
  logoContainer: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 70, height: 70, borderRadius: 20, marginBottom: 12 },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { color: '#999', fontSize: 14, textAlign: 'center', paddingHorizontal: 10 },
  formContainer: { flex: 1 },

  fotoContainer: { alignItems: 'center', marginBottom: 22 },
  fotoPicker: { marginBottom: 8 },
  fotoPreview: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#F0502D' },
  fotoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1c1d2b',
    borderWidth: 1,
    borderColor: '#2a2b3d',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fotoPlaceholderText: { fontSize: 28 },
  fotoLabel: { color: '#F0502D', fontSize: 13, fontWeight: '600' },

  inputGroup: { marginBottom: 16 },
  label: { color: '#CCCCCC', fontSize: 14, fontWeight: '500', marginBottom: 6 },
  input: {
    backgroundColor: '#1c1d2b', borderRadius: 8, padding: 14,
    color: '#FFFFFF', fontSize: 16, borderWidth: 1, borderColor: '#2a2b3d',
  },
  passwordContainer: { position: 'relative' },
  passwordInput: { paddingRight: 50 },
  eyeButton: { position: 'absolute', right: 14, top: 14 },
  eyeButtonText: { fontSize: 20 },
  registerButton: {
    backgroundColor: '#F0502D', paddingVertical: 16, borderRadius: 8,
    alignItems: 'center', marginBottom: 14, marginTop: 10,
  },
  registerButtonDisabled: { opacity: 0.7 },
  registerButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  loginText: { color: '#999', fontSize: 14 },
  loginLink: { color: '#F0502D', fontSize: 14, fontWeight: 'bold' },
});