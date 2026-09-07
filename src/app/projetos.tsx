import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, Link } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

import { ThemedView } from '@/components/themed-view';
import { supabase } from '../utils/supabase';

// --- ÍCONES ---
const BackIconSvg = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke="#F0502D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UserIconSvg = ({ size = 40 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#2a2b3d" stroke="#F0502D" strokeWidth="2" />
    <Circle cx="12" cy="9" r="3" fill="#F0502D" />
    <Path d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="#F0502D" />
  </Svg>
);

const FolderIconSvg = () => (
  <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
    <Path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PlusIconSvg = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const CrownIconSvg = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M2 8l4 4 6-8 6 8 4-4-2 12H4L2 8z" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(240,80,45,0.15)" />
  </Svg>
);

const CloseIconSvg = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6L18 18" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const DownloadIconSvg = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M4 19h16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UploadIconSvg = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M12 16V4m0 0L7 9m5-5l5 5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M4 20h16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// --- TIPOS ---
interface Projeto {
  uuid: string;
  titulo: string;
  descricao: string | null;
  ano: number | null;
  status: string | null;
  imagem_url: string | null;
}

interface MembroProjeto {
  petiano_id: string;
  tipo_responsavel: string;
  petianos: {
    nome: string;
    avatar_url: string | null;
    cargo: string;
  };
}

interface Atividade {
  uuid: string;
  titulo: string;
  data_inicio: string | null;
  data_fim: string | null;
  status: string | null;
}

const ANOS = [2023, 2024, 2025, 2026];
const STATUS_OPCOES = ['Em andamento', 'Concluído', 'Planejado'];

const formatarData = (iso: string | null) => {
  if (!iso) return '';
  const data = new Date(iso);
  return data.toLocaleDateString('pt-BR');
};

