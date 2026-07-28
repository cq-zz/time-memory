import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const FOOTER_BOTTOM_OFFSET = 96;

export default function FormKeyboardScrollView({
  children,
  bottomOffset = FOOTER_BOTTOM_OFFSET,
  keyboardShouldPersistTaps = 'handled',
  showsVerticalScrollIndicator = false,
  ...props
}) {
  return (
    <KeyboardAwareScrollView
      {...props}
      bottomOffset={bottomOffset}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}
