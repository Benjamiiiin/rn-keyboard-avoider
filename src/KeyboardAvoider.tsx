import React, { useEffect } from 'react';
import { StyleSheet, KeyboardEvent, Keyboard, findNodeHandle, 
  TextInput, Animated, Easing, Platform, Dimensions, ScaledSize
} from 'react-native';
import { useReff, useStatee } from './Hooks';

const checkIsPortrait = (dims: ScaledSize ) => {
  return dims.width < dims.height;
}


interface Props {
  yOffset?: number;
}
const KeyboardAvoider: React.FC<Props> = ({ yOffset=10, children }) => {
  const ref = useReff(null);
  const kbOffset = useStatee(0);
  const kbOffsetAnim = useReff(new Animated.Value(0)).cur;

  // Handle a special case on Android where rotating from landscape to portrait causes the offset to fail
  const isPortrait = useStatee(checkIsPortrait(Dimensions.get('screen')));
  const justRotated = useStatee(false);
  
  const updateOffset = (toValue: number) => {
    kbOffset.set(toValue);

    const didJustRotate = justRotated.val;
    const duration = didJustRotate ? 1000 : 100;
    const easing = didJustRotate ? null : Easing.out(Easing.ease);
    if (didJustRotate) justRotated.set(false);

    Animated.timing(kbOffsetAnim, {
      toValue: -toValue,
      duration: duration,
      useNativeDriver: true,
      easing: easing,
    }).start();
  }

  useEffect(() => {
    const kbShow = Keyboard.addListener(
      Platform.select({ios: "keyboardWillShow", android: "keyboardDidShow"}), 
      onKeyboardShow,
    );
    const kbHide = Keyboard.addListener(
      Platform.select({ios: "keyboardWillHide", android: "keyboardDidHide"}), 
      onKeyboardHide
    );

    const onOrientationChange = () => {
      const portrait = checkIsPortrait(Dimensions.get('screen'));
      justRotated.set(!isPortrait.val && portrait);
      isPortrait.set(portrait);
    };

    if (Platform.OS === 'android') {
      Dimensions.addEventListener("change", onOrientationChange);
    }

    return () => {
      kbShow.remove();
      kbHide.remove();
      Dimensions.removeEventListener("change", onOrientationChange);
    }
  }, []);

  const onKeyboardShow = (e: KeyboardEvent) => {
    setTimeout(() => {
      const textRef = TextInput.State.currentlyFocusedInput();
      textRef && measureTextInput(textRef, e);
    }, 100);
  }

  const measureTextInput = (textRef: any, e: KeyboardEvent) => {
    const topY = e.endCoordinates.screenY;

    textRef.measureLayout(findNodeHandle(ref.cur), 
      (x: number, y: number) => {
        const pageY = y;

        textRef.measure((x: number, y: number, width: number, height: number) => {
          const textInputY = pageY - kbOffset.val + height + yOffset; // y coordinate of the bottom of this component
          const offset = (textInputY > topY) ? (textInputY - topY) : 0;

          if (Platform.OS === 'android') updateOffset(Math.min(offset, yOffset));
          else updateOffset(offset);
        });
    }, ()=>{});
  }

  const onKeyboardHide = (e: KeyboardEvent) => {
    updateOffset(0);
  }

  return(
    <Animated.View
      ref={ref.trueRef}
      style={[styles.container, { transform: [{ translateY: kbOffsetAnim }]}]}
    >
      { children }
    </Animated.View>
  )
}
export default KeyboardAvoider;


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});