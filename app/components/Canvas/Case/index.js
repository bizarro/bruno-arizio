import EventEmitter from 'events'

import Background from './Background'
import Titles from './Titles'

export default class extends EventEmitter {
  constructor ({ covers, index, scene, sizes, titlesFills }) {
    super()

    this.name = 'Case'

    this.scene = scene

    this.createBackground(covers, sizes)
    this.createTitle(sizes, titlesFills)

    this.set(index)
  }

  /**
   * Create.
   */
  createBackground (covers, sizes) {
    this.background = new Background({
      covers,
      sizes
    })
  }

  createTitle (sizes, titlesFills) {
    this.titles = new Titles({
      sizes,
      titlesFills
    })
  }

  /**
   * Events.
   */
  onResize ({ sizes, titlesFills }) {
    this.background.onResize({
      sizes
    })

    this.titles.onResize({
      sizes,
      titlesFills
    })
  }

  /**
   * Animations.
   */
  show (page) {
    this.scene.add(this.background)
    this.scene.add(this.titles)

    this.background.show(page)
    this.titles.show(page)
  }

  hide (pathname) {
    let promises = []

    if (this.background) {
      const promise = this.background.hide(pathname, () => {
        this.scene.remove(this.background)

        this.background.destroy()
      })

      promises.push(promise)
    }

    if (this.titles) {
      const promise = this.titles.hide(pathname, () => {
        this.scene.remove(this.titles)

        this.titles.destroy()
      })

      promises.push(promise)
    }

    return Promise.all(promises)
  }

  /**
   * Set.
   */
  set (value) {
    this.index = value

    this.background.set(this.index)
    this.titles.set(this.index)
  }
}
