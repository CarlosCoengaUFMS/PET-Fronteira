import React, { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import { Platform, StyleSheet, ScrollView, View, Text, TouchableOpacity, Image, Modal, Alert, Animated, Easing, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, Stack, router } from 'expo-router';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// Supabase
import { supabase } from '../utils/supabase';

// --- ÍCONES DO HEADER E NAVEGAÇÃO ---
const MenuIconSvg = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="2.5" rx="1" fill="#FFFFFF" />
    <Rect x="3" y="11" width="18" height="2.5" rx="1" fill="#FFFFFF" />
    <Rect x="3" y="18" width="18" height="2.5" rx="1" fill="#FFFFFF" />
  </Svg>
);

const CloseIconSvg = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6L18 18" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const LoginIconSvg = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UserIconSvg = ({ size = 32 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#2a2b3d" stroke="#F0502D" strokeWidth="2" />
    <Circle cx="12" cy="9" r="3" fill="#F0502D" />
    <Path d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="#F0502D" />
  </Svg>
);

const SettingsIconSvg = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke="#FFFFFF" strokeWidth="2" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const EditIconSvg = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const LogoutIconSvg = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// --- ÍCONE: SETA DO FOOTER ---
const ChevronIconSvg = ({ expanded }: { expanded: boolean }) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
  >
    <Path d="M18 15l-6-6-6 6" stroke="#F0502D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// --- ÍCONE: FACEBOOK (Redes Sociais) ---
