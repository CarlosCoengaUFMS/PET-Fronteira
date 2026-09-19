import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

type TipoAlerta = 'info' | 'sucesso' | 'erro' | 'confirmacao';

interface OpcoesAlerta {
  titulo: string;
  mensagem?: string;
  tipo?: TipoAlerta;
  textoBotao?: string;
}

interface OpcoesConfirmacao {
  titulo: string;
  mensagem?: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  destrutivo?: boolean;
}

interface AppAlertContextType {
  mostrarAlerta: (opcoes: OpcoesAlerta) => void;
  mostrarConfirmacao: (opcoes: OpcoesConfirmacao) => Promise<boolean>;
}

const AppAlertContext = createContext<AppAlertContextType | null>(null);

export const useAppAlert = () => {
  const contexto = useContext(AppAlertContext);
  if (!contexto) {
    throw new Error('useAppAlert precisa ser usado dentro de um <AppAlertProvider>');
  }
  return contexto;
};

// --- ÍCONES ---
const CheckIconSvg = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="rgba(46,204,113,0.15)" />
    <Path d="M7 12.5l3 3 7-7" stroke="#2ECC71" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ErrorIconSvg = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="rgba(255,68,68,0.15)" />
    <Path d="M15 9l-6 6M9 9l6 6" stroke="#FF4444" strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

const InfoIconSvg = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="rgba(28,111,168,0.15)" />
    <Path d="M12 11v5.5M12 8v.01" stroke="#1c6fa8" strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

const QuestionIconSvg = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="rgba(240,80,45,0.15)" />
    <Path
      d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 1-1 1.7v.3M12 17v.01"
      stroke="#F0502D"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const IconePorTipo: Record<TipoAlerta, () => React.JSX.Element> = {
  sucesso: CheckIconSvg,
  erro: ErrorIconSvg,
  info: InfoIconSvg,
  confirmacao: QuestionIconSvg,
};

interface EstadoModal {
  visivel: boolean;
  titulo: string;
  mensagem?: string;
  tipo: TipoAlerta;
  ehConfirmacao: boolean;
  textoBotaoPrimario: string;
  textoBotaoSecundario?: string;
  destrutivo?: boolean;
  resolver?: (valor: boolean) => void;
}

const ESTADO_INICIAL: EstadoModal = {
  visivel: false,
  titulo: '',
  tipo: 'info',
  ehConfirmacao: false,
  textoBotaoPrimario: 'OK',
};

export function AppAlertProvider({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<EstadoModal>(ESTADO_INICIAL);
  const anim = useRef(new Animated.Value(0)).current;

  const animarEntrada = useCallback(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim]);

  const fechar = useCallback(
    (resultado: boolean) => {
      Animated.timing(anim, {
        toValue: 0,
        duration: 150,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setEstado((atual) => {
          atual.resolver?.(resultado);
          return ESTADO_INICIAL;
        });
      });
    },
    [anim]
  );

  const mostrarAlerta = useCallback(
    (opcoes: OpcoesAlerta) => {
      setEstado({
        visivel: true,
        titulo: opcoes.titulo,
        mensagem: opcoes.mensagem,
        tipo: opcoes.tipo || 'info',
        ehConfirmacao: false,
        textoBotaoPrimario: opcoes.textoBotao || 'OK',
      });
      animarEntrada();
    },
    [animarEntrada]
  );

  const mostrarConfirmacao = useCallback(
    (opcoes: OpcoesConfirmacao): Promise<boolean> => {
      return new Promise((resolve) => {
        setEstado({
          visivel: true,
          titulo: opcoes.titulo,
          mensagem: opcoes.mensagem,
          tipo: 'confirmacao',
          ehConfirmacao: true,
          textoBotaoPrimario: opcoes.textoConfirmar || 'Confirmar',
          textoBotaoSecundario: opcoes.textoCancelar || 'Cancelar',
          destrutivo: opcoes.destrutivo,
          resolver: resolve,
        });
        animarEntrada();
      });
    },
    [animarEntrada]
  );

  const Icone = IconePorTipo[estado.tipo];

  return (
    <AppAlertContext.Provider value={{ mostrarAlerta, mostrarConfirmacao }}>
      {children}

      <Modal visible={estado.visivel} transparent animationType="none" onRequestClose={() => fechar(false)}>
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.card,
              {
                opacity: anim,
                transform: [
                  {
                    scale: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                  {
                    translateY: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [12, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.iconeWrapper}>
              <Icone />
            </View>

            <Text style={styles.titulo}>{estado.titulo}</Text>
            {estado.mensagem ? <Text style={styles.mensagem}>{estado.mensagem}</Text> : null}

            <View style={styles.botoesRow}>
              {estado.ehConfirmacao && (
                <TouchableOpacity style={styles.botaoSecundario} onPress={() => fechar(false)}>
                  <Text style={styles.botaoSecundarioTexto}>{estado.textoBotaoSecundario}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.botaoPrimario, estado.destrutivo && styles.botaoDestrutivo]}
                onPress={() => fechar(true)}
              >
                <Text style={styles.botaoPrimarioTexto}>{estado.textoBotaoPrimario}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </AppAlertContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#1c1d2b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2b3d',
    padding: 28,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  iconeWrapper: { marginBottom: 14 },
  titulo: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  mensagem: { color: '#AAAAAA', fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 22 },
  botoesRow: { flexDirection: 'row', gap: 10, width: '100%' },
  botaoPrimario: { flex: 1, backgroundColor: '#F0502D', paddingVertical: 13, borderRadius: 8, alignItems: 'center' },
  botaoDestrutivo: { backgroundColor: '#FF4444' },
  botaoPrimarioTexto: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  botaoSecundario: { flex: 1, borderWidth: 1, borderColor: '#2a2b3d', paddingVertical: 13, borderRadius: 8, alignItems: 'center' },
  botaoSecundarioTexto: { color: '#CCCCCC', fontSize: 15, fontWeight: '600' },
});