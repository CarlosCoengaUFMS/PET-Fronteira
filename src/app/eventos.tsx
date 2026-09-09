import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

import { ThemedView } from '@/components/themed-view';
import { supabase } from '../utils/supabase';

// --- ÍCONES ---
const BackIconSvg = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke="#F0502D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const HomeIconSvg = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M3 11l9-8 9 8" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChevronLeftSvg = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChevronRightSvg = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M9 6l6 6-6 6" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChevronDownSvg = ({ aberto }: { aberto: boolean }) => (
  <Svg
    width={18}
    height={18}
    viewBox="0 0 24 24"
    fill="none"
    style={{ transform: [{ rotate: aberto ? '180deg' : '0deg' }] }}
  >
    <Path d="M6 9l6 6 6-6" stroke="#F0502D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const FolderIconSvg = () => (
  <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
    <Path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// --- TIPOS ---
interface AtividadeEvento {
  uuid: string;
  titulo: string;
  sobre: string | null;
  data_inicio: string;
  status: string | null;
  imagem_url: string | null;
  projeto: { titulo: string } | null;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const DIAS_SEMANA = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

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

export default function EventosScreen() {
  const hoje = new Date();
  const [mesAtual, setMesAtual] = useState(hoje.getMonth());
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());

  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [logado, setLogado] = useState(false);

  const [atividades, setAtividades] = useState<AtividadeEvento[]>([]);
  const [carregandoAtividades, setCarregandoAtividades] = useState(true);
  const [expandidoUuid, setExpandidoUuid] = useState<string | null>(null);

  useEffect(() => {
    verificarSessao();
  }, []);

