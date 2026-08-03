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

export default function RegistroScreen() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const handleRegistro = async () => {
    // Validação dos campos
    if (!form.nome || !form.email || !form.senha || !form.confirmarSenha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (form.nome.length < 3) {
      Alert.alert('Erro', 'O nome deve ter no mínimo 3 caracteres');
      return;
    }

    if (!form.email.includes('@') || !form.email.includes('.')) {
      Alert.alert('Erro', 'Por favor, insira um e-mail válido');
      return;
    }

    if (form.senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    setLoading(true);

    // Simulação de registro (substituir pela chamada real à API)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulação de sucesso
      Alert.alert(
        'Sucesso!',
        'Conta criada com sucesso! Faça login para continuar.',
        [
          {
            text: 'Fazer Login',
            onPress: () => router.replace('/login'),
          },
        ]
      );
      
      // Limpar formulário
      setForm({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: '',
      });
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar conta. Tente novamente.');
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
              {/* Header com botão voltar */}
              <TouchableOpacity 
                onPress={() => router.back()} 
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>← Voltar</Text>
              </TouchableOpacity>

              {/* Logo */}
              <View style={styles.logoContainer}>
                <Image 
                  source={require('@/assets/images/icon.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.title}>Criar Conta</Text>
                <Text style={styles.subtitle}>Junte-se ao PT Fronteira</Text>
              </View>

              {/* Formulário */}
              <View style={styles.formContainer}>
                {/* Nome */}
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

                {/* Email */}
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

                {/* Senha */}
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

                {/* Confirmar Senha */}
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

                {/* Termos e Condições */}
                <View style={styles.termsContainer}>
                  <TouchableOpacity style={styles.checkboxContainer}>
                    <View style={styles.checkbox} />
                    <Text style={styles.termsText}>
                      Li e concordo com os{' '}
                      <Text style={styles.termsLink}>Termos de Uso</Text>
                      {' e '}
                      <Text style={styles.termsLink}>Política de Privacidade</Text>
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Botão Registrar */}
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

                {/* Link para Login */}
                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Já tem uma conta? </Text>
                  <Link href="/login" asChild>
                    <TouchableOpacity>
                      <Text style={styles.loginLink}>Faça Login</Text>
                    </TouchableOpacity>
                  </Link>
                </View>

                {/* Separador */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>ou</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Registro Social - Placeholder */}
                <View style={styles.socialButtons}>
                  <TouchableOpacity style={styles.socialButton}>
                    <Text style={styles.socialButtonText}>Google</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <Text style={styles.socialButtonText}>Facebook</Text>
                  </TouchableOpacity>
                </View>

                {/* Informação de segurança */}
                <View style={styles.securityContainer}>
                  <Text style={styles.securityText}>🔒</Text>
                  <Text style={styles.securityText}>
                    Suas informações estão seguras conosco
                  </Text>
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
    marginBottom: 24,
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
    marginBottom: 4,
  },
  subtitle: {
    color: '#999',
    fontSize: 15,
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
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
  termsContainer: {
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#F0502D',
    borderRadius: 4,
    marginRight: 10,
    backgroundColor: 'transparent',
  },
  termsText: {
    color: '#999',
    fontSize: 13,
    flex: 1,
  },
  termsLink: {
    color: '#F0502D',
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: '#F0502D',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 14,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginText: {
    color: '#999',
    fontSize: 14,
  },
  loginLink: {
    color: '#F0502D',
    fontSize: 14,
    fontWeight: 'bold',
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
    marginBottom: 16,
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
  securityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  securityText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
});