export default function ProjetosScreen() {
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [logado, setLogado] = useState(false);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [souTutor, setSouTutor] = useState(false);

  const [anoSelecionado, setAnoSelecionado] = useState(2026);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [carregandoProjetos, setCarregandoProjetos] = useState(true);

  const [planejamentoUrl, setPlanejamentoUrl] = useState<string | null>(null);
  const [enviandoPlanejamento, setEnviandoPlanejamento] = useState(false);

  const [projetoSelecionado, setProjetoSelecionado] = useState<Projeto | null>(null);
  const [membros, setMembros] = useState<MembroProjeto[]>([]);
  const [carregandoMembros, setCarregandoMembros] = useState(false);
  const [atividades, setAtividades] = useState<Atividade[]>([]);

  const [formNovoProjetoVisivel, setFormNovoProjetoVisivel] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novoStatus, setNovoStatus] = useState(STATUS_OPCOES[0]);
  const [enviandoProjeto, setEnviandoProjeto] = useState(false);

  const [formNovaAtividadeVisivel, setFormNovaAtividadeVisivel] = useState(false);
  const [atividadeTitulo, setAtividadeTitulo] = useState('');
  const [enviandoAtividade, setEnviandoAtividade] = useState(false);

  useEffect(() => {
    verificarSessao();
  }, []);

  useEffect(() => {
    if (logado) {
      buscarProjetos(anoSelecionado);
      buscarPlanejamento(anoSelecionado);
    }
  }, [anoSelecionado, logado]);

  const verificarSessao = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setLogado(true);
      setUsuarioId(session.user.id);

      const { data: petiano } = await supabase
        .from('petianos')
        .select('cargo')
        .eq('id', session.user.id)
        .single();

      setSouTutor(petiano?.cargo === 'Tutor');
    } else {
      setLogado(false);
    }
    setCarregandoSessao(false);
  };

  const buscarProjetos = async (ano: number) => {
    setCarregandoProjetos(true);
    const { data, error } = await supabase
      .from('projeto')
      .select('*')
      .eq('ano', ano)
      .order('created', { ascending: true });

    if (!error && data) {
      setProjetos(data as Projeto[]);
    } else if (error) {
      console.error('Erro ao buscar projetos:', error);
    }
    setCarregandoProjetos(false);
  };

  const buscarPlanejamento = async (ano: number) => {
    const { data } = await supabase
      .from('planejamento_anual')
      .select('arquivo_url')
      .eq('ano', ano)
      .single();

    setPlanejamentoUrl(data?.arquivo_url || null);
  };

  const voltar = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  // --- CRIAR PROJETO (temporário, remover quando todos os projetos reais forem cadastrados) ---
  const criarProjeto = async () => {
    if (!novoTitulo.trim() || !usuarioId) {
      Alert.alert('Erro', 'Digite o título do projeto.');
      return;
    }

    setEnviandoProjeto(true);
    try {
      const { data: novo, error } = await supabase
        .from('projeto')
        .insert({
          titulo: novoTitulo,
          descricao: novaDescricao,
          ano: anoSelecionado,
          status: novoStatus,
        })
        .select()
        .single();

      if (error) throw error;

      // quem cria o projeto vira automaticamente o líder
      await supabase.from('petianos_has_projeto').insert({
        petiano_id: usuarioId,
        projeto_uuid: novo.uuid,
        tipo_responsavel: 'lider',
      });

      setNovoTitulo('');
      setNovaDescricao('');
      setNovoStatus(STATUS_OPCOES[0]);
      setFormNovoProjetoVisivel(false);
      buscarProjetos(anoSelecionado);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro', error.message || 'Não foi possível criar o projeto.');
    } finally {
      setEnviandoProjeto(false);
    }
  };

  const selecionarProjeto = async (projeto: Projeto) => {
    setProjetoSelecionado(projeto);
    setCarregandoMembros(true);

    const { data: membrosData, error } = await supabase
      .from('petianos_has_projeto')
      .select('petiano_id, tipo_responsavel, petianos(nome, avatar_url, cargo)')
      .eq('projeto_uuid', projeto.uuid);

    if (!error && membrosData) {
      setMembros(membrosData as any as MembroProjeto[]);
    }

    const { data: atividadesData } = await supabase
      .from('atividade')
      .select('uuid, titulo, data_inicio, data_fim, status')
      .eq('projeto_uuid', projeto.uuid)
      .order('data_inicio', { ascending: true });

    setAtividades((atividadesData as Atividade[]) || []);
    setCarregandoMembros(false);
  };

  const voltarParaLista = () => {
    setProjetoSelecionado(null);
    setMembros([]);
    setAtividades([]);
    setFormNovaAtividadeVisivel(false);
  };

  const souMembro = membros.some((m) => m.petiano_id === usuarioId);
  const souLider = membros.some((m) => m.petiano_id === usuarioId && m.tipo_responsavel === 'lider');

  const participarProjeto = async () => {
    if (!projetoSelecionado || !usuarioId) return;

    const { error } = await supabase.from('petianos_has_projeto').insert({
      petiano_id: usuarioId,
      projeto_uuid: projetoSelecionado.uuid,
      tipo_responsavel: 'membro',
    });

    if (error) {
      Alert.alert('Erro', 'Não foi possível entrar no projeto.');
      return;
    }

    selecionarProjeto(projetoSelecionado);
  };

  const sairDoProjeto = async () => {
    if (!projetoSelecionado || !usuarioId) return;

    const { error } = await supabase
      .from('petianos_has_projeto')
      .delete()
      .eq('petiano_id', usuarioId)
      .eq('projeto_uuid', projetoSelecionado.uuid);

    if (error) {
      Alert.alert('Erro', 'Não foi possível sair do projeto.');
      return;
    }

    selecionarProjeto(projetoSelecionado);
  };

  const criarAtividade = async () => {
    if (!atividadeTitulo.trim() || !projetoSelecionado) {
      Alert.alert('Erro', 'Digite o título da atividade.');
      return;
    }

    setEnviandoAtividade(true);
    try {
      const { error } = await supabase.from('atividade').insert({
        projeto_uuid: projetoSelecionado.uuid,
        titulo: atividadeTitulo,
      });

      if (error) throw error;

      setAtividadeTitulo('');
      setFormNovaAtividadeVisivel(false);
      selecionarProjeto(projetoSelecionado);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro', error.message || 'Não foi possível criar a atividade.');
    } finally {
      setEnviandoAtividade(false);
    }
  };

  const enviarPlanejamento = async () => {
    const resultado = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (resultado.canceled) return;

    const arquivo = resultado.assets[0];
    setEnviandoPlanejamento(true);

    try {
      const resposta = await fetch(arquivo.uri);
      const blob = await resposta.blob();
      const caminho = `${anoSelecionado}/${Date.now()}-${arquivo.name}`;

      const { error: erroUpload } = await supabase.storage
        .from('planejamentos')
        .upload(caminho, blob, { contentType: 'application/pdf' });

      if (erroUpload) throw new Error('Falha ao enviar. Verifique se o bucket "planejamentos" foi criado como Public.');

      const { data: urlData } = supabase.storage.from('planejamentos').getPublicUrl(caminho);

      const { error: erroUpsert } = await supabase
        .from('planejamento_anual')
        .upsert({ ano: anoSelecionado, arquivo_url: urlData.publicUrl, atualizado_em: new Date().toISOString() });

      if (erroUpsert) throw erroUpsert;

      setPlanejamentoUrl(urlData.publicUrl);
      Alert.alert('Sucesso', 'Planejamento enviado com sucesso!');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro', error.message || 'Não foi possível enviar o planejamento.');
    } finally {
      setEnviandoPlanejamento(false);
    }
  };

  const abrirLink = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert('Erro', 'Não foi possível abrir o arquivo.'));
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
          </View>
          <View style={styles.lockedContainer}>
            <Text style={styles.lockedTitle}>Área restrita</Text>
            <Text style={styles.lockedText}>Você precisa estar logado para ver os projetos.</Text>
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
      <Stack.Screen options={{ title: 'Projetos', headerShown: false }} />

      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={projetoSelecionado ? voltarParaLista : voltar}
              style={styles.backButton}
            >
              <BackIconSvg />
              <Text style={styles.backButtonText}>
                {projetoSelecionado ? 'Voltar para a lista' : 'Voltar'}
              </Text>
            </TouchableOpacity>

            {!projetoSelecionado && (
              <Link href="/meus-projetos" asChild>
                <TouchableOpacity style={styles.meusProjetosBtn}>
                  <Text style={styles.meusProjetosBtnText}>Meus Projetos</Text>
                </TouchableOpacity>
              </Link>
            )}
          </View>

          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

            {!projetoSelecionado ? (
              <>
                <View style={styles.titleSection}>
                  <Text style={styles.title}>
                    Projetos<Text style={styles.orangeHighlight}>.</Text>
                  </Text>
                  <Text style={styles.subtitle}>Conheça as iniciativas do PET Fronteira</Text>
                </View>

                {/* --- ABAS DE ANO --- */}
                <View style={styles.anosRow}>
                  {ANOS.map((ano) => (
                    <TouchableOpacity
                      key={ano}
                      style={[styles.anoTab, anoSelecionado === ano && styles.anoTabAtiva]}
                      onPress={() => setAnoSelecionado(ano)}
                    >
                      <Text style={[styles.anoTabText, anoSelecionado === ano && styles.anoTabTextAtiva]}>
                        {ano}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* --- PLANEJAMENTO DO ANO --- */}
                <View style={styles.planejamentoBox}>
                  <Text style={styles.planejamentoTitulo}>Planejamento {anoSelecionado}</Text>
                  {planejamentoUrl ? (
                    <TouchableOpacity style={styles.planejamentoBtn} onPress={() => abrirLink(planejamentoUrl)}>
                      <DownloadIconSvg />
                      <Text style={styles.planejamentoBtnText}>Baixar PDF</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.emptyText}>Nenhum planejamento enviado para {anoSelecionado} ainda.</Text>
                  )}

                  {souTutor && (
                    <TouchableOpacity
                      style={[styles.planejamentoBtnSecundario, enviandoPlanejamento && styles.uploadBtnDisabled]}
                      onPress={enviarPlanejamento}
                      disabled={enviandoPlanejamento}
                    >
                      {enviandoPlanejamento ? (
                        <ActivityIndicator color="#F0502D" />
                      ) : (
                        <>
                          <UploadIconSvg />
                          <Text style={styles.planejamentoBtnSecundarioText}>
                            {planejamentoUrl ? 'Atualizar planejamento (PDF)' : 'Enviar planejamento (PDF)'}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>

                {/* --- BOTÃO TEMPORÁRIO DE ADICIONAR PROJETO --- */}
                {/* REMOVER quando todos os projetos reais (2023-2026) forem cadastrados */}
                {souTutor && (
                  <TouchableOpacity
                    style={styles.addProjetoBtn}
                    onPress={() => setFormNovoProjetoVisivel(!formNovoProjetoVisivel)}
                  >
                    <PlusIconSvg />
                    <Text style={styles.addProjetoBtnText}>Adicionar Projeto ({anoSelecionado})</Text>
                  </TouchableOpacity>
                )}

                {formNovoProjetoVisivel && (
                  <View style={styles.novoProjetoForm}>
                    <TextInput
                      style={styles.input}
                      placeholder="Título do projeto"
                      placeholderTextColor="#666"
                      value={novoTitulo}
                      onChangeText={setNovoTitulo}
                    />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Descrição"
                      placeholderTextColor="#666"
                      value={novaDescricao}
                      onChangeText={setNovaDescricao}
                      multiline
                      numberOfLines={3}
                    />
                    <View style={styles.statusRow}>
                      {STATUS_OPCOES.map((opcao) => (
                        <TouchableOpacity
                          key={opcao}
                          style={[styles.statusChip, novoStatus === opcao && styles.statusChipAtivo]}
                          onPress={() => setNovoStatus(opcao)}
                        >
                          <Text style={[styles.statusChipText, novoStatus === opcao && styles.statusChipTextAtivo]}>
                            {opcao}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TouchableOpacity
                      style={[styles.salvarProjetoBtn, enviandoProjeto && styles.uploadBtnDisabled]}
                      onPress={criarProjeto}
                      disabled={enviandoProjeto}
                    >
                      {enviandoProjeto ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.salvarProjetoBtnText}>Criar Projeto</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* --- GRID DE PROJETOS DO ANO --- */}
                {carregandoProjetos ? (
                  <ActivityIndicator color="#F0502D" size="large" style={{ marginVertical: 30 }} />
                ) : projetos.length > 0 ? (
                  <View style={styles.projetosGrid}>
                    {projetos.map((projeto) => (
                      <TouchableOpacity
                        key={projeto.uuid}
                        style={styles.projetoCard}
                        onPress={() => selecionarProjeto(projeto)}
                      >
                        {projeto.imagem_url ? (
                          <Image source={{ uri: projeto.imagem_url }} style={styles.projetoImagem} />
                        ) : (
                          <View style={styles.projetoImagemPlaceholder}>
                            <FolderIconSvg />
                          </View>
                        )}
                        <Text style={styles.projetoNome} numberOfLines={1}>{projeto.titulo}</Text>
                        {projeto.descricao ? (
                          <Text style={styles.projetoDesc} numberOfLines={3}>{projeto.descricao}</Text>
                        ) : null}
                        {projeto.status ? (
                          <View style={styles.projetoStatusBadge}>
                            <Text style={styles.projetoStatusText}>{projeto.status}</Text>
                          </View>
                        ) : null}
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>Nenhum projeto cadastrado para {anoSelecionado} ainda.</Text>
                )}
              </>
            ) : (
              <>
                {/* --- DETALHE DO PROJETO --- */}
                <Text style={styles.detalheTitulo}>{projetoSelecionado.titulo}</Text>
                {projetoSelecionado.status ? (
                  <View style={styles.projetoStatusBadge}>
                    <Text style={styles.projetoStatusText}>{projetoSelecionado.status}</Text>
                  </View>
                ) : null}
                {projetoSelecionado.descricao ? (
                  <Text style={styles.detalheDescricao}>{projetoSelecionado.descricao}</Text>
                ) : null}

                {carregandoMembros ? (
                  <ActivityIndicator color="#F0502D" size="large" style={{ marginVertical: 20 }} />
                ) : (
                  <>
                    {!souMembro ? (
                      <TouchableOpacity style={styles.participarBtn} onPress={participarProjeto}>
                        <Text style={styles.participarBtnText}>Fazer parte do projeto</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={styles.sairBtn} onPress={sairDoProjeto}>
                        <Text style={styles.sairBtnText}>Sair do projeto</Text>
                      </TouchableOpacity>
                    )}

                    <Text style={styles.secaoTitulo}>Integrantes</Text>
                    <View style={styles.membrosGrid}>
                      {membros.map((membro) => (
                        <View key={membro.petiano_id} style={styles.membroCard}>
                          {membro.petianos?.avatar_url ? (
                            <Image source={{ uri: membro.petianos.avatar_url }} style={styles.membroAvatar} />
                          ) : (
                            <UserIconSvg size={44} />
                          )}
                          <Text style={styles.membroNome} numberOfLines={1}>{membro.petianos?.nome}</Text>
                          {membro.tipo_responsavel === 'lider' && (
                            <View style={styles.liderBadge}>
                              <CrownIconSvg />
                              <Text style={styles.liderBadgeText}>Líder</Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>

                    <View style={styles.atividadesHeader}>
                      <Text style={styles.secaoTitulo}>Atividades</Text>
                      {souLider && (
                        <TouchableOpacity
                          style={styles.novaAtividadeBtn}
                          onPress={() => setFormNovaAtividadeVisivel(!formNovaAtividadeVisivel)}
                        >
                          {formNovaAtividadeVisivel ? <CloseIconSvg /> : <PlusIconSvg />}
                        </TouchableOpacity>
                      )}
                    </View>

                    {formNovaAtividadeVisivel && (
                      <View style={styles.novoProjetoForm}>
                        <TextInput
                          style={styles.input}
                          placeholder="Título da atividade"
                          placeholderTextColor="#666"
                          value={atividadeTitulo}
                          onChangeText={setAtividadeTitulo}
                        />
                        <TouchableOpacity
                          style={[styles.salvarProjetoBtn, enviandoAtividade && styles.uploadBtnDisabled]}
                          onPress={criarAtividade}
                          disabled={enviandoAtividade}
                        >
                          {enviandoAtividade ? (
                            <ActivityIndicator color="#FFFFFF" />
                          ) : (
                            <Text style={styles.salvarProjetoBtnText}>Criar Atividade</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}

                    {atividades.length > 0 ? (
                      <View style={styles.atividadesLista}>
                        {atividades.map((atividade) => (
                          <View key={atividade.uuid} style={styles.atividadeCard}>
                            <Text style={styles.atividadeTitulo}>{atividade.titulo}</Text>
                            {atividade.data_inicio ? (
                              <Text style={styles.atividadeData}>{formatarData(atividade.data_inicio)}</Text>
                            ) : null}
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.emptyText}>Nenhuma atividade cadastrada ainda.</Text>
                    )}
                  </>
                )}
              </>
            )}

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
  meusProjetosBtn: { borderWidth: 1, borderColor: '#F0502D', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  meusProjetosBtnText: { color: '#F0502D', fontSize: 13, fontWeight: 'bold' },
  scrollContainer: { flexGrow: 1, padding: 20 },

  titleSection: { alignItems: 'center', marginBottom: 24 },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  orangeHighlight: { color: '#F0502D' },
  subtitle: { color: '#AAAAAA', fontSize: 15, textAlign: 'center' },
  emptyText: { color: '#666', fontSize: 14, textAlign: 'center', marginTop: 10 },

  anosRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 24 },
  anoTab: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, borderWidth: 1, borderColor: '#2a2b3d', backgroundColor: '#1c1d2b' },
  anoTabAtiva: { backgroundColor: '#F0502D', borderColor: '#F0502D' },
  anoTabText: { color: '#AAAAAA', fontSize: 14, fontWeight: 'bold' },
  anoTabTextAtiva: { color: '#FFFFFF' },

  planejamentoBox: {
    backgroundColor: '#1c1d2b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2b3d',
    padding: 18,
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  planejamentoTitulo: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  planejamentoBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1c6fa8', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 },
  planejamentoBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  planejamentoBtnSecundario: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#F0502D', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  planejamentoBtnSecundarioText: { color: '#F0502D', fontSize: 12, fontWeight: 'bold' },

  addProjetoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#F0502D', paddingVertical: 12, borderRadius: 8, marginBottom: 12 },
  addProjetoBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },

  novoProjetoForm: { backgroundColor: '#1c1d2b', borderRadius: 12, borderWidth: 1, borderColor: '#2a2b3d', padding: 16, gap: 12, marginBottom: 20 },
  input: { backgroundColor: '#11121C', borderRadius: 8, padding: 12, color: '#FFFFFF', fontSize: 14, borderWidth: 1, borderColor: '#2a2b3d' },
  textArea: { minHeight: 70, textAlignVertical: 'top' },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#2a2b3d' },
  statusChipAtivo: { backgroundColor: '#F0502D', borderColor: '#F0502D' },
  statusChipText: { color: '#AAAAAA', fontSize: 12 },
  statusChipTextAtivo: { color: '#FFFFFF', fontWeight: 'bold' },
  salvarProjetoBtn: { backgroundColor: '#F0502D', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  salvarProjetoBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  uploadBtnDisabled: { opacity: 0.7 },

  projetosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  projetoCard: { width: 220, backgroundColor: '#1c1d2b', borderRadius: 14, borderWidth: 1, borderColor: '#2a2b3d', overflow: 'hidden', padding: 14 },
  projetoImagem: { width: '100%', height: 100, borderRadius: 8, marginBottom: 10 },
  projetoImagemPlaceholder: { width: '100%', height: 100, borderRadius: 8, backgroundColor: '#2a2b3d', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  projetoNome: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  projetoDesc: { color: '#AAAAAA', fontSize: 12, lineHeight: 18, marginBottom: 8 },
  projetoStatusBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(240,80,45,0.15)', borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8, marginTop: 4 },
  projetoStatusText: { color: '#F0502D', fontSize: 11, fontWeight: 'bold' },

  detalheTitulo: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  detalheDescricao: { color: '#AAAAAA', fontSize: 14, lineHeight: 21, marginTop: 10, marginBottom: 20 },

  participarBtn: { backgroundColor: '#F0502D', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  participarBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  sairBtn: { borderWidth: 1, borderColor: '#FF4444', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  sairBtnText: { color: '#FF4444', fontSize: 14, fontWeight: 'bold' },

  secaoTitulo: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold', marginBottom: 14 },
  membrosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  membroCard: { width: 100, alignItems: 'center', backgroundColor: '#1c1d2b', borderRadius: 10, borderWidth: 1, borderColor: '#2a2b3d', paddingVertical: 14, paddingHorizontal: 6 },
  membroAvatar: { width: 44, height: 44, borderRadius: 22 },
  membroNome: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 8 },
  liderBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  liderBadgeText: { color: '#F0502D', fontSize: 10, fontWeight: 'bold' },

  atividadesHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  novaAtividadeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0502D', justifyContent: 'center', alignItems: 'center' },
  atividadesLista: { gap: 10 },
  atividadeCard: { backgroundColor: '#1c1d2b', borderRadius: 10, borderWidth: 1, borderColor: '#2a2b3d', padding: 14 },
  atividadeTitulo: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  atividadeData: { color: '#888', fontSize: 12, marginTop: 4 },

  lockedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 30 },
  lockedTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  lockedText: { color: '#AAAAAA', fontSize: 14, textAlign: 'center' },
  loginBtn: { backgroundColor: '#F0502D', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 8, marginTop: 10 },
  loginBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});