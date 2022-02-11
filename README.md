# audio-player-vue
[![Version](https://img.shields.io/npm/v/audio-player-vue.svg)](https://www.npmjs.org/package/audio-player-vue)

Vue component for embedding audio files and streams

## Install
Use `yarn` to install the module
```bash
yarn add audio-player-vue
```
Or use `npm` to install the module
```bash
npm install audio-player-vue
```

## Usage

#### Component
```vue
  /* audio file player */
  <AudioPlayer src="https://test.com/file.mp3" />
  
  /* audio stream player */
  <AudioPlayer src="https://test.com/stream" stream />
```

## Development Setup (Vue + Vite)

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production
$ yarn build

# preview production build
$ yarn preview --host

```
