import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

import { ThemedView } from '@/components/themed-view';

// --- ÍCONES ---
const BackIconSvg = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke="#F0502D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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

const FolderIconSvg = () => (
  <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
    <Path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// --- TIPO: EVENTO (preparado para vir do banco futuramente) ---
// Quando a tabela "eventos" existir no Supabase (relacionada à tabela "projetos"
// que ainda está sendo montada), troque EVENTOS_ATUAIS por uma busca real:
//
// const { data, error } = await supabase
//   .from('eventos')
//   .select('*, projetos(nome)')
//   .order('data', { ascending: true });
//
interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data: string; 
  horario: string; 
  local: string;
  organizador: string;
  imagem_url: string | null;
  status: 'concluido' | 'em_breve';
}

// Array vazio de propósito — ainda sem backend de eventos/projetos.
const EVENTOS_ATUAIS: Evento[] = [];

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const DIAS_SEMANA = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

export default function EventosScreen() {
  const hoje = new Date();
  const [mesAtual, setMesAtual] = useState(hoje.getMonth());
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());

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

    // getDay(): 0 = domingo, 1 = segunda... ajustamos para começar na segunda
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

  return (
    <>
      <Stack.Screen options={{ title: 'Eventos', headerShown: false }} />

      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <BackIconSvg />
              <Text style={styles.backButtonText}>Voltar</Text>
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
                    {semana.map((dia, i) => (
                      <View
                        key={i}
                        style={[styles.calendarDayCell, ehHoje(dia) && styles.calendarDayCellToday]}
                      >
                        {dia !== null && (
                          <Text style={[styles.calendarDayText, ehHoje(dia) && styles.calendarDayTextToday]}>
                            {dia}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </View>

            {/* --- LISTA DE EVENTOS --- */}
            <View style={styles.eventosSection}>
              {EVENTOS_ATUAIS.length > 0 ? (
                <View style={styles.eventosLista}>
                  {EVENTOS_ATUAIS.map((evento) => (
                    <View key={evento.id} style={styles.eventoCard}>
                      {evento.imagem_url ? (
                        <Image source={{ uri: evento.imagem_url }} style={styles.eventoImagem} />
                      ) : (
                        <View style={styles.eventoImagemPlaceholder}>
                          <FolderIconSvg />
                        </View>
                      )}

                      <View style={styles.eventoConteudo}>
                        <View
                          style={[
                            styles.eventoBadge,
                            evento.status === 'concluido' ? styles.eventoBadgeConcluido : styles.eventoBadgeEmBreve,
                          ]}
                        >
                          <Text style={styles.eventoBadgeText}>
                            {evento.status === 'concluido' ? 'Concluído' : 'Em breve'}
                          </Text>
                        </View>

                        <Text style={styles.eventoDataHora}>{evento.data} às {evento.horario}</Text>
                        <Text style={styles.eventoTitulo}>{evento.titulo}</Text>
                        <Text style={styles.eventoDescricao}>{evento.descricao}</Text>
                        <Text style={styles.eventoLocal}>{evento.local} · {evento.organizador}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.eventosEmptyState}>
                  <FolderIconSvg />
                  <Text style={styles.emptyText}>
                    Nenhum evento cadastrado ainda. Assim que o banco de projetos e eventos estiver pronto, eles aparecerão aqui automaticamente.
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
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#2a2b3d' },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backButtonText: { color: '#F0502D', fontSize: 16, fontWeight: '500' },
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
  calendarDayText: { color: '#CCCCCC', fontSize: 12 },
  calendarDayTextToday: { color: '#FFFFFF', fontWeight: 'bold' },

  // --- LISTA DE EVENTOS ---
  eventosSection: { paddingHorizontal: 20, paddingTop: 10 },
  eventosLista: { gap: 16 },
  eventoCard: {
    flexDirection: 'row',
    backgroundColor: '#1c1d2b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2b3d',
    overflow: 'hidden',
  },
  eventoImagem: { width: 100, height: '100%', minHeight: 110 },
  eventoImagemPlaceholder: {
    width: 100,
    minHeight: 110,
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
  eventoDescricao: { color: '#AAAAAA', fontSize: 12, lineHeight: 18 },
  eventoLocal: { color: '#666', fontSize: 11, marginTop: 4 },

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
});