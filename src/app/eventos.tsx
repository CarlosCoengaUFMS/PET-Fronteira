import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Image, ActivityIndicator, TextInput, Alert, Platform } from 'react-native';
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

const FolderIconSvg = () => (
  <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
    <Path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TagIconSvg = () => (
  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
    <Path d="M20.59 13.41L11 3.83A2 2 0 0 0 9.5 3H4a1 1 0 0 0-1 1v5.5a2 2 0 0 0 .59 1.41l9.58 9.58a2 2 0 0 0 2.83 0l5-5a2 2 0 0 0 0-2.83z" stroke="#F0502D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="7" cy="7.5" r="1" fill="#F0502D" />
  </Svg>
);

const CommentIconSvg = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="#F0502D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TrashIconSvg = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18" stroke="#FF4444" strokeWidth="2" strokeLinecap="round" />
    <Path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="#FF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UserIconSvg = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#2a2b3d" stroke="#F0502D" strokeWidth="1.5" />
    <Circle cx="12" cy="9" r="3" fill="#F0502D" />
    <Path d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="#F0502D" />
  </Svg>
);

const ReplyIconSvg = () => (
  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
    <Path d="M9 17l-5-5 5-5M4 12h10a5 5 0 0 1 5 5v2" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

interface Comentario {
  uuid: string;
  atividade_uuid: string;
  autor_id: string;
  resposta_a: string | null;
  texto: string;
  created_at: string;
  autor_nome?: string;
  autor_avatar?: string | null;
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

const formatarDataComentario = (iso: string) => {
  const data = new Date(iso);
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
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
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [souPetiano, setSouPetiano] = useState(false);

  const [atividades, setAtividades] = useState<AtividadeEvento[]>([]);
  const [carregandoAtividades, setCarregandoAtividades] = useState(true);

  const [comentariosAbertoUuid, setComentariosAbertoUuid] = useState<string | null>(null);
  const [comentariosPorAtividade, setComentariosPorAtividade] = useState<Record<string, Comentario[]>>({});
  const [carregandoComentarios, setCarregandoComentarios] = useState(false);
  const [novoComentario, setNovoComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);

  const [respondendoUuid, setRespondendoUuid] = useState<string | null>(null);
  const [textoResposta, setTextoResposta] = useState('');
  const [enviandoResposta, setEnviandoResposta] = useState(false);

  useEffect(() => {
    verificarSessao();
    buscarAtividades();
  }, []);

  const verificarSessao = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setLogado(true);
      setUsuarioId(session.user.id);

      // Qualquer usuário com linha em "petianos" (independente do cargo)
      // pode moderar comentários de qualquer pessoa
      const { data: petiano } = await supabase
        .from('petianos')
        .select('id')
        .eq('id', session.user.id)
        .single();

      setSouPetiano(!!petiano);
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

  const buscarComentarios = async (atividadeUuid: string) => {
    setCarregandoComentarios(true);
    const { data, error } = await supabase
      .from('comentarios_atividade')
      .select('uuid, atividade_uuid, autor_id, resposta_a, texto, created_at')
      .eq('atividade_uuid', atividadeUuid)
      .order('created_at', { ascending: true });

    if (!error && data) {
      const autorIds = [...new Set(data.map((c: any) => c.autor_id))];
      let infoPorId: Record<string, { nome: string; avatar_url: string | null }> = {};

      if (autorIds.length > 0) {
        // 1º: procura o nome/foto entre os petianos
        const { data: petianosData } = await supabase
          .from('petianos')
          .select('id, nome, avatar_url')
          .in('id', autorIds);

        (petianosData || []).forEach((p: any) => {
          infoPorId[p.id] = { nome: p.nome, avatar_url: p.avatar_url };
        });

        // 2º: quem não é petiano, procura entre os usuários externos (visitantes)
        const idsRestantes = autorIds.filter((id) => !infoPorId[id]);
        if (idsRestantes.length > 0) {
          const { data: externosData } = await supabase
            .from('usuarios_externos')
            .select('id, nome')
            .in('id', idsRestantes);

          (externosData || []).forEach((u: any) => {
            infoPorId[u.id] = { nome: u.nome, avatar_url: null };
          });
        }
      }

      const comInfo = (data as any[]).map((c) => ({
        ...c,
        autor_nome: infoPorId[c.autor_id]?.nome || 'Usuário',
        autor_avatar: infoPorId[c.autor_id]?.avatar_url || null,
      }));

      setComentariosPorAtividade((atual) => ({ ...atual, [atividadeUuid]: comInfo }));
    } else if (error) {
      console.error('Erro ao buscar comentários:', error);
    }
    setCarregandoComentarios(false);
  };

  const toggleComentarios = (atividadeUuid: string) => {
    if (comentariosAbertoUuid === atividadeUuid) {
      setComentariosAbertoUuid(null);
      return;
    }
    setComentariosAbertoUuid(atividadeUuid);
    setNovoComentario('');
    setRespondendoUuid(null);
    if (!comentariosPorAtividade[atividadeUuid]) {
      buscarComentarios(atividadeUuid);
    }
  };

  const enviarComentario = async (atividadeUuid: string) => {
    if (!novoComentario.trim() || !usuarioId) return;

    setEnviandoComentario(true);
    const { error } = await supabase.from('comentarios_atividade').insert({
      atividade_uuid: atividadeUuid,
      autor_id: usuarioId,
      texto: novoComentario.trim(),
    });

    if (error) {
      console.error('Erro ao enviar comentário:', error);
      Alert.alert('Erro', 'Não foi possível enviar o comentário.');
    } else {
      setNovoComentario('');
      await buscarComentarios(atividadeUuid);
    }
    setEnviandoComentario(false);
  };

  const enviarResposta = async (atividadeUuid: string, comentarioPaiUuid: string) => {
    if (!textoResposta.trim() || !usuarioId) return;

    setEnviandoResposta(true);
    const { error } = await supabase.from('comentarios_atividade').insert({
      atividade_uuid: atividadeUuid,
      autor_id: usuarioId,
      resposta_a: comentarioPaiUuid,
      texto: textoResposta.trim(),
    });

    if (error) {
      console.error('Erro ao enviar resposta:', error);
      Alert.alert('Erro', 'Não foi possível enviar a resposta.');
    } else {
      setTextoResposta('');
      setRespondendoUuid(null);
      await buscarComentarios(atividadeUuid);
    }
    setEnviandoResposta(false);
  };

  const confirmarExclusao = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (Platform.OS === 'web') {
        resolve(window.confirm('Tem certeza que deseja excluir este comentário?'));
      } else {
        Alert.alert(
          'Excluir comentário',
          'Tem certeza que deseja excluir este comentário?',
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Excluir', style: 'destructive', onPress: () => resolve(true) },
          ]
        );
      }
    });
  };

  const excluirComentario = async (comentario: Comentario) => {
    const confirmado = await confirmarExclusao();
    if (!confirmado) return;

    const { error } = await supabase.from('comentarios_atividade').delete().eq('uuid', comentario.uuid);
    if (!error) {
      await buscarComentarios(comentario.atividade_uuid);
    } else {
      console.error('Erro ao excluir comentário:', error);
      Alert.alert('Erro', 'Não foi possível excluir o comentário.');
    }
  };

  // Pode excluir se for o autor OU se for qualquer petiano (moderação)
  const podeExcluirComentario = (comentario: Comentario) => {
    return comentario.autor_id === usuarioId || souPetiano;
  };

  if (carregandoSessao) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#F0502D" />
      </View>
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
                    const comentariosAbertos = comentariosAbertoUuid === atividade.uuid;
                    const todosComentarios = comentariosPorAtividade[atividade.uuid] || [];
                    const comentariosTopo = todosComentarios.filter((c) => !c.resposta_a);
                    const respostasPorPai: Record<string, Comentario[]> = {};
                    todosComentarios.forEach((c) => {
                      if (c.resposta_a) {
                        if (!respostasPorPai[c.resposta_a]) respostasPorPai[c.resposta_a] = [];
                        respostasPorPai[c.resposta_a].push(c);
                      }
                    });

                    return (
                      <View key={atividade.uuid} style={styles.eventoCard}>
                        <View style={styles.eventoLinha}>
                          <View style={styles.eventoThumbWrapper}>
                            {atividade.imagem_url ? (
                              <Image source={{ uri: atividade.imagem_url }} style={styles.eventoImagem} resizeMode="cover" />
                            ) : (
                              <View style={styles.eventoImagemPlaceholder}>
                                <FolderIconSvg />
                              </View>
                            )}
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
                          </View>

                          <View style={styles.eventoConteudo}>
                            <Text style={styles.eventoDataHora}>{formatarDataHora(atividade.data_inicio)}</Text>
                            <Text style={styles.eventoTitulo}>{atividade.titulo}</Text>
                            {atividade.sobre ? (
                              <Text style={styles.eventoSobre}>{atividade.sobre}</Text>
                            ) : null}

                            {atividade.projeto?.titulo ? (
                              <View style={styles.eventoMetaRow}>
                                <TagIconSvg />
                                <Text style={styles.eventoMetaText}>{atividade.projeto.titulo}</Text>
                              </View>
                            ) : null}
                          </View>
                        </View>

                        {/* --- COMENTÁRIOS --- */}
                        <TouchableOpacity
                          style={styles.comentariosToggle}
                          onPress={() => toggleComentarios(atividade.uuid)}
                        >
                          <CommentIconSvg />
                          <Text style={styles.comentariosToggleText}>
                            {comentariosAbertos ? 'Ocultar comentários' : 'Comentários e perguntas'}
                            {comentariosTopo.length > 0 ? ` (${comentariosTopo.length})` : ''}
                          </Text>
                        </TouchableOpacity>

                        {comentariosAbertos && (
                          <View style={styles.comentariosBox}>
                            {carregandoComentarios ? (
                              <ActivityIndicator color="#F0502D" style={{ marginVertical: 10 }} />
                            ) : comentariosTopo.length > 0 ? (
                              <View style={styles.comentariosLista}>
                                {comentariosTopo.map((comentario) => (
                                  <View key={comentario.uuid} style={styles.comentarioItem}>
                                    <View style={styles.comentarioLinha}>
                                      {comentario.autor_avatar ? (
                                        <Image source={{ uri: comentario.autor_avatar }} style={styles.comentarioAvatar} />
                                      ) : (
                                        <UserIconSvg size={28} />
                                      )}
                                      <View style={styles.comentarioConteudo}>
                                        <View style={styles.comentarioTopo}>
                                          <Text style={styles.comentarioAutor}>{comentario.autor_nome}</Text>
                                          <Text style={styles.comentarioData}>{formatarDataComentario(comentario.created_at)}</Text>
                                        </View>
                                        <Text style={styles.comentarioTexto}>{comentario.texto}</Text>

                                        <View style={styles.comentarioAcoesRow}>
                                          {logado && (
                                            <TouchableOpacity
                                              style={styles.responderBtn}
                                              onPress={() => {
                                                setRespondendoUuid(respondendoUuid === comentario.uuid ? null : comentario.uuid);
                                                setTextoResposta('');
                                              }}
                                            >
                                              <ReplyIconSvg />
                                              <Text style={styles.responderBtnText}>
                                                {respondendoUuid === comentario.uuid ? 'Cancelar' : 'Responder'}
                                              </Text>
                                            </TouchableOpacity>
                                          )}
                                          {podeExcluirComentario(comentario) && (
                                            <TouchableOpacity onPress={() => excluirComentario(comentario)}>
                                              <TrashIconSvg />
                                            </TouchableOpacity>
                                          )}
                                        </View>

                                        {respondendoUuid === comentario.uuid && (
                                          <View style={styles.respostaFormRow}>
                                            <TextInput
                                              style={styles.comentarioInput}
                                              placeholder="Escreva sua resposta..."
                                              placeholderTextColor="#666"
                                              value={textoResposta}
                                              onChangeText={setTextoResposta}
                                              multiline
                                            />
                                            <TouchableOpacity
                                              style={[styles.comentarioEnviarBtn, enviandoResposta && styles.comentarioEnviarBtnDisabled]}
                                              onPress={() => enviarResposta(atividade.uuid, comentario.uuid)}
                                              disabled={enviandoResposta}
                                            >
                                              {enviandoResposta ? (
                                                <ActivityIndicator color="#FFFFFF" size="small" />
                                              ) : (
                                                <Text style={styles.comentarioEnviarBtnText}>Enviar</Text>
                                              )}
                                            </TouchableOpacity>
                                          </View>
                                        )}

                                        {/* --- RESPOSTAS DESTE COMENTÁRIO --- */}
                                        {(respostasPorPai[comentario.uuid] || []).map((resposta) => (
                                          <View key={resposta.uuid} style={styles.respostaItem}>
                                            {resposta.autor_avatar ? (
                                              <Image source={{ uri: resposta.autor_avatar }} style={styles.respostaAvatar} />
                                            ) : (
                                              <UserIconSvg size={22} />
                                            )}
                                            <View style={styles.comentarioConteudo}>
                                              <View style={styles.comentarioTopo}>
                                                <Text style={styles.comentarioAutor}>{resposta.autor_nome}</Text>
                                                <Text style={styles.comentarioData}>{formatarDataComentario(resposta.created_at)}</Text>
                                                {podeExcluirComentario(resposta) && (
                                                  <TouchableOpacity onPress={() => excluirComentario(resposta)}>
                                                    <TrashIconSvg />
                                                  </TouchableOpacity>
                                                )}
                                              </View>
                                              <Text style={styles.comentarioTexto}>{resposta.texto}</Text>
                                            </View>
                                          </View>
                                        ))}
                                      </View>
                                    </View>
                                  </View>
                                ))}
                              </View>
                            ) : (
                              <Text style={styles.comentariosVazio}>Nenhum comentário ainda. Seja o primeiro a perguntar!</Text>
                            )}

                            {logado ? (
                              <View style={styles.comentarioFormRow}>
                                <TextInput
                                  style={styles.comentarioInput}
                                  placeholder="Escreva uma pergunta ou comentário..."
                                  placeholderTextColor="#666"
                                  value={novoComentario}
                                  onChangeText={setNovoComentario}
                                  multiline
                                />
                                <TouchableOpacity
                                  style={[styles.comentarioEnviarBtn, enviandoComentario && styles.comentarioEnviarBtnDisabled]}
                                  onPress={() => enviarComentario(atividade.uuid)}
                                  disabled={enviandoComentario}
                                >
                                  {enviandoComentario ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                  ) : (
                                    <Text style={styles.comentarioEnviarBtnText}>Enviar</Text>
                                  )}
                                </TouchableOpacity>
                              </View>
                            ) : (
                              <View style={styles.loginParaComentar}>
                                <Text style={styles.loginParaComentarText}>Faça login para comentar ou perguntar.</Text>
                                <TouchableOpacity onPress={() => router.push('/login')}>
                                  <Text style={styles.loginParaComentarLink}>Fazer Login</Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
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
  eventosLista: { gap: 18 },
  eventoCard: {
    backgroundColor: '#1c1d2b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2b3d',
    overflow: 'hidden',
  },
  eventoLinha: { flexDirection: 'row', alignItems: 'center' },
  eventoThumbWrapper: { width: 120, position: 'relative' },
  eventoImagem: { width: '100%', height: '100%', minHeight: 130 },
  eventoImagemPlaceholder: {
    width: '100%',
    height: '100%',
    minHeight: 130,
    backgroundColor: '#2a2b3d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventoBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  eventoBadgeConcluido: { backgroundColor: 'rgba(42,43,61,0.9)' },
  eventoBadgeEmBreve: { backgroundColor: 'rgba(28,111,168,0.9)' },
  eventoBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  eventoConteudo: { flex: 1, padding: 14, gap: 4 },
  eventoDataHora: { color: '#F0502D', fontSize: 11, fontWeight: 'bold' },
  eventoTitulo: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  eventoSobre: { color: '#AAAAAA', fontSize: 12, lineHeight: 18, marginTop: 2 },
  eventoMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  eventoMetaText: { color: '#888', fontSize: 11 },

  comentariosToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#2a2b3d',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  comentariosToggleText: { color: '#F0502D', fontSize: 12, fontWeight: '600' },

  comentariosBox: {
    borderTopWidth: 1,
    borderTopColor: '#2a2b3d',
    padding: 14,
    gap: 12,
  },
  comentariosLista: { gap: 16 },
  comentariosVazio: { color: '#666', fontSize: 12, fontStyle: 'italic' },

  comentarioItem: { gap: 4 },
  comentarioLinha: { flexDirection: 'row', gap: 10 },
  comentarioAvatar: { width: 28, height: 28, borderRadius: 14 },
  comentarioConteudo: { flex: 1, gap: 2 },
  comentarioTopo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  comentarioAutor: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  comentarioData: { color: '#666', fontSize: 11, flex: 1 },
  comentarioTexto: { color: '#CCCCCC', fontSize: 13, lineHeight: 19 },

  comentarioAcoesRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 4 },
  responderBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  responderBtnText: { color: '#F0502D', fontSize: 11, fontWeight: '600' },

  respostaFormRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', marginTop: 8 },
  respostaItem: { flexDirection: 'row', gap: 8, marginTop: 10, marginLeft: 20, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#2a2b3d' },
  respostaAvatar: { width: 22, height: 22, borderRadius: 11 },

  comentarioFormRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  comentarioInput: {
    flex: 1,
    backgroundColor: '#11121C',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2b3d',
    color: '#FFFFFF',
    fontSize: 13,
    padding: 10,
    minHeight: 40,
    maxHeight: 90,
  },
  comentarioEnviarBtn: {
    backgroundColor: '#F0502D',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  comentarioEnviarBtnDisabled: { opacity: 0.7 },
  comentarioEnviarBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },

  loginParaComentar: { alignItems: 'center', gap: 6, paddingVertical: 6 },
  loginParaComentarText: { color: '#888', fontSize: 12 },
  loginParaComentarLink: { color: '#F0502D', fontSize: 13, fontWeight: 'bold' },

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