const FacebookIconSvg = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"
      fill="#F0502D"
    />
  </Svg>
);
// --- ÍCONE: INSTAGRAM ---
const InstagramIconSvg = ({ size = 22 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="5"
      stroke="#F0502D"
      strokeWidth="2"
    />
    <Circle
      cx="12"
      cy="12"
      r="4"
      stroke="#F0502D"
      strokeWidth="2"
    />
    <Circle
      cx="17.5"
      cy="6.5"
      r="1"
      fill="#F0502D"
    />
  </Svg>
);
// --- ÍCONES DAS RECURSOS DA SEÇÃO "O QUE O PET PROPORCIONA" ---
const SearchIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke="#F0502D" strokeWidth="2" />
    <Path d="M20 20L16 16" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const EaselIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="11" rx="2" stroke="#F0502D" strokeWidth="2" />
    <Path d="M12 15v5M8 20l1-5M16 20l-1-5M8 4V2M16 4V2" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const PeopleIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" />
    <Circle cx="9" cy="7" r="4" stroke="#F0502D" strokeWidth="2" />
    <Path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const DocumentIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" />
    <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const ToolsIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MicIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Rect x="9" y="2" width="6" height="12" rx="3" stroke="#F0502D" strokeWidth="2" />
    <Path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const MonitorIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke="#F0502D" strokeWidth="2" />
    <Path d="M6 21v-2a6 6 0 0 1 12 0v2" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const DollarIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke="#F0502D" strokeWidth="2" />
    <Path d="M12 6v12M15 9.5c0-1.38-1.34-2.5-3-2.5s-3 1.12-3 2.5 1.34 2.5 3 2.5 3 1.12 3 2.5-1.34 2.5-3 2.5-3-1.12-3-2.5" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export default function HomeScreen() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [userMenuAberto, setUserMenuAberto] = useState(false);

  // --- ESTADO E ANIMAÇÃO DO FOOTER FLUTUANTE ---
  const [footerVisivel, setFooterVisivel] = useState(false);
  const footerAnim = useRef(new Animated.Value(0)).current;

  const toggleFooter = () => {
    const abrindo = !footerVisivel;
    setFooterVisivel(abrindo);
    Animated.timing(footerAnim, {
      toValue: abrindo ? 1 : 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({
    nome: '',
    email: '',
    cargo: '',
    avatar: null
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      atualizarDadosDoUsuario(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      atualizarDadosDoUsuario(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const atualizarDadosDoUsuario = (session: any) => {
    if (session?.user) {
      setIsLoggedIn(true);
      setUserData({
        nome: session.user.user_metadata?.full_name || 'Usuário',
        email: session.user.email,
        cargo: session.user.user_metadata?.cargo || 'Membro',
        avatar: session.user.user_metadata?.avatar_url || null
      });
    } else {
      setIsLoggedIn(false);
      setUserData({ nome: '', email: '', cargo: '', avatar: null });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserMenuAberto(false);
    setMenuAberto(false);

    if (Platform.OS === 'web') {
      window.alert('Você saiu da conta.');
    } else {
      Alert.alert('Sucesso', 'Você saiu da conta.');
    }
  };

  const handleUserIconPress = () => {
    if (isLoggedIn) {
      setUserMenuAberto(true);
    } else {
      router.push('/login');
    }
  };

  const abrirLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      if (Platform.OS === 'web') {
        window.alert('Não foi possível abrir o link.');
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o link.');
      }
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'PET Fronteira',
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
                  <Text style={styles.logoTitle}>PET Fronteira</Text>
                  <Text style={styles.logoSubtitle}>Campus de Ponta Porã</Text>
                </View>
              </View>

              <View style={styles.headerButtons}>
                <TouchableOpacity
                  onPress={handleUserIconPress}
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

                  <View style={styles.menuSeparator} />

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
                <View style={styles.userModalHeader}>
                  <Text style={styles.userModalTitle}>Minha Conta</Text>
                  <TouchableOpacity onPress={() => setUserMenuAberto(false)}>
                    <CloseIconSvg />
                  </TouchableOpacity>
                </View>

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
                  <Text style={styles.userRole}>{userData.cargo}</Text>
                </View>

                <View style={styles.userMenuOptions}>
                  <Link href="/editar-perfil" asChild>
                    <TouchableOpacity
                      style={styles.userMenuOption}
                      onPress={() => setUserMenuAberto(false)}
                    >
                      <EditIconSvg />
                      <Text style={styles.userMenuOptionText}>Editar Perfil</Text>
                    </TouchableOpacity>
                  </Link>

                  <Link href="/configuracoes" asChild>
                    <TouchableOpacity
                      style={styles.userMenuOption}
                      onPress={() => setUserMenuAberto(false)}
                    >
                      <SettingsIconSvg />
                      <Text style={styles.userMenuOptionText}>Configurações</Text>
                    </TouchableOpacity>
                  </Link>

                  <View style={styles.userMenuSeparator} />

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

          {/* --- CONTEÚDO PRINCIPAL --- */}
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

            {/* Hero Section */}
            <View style={styles.hero}>
              <Text style={styles.heroTitle}>PET Fronteira do Campus de Ponta Porã</Text>
              <Text style={styles.heroSubtitle}>Unindo forças pela educação, cultura e desenvolvimento da região de fronteira</Text>

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

            {/* Boas-vindas para usuários logados */}
            {isLoggedIn && userData.nome && (
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

            {/* --- SEÇÃO: QUEM SOMOS --- */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                Quem somos<Text style={styles.orangeHighlight}>?</Text>
              </Text>
              <Text style={styles.sectionSubtitle}>
                Conheça o Programa de Educação Tutorial (PET) da UFMS.
              </Text>

              <View style={styles.aboutCardsContainer}>
                <View style={styles.aboutCard}>
                  <Text style={styles.aboutCardText}>
                    O Programa de Educação Tutorial (PET) é uma iniciativa do Ministério da Educação (MEC) criado para promover a indissociabilidade entre ensino, pesquisa e extensão nas universidades brasileiras. Na UFMS, o PET visa aprimorar a formação acadêmica dos estudantes, estimulando o desenvolvimento de habilidades críticas e criativas.
                  </Text>
                </View>

                <View style={styles.aboutCard}>
                  <Text style={styles.aboutCardText}>
                    O PET Fronteira é um grupo de Programa de Educação Tutorial que atua na integração entre ensino, pesquisa e extensão. Nosso objetivo é proporcionar experiências enriquecedoras aos petianos, desenvolvendo projetos inovadores que impactam positivamente a comunidade acadêmica e a sociedade. Trabalhamos com autonomia, responsabilidade e espírito colaborativo, sempre em sintonia com os princípios da universidade pública.
                  </Text>
                </View>
              </View>
            </View>

            {/* --- SEÇÃO: O QUE O PET PROPORCIONA --- */}
            <View style={[styles.sectionContainer, styles.sectionAltBg]}>
              <Text style={styles.sectionTitle}>
                O que o PET proporciona<Text style={styles.orangeHighlight}>?</Text>
              </Text>
              <Text style={styles.sectionSubtitle}>
                Essas são algumas das principais vantagens e experiências que o PET oferece.
              </Text>

              <View style={styles.featuresGrid}>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}><SearchIcon /></View>
                  <View style={styles.featureTextContent}>
                    <Text style={styles.featureTitle}>Projetos de Pesquisa</Text>
                    <Text style={styles.featureDesc}>Desenvolvimento de estudos científicos em áreas de interesse do grupo.</Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}><EaselIcon /></View>
                  <View style={styles.featureTextContent}>
                    <Text style={styles.featureTitle}>Eventos Científicos</Text>
                    <Text style={styles.featureDesc}>Envolvimento em seminários, feiras e encontros de pesquisa.</Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}><PeopleIcon /></View>
                  <View style={styles.featureTextContent}>
                    <Text style={styles.featureTitle}>Projetos de Extensão</Text>
                    <Text style={styles.featureDesc}>Ações junto à comunidade para aplicar os conhecimentos adquiridos no curso.</Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}><DocumentIcon /></View>
                  <View style={styles.featureTextContent}>
                    <Text style={styles.featureTitle}>Projetos de Ensino</Text>
                    <Text style={styles.featureDesc}>Estratégias inovadoras voltadas ao aprimoramento do processo de ensino-aprendizagem.</Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}><ToolsIcon /></View>
                  <View style={styles.featureTextContent}>
                    <Text style={styles.featureTitle}>Oficinas</Text>
                    <Text style={styles.featureDesc}>Atividades práticas e dinâmicas para desenvolvimento de habilidades acadêmicas e profissionais.</Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}><MicIcon /></View>
                  <View style={styles.featureTextContent}>
                    <Text style={styles.featureTitle}>Palestras</Text>
                    <Text style={styles.featureDesc}>Eventos com convidados para discutir temas relevantes da área, atualidades e mercado de trabalho.</Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}><MonitorIcon /></View>
                  <View style={styles.featureTextContent}>
                    <Text style={styles.featureTitle}>Monitorias</Text>
                    <Text style={styles.featureDesc}>Apoio contínuo em disciplinas, auxiliando colegas com dúvidas e práticas de aprendizado.</Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}><DollarIcon /></View>
                  <View style={styles.featureTextContent}>
                    <Text style={styles.featureTitle}>Ajuda financeira para bolsistas</Text>
                    <Text style={styles.featureDesc}>Bolsa auxílio para membros bolsistas.</Text>
                  </View>
                </View>
              </View>
            </View>

          </ScrollView>

          {/* --- FOOTER FLUTUANTE FIXO (fora do ScrollView) --- */}
          <View style={styles.footerOverlay} pointerEvents="box-none">
            <Animated.View
              pointerEvents={footerVisivel ? 'auto' : 'none'}
              style={[
                styles.footer,
                styles.floatingFooter,
                {
                  opacity: footerAnim,
                  transform: [
                    {
                      translateY: footerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.footerContent}>
                <View style={styles.footerSection}>
                  <Text style={styles.footerTitle}>PET Fronteira</Text>
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
                  <Text style={styles.footerTitle}>Úteis</Text>
                  <TouchableOpacity onPress={() => abrirLink('https://prograd.ufms.br/calendario-academico/')}>
                    <Text style={styles.footerLink}>Calendário Acadêmico</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => abrirLink('https://sigproj.ufms.br/')}>
                    <Text style={styles.footerLink}>SIGPROJ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => abrirLink('https://siscad.ufms.br/')}>
                    <Text style={styles.footerLink}>SISCAD</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => abrirLink('https://ava.ufms.br/')}>
                    <Text style={styles.footerLink}>AVA</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => abrirLink('https://prograd.ufms.br/programas-e-projetos/programa-de-educacao-tutorial-pet/')}>
                    <Text style={styles.footerLink}>Pets UFMS</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => abrirLink('https://www.ufms.br/')}>
                    <Text style={styles.footerLink}>UFMS</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => abrirLink('https://cppp.ufms.br/')}>
                    <Text style={styles.footerLink}>Campus Ponta Porã</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.footerSection}>
                  <Text style={styles.footerTitle}>Redes Sociais</Text>

                  <View style={styles.socialLinks}>
                    {/* Facebook */}
                    <TouchableOpacity
                      style={styles.socialIconBtn}
                      onPress={() => abrirLink('https://www.facebook.com/pet.fronteira/')}
                    >
                      <FacebookIconSvg size={22} />
                    </TouchableOpacity>

                    {/* Instagram */}
                    <TouchableOpacity
                      style={styles.socialIconBtn}
                      onPress={() => abrirLink('https://www.instagram.com/petfronteira/?hl=pt')}
                    >
                      <InstagramIconSvg size={22} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.footerBottom}>
                <Text style={styles.footerBottomText}>
                  © 2026 PET Fronteira - Todos os direitos reservados
                </Text>
              </View>
            </Animated.View>

            <TouchableOpacity
              style={styles.footerToggleBtn}
              onPress={toggleFooter}
              activeOpacity={0.8}
            >
              <ChevronIconSvg expanded={footerVisivel} />
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </ThemedView>
    </>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#11121C' },
  safeArea: { flex: 1 },
  scrollContainer: { flexGrow: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#2a2b3d', backgroundColor: '#11121C', zIndex: 10 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerButtons: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoImage: { width: 45, height: 45, borderRadius: 10 },
  logoTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  logoSubtitle: { color: '#CCCCCC', fontSize: 12 },
  userButton: { padding: 5, position: 'relative' },
  userIconContainer: { position: 'relative' },
  loginDot: { position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF4444', borderWidth: 2, borderColor: '#11121C' },
  userAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#F0502D' },
  hamburgerBtn: { padding: 5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)' },
  menuDropdown: { backgroundColor: '#1c1d2b', width: '100%', height: '100%', padding: 30, paddingTop: 60, alignItems: 'center' },
  closeBtnTop: { position: 'absolute', top: 40, right: 20, zIndex: 10 },
  menuLinksContainer: { width: '100%', alignItems: 'center', marginTop: 20 },
  navLink: { color: '#FFFFFF', fontSize: 20, fontWeight: '500', marginVertical: 12, width: '100%', textAlign: 'center', paddingVertical: 8 },
  menuSeparator: { width: '80%', height: 1, backgroundColor: '#2a2b3d', marginVertical: 15 },
  loginButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0502D', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 8, gap: 10, width: '80%', marginTop: 5 },
  loginButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },

  userModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  userModal: { backgroundColor: '#1c1d2b', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 25, paddingBottom: 40 },
  userModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  userModalTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
  userInfoSection: { alignItems: 'center', marginBottom: 30 },
  userAvatarLarge: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#2a2b3d', justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 3, borderColor: '#F0502D', position: 'relative' },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  changePhotoButton: { position: 'absolute', bottom: 0, right: -5, backgroundColor: '#F0502D', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1c1d2b' },
  changePhotoText: { fontSize: 14 },
  userName: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  userEmail: { color: '#CCCCCC', fontSize: 14, marginBottom: 5 },
  userRole: { color: '#F0502D', fontSize: 14, fontWeight: 'bold', backgroundColor: '#2a2b3d', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },

  userMenuOptions: { gap: 5 },
  userMenuOption: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#2a2b3d', borderRadius: 10, gap: 15 },
  userMenuOptionText: { color: '#FFFFFF', fontSize: 16 },
  userMenuSeparator: { height: 1, backgroundColor: '#2a2b3d', marginVertical: 10 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#F0502D', borderRadius: 10, gap: 15, justifyContent: 'center' },
  logoutButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

  hero: { backgroundColor: '#2a2b3d', padding: 40, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 4, borderBottomColor: '#F0502D' },
  heroTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  heroSubtitle: { color: '#DDDDDD', fontSize: 16, textAlign: 'center', marginBottom: 25 },
  heroButtons: { flexDirection: 'row', gap: 15, flexWrap: 'wrap', justifyContent: 'center' },

  welcomeSection: { padding: 25, alignItems: 'center' },
  welcomeAvatarContainer: { marginBottom: 15 },
  welcomeAvatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#F0502D' },
  welcomeTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  welcomeText: { color: '#CCCCCC', fontSize: 16, textAlign: 'center' },

  sectionContainer: { paddingVertical: 45, paddingHorizontal: 20, alignItems: 'center' },
  sectionAltBg: { backgroundColor: '#161724', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#2a2b3d' },
  sectionTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  orangeHighlight: { color: '#F0502D' },
  sectionSubtitle: { color: '#AAAAAA', fontSize: 15, textAlign: 'center', marginBottom: 35, paddingHorizontal: 10 },

  aboutCardsContainer: { gap: 18, width: '100%', maxWidth: 900 },
  aboutCard: { backgroundColor: '#1c1d2b', padding: 22, borderRadius: 12, borderWidth: 1, borderColor: '#2a2b3d' },
  aboutCardText: { color: '#DDDDDD', fontSize: 14, lineHeight: 22, textAlign: 'justify' },

  featuresGrid: { width: '100%', maxWidth: 900, gap: 16, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  featureItem: { flexDirection: 'row', width: '31%', minWidth: 260, alignItems: 'flex-start', gap: 12 },
  featureIconContainer: { width: 48, height: 48, borderRadius: 10, backgroundColor: 'rgba(240, 80, 45, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(240, 80, 45, 0.2)' },
  featureTextContent: { flex: 1 },
  featureTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  featureDesc: { color: '#AAAAAA', fontSize: 13, lineHeight: 19 },

  // --- FOOTER FLUTUANTE & BOTÃO ---
  footerOverlay: {
    position: 'absolute',
    left: 15,
    bottom: 20,
    zIndex: 100,
    elevation: 10,
  },
  footerToggleBtn: {
    backgroundColor: '#1c1d2b',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2b3d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  floatingFooter: {
    position: 'absolute',
    bottom: 56,
    left: 0,
    width: 340,
    maxWidth: 360,
    borderRadius: 12,
    overflow: 'hidden',
  },

  footer: { backgroundColor: '#1c1d2b', borderTopWidth: 3, borderTopColor: '#F0502D', paddingVertical: 20, paddingHorizontal: 15 },
  footerContent: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 15, marginBottom: 20 },
  footerSection: { flex: 1, minWidth: 140 },
  footerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 10, borderBottomWidth: 2, borderBottomColor: '#F0502D', paddingBottom: 5 },
  footerText: { color: '#CCCCCC', fontSize: 13, marginBottom: 5, lineHeight: 18 },
  footerLink: { color: '#CCCCCC', fontSize: 13, marginBottom: 6, lineHeight: 18 },
  socialLinks: { gap: 6 },
  socialLink: { color: '#F0502D', fontSize: 13, marginBottom: 4 },
  socialIconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(240, 80, 45, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(240, 80, 45, 0.3)' },
  footerBottom: { borderTopWidth: 1, borderTopColor: '#2a2b3d', paddingTop: 15, alignItems: 'center' },
  footerBottomText: { color: '#666', fontSize: 12, textAlign: 'center' },

  btnPrimary: { backgroundColor: '#F0502D', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 8, alignItems: 'center' },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  btnSecondary: { backgroundColor: 'transparent', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 8, alignItems: 'center', borderWidth: 2, borderColor: '#F0502D' },
  btnSecondaryText: { color: '#F0502D', fontSize: 16, fontWeight: 'bold' },
});