  const verificarSessao = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setLogado(true);
      buscarAtividades();
    } else {
      setLogado(false);
    }
    setCarregandoSessao(false);
  };

  const buscarAtividades = async () => {
    setCarregandoAtividades(true);
    const { data, error } = await supabase
      .from('atividade')
      .select('uuid, titulo, sobre, data_inicio, status, imagem_url, projeto:projeto_uuid(titulo)')
      .not('data_inicio', 'is', null)
      .order('data_inicio', { ascending: true });

    if (!error && data) {
      setAtividades(data as any as AtividadeEvento[]);
    } else if (error) {
      console.error('Erro ao buscar atividades:', error);
    }
    setCarregandoAtividades(false);
  };

  const voltar = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const irParaHome = () => {
    router.push('/');
  };

  const irParaMesAnterior = () => {
    if (mesAtual === 0) {
      setMesAtual(11);
      setAnoAtual(anoAtual - 1);
    } else {
      setMesAtual(mesAtual - 1);
    }
  };

  const irParaProximoMes = () => {
    if (mesAtual === 11) {
      setMesAtual(0);
      setAnoAtual(anoAtual + 1);
    } else {
      setMesAtual(mesAtual + 1);
    }
  };

  // Gera a grade de dias do mês (começando na segunda-feira)
  const gerarDiasDoMes = () => {
    const primeiroDia = new Date(anoAtual, mesAtual, 1);
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
    const diasNoMes = ultimoDia.getDate();

    let diaSemanaInicio = primeiroDia.getDay();
    diaSemanaInicio = diaSemanaInicio === 0 ? 6 : diaSemanaInicio - 1;

    const dias: (number | null)[] = [];

    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null);
    }
    for (let dia = 1; dia <= diasNoMes; dia++) {
      dias.push(dia);
    }
    while (dias.length % 7 !== 0) {
      dias.push(null);
    }

    return dias;
  };

  const diasDoMes = gerarDiasDoMes();
  const semanas: (number | null)[][] = [];
  for (let i = 0; i < diasDoMes.length; i += 7) {
    semanas.push(diasDoMes.slice(i, i + 7));
  }

  const ehHoje = (dia: number | null) => {
    if (!dia) return false;
    return (
      dia === hoje.getDate() &&
      mesAtual === hoje.getMonth() &&
      anoAtual === hoje.getFullYear()
    );
  };

  // Dias do mês exibido que têm pelo menos uma atividade agendada
  const diasComEvento = new Set<number>();
  atividades.forEach((atividade) => {
    const data = new Date(atividade.data_inicio);
    if (data.getFullYear() === anoAtual && data.getMonth() === mesAtual) {
      diasComEvento.add(data.getDate());
    }
  });

  const toggleExpandido = (uuid: string) => {
    setExpandidoUuid((atual) => (atual === uuid ? null : uuid));
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
            <TouchableOpacity onPress={voltar} style={styles.backButton}>
              <BackIconSvg />
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={irParaHome} style={styles.homeBtn}>
              <HomeIconSvg />
            </TouchableOpacity>
          </View>
          <View style={styles.lockedContainer}>
            <Text style={styles.lockedTitle}>Área restrita</Text>
            <Text style={styles.lockedText}>Você precisa estar logado para ver o calendário de eventos.</Text>
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
      <Stack.Screen options={{ title: 'Eventos', headerShown: false }} />

      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={voltar} style={styles.backButton}>
              <BackIconSvg />
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={irParaHome} style={styles.homeBtn}>
              <HomeIconSvg />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

            {/* --- CALENDÁRIO --- */}
            <View style={styles.calendarSection}>
              <View style={styles.calendarHeaderRow}>
                <Text style={styles.calendarTitle}>Calendário de Eventos</Text>

                <View style={styles.calendarNav}>
                  <Text style={styles.calendarMonthLabel}>
                    {MESES[mesAtual]} {anoAtual}
                  </Text>
                  <TouchableOpacity onPress={irParaMesAnterior} style={styles.calendarNavBtn}>
                    <ChevronLeftSvg />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={irParaProximoMes} style={styles.calendarNavBtn}>
                    <ChevronRightSvg />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.calendarGrid}>
                <View style={styles.calendarWeekRow}>
                  {DIAS_SEMANA.map((dia) => (
                    <Text key={dia} style={styles.calendarWeekDayLabel}>{dia}</Text>
                  ))}
                </View>

                {semanas.map((semana, index) => (
                  <View key={index} style={styles.calendarWeekRow}>
                    {semana.map((dia, i) => {
                      const hojeAtual = ehHoje(dia);
                      const comEvento = dia !== null && diasComEvento.has(dia);
                      return (
                        <View
                          key={i}
                          style={[
                            styles.calendarDayCell,
                            hojeAtual && styles.calendarDayCellToday,
                            !hojeAtual && comEvento && styles.calendarDayCellEvento,
                          ]}
                        >
                          {dia !== null && (
                            <Text style={[styles.calendarDayText, hojeAtual && styles.calendarDayTextToday]}>
                              {dia}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>

            {/* --- LISTA DE EVENTOS --- */}
            <View style={styles.eventosSection}>
              {carregandoAtividades ? (
                <ActivityIndicator color="#F0502D" size="large" style={{ marginVertical: 30 }} />
              ) : atividades.length > 0 ? (
                <View style={styles.eventosLista}>
                  {atividades.map((atividade) => {
                    const concluida = atividade.status === 'Concluída';
                    const expandido = expandidoUuid === atividade.uuid;

                    return (
                      <TouchableOpacity
                        key={atividade.uuid}
                        style={styles.eventoCard}
                        onPress={() => toggleExpandido(atividade.uuid)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.eventoLinha}>
                          {atividade.imagem_url ? (
                            <Image source={{ uri: atividade.imagem_url }} style={styles.eventoImagem} resizeMode="cover" />
                          ) : (
                            <View style={styles.eventoImagemPlaceholder}>
                              <FolderIconSvg />
                            </View>
                          )}

                          <View style={styles.eventoConteudo}>
                            <View
                              style={[
                                styles.eventoBadge,
                                concluida ? styles.eventoBadgeConcluido : styles.eventoBadgeEmBreve,
                              ]}
                            >
                              <Text style={styles.eventoBadgeText}>
                                {concluida ? 'Concluído' : 'Em breve'}
                              </Text>
                            </View>

                            <Text style={styles.eventoDataHora}>{formatarDataHora(atividade.data_inicio)}</Text>
                            <Text style={styles.eventoTitulo}>{atividade.titulo}</Text>
                            {atividade.projeto?.titulo ? (
                              <Text style={styles.eventoLocal}>{atividade.projeto.titulo}</Text>
                            ) : null}
                          </View>

                          <ChevronDownSvg aberto={expandido} />
                        </View>

                        {expandido && (
                          <View style={styles.eventoExpandido}>
                            {atividade.imagem_url && (
                              <Image source={{ uri: atividade.imagem_url }} style={styles.eventoImagemGrande} resizeMode="cover" />
                            )}
                            {atividade.sobre ? (
                              <Text style={styles.eventoSobre}>{atividade.sobre}</Text>
                            ) : (
                              <Text style={styles.eventoSobreVazio}>Nenhuma descrição adicionada para este evento.</Text>
                            )}
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.eventosEmptyState}>
                  <FolderIconSvg />
                  <Text style={styles.emptyText}>
                    Nenhum evento cadastrado ainda. Assim que os líderes de projeto criarem atividades, elas aparecerão aqui automaticamente.
                  </Text>
                </View>
              )}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#2a2b3d' },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backButtonText: { color: '#F0502D', fontSize: 16, fontWeight: '500' },
  homeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1c1d2b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2b3d',
  },
  scrollContainer: { flexGrow: 1, paddingBottom: 40 },

  emptyText: { color: '#666', fontSize: 14, textAlign: 'center', lineHeight: 21 },

  // --- CALENDÁRIO ---
  calendarSection: { padding: 20, maxWidth: 420, width: '100%', alignSelf: 'center' },
  calendarHeaderRow: { marginBottom: 16 },
  calendarTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  calendarNav: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  calendarMonthLabel: { color: '#CCCCCC', fontSize: 14, flex: 1 },
  calendarNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1c1d2b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2b3d',
  },
  calendarGrid: {
    backgroundColor: '#1c1d2b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2b3d',
    padding: 12,
  },
  calendarWeekRow: { flexDirection: 'row' },
  calendarWeekDayLabel: {
    flex: 1,
    textAlign: 'center',
    color: '#666',
    fontSize: 10,
    fontWeight: 'bold',
    paddingVertical: 8,
  },
  calendarDayCell: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 38,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 6,
  },
  calendarDayCellToday: { backgroundColor: '#F0502D' },
  calendarDayCellEvento: { borderWidth: 2, borderColor: '#F0502D' },
  calendarDayText: { color: '#CCCCCC', fontSize: 12 },
  calendarDayTextToday: { color: '#FFFFFF', fontWeight: 'bold' },

  // --- LISTA DE EVENTOS ---
  eventosSection: { paddingHorizontal: 20, paddingTop: 10 },
  eventosLista: { gap: 16 },
  eventoCard: {
    backgroundColor: '#1c1d2b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2b3d',
    overflow: 'hidden',
  },
  eventoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventoImagem: { width: 100, height: 110 },
  eventoImagemPlaceholder: {
    width: 100,
    height: 110,
    backgroundColor: '#2a2b3d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventoConteudo: { flex: 1, padding: 14, gap: 4 },
  eventoBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginBottom: 4 },
  eventoBadgeConcluido: { backgroundColor: '#2a2b3d' },
  eventoBadgeEmBreve: { backgroundColor: '#1c6fa8' },
  eventoBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  eventoDataHora: { color: '#F0502D', fontSize: 11, fontWeight: 'bold' },
  eventoTitulo: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  eventoLocal: { color: '#666', fontSize: 11, marginTop: 4 },

  eventoExpandido: {
    borderTopWidth: 1,
    borderTopColor: '#2a2b3d',
    padding: 14,
    gap: 12,
  },
  eventoImagemGrande: { width: '100%', height: 180, borderRadius: 10 },
  eventoSobre: { color: '#CCCCCC', fontSize: 13, lineHeight: 20 },
  eventoSobreVazio: { color: '#666', fontSize: 13, fontStyle: 'italic' },

  eventosEmptyState: {
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#1c1d2b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2a2b3d',
    borderStyle: 'dashed',
    padding: 30,
  },

  lockedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 30 },
  lockedTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  lockedText: { color: '#AAAAAA', fontSize: 14, textAlign: 'center' },
  loginBtn: { backgroundColor: '#F0502D', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 8, marginTop: 10 },
  loginBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});