import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';
import { color } from '../theme/tokens';

export function PaperBackground() {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: color.paper }]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="grid" width={24} height={24} patternUnits="userSpaceOnUse">
            <Path d="M24 0H0V24" fill="none" stroke={color.paperGrid} strokeWidth={1} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#grid)" />
      </Svg>
    </View>
  );
}
