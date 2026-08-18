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
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, Stack, router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';

// 1. Importando o Supabase
import { supabase } from '../utils/supabase';

// Lista de cargos disponíveis
const CARGOS_DISPONIVEIS = [
  'Petiano Admin',
  'Petiano Bolsista',
  'Petiano',
  'Petiano auxiliar'
];

export default function RegistroScreen() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cargo: 'Petiano', // Cargo padrão selecionado
  });
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const handleRegistro = async () => {
    console.log("1. Iniciando validação...");
    
    if (!form.nome || !form.email || !form.senha || !form.confirmarSenha) {
      console.log("Erro: Campos vazios");
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (form.nome.length < 3) {
      console.log("Erro: Nome muito curto");
      Alert.alert('Erro', 'O nome deve ter no mínimo 3 caracteres');
      return;
    }

    if (!form.email.includes('@')) {
      console.log("Erro: Email inválido");
      Alert.alert('Erro', 'Por favor, insira um e-mail válido');
      return;
    }

    // Reduzido para 3 caracteres para você conseguir testar a senha "123"
    if (form.senha.length < 3) {
      console.log("Erro: Senha muito curta");
      Alert.alert('Erro', 'A senha deve ter no mínimo 3 caracteres');
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      console.log("Erro: Senhas não batem");
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    console.log("2. Validação ok. Enviando para o Supabase: ", form.email, form.cargo);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.senha,
        options: {
          data: {
            full_name: form.nome,
            cargo: form.cargo,
          }
        }
      });

      console.log("3. Resposta do Supabase:", { data, error });

      if (error) {
        Alert.alert('Erro ao criar conta', error.message);
        return;
      }

      // Correção para funcionar perfeitamente na Web e no Celular
      if (Platform.OS === 'web') {
        window.alert('Conta criada com sucesso! Redirecionando para o login...');
        router.replace('/login');
      } else {
        Alert.alert(
          'Sucesso!',
          'Conta criada com sucesso! Faça login para continuar.',
          [{ text: 'Fazer Login', onPress: () => router.replace('/login') }]
        );
      }
      
    } catch (error) {
      console.error("Erro grave de conexão:", error);
      Alert.alert('Erro', 'Falha ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Registro',
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
              <TouchableOpacity 
                onPress={() => router.back()} 
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>← Voltar</Text>
              </TouchableOpacity>

              <View style={styles.logoContainer}>
                <Image 
                  source={require('@/assets/images/icon.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.title}>Criar Conta</Text>
                <Text style={styles.subtitle}>Junte-se ao PT Fronteira</Text>
              </View>

              <View style={styles.formContainer}>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nome Completo</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Digite seu nome completo"
                    placeholderTextColor="#666"
                    value={form.nome}
                    onChangeText={(text) => setForm({...form, nome: text})}
                    editable={!loading}
                  />
                </View>

                {/* NOVO: Seleção de Cargo */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Cargo / Tipo de Conta</Text>
                  <View style={styles.cargosContainer}>
                    {CARGOS_DISPONIVEIS.map((cargo) => (
                      <TouchableOpacity
                        key={cargo}
                        style={[
                          styles.cargoButton,
                          form.cargo === cargo && styles.cargoButtonActive
                        ]}
                        onPress={() => setForm({...form, cargo: cargo})}
                        disabled={loading}
                      >
                        <Text style={[
                          styles.cargoText,
                          form.cargo === cargo && styles.cargoTextActive
                        ]}>
                          {cargo}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>E-mail</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="seu@email.com"
                    placeholderTextColor="#666"
                    value={form.email}
                    onChangeText={(text) => setForm({...form, email: text})}
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
                      placeholder="Digite sua senha (mínimo 6 caracteres)"
                      placeholderTextColor="#666"
                      value={form.senha}
                      onChangeText={(text) => setForm({...form, senha: text})}
                      secureTextEntry={!mostrarSenha}
                      editable={!loading}
                    />
                    <TouchableOpacity 
                      onPress={() => setMostrarSenha(!mostrarSenha)}
                      style={styles.eyeButton}
                    >
                      <Text style={styles.eyeButtonText}>
                        {mostrarSenha ? '👁️' : '👁️‍🗨️'}
                      </Text>
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
                      onChangeText={(text) => setForm({...form, confirmarSenha: text})}
                      secureTextEntry={!mostrarConfirmarSenha}
                      editable={!loading}
                    />
                    <TouchableOpacity 
                      onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                      style={styles.eyeButton}
                    >
                      <Text style={styles.eyeButtonText}>
                        {mostrarConfirmarSenha ? '👁️' : '👁️‍🗨️'}
                      </Text>
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
  subtitle: { color: '#999', fontSize: 15 },
  formContainer: { flex: 1 },
  inputGroup: { marginBottom: 16 },
  label: { color: '#CCCCCC', fontSize: 14, fontWeight: '500', marginBottom: 6 },
  input: {
    backgroundColor: '#1c1d2b', borderRadius: 8, padding: 14,
    color: '#FFFFFF', fontSize: 16, borderWidth: 1, borderColor: '#2a2b3d',
  },
  
  // NOVOS ESTILOS PARA OS CARGOS
  cargosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cargoButton: {
    backgroundColor: '#1c1d2b',
    borderWidth: 1,
    borderColor: '#2a2b3d',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cargoButtonActive: {
    backgroundColor: '#F0502D',
    borderColor: '#F0502D',
  },
  cargoText: {
    color: '#999',
    fontSize: 14,
  },
  cargoTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
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