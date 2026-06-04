import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingScreen } from './LoadingScreen';
import { colors } from '../theme/colors';

interface Props {
  message?: string;
  submessage?: string;
}

export function ScreenLoader({ message, submessage }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <LoadingScreen message={message} submessage={submessage} variant="page" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
