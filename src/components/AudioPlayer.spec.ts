import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import AudioFilePlayer from '../components/AudioFilePlayer.vue'

const wrapper = mount(AudioFilePlayer, {
  propsData: { src: '1.mp3' },
})

it('testing AudioPlayer component props', async () => {
  expect(wrapper.props().src).toEqual('1.mp3')
})
