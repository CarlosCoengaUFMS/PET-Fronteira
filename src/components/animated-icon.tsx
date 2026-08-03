import React, { useState } from 'react';
import * as Device from 'expo-device';
import { Platform, StyleSheet, ScrollView, View, Text, TouchableOpacity, Image, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, Stack } from 'expo-router';
import Svg, { Path, Rect } from 'react-native-svg';

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

export default function HomeScreen() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', mensagem: '' });

  const enviarFormulario = () => {
    alert('Mensagem enviada com sucesso!');
    setForm({ nome: '', email: '', mensagem: '' });
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Configuração do ícone na aba do navegador */}
        <Stack.Screen 
          options={{
            title: 'PT Fronteira',
            headerShown: false,
            // Para web - ícone na aba do navegador
            ...(Platform.OS === 'web' && {
              headerStyle: {
                backgroundColor: '#11121C',
              },
            }),
          }}
        />
        
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
            
            {/* Botão Hamburguer */}
            <TouchableOpacity onPress={() => setMenuAberto(true)} style={styles.hamburgerBtn}>
              <MenuIconSvg />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- MENU --- */}
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
                
                {/* Login no menu hamburguer */}
                <Link href="/login" asChild onPress={() => setMenuAberto(false)}>
                  <TouchableOpacity style={styles.loginButton}>
                    <LoginIconSvg />
                    <Text style={styles.loginButtonText}>Login</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* --- CONTEÚDO --- */}
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Hero Section */}
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>PT Fronteira do Campus de Ponta Porã</Text>
            <Text style={styles.heroSubtitle}>Unindo forças pela educação, cultura e desenvolvimento da região de fronteira</Text>
            <Link href="/contato" asChild>
              <TouchableOpacity style={styles.btnPrimary}>
                <Text style={styles.btnPrimaryText}>Venha Conhecer</Text>
              </TouchableOpacity>
            </Link>
          </View>

        </ScrollView>

        {/* --- FOOTER --- */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerSection}>
              <Text style={styles.footerTitle}>PT Fronteira</Text>
              <Text style={styles.footerText}>Campus de Ponta Porã</Text>
              <Text style={styles.footerText}>Partido dos Trabalhadores</Text>
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
                <Text style={styles.socialLink}>Facebook</Text>
                <Text style={styles.socialLink}>Instagram</Text>
                <Text style={styles.socialLink}>Twitter</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.footerBottom}>
            <Text style={styles.footerBottomText}>
              © 2024 PT Fronteira - Todos os direitos reservados
            </Text>
          </View>
        </View>

      </SafeAreaView>
    </ThemedView>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#11121C',
  },
  safeArea: {
    flex: 1,
    paddingBottom: BottomTabInset,
  },
  scrollContainer: {
    paddingBottom: 40,
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  hamburgerBtn: {
    padding: 5,
  },

  // Menu Modal
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
    marginVertical: 15,
    width: '100%',
    textAlign: 'center',
  },
  menuSeparator: {
    width: '80%',
    height: 1,
    backgroundColor: '#2a2b3d',
    marginVertical: 20,
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
    marginTop: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
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
    marginBottom: 20,
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
  
  // Footer
  footer: {
    backgroundColor: '#1c1d2b',
    borderTopWidth: 2,
    borderTopColor: '#F0502D',
    paddingTop: 30,
    paddingBottom: 20,
    marginTop: 'auto',
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  footerSection: {
    flex: 1,
    minWidth: 150,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  footerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0502D',
    paddingBottom: 5,
  },
  footerText: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 5,
    lineHeight: 20,
  },
  footerLink: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  socialLinks: {
    gap: 8,
  },
  socialLink: {
    color: '#F0502D',
    fontSize: 14,
    marginBottom: 5,
  },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: '#2a2b3d',
    paddingTop: 15,
    alignItems: 'center',
  },
  footerBottomText: {
    color: '#888',
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
});