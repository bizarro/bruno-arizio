import { Group } from 'three'

import Background from './Background'
import Title from './Title'

export default class extends Group {
  constructor ({ cover, fill, index, sizes }) {
    super()

    this.index = index
    this.location = (sizes.environment.height * 1.33) * this.index * -1
    this.sizes = sizes

    this.position.y = this.location

    this.createBackground(cover)
    this.createTitle(fill)
  }

  /**
   * Create.
   */
  createBackground (cover) {
    this.background = new Background({
      cover,
      index: this.index,
      sizes: this.sizes
    })
  }

  createTitle (fill) {
    this.title = new Title({
      fill,
      index: this.index,
      sizes: this.sizes
    })
  }

  /**
   * Events.
   */
  onTouchStart () {
    if (this.background) {
      this.background.onTouchStart()
    }
  }

  onTouchEnd () {
    this.background.onTouchEnd()
  }

  onResize ({ fill, sizes }) {
    this.sizes = sizes

    if (this.background) {
      this.background.onResize({
        sizes
      })
    }

    if (this.title) {
      this.title.onResize({
        fill,
        sizes
      })
    }
  }

  /**
   * Animations.
   */
  show (isCurrent, pathname) {
    this.add(this.background)
    this.add(this.title)

    this.background.show(isCurrent, pathname)
    this.title.show(isCurrent, pathname)
  }

  hide (isCurrent, pathname, page) {
    let promises = []

    if (this.background) {
      const promise = this.background.hide(isCurrent, pathname, page, () => {
        this.remove(this.background)

        this.background.destroy()
        this.background = null
      })

      promises.push(promise)
    }

    if (this.title) {
      const promise = this.title.hide(isCurrent, pathname, page, () => {
        this.remove(this.title)

        this.title.destroy()
        this.title = null
      })

      promises.push(promise)
    }

    return Promise.all(promises)
  }

  /**
   * Update.
   */
  update (scroll) {
    const percent = this.position.y / this.sizes.environment.height

    this.position.y = this.location + scroll

    if (this.background) {
      this.background.update(percent)
    }

    if (this.title) {
      this.title.update(percent)
    }
  }

  animate (time) {
    if (this.background) {
      this.background.animate(time)
    }
  }

  /**
   * Destroy.
   */
  destroyBackground () {
    if (this.background) {
      this.background.destroy()
    }
  }

  destroyTitle () {
    if (this.title) {
      this.title.destroy()
    }
  }

  destroy () {
    this.destroyBackground()
    this.destroyTitle()
  }
}
