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
import { Stack, router, Link, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
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

const ImageIconSvg = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="2" stroke="#F0502D" strokeWidth="2" />
    <Circle cx="8.5" cy="8.5" r="1.5" fill="#F0502D" />
    <Path d="M21 15l-5-5L5 21" stroke="#F0502D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TrashIconSvg = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18" stroke="#FF4444" strokeWidth="2" strokeLinecap="round" />
    <Path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="#FF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// --- TIPOS ---
interface Projeto {
  uuid: string;
  titulo: string;
  descricao: string | null;
  ano: number | null;
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
  status: string | null;
  imagem_url: string | null;
}

interface PetianoSimples {
  id: string;
  nome: string;
  avatar_url: string | null;
  cargo: string;
}

const ANOS = [2023, 2024, 2025, 2026];

// Mostra um aviso que funciona tanto na web quanto no celular
// (Alert.alert sozinho não exibe nada no navegador)
const mostrarAlerta = (titulo: string, mensagem: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensagem}`);
  } else {
    Alert.alert(titulo, mensagem);
  }
};

const formatarData = (iso: string | null) => {
  if (!iso) return '';
  const data = new Date(iso);
  return data.toLocaleDateString('pt-BR');
};

const formatarDataHoraAtividade = (iso: string | null) => {
  if (!iso) return '';
  const data = new Date(iso);
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Extrai o caminho do arquivo dentro do bucket a partir da URL pública
const extrairCaminhoStorage = (url: string, bucket: string) => {
  const marcador = `/${bucket}/`;
  const indice = url.indexOf(marcador);
  if (indice === -1) return null;
  return url.substring(indice + marcador.length);
};

// Converte "DD/MM/AAAA" + "HH:MM" em um Date válido (ou null se inválido)
const parseDataHora = (dataStr: string, horaStr: string): Date | null => {
  const partesData = dataStr.trim().split('/');
  const partesHora = horaStr.trim().split(':');
  if (partesData.length !== 3 || partesHora.length !== 2) return null;

  const [diaStr, mesStr, anoStr] = partesData;
  const [horaStrH, minutoStr] = partesHora;

  const dia = parseInt(diaStr, 10);
  const mes = parseInt(mesStr, 10);
  const ano = parseInt(anoStr, 10);
  const hora = parseInt(horaStrH, 10);
  const minuto = parseInt(minutoStr, 10);

  if ([dia, mes, ano, hora, minuto].some((n) => isNaN(n))) return null;

  const data = new Date(ano, mes - 1, dia, hora, minuto);
  if (isNaN(data.getTime())) return null;
  return data;
};

// Vai inserindo "/" enquanto o usuário digita: "09082026" -> "09/08/2026"
const formatarDataInput = (texto: string) => {
  const numeros = texto.replace(/\D/g, '').slice(0, 8);
  if (numeros.length > 4) {
    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`;
  }
  if (numeros.length > 2) {
    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}`;
  }
  return numeros;
};

// Vai inserindo ":" enquanto o usuário digita: "1654" -> "16:54"
const formatarHoraInput = (texto: string) => {
  const numeros = texto.replace(/\D/g, '').slice(0, 4);
  if (numeros.length > 2) {
    return `${numeros.slice(0, 2)}:${numeros.slice(2, 4)}`;
  }
  return numeros;
};

export default function ProjetosScreen() {
  const params = useLocalSearchParams<{ projeto?: string; ano?: string }>();

  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [logado, setLogado] = useState(false);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [souTutor, setSouTutor] = useState(false);
  const [linkProcessado, setLinkProcessado] = useState(false);

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
  const [novaImagemLocal, setNovaImagemLocal] = useState<string | null>(null);
  const [enviandoProjeto, setEnviandoProjeto] = useState(false);

  const [petianosDisponiveis, setPetianosDisponiveis] = useState<PetianoSimples[]>([]);
  const [lideresSelecionados, setLideresSelecionados] = useState<string[]>([]);

  const [formNovaAtividadeVisivel, setFormNovaAtividadeVisivel] = useState(false);
  const [atividadeTitulo, setAtividadeTitulo] = useState('');
  const [atividadeData, setAtividadeData] = useState('');
  const [atividadeHora, setAtividadeHora] = useState('');
  const [novaImagemAtividadeLocal, setNovaImagemAtividadeLocal] = useState<string | null>(null);
  const [enviandoAtividade, setEnviandoAtividade] = useState(false);

  const [atividadeReagendandoUuid, setAtividadeReagendandoUuid] = useState<string | null>(null);
  const [reagendarData, setReagendarData] = useState('');
  const [reagendarHora, setReagendarHora] = useState('');

  useEffect(() => {
    verificarSessao();
  }, []);

  // Projetos e planejamento são públicos — carregam independente de login
  useEffect(() => {
    buscarProjetos(anoSelecionado);
    buscarPlanejamento(anoSelecionado);
  }, [anoSelecionado]);

  useEffect(() => {
    if (souTutor) {
      buscarPetianosParaLideranca();
    }
  }, [souTutor]);

  // --- Vindo de "Meus Projetos": abre direto o projeto e o ano corretos ---
  useEffect(() => {
    if (params.projeto && !linkProcessado) {
      setLinkProcessado(true);
      if (params.ano) {
        setAnoSelecionado(Number(params.ano));
      }
      abrirProjetoPorUuid(params.projeto as string);
    }
  }, [params.projeto]);

  const abrirProjetoPorUuid = async (uuid: string) => {
    const { data, error } = await supabase.from('projeto').select('*').eq('uuid', uuid).single();
    if (!error && data) {
      selecionarProjeto(data as Projeto);
    }
  };

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

  const buscarPetianosParaLideranca = async () => {
    const { data } = await supabase
      .from('petianos')
      .select('id, nome, avatar_url, cargo')
      .neq('cargo', 'Tutor');

    setPetianosDisponiveis((data as PetianoSimples[]) || []);
  };

  const voltar = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const escolherImagemProjeto = async () => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      mostrarAlerta('Permissão negada', 'Precisamos de acesso às suas fotos.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.6,
    });

    if (!resultado.canceled) {
      setNovaImagemLocal(resultado.assets[0].uri);
    }
  };

  const escolherImagemAtividade = async () => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      mostrarAlerta('Permissão negada', 'Precisamos de acesso às suas fotos.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.6,
    });

    if (!resultado.canceled) {
      setNovaImagemAtividadeLocal(resultado.assets[0].uri);
    }
  };

  const toggleLider = (id: string) => {
    setLideresSelecionados((atual) =>
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]
    );
  };

  // --- CRIAR PROJETO (temporário, remover quando todos os projetos reais forem cadastrados) ---
  const criarProjeto = async () => {
    if (!novoTitulo.trim()) {
      mostrarAlerta('Erro', 'Digite o título do projeto.');
      return;
    }

    setEnviandoProjeto(true);
    try {
      let imagemUrl: string | null = null;

      if (novaImagemLocal) {
        const resposta = await fetch(novaImagemLocal);
        const blob = await resposta.blob();
        const caminho = `${usuarioId}/${Date.now()}.jpg`;

        const { error: erroUpload } = await supabase.storage
          .from('projetos')
          .upload(caminho, blob, { contentType: 'image/jpeg' });

        if (erroUpload) {
          throw new Error('Falha ao enviar a imagem. Verifique se o bucket "projetos" foi criado como Public.');
        }

        const { data: urlData } = supabase.storage.from('projetos').getPublicUrl(caminho);
        imagemUrl = urlData.publicUrl;
      }

      const { data: novo, error } = await supabase
        .from('projeto')
        .insert({
          titulo: novoTitulo,
          descricao: novaDescricao,
          ano: anoSelecionado,
          imagem_url: imagemUrl,
        })
        .select()
        .single();

      if (error) throw error;

      if (lideresSelecionados.length > 0) {
        const linhas = lideresSelecionados.map((petianoId) => ({
          petiano_id: petianoId,
          projeto_uuid: novo.uuid,
          tipo_responsavel: 'lider',
        }));
        await supabase.from('petianos_has_projeto').insert(linhas);
      }

      setNovoTitulo('');
      setNovaDescricao('');
      setNovaImagemLocal(null);
      setLideresSelecionados([]);
      setFormNovoProjetoVisivel(false);
      buscarProjetos(anoSelecionado);
    } catch (error: any) {
      console.error(error);
      mostrarAlerta('Erro', error.message || 'Não foi possível criar o projeto.');
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
      .select('uuid, titulo, data_inicio, status, imagem_url')
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
    setAtividadeReagendandoUuid(null);
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
      mostrarAlerta('Erro', 'Não foi possível entrar no projeto.');
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
      mostrarAlerta('Erro', 'Não foi possível sair do projeto.');
      return;
    }

    selecionarProjeto(projetoSelecionado);
  };

  const criarAtividade = async () => {
    if (!atividadeTitulo.trim() || !projetoSelecionado) {
      mostrarAlerta('Erro', 'Digite o título da atividade.');
      return;
    }

    if (!atividadeData.trim() || !atividadeHora.trim()) {
      mostrarAlerta('Erro', 'Preencha a data e a hora da atividade.');
      return;
    }

    const dataHora = parseDataHora(atividadeData, atividadeHora);
    if (!dataHora) {
      mostrarAlerta('Erro', 'Data ou hora inválida. Use o formato DD/MM/AAAA e HH:MM.');
      return;
    }

    setEnviandoAtividade(true);
    try {
      let imagemUrl: string | null = null;

      if (novaImagemAtividadeLocal) {
        const resposta = await fetch(novaImagemAtividadeLocal);
        const blob = await resposta.blob();
        const caminho = `${projetoSelecionado.uuid}/${Date.now()}.jpg`;

        const { error: erroUpload } = await supabase.storage
          .from('atividades')
          .upload(caminho, blob, { contentType: 'image/jpeg' });

        if (!erroUpload) {
          const { data: urlData } = supabase.storage.from('atividades').getPublicUrl(caminho);
          imagemUrl = urlData.publicUrl;
        } else {
          console.error('Erro ao enviar imagem da atividade:', erroUpload);
        }
      }

      const { error } = await supabase.from('atividade').insert({
        projeto_uuid: projetoSelecionado.uuid,
        titulo: atividadeTitulo,
        data_inicio: dataHora.toISOString(),
        imagem_url: imagemUrl,
      });

      if (error) throw error;

      setAtividadeTitulo('');
      setAtividadeData('');
      setAtividadeHora('');
      setNovaImagemAtividadeLocal(null);
      setFormNovaAtividadeVisivel(false);
      selecionarProjeto(projetoSelecionado);
    } catch (error: any) {
      console.error(error);
      mostrarAlerta('Erro', error.message || 'Não foi possível criar a atividade.');
    } finally {
      setEnviandoAtividade(false);
    }
  };

  const marcarConcluida = async (atividade: Atividade) => {
    const { error } = await supabase
      .from('atividade')
      .update({ status: 'Concluída' })
      .eq('uuid', atividade.uuid);

    if (error) {
      mostrarAlerta('Erro', 'Não foi possível marcar como concluída.');
      return;
    }

    if (projetoSelecionado) selecionarProjeto(projetoSelecionado);
  };

  const confirmarReagendamento = async (atividade: Atividade) => {
    const dataHora = parseDataHora(reagendarData, reagendarHora);
    if (!dataHora) {
      mostrarAlerta('Erro', 'Data ou hora inválida. Use o formato DD/MM/AAAA e HH:MM.');
      return;
    }

    const { error } = await supabase
      .from('atividade')
      .update({ data_inicio: dataHora.toISOString(), status: null })
      .eq('uuid', atividade.uuid);

    if (error) {
      mostrarAlerta('Erro', 'Não foi possível adiar a atividade.');
      return;
    }

    setAtividadeReagendandoUuid(null);
    setReagendarData('');
    setReagendarHora('');
    if (projetoSelecionado) selecionarProjeto(projetoSelecionado);
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
      mostrarAlerta('Sucesso', 'Planejamento enviado com sucesso!');
    } catch (error: any) {
      console.error(error);
      mostrarAlerta('Erro', error.message || 'Não foi possível enviar o planejamento.');
    } finally {
      setEnviandoPlanejamento(false);
    }
  };

  const confirmarAcao = (mensagem: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (Platform.OS === 'web') {
        resolve(window.confirm(mensagem));
      } else {
        Alert.alert(
          'Confirmar',
          mensagem,
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Excluir', style: 'destructive', onPress: () => resolve(true) },
          ]
        );
      }
    });
  };

  const excluirProjeto = async () => {
    if (!projetoSelecionado) return;

    const confirmado = await confirmarAcao(
      'Tem certeza que deseja excluir este projeto? Essa ação não pode ser desfeita.'
    );
    if (!confirmado) return;

    try {
      await supabase.from('atividade').delete().eq('projeto_uuid', projetoSelecionado.uuid);
      await supabase.from('petianos_has_projeto').delete().eq('projeto_uuid', projetoSelecionado.uuid);

      if (projetoSelecionado.imagem_url) {
        const caminho = extrairCaminhoStorage(projetoSelecionado.imagem_url, 'projetos');
        if (caminho) {
          await supabase.storage.from('projetos').remove([caminho]);
        }
      }

      const { error } = await supabase.from('projeto').delete().eq('uuid', projetoSelecionado.uuid);
      if (error) throw error;

      voltarParaLista();
      buscarProjetos(anoSelecionado);
    } catch (error: any) {
      console.error(error);
      mostrarAlerta('Erro', 'Não foi possível excluir o projeto.');
    }
  };

  const abrirLink = (url: string) => {
    Linking.openURL(url).catch(() => mostrarAlerta('Erro', 'Não foi possível abrir o arquivo.'));
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

            {!projetoSelecionado && logado && (
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

                    <TouchableOpacity style={styles.imagemPickerBtn} onPress={escolherImagemProjeto}>
                      {novaImagemLocal ? (
                        <Image source={{ uri: novaImagemLocal }} style={styles.imagemPreview} />
                      ) : (
                        <View style={styles.imagemPickerPlaceholder}>
                          <ImageIconSvg />
                          <Text style={styles.imagemPickerText}>Escolher imagem do projeto</Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    <Text style={styles.lideresLabel}>Líderes do projeto</Text>
                    <View style={styles.lideresGrid}>
                      {petianosDisponiveis.map((petiano) => {
                        const selecionado = lideresSelecionados.includes(petiano.id);
                        return (
                          <TouchableOpacity
                            key={petiano.id}
                            style={[styles.liderChip, selecionado && styles.liderChipAtivo]}
                            onPress={() => toggleLider(petiano.id)}
                          >
                            {petiano.avatar_url ? (
                              <Image source={{ uri: petiano.avatar_url }} style={styles.liderChipAvatar} />
                            ) : (
                              <UserIconSvg size={24} />
                            )}
                            <Text style={[styles.liderChipText, selecionado && styles.liderChipTextAtivo]} numberOfLines={1}>
                              {petiano.nome}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
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
                {projetoSelecionado.imagem_url && (
                  <Image source={{ uri: projetoSelecionado.imagem_url }} style={styles.detalheImagem} />
                )}

                <View style={styles.detalheTituloRow}>
                  <Text style={styles.detalheTitulo}>{projetoSelecionado.titulo}</Text>
                  {souTutor && (
                    <TouchableOpacity style={styles.excluirProjetoBtn} onPress={excluirProjeto}>
                      <TrashIconSvg />
                    </TouchableOpacity>
                  )}
                </View>

                {projetoSelecionado.descricao ? (
                  <Text style={styles.detalheDescricao}>{projetoSelecionado.descricao}</Text>
                ) : null}

                {carregandoMembros ? (
                  <ActivityIndicator color="#F0502D" size="large" style={{ marginVertical: 20 }} />
                ) : (
                  <>
                    {!logado ? (
                      <TouchableOpacity style={styles.participarBtn} onPress={() => router.push('/login')}>
                        <Text style={styles.participarBtnText}>Faça login para participar</Text>
                      </TouchableOpacity>
                    ) : !souMembro ? (
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
                        <View style={styles.dataHoraRow}>
                          <TextInput
                            style={[styles.input, styles.dataHoraInput]}
                            placeholder="DD/MM/AAAA"
                            placeholderTextColor="#666"
                            value={atividadeData}
                            onChangeText={(texto) => setAtividadeData(formatarDataInput(texto))}
                            keyboardType="numeric"
                            maxLength={10}
                          />
                          <TextInput
                            style={[styles.input, styles.dataHoraInput]}
                            placeholder="HH:MM"
                            placeholderTextColor="#666"
                            value={atividadeHora}
                            onChangeText={(texto) => setAtividadeHora(formatarHoraInput(texto))}
                            keyboardType="numeric"
                            maxLength={5}
                          />
                        </View>

                        <TouchableOpacity style={styles.imagemPickerBtn} onPress={escolherImagemAtividade}>
                          {novaImagemAtividadeLocal ? (
                            <Image source={{ uri: novaImagemAtividadeLocal }} style={styles.imagemPreview} />
                          ) : (
                            <View style={styles.imagemPickerPlaceholder}>
                              <ImageIconSvg />
                              <Text style={styles.imagemPickerText}>Escolher imagem da atividade</Text>
                            </View>
                          )}
                        </TouchableOpacity>

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
                        {atividades.map((atividade) => {
                          const dataAtividade = atividade.data_inicio ? new Date(atividade.data_inicio) : null;
                          const jaPassou = dataAtividade ? dataAtividade.getTime() < Date.now() : false;
                          const concluida = atividade.status === 'Concluída';
                          const reagendando = atividadeReagendandoUuid === atividade.uuid;

                          return (
                            <View key={atividade.uuid} style={styles.atividadeCard}>
                              {atividade.imagem_url && (
                                <Image source={{ uri: atividade.imagem_url }} style={styles.atividadeImagem} />
                              )}
                              <Text style={styles.atividadeTitulo}>{atividade.titulo}</Text>
                              {atividade.data_inicio ? (
                                <Text style={styles.atividadeData}>{formatarDataHoraAtividade(atividade.data_inicio)}</Text>
                              ) : null}

                              <View
                                style={[
                                  styles.atividadeStatusBadge,
                                  concluida
                                    ? styles.atividadeStatusConcluida
                                    : jaPassou
                                    ? styles.atividadeStatusAtrasada
                                    : styles.atividadeStatusAgendada,
                                ]}
                              >
                                <Text style={styles.atividadeStatusText}>
                                  {concluida ? 'Concluída' : jaPassou ? 'Atrasada' : 'Agendada'}
                                </Text>
                              </View>

                              {souLider && (
                                <View style={styles.atividadeAcoes}>
                                  {!concluida && jaPassou && (
                                    <TouchableOpacity
                                      style={styles.atividadeAcaoBtn}
                                      onPress={() => marcarConcluida(atividade)}
                                    >
                                      <Text style={styles.atividadeAcaoBtnText}>Marcar como concluída</Text>
                                    </TouchableOpacity>
                                  )}
                                  <TouchableOpacity
                                    style={styles.atividadeAcaoBtnSecundario}
                                    onPress={() =>
                                      setAtividadeReagendandoUuid(reagendando ? null : atividade.uuid)
                                    }
                                  >
                                    <Text style={styles.atividadeAcaoBtnSecundarioText}>
                                      {reagendando ? 'Cancelar' : 'Adiar'}
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              )}

                              {reagendando && (
                                <View style={styles.reagendarForm}>
                                  <TextInput
                                    style={styles.input}
                                    placeholder="Nova data (DD/MM/AAAA)"
                                    placeholderTextColor="#666"
                                    value={reagendarData}
                                    onChangeText={(texto) => setReagendarData(formatarDataInput(texto))}
                                    keyboardType="numeric"
                                    maxLength={10}
                                  />
                                  <TextInput
                                    style={styles.input}
                                    placeholder="Nova hora (HH:MM)"
                                    placeholderTextColor="#666"
                                    value={reagendarHora}
                                    onChangeText={(texto) => setReagendarHora(formatarHoraInput(texto))}
                                    keyboardType="numeric"
                                    maxLength={5}
                                  />
                                  <TouchableOpacity
                                    style={styles.salvarProjetoBtn}
                                    onPress={() => confirmarReagendamento(atividade)}
                                  >
                                    <Text style={styles.salvarProjetoBtnText}>Confirmar novo horário</Text>
                                  </TouchableOpacity>
                                </View>
                              )}
                            </View>
                          );
                        })}
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
  uploadBtnDisabled: { opacity: 0.7 },

  dataHoraRow: { flexDirection: 'row', gap: 10 },
  dataHoraInput: { flex: 1 },

  imagemPickerBtn: { borderRadius: 8, overflow: 'hidden' },
  imagemPreview: { width: '100%', height: 140, borderRadius: 8 },
  imagemPickerPlaceholder: {
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2b3d',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imagemPickerText: { color: '#F0502D', fontSize: 13, fontWeight: '600' },

  lideresLabel: { color: '#CCCCCC', fontSize: 13, fontWeight: '600' },
  lideresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  liderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#11121C',
    borderWidth: 1,
    borderColor: '#2a2b3d',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    maxWidth: 150,
  },
  liderChipAtivo: { backgroundColor: 'rgba(240,80,45,0.15)', borderColor: '#F0502D' },
  liderChipAvatar: { width: 24, height: 24, borderRadius: 12 },
  liderChipText: { color: '#AAAAAA', fontSize: 12 },
  liderChipTextAtivo: { color: '#F0502D', fontWeight: 'bold' },

  salvarProjetoBtn: { backgroundColor: '#F0502D', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  salvarProjetoBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },

  projetosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  projetoCard: { width: 220, backgroundColor: '#1c1d2b', borderRadius: 14, borderWidth: 1, borderColor: '#2a2b3d', overflow: 'hidden', padding: 14 },
  projetoImagem: { width: '100%', height: 100, borderRadius: 8, marginBottom: 10 },
  projetoImagemPlaceholder: { width: '100%', height: 100, borderRadius: 8, backgroundColor: '#2a2b3d', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  projetoNome: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  projetoDesc: { color: '#AAAAAA', fontSize: 12, lineHeight: 18 },

  detalheImagem: { width: '100%', height: 180, borderRadius: 12, marginBottom: 16 },
  detalheTituloRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  detalheTitulo: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 8, flex: 1 },
  excluirProjetoBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,68,68,0.1)', justifyContent: 'center', alignItems: 'center' },
  detalheDescricao: { color: '#AAAAAA', fontSize: 14, lineHeight: 21, marginBottom: 20 },

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
  atividadesLista: { gap: 12 },
  atividadeCard: { backgroundColor: '#1c1d2b', borderRadius: 10, borderWidth: 1, borderColor: '#2a2b3d', padding: 14, gap: 6 },
  atividadeImagem: { width: '100%', height: 130, borderRadius: 8, marginBottom: 6 },
  atividadeTitulo: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  atividadeData: { color: '#888', fontSize: 12 },
  atividadeStatusBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8, marginTop: 2 },
  atividadeStatusAgendada: { backgroundColor: '#1c6fa8' },
  atividadeStatusAtrasada: { backgroundColor: '#8a4a1c' },
  atividadeStatusConcluida: { backgroundColor: '#2a2b3d' },
  atividadeStatusText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  atividadeAcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  atividadeAcaoBtn: { backgroundColor: '#F0502D', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  atividadeAcaoBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  atividadeAcaoBtnSecundario: { borderWidth: 1, borderColor: '#F0502D', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  atividadeAcaoBtnSecundarioText: { color: '#F0502D', fontSize: 12, fontWeight: 'bold' },
  reagendarForm: { gap: 10, marginTop: 10 },
});