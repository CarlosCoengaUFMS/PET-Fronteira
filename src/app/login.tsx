import React, { useState } from 'react';
import { supabase } from '@/utils/supabase';
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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Erro', 'Por favor, insira um e-mail válido');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
      });

      if (error) {
        Alert.alert('Erro no Login', error.message);
      } else {
        Alert.alert('Sucesso', 'Login realizado com sucesso!');
        router.replace('/');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao conectar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Login',
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
                <Text style={styles.title}>PET Fronteira</Text>
                <Text style={styles.subtitle}>Faça login para continuar</Text>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>E-mail</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="seu@email.com"
                    placeholderTextColor="#666"
                    value={email}
                    onChangeText={setEmail}
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
                      value={senha}
                      onChangeText={setSenha}
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

                <TouchableOpacity 
                  style={styles.forgotPassword}
                  onPress={() => Alert.alert('Recuperar Senha', 'Funcionalidade em desenvolvimento')}
                >
                  <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.loginButtonText}>Entrar</Text>
                  )}
                </TouchableOpacity>

                {/* --- OPÇÕES DE CADASTRO --- */}
                {/* O cadastro de petianos será restrito futuramente; por enquanto os dois convivem aqui */}
                <View style={styles.registerOptionsContainer}>
                  <Text style={styles.registerOptionsLabel}>Não tem uma conta?</Text>

                  <Link href="/registro-fora" asChild>
                    <TouchableOpacity style={styles.registerOptionBtnPrimary}>
                      <Text style={styles.registerOptionBtnPrimaryText}>Cadastre-se</Text>
                    </TouchableOpacity>
                  </Link>

                  <Link href="/registro" asChild>
                    <TouchableOpacity style={styles.registerOptionBtnSecondary}>
                      <Text style={styles.registerOptionBtnSecondaryText}>Sou petiano — cadastrar como Petiano</Text>
                    </TouchableOpacity>
                  </Link>
                </View>

                {/* Separador */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>ou</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Login Social - Placeholder */}
                <View style={styles.socialButtons}>
                  <TouchableOpacity style={styles.socialButton}>
                    <Text style={styles.socialButtonText}>Google</Text>
                  </TouchableOpacity>
                </View>

                {/* Versão demonstração */}
                <View style={styles.demoContainer}>
                  <Text style={styles.demoText}>Credenciais de demonstração:</Text>
                  <Text style={styles.demoCreds}>Email: teste@ufms.br</Text>
                  <Text style={styles.demoCreds}>Senha: 123456</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#11121C',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  backButton: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#F0502D',
    fontSize: 16,
    fontWeight: '500',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 20,
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    color: '#999',
    fontSize: 15,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1c1d2b',
    borderRadius: 8,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a2b3d',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  eyeButtonText: {
    fontSize: 20,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#F0502D',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#F0502D',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 14,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // --- OPÇÕES DE CADASTRO ---
  registerOptionsContainer: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  registerOptionsLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 2,
  },
  registerOptionBtnPrimary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#F0502D',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  registerOptionBtnPrimaryText: {
    color: '#F0502D',
    fontSize: 15,
    fontWeight: 'bold',
  },
  registerOptionBtnSecondary: {
    paddingVertical: 6,
  },
  registerOptionBtnSecondaryText: {
    color: '#666',
    fontSize: 13,
    textDecorationLine: 'underline',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2a2b3d',
  },
  dividerText: {
    color: '#666',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  socialButton: {
    flex: 1,
    backgroundColor: '#1c1d2b',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2b3d',
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  demoContainer: {
    padding: 14,
    backgroundColor: '#1c1d2b',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2b3d',
    alignItems: 'center',
  },
  demoText: {
    color: '#999',
    fontSize: 11,
    marginBottom: 3,
  },
  demoCreds: {
    color: '#CCCCCC',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});