# rn-keyboard-avoider

A simple keyboard-avoiding view for Android and iOS in React Native with Expo. Works in both portrait and landscape orientations!

`TextInput` fields are pushed gracefully above the top of the keyboard, with a customisable offset between the top of the keyboard and the bottom of the `TextInput`.

<img src="./assets/demo.gif" width='320'/>

## Installation
```bash
npm install --save rn-keyboard-avoider
```

For proper behaviour on Android devices, add the `softwareKeyboardLayoutMode` property to your ***app.json*** file as follows:

```json
{
  "expo": {
    "android": {
      "softwareKeyboardLayoutMode": "pan"
    }
  }
}
```

## How to Use

Simply wrap your app (or app contents) with the component:

```jsx
import { KeyboardAvoider } from 'rn-keyboard-avoider';

export default function App() {
  <KeyboardAvoider>
    {/* your app contents */}
  </KeyboardAvoider>
);
```

For proper behaviour on Android devices in landscape orientation, add the `disableFullscreenUI` property to your `TextInput` components as follows:

```jsx
<TextInput disableFullscreenUI={true}/>
```

## Properties

### yOffset (optional): number
Controls the distance between the top of the keyboard and the bottom of your `TextInput` field. Default is 10px.


## Limitations

- On Android devices, the yOffset will be reduced after the user starts typing. This is due to the behaviour of the native `softwareKeyboardLayoutMode` property being set to `pan`. If you're really keen to keep the offset, it's possible to simply increase the padding of your text inputs.

## About

Made by ***friggitydingo*** to support the development of a mobile sci-fi MMO built with React Native.

[![Discord URL](https://img.shields.io/badge/-white?logo=discord&style=social&label=Join%20the%20Discord)](http://discord.gg/qRMMvxW3yc)

[![Twitter URL](https://img.shields.io/twitter/follow/BenScottSteer?style=social)](https://twitter.com/BenScottSteer)
