import React, { useEffect, useRef } from 'react';
import { useState } from '@hookstate/core';
import { StyleSheet, KeyboardEvent, Keyboard, findNodeHandle, TextInput, Animated, Easing, Platform } from 'react-native';
import { Orientation, OrientationChangeEvent, addOrientationChangeListener } from 'expo-screen-orientation';


interface Props {
  yOffset?: number;
}
const KeyboardAvoider: React.FC<Props> = ({ yOffset=10, children }) => {
  const ref = useRef(null);
  const kbOffset = useState(0);
  const kbOffsetAnim = useRef(new Animated.Value(0)).current;

  // Handle a special case on Android where rotating from landscape to portrait causes the offset to fail
  const justRotated = useState(false);
  const onOrientationChange = (e: OrientationChangeEvent) => {
    if ([Orientation.PORTRAIT_DOWN, Orientation.PORTRAIT_UP].includes(e.orientationInfo.orientation))
      justRotated.set(true);
  }
  
  const updateOffset = (toValue: number) => {
    kbOffset.set(toValue);

    const didJustRotate = justRotated.get();
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

    const rotate = Platform.OS === 'ios' ? undefined : addOrientationChangeListener(onOrientationChange);

    return () => {
      kbShow.remove();
      kbHide.remove();
      rotate && rotate.remove();
    }
  }, []);

  const onKeyboardShow = (e: KeyboardEvent) => {
    const topY = e.endCoordinates.screenY;
    const textRef = TextInput.State.currentlyFocusedInput();

    textRef && textRef.measureLayout(findNodeHandle(ref.current), 
      (x: number, y: number) => {
        const pageY = y;

        textRef && textRef.measure((x: number, y: number, width: number, height: number) => {
          const textInputY = pageY - kbOffset.get() + height + yOffset; // y coordinate of the bottom of this component
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
      ref={ref}
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