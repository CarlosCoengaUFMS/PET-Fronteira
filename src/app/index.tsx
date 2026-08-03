import React, { useState } from 'react';
import * as Device from 'expo-device';
import { Platform, StyleSheet, ScrollView, View, Text, TouchableOpacity, Image, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, Stack, router } from 'expo-router'; // 👈 Adicionado router
import Svg, { Path, Rect, Circle } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';

// --- 1. Componente do Ícone de Menu (Hambúrguer em SVG) ---
const MenuIconSvg = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="2.5" rx="1" fill="#FFFFFF" />
    <Rect x="3" y="11" width="18" height="2.5" rx="1" fill="#FFFFFF" />
    <Rect x="3" y="18" width="18" height="2.5" rx="1" fill="#FFFFFF" />
  </Svg>
);

// --- 2. Componente do Ícone de Fechar (X em SVG) ---
const CloseIconSvg = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6L18 18" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// --- 3. Ícone de Login em SVG ---
const LoginIconSvg = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// --- 4. Ícone de Usuário (Avatar/Personagem) - Versão melhorada ---
const UserIconSvg = ({ size = 32 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#2a2b3d" stroke="#F0502D" strokeWidth="2" />
    <Circle cx="12" cy="9" r="3" fill="#F0502D" />
    <Path d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="#F0502D" />
  </Svg>
);

// --- 5. Ícone de Configurações ---
const SettingsIconSvg = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke="#FFFFFF" strokeWidth="2" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// --- 6. Ícone de Editar Perfil ---
const EditIconSvg = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// --- 7. Ícone de Sair ---
const LogoutIconSvg = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function HomeScreen() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [userMenuAberto, setUserMenuAberto] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', mensagem: '' });
  
  // Estado de autenticação - Inicia como true para teste
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userData, setUserData] = useState({
    nome: 'João Silva',
    email: 'joao.silva@ufms.br',
    avatar: null // URL da imagem do avatar
  });

  const enviarFormulario = () => {
    alert('Mensagem enviada com sucesso!');
    setForm({ nome: '', email: '', mensagem: '' });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserMenuAberto(false);
    alert('Logout realizado com sucesso!');
  };

  const handleUserIconPress = () => {
    if (isLoggedIn) {
      // Se estiver logado, abre o menu do usuário
      setUserMenuAberto(true);
    } else {
      // Se não estiver logado, redireciona para a página de login
      router.push('/login');
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'PT Fronteira',
          headerShown: false,
        }} 
      />
      
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          
          {/* --- HEADER --- */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.logoContainer}>
                <Image 
                  source={require('@/assets/images/icon.png')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <View>
                  <Text style={styles.logoTitle}>PT Fronteira</Text>
                  <Text style={styles.logoSubtitle}>Campus de Ponta Porã</Text>
                </View>
              </View>
              
              <View style={styles.headerButtons}>
                {/* Botão de Usuário/Perfil */}
                <TouchableOpacity 
                  onPress={handleUserIconPress} // 👈 Agora usa a função que redireciona
                  style={styles.userButton}
                >
                  {isLoggedIn && userData.avatar ? (
                    <Image 
                      source={{ uri: userData.avatar }} 
                      style={styles.userAvatar}
                    />
                  ) : (
                    <View style={styles.userIconContainer}>
                      <UserIconSvg size={36} />
                      {!isLoggedIn && (
                        <View style={styles.loginDot} />
                      )}
                    </View>
                  )}
                </TouchableOpacity>
                
                {/* Botão Hamburguer */}
                <TouchableOpacity onPress={() => setMenuAberto(true)} style={styles.hamburgerBtn}>
                  <MenuIconSvg />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* --- MENU PRINCIPAL --- */}
          <Modal visible={menuAberto} transparent animationType="fade" onRequestClose={() => setMenuAberto(false)}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMenuAberto(false)}>
              <View style={styles.menuDropdown}>
                <TouchableOpacity onPress={() => setMenuAberto(false)} style={styles.closeBtnTop}>
                  <CloseIconSvg />
                </TouchableOpacity>

                <View style={styles.menuLinksContainer}>
                  <Link href="/" style={styles.navLink} onPress={() => setMenuAberto(false)}>Início</Link>
                  <Link href="/sobre" style={styles.navLink} onPress={() => setMenuAberto(false)}>Sobre</Link>
                  <Link href="/projetos" style={styles.navLink} onPress={() => setMenuAberto(false)}>Projetos</Link>
                  <Link href="/contato" style={styles.navLink} onPress={() => setMenuAberto(false)}>Contato</Link>
                  
                  {/* Separador */}
                  <View style={styles.menuSeparator} />
                  
                  {/* LOGIN/LOGOUT NO MENU HAMBURGUER */}
                  {isLoggedIn ? (
                    <TouchableOpacity 
                      style={styles.loginButton}
                      onPress={handleLogout}
                    >
                      <LogoutIconSvg />
                      <Text style={styles.loginButtonText}>Sair</Text>
                    </TouchableOpacity>
                  ) : (
                    <Link href="/login" asChild>
                      <TouchableOpacity 
                        style={styles.loginButton}
                        onPress={() => setMenuAberto(false)}
                      >
                        <LoginIconSvg />
                        <Text style={styles.loginButtonText}>Login</Text>
                      </TouchableOpacity>
                    </Link>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* --- MENU DO USUÁRIO --- */}
          <Modal visible={userMenuAberto} transparent animationType="slide" onRequestClose={() => setUserMenuAberto(false)}>
            <View style={styles.userModalOverlay}>
              <View style={styles.userModal}>
                {/* Cabeçalho do Modal */}
                <View style={styles.userModalHeader}>
                  <Text style={styles.userModalTitle}>Minha Conta</Text>
                  <TouchableOpacity onPress={() => setUserMenuAberto(false)}>
                    <CloseIconSvg />
                  </TouchableOpacity>
                </View>

                {/* Informações do Usuário */}
                <View style={styles.userInfoSection}>
                  <View style={styles.userAvatarLarge}>
                    {userData.avatar ? (
                      <Image source={{ uri: userData.avatar }} style={styles.avatarImage} />
                    ) : (
                      <UserIconSvg size={60} />
                    )}
                    <TouchableOpacity style={styles.changePhotoButton}>
                      <Text style={styles.changePhotoText}>📷</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.userName}>{userData.nome}</Text>
                  <Text style={styles.userEmail}>{userData.email}</Text>
                </View>

                {/* Opções do Menu */}
                <View style={styles.userMenuOptions}>
                  {/* Editar Perfil */}
                  <Link href="/editar-perfil" asChild>
                    <TouchableOpacity 
                      style={styles.userMenuOption}
                      onPress={() => setUserMenuAberto(false)}
                    >
                      <EditIconSvg />
                      <Text style={styles.userMenuOptionText}>Editar Perfil</Text>
                    </TouchableOpacity>
                  </Link>

                  {/* Configurações */}
                  <Link href="/configuracoes" asChild>
                    <TouchableOpacity 
                      style={styles.userMenuOption}
                      onPress={() => setUserMenuAberto(false)}
                    >
                      <SettingsIconSvg />
                      <Text style={styles.userMenuOptionText}>Configurações</Text>
                    </TouchableOpacity>
                  </Link>

                  {/* Separador */}
                  <View style={styles.userMenuSeparator} />

                  {/* Logout */}
                  <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={handleLogout}
                  >
                    <LogoutIconSvg />
                    <Text style={styles.logoutButtonText}>Sair da Conta</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* --- CONTEÚDO --- */}
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            
            {/* Hero Section */}
            <View style={styles.hero}>
              <Text style={styles.heroTitle}>PT Fronteira do Campus de Ponta Porã</Text>
              <Text style={styles.heroSubtitle}>Unindo forças pela educação, cultura e desenvolvimento da região de fronteira</Text>
              
              {/* Botões condicionais baseados no login */}
              {isLoggedIn ? (
                <View style={styles.heroButtons}>
                  <Link href="/projetos" asChild>
                    <TouchableOpacity style={styles.btnPrimary}>
                      <Text style={styles.btnPrimaryText}>Ver Projetos</Text>
                    </TouchableOpacity>
                  </Link>
                  <Link href="/meus-projetos" asChild>
                    <TouchableOpacity style={styles.btnSecondary}>
                      <Text style={styles.btnSecondaryText}>Meus Projetos</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              ) : (
                <Link href="/contato" asChild>
                  <TouchableOpacity style={styles.btnPrimary}>
                    <Text style={styles.btnPrimaryText}>Venha Conhecer</Text>
                  </TouchableOpacity>
                </Link>
              )}
            </View>

            {/* Seção de Boas-vindas para usuários logados */}
            {isLoggedIn && (
              <View style={styles.welcomeSection}>
                <View style={styles.welcomeAvatarContainer}>
                  {userData.avatar ? (
                    <Image source={{ uri: userData.avatar }} style={styles.welcomeAvatar} />
                  ) : (
                    <UserIconSvg size={50} />
                  )}
                </View>
                <Text style={styles.welcomeTitle}>Bem-vindo de volta, {userData.nome.split(' ')[0]}!</Text>
                <Text style={styles.welcomeText}>Confira as novidades e projetos do PET Fronteira</Text>
              </View>
            )}

          </ScrollView>

        </SafeAreaView>
        
        {/* --- FOOTER --- */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerSection}>
              <Text style={styles.footerTitle}>PT Fronteira</Text>
              <Text style={styles.footerText}>UFMS Universidade Federal de Mato Grosso do Sul</Text>
              <Text style={styles.footerText}>Campus de Ponta Porã</Text>
            </View>
            
            <View style={styles.footerSection}>
              <Text style={styles.footerTitle}>Links Rápidos</Text>
              <Link href="/sobre" style={styles.footerLink}>Sobre</Link>
              <Link href="/projetos" style={styles.footerLink}>Projetos</Link>
              <Link href="/contato" style={styles.footerLink}>Contato</Link>
            </View>
            
            <View style={styles.footerSection}>
              <Text style={styles.footerTitle}>Redes Sociais</Text>
              <View style={styles.socialLinks}>
                <Link href="https://www.instagram.com/petfronteira?igsh=aWZiajhvcTYyOWUz" style={styles.socialLink}>Instagram</Link>
              </View>
            </View>
          </View>
          
          <View style={styles.footerBottom}>
            <Text style={styles.footerBottomText}>
              © 2026 PT Fronteira - Todos os direitos reservados
            </Text>
          </View>
        </View>
      </ThemedView>
    </>
  );
}

