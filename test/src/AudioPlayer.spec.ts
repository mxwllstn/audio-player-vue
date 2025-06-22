import { AudioFilePlayer } from '@mxwllstn/audio-player-vue'
import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'

const wrapper = mount(AudioFilePlayer, {
  props: { src: '1.mp3' },
})

it('testing AudioPlayer component props', async () => {
  expect(wrapper.props().src).toEqual('1.mp3')
})
