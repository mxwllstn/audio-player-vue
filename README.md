# audio-player-vue
Vue component for embedding audio files and streams

## Usage

```vue
import { AudioFilePlayer, AudioStreamPlayer } from '@mxwllstn/audio-player-vue'

/* audio file player */
<AudioFilePlayer src="https://test.com/file.mp3" />

/* audio stream player */
<AudioStreamPlayer src="https://test.com/stream" />
```

## Source Export

Copy the raw source into your project (shadcn-style):

```bash
npx @mxwllstn/audio-player-vue --export ./src/components/audio-player
```

## Development Setup

```bash
# install dependencies
pnpm i

# serve with hot reload
pnpm run dev

# build for production
pnpm run build
```