// --- ESTILOS ATUALIZADOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#11121C',
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  
  // Header
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2b3d',
    backgroundColor: '#11121C',
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoImage: {
    width: 45,
    height: 45,
    borderRadius: 10,
  },
  logoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoSubtitle: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  userButton: {
    padding: 5,
    position: 'relative',
  },
  userIconContainer: {
    position: 'relative',
  },
  loginDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4444',
    borderWidth: 2,
    borderColor: '#11121C',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#F0502D',
  },
  hamburgerBtn: {
    padding: 5,
  },

  // Menu Principal Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  menuDropdown: {
    backgroundColor: '#1c1d2b',
    width: '100%',
    height: '100%',
    padding: 30,
    paddingTop: 60,
    alignItems: 'center',
  },
  closeBtnTop: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  menuLinksContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  navLink: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
    marginVertical: 12,
    width: '100%',
    textAlign: 'center',
    paddingVertical: 8,
  },
  menuSeparator: {
    width: '80%',
    height: 1,
    backgroundColor: '#2a2b3d',
    marginVertical: 15,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0502D',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    gap: 10,
    width: '80%',
    marginTop: 5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Menu do Usuário Modal
  userModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  userModal: {
    backgroundColor: '#1c1d2b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    paddingBottom: 40,
  },
  userModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  userModalTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  userInfoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  userAvatarLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#2a2b3d',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#F0502D',
    position: 'relative',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: -5,
    backgroundColor: '#F0502D',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1c1d2b',
  },
  changePhotoText: {
    fontSize: 14,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  userMenuOptions: {
    gap: 5,
  },
  userMenuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2a2b3d',
    borderRadius: 10,
    gap: 15,
  },
  userMenuOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  userMenuSeparator: {
    height: 1,
    backgroundColor: '#2a2b3d',
    marginVertical: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F0502D',
    borderRadius: 10,
    gap: 15,
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Hero
  hero: {
    backgroundColor: '#2a2b3d',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#F0502D',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    color: '#DDDDDD',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 15,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  // Seção de Boas-vindas
  welcomeSection: {
    padding: 25,
    alignItems: 'center',
  },
  welcomeAvatarContainer: {
    marginBottom: 15,
  },
  welcomeAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#F0502D',
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeText: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
  },
  
  // Footer
  footer: {
    backgroundColor: '#1c1d2b',
    borderTopWidth: 3,
    borderTopColor: '#F0502D',
    paddingVertical: 20,
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 20,
  },
  footerSection: {
    flex: 1,
    minWidth: 140,
  },
  footerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#F0502D',
    paddingBottom: 5,
  },
  footerText: {
    color: '#CCCCCC',
    fontSize: 13,
    marginBottom: 5,
    lineHeight: 18,
  },
  footerLink: {
    color: '#CCCCCC',
    fontSize: 13,
    marginBottom: 6,
    lineHeight: 18,
  },
  socialLinks: {
    gap: 6,
  },
  socialLink: {
    color: '#F0502D',
    fontSize: 13,
    marginBottom: 4,
  },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: '#2a2b3d',
    paddingTop: 15,
    alignItems: 'center',
  },
  footerBottomText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  
  // Botões
  btnPrimary: {
    backgroundColor: '#F0502D',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#11121C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F0502D',
  },
  btnSecondaryText: {
    color: '#F0502D',
    fontSize: 16,
    fontWeight: 'bold',
  },
});