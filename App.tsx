import { Canvas, Image as SkiaImage, makeImageFromView, type SkImage } from '@shopify/react-native-skia';
import { useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

/**
 * Repro for expo/expo#50701 — SDK 57 pins @shopify/react-native-skia 2.6.2 with react-native 0.86.
 *
 * The purple box has overflow: 'hidden' and a child (orange bar) twice its width. On screen the bar is
 * clipped at the box edge. Tap "Snapshot": makeImageFromView draws the same view into a Skia image,
 * shown underneath.
 *
 * Expected: the snapshot is clipped like the screen, and logcat is quiet.
 * Actual on Android (Skia 2.6.2 + RN 0.86): logcat prints
 *   "couldn't invoke dispatchOverflowDraw() on ReactViewGroup" + java.lang.NoSuchMethodException
 * once per ReactViewGroup in the snapshot, and the clip is skipped (the bar overflows the box in
 * the image).
 *
 *   adb logcat | grep -A3 dispatchOverflowDraw
 */
export default function App() {
  const ref = useRef<View>(null);
  const [image, setImage] = useState<SkImage | null>(null);

  const snapshot = async () => {
    if (ref.current) setImage(await makeImageFromView(ref));
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.label}>On screen (clipped by overflow: hidden)</Text>
      <View ref={ref} collapsable={false} style={styles.frame}>
        <View style={styles.box}>
          <View style={styles.bar} />
        </View>
      </View>
      <Button title="Snapshot" onPress={snapshot} />
      <Text style={styles.label}>makeImageFromView result</Text>
      <Canvas style={styles.frame}>
        {image ? <SkiaImage image={image} x={0} y={0} width={300} height={160} fit="contain" /> : null}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: '#fff' },
  label: { fontSize: 14, color: '#333' },
  frame: { width: 300, height: 160, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  box: { width: 150, height: 100, backgroundColor: '#7c3aed', overflow: 'hidden', justifyContent: 'center' },
  bar: { width: 300, height: 30, backgroundColor: '#f59e0b' },
});
