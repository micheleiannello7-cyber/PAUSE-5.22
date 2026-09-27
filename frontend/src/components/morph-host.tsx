// PAUSE — livello "ospite" sopra tutto lo stack (anche sopra la barra dei tab):
// ci vive la transizione card Home → lettura (story-morph). Chi apre la storia
// vi monta l'overlay; il lettore, appena disegnato sotto, lo congeda con una
// dissolvenza breve. Finché è attivo assorbe i tocchi (niente doppi tap).
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

type MorphHostCtx = { show: (node: ReactNode) => void; dismiss: () => void; clear: () => void; active: boolean };

const Ctx = createContext<MorphHostCtx>({ show: () => {}, dismiss: () => {}, clear: () => {}, active: false });

export const useMorphHost = () => useContext(Ctx);

export function MorphHost({ children }: { children: ReactNode }) {
  const [node, setNode] = useState<ReactNode>(null);
  const fade = useSharedValue(1);
  const clear = useCallback(() => setNode(null), []);
  const show = useCallback((next: ReactNode) => { fade.value = 1; setNode(next); }, [fade]);
  const dismiss = useCallback(() => {
    fade.value = withTiming(0, { duration: 240, easing: Easing.out(Easing.quad) }, (done) => { if (done) runOnJS(clear)(); });
  }, [fade, clear]);
  const style = useAnimatedStyle(() => ({ opacity: fade.value }));
  const value = useMemo(() => ({ show, dismiss, clear, active: node != null }), [show, dismiss, clear, node]);
  return (
    <Ctx.Provider value={value}>
      <View style={styles.fill}>
        {children}
        {node != null ? (
          <Animated.View style={[StyleSheet.absoluteFill, style]} testID="morph-host">{node}</Animated.View>
        ) : null}
      </View>
    </Ctx.Provider>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
