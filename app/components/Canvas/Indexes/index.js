import EventEmitter from 'events'
import { clamp, debounce, each } from 'lodash'
import { Box3, Vector3 } from 'three'

import { Detection } from 'classes/Detection'

import Background from './Background'
import Titles from './Titles'

export default class extends EventEmitter {
  constructor ({ camera, covers, index, scene, sizes, titlesFills, titlesStrokes }) {
    super()

    this.name = 'Indexes'

    this.camera = camera
    this.covers = covers
    this.scene = scene
    this.sizes = sizes
    this.titlesFills = titlesFills
    this.titlesStrokes = titlesStrokes

    this.elements = document.querySelectorAll('.index__link')

    this.isDown = false

    this.scroll = {
      clamp: {
        minimum: 0,
        maximum: 0
      },
      values: {
        current: 0,
        target: 0
      },
      y: {
        end: 0,
        start: 0
      }
    }

    this.onCheckDebounce = debounce(this.onCheck, 400)

    this.createBackground()
    this.createTitles()

    this.set(index)
  }

  /**
   * Create.
   */
  createBackground () {
    this.background = new Background({
      covers: this.covers,
      sizes: this.sizes
    })
  }

  createTitles () {
    this.titles = new Titles({
      sizes: this.sizes,
      titlesFills: this.titlesFills,
      titlesStrokes: this.titlesStrokes
    })

    this.scroll.clamp.maximum = this.titles.height * (this.titlesFills.length - 1)
  }

  /**
   * Events.
   */
  onTouchDown ({ y }) {
    this.isDown = true

    this.scroll.values.current = this.titles.position.y

    this.scroll.y.start = y
  }

  onTouchMove ({ y }) {
    if (!this.isDown) {
      return
    }

    this.scroll.y.end = y

    this.scroll.values.target = this.scroll.values.current + (this.scroll.y.start - this.scroll.y.end)
    this.scroll.values.target = clamp(this.scroll.values.target, this.scroll.clamp.minimum, this.scroll.clamp.maximum)
  }

  onTouchUp ({ y }) {
    this.isDown = false

    this.onCheck()
  }

  onWheel (speed) {
    this.isWheel = true

    const value = speed > 0 ? 1 : -1

    this.scroll.values.target += (this.titles.children[0].height + this.titles.children[0].padding) * value
    this.scroll.values.target = clamp(this.scroll.values.target, this.scroll.clamp.minimum, this.scroll.clamp.maximum)

    this.onCheckDebounce()
  }

  onResize ({ sizes, titlesFills, titlesStrokes }) {
    this.sizes = sizes

    this.background.onResize({
      sizes
    })

    this.titles.onResize({
      sizes,
      titlesFills,
      titlesStrokes
    })

    this.scroll.clamp.maximum = this.titles.height * (this.titlesFills.length - 1)
  }

  onCheck () {
    this.scroll.values.target = this.titles.height * this.index
    this.scroll.values.target = clamp(this.scroll.values.target, this.scroll.clamp.minimum, this.scroll.clamp.maximum)
  }

  /**
   * Animations.
   */
  show (pathname) {
    this.scene.add(this.background)
    this.scene.add(this.titles)

    this.background.show(pathname)
    this.titles.show(pathname, this.scroll)

    window.requestAnimationFrame(() => {
      this.calculate()
    })
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

    this.scroll.values.target = this.titles.height * this.index
    this.scroll.values.target = clamp(this.scroll.values.target, this.scroll.clamp.minimum, this.scroll.clamp.maximum)

    this.titles.position.y = this.scroll.values.target

    this.background.set(this.index)
    this.titles.set(this.index, true)

    window.requestAnimationFrame(() => {
      this.calculate()
    })
  }

  /**
   * Update.
   */
  update () {
    const index = Math.round(this.titles.position.y / this.titles.height)

    if (this.index !== index) {
      this.index = index

      this.emit('change', this.index)

      this.titles.set(this.index, Detection.isSafari)
    }

    this.titles.position.y += (this.scroll.values.target - this.titles.position.y) * 0.1

    this.background.update(this.index)
    this.titles.update(this.index)

    if (this.titles.position.y.toFixed(3) !== this.scroll.values.target.toFixed(3)) {
      this.calculate()
    }
  }

  /**
   * Calculate.
   */
  calculate () {
    const position = new Vector3()
    const box = new Box3()

    if (Detection.isSafari) {
      const child = this.titles.children[this.index]

      if (child) {
        box.setFromObject(child)

        const min = box.min.clone().project(this.camera)
        const max = box.max.clone().project(this.camera)

        const minX = (min.x) / 2 * this.sizes.screen.width
        const maxX = (max.x) / 2 * this.sizes.screen.width

        const minY = (min.y) / 2 * this.sizes.screen.height
        const maxY = (max.y) / 2 * this.sizes.screen.height

        const height = maxY - minY
        const width = maxX - minX

        child.updateMatrixWorld()
        child.getWorldPosition(position)

        position.project(this.camera)

        position.x = Math.round((position.x + 1) * this.sizes.screen.width / 2)
        position.y = Math.round((-position.y + 1) * this.sizes.screen.height / 2)
        position.z = 0

        each(this.elements, (link, linkIndex) => {
          if (linkIndex === this.index) {
            link.classList.add('index__link--active')
          } else {
            link.classList.remove('index__link--active')
          }
        })

        const link = this.elements[this.index]

        if (link) {
          TweenMax.set(link, {
            height,
            width,
            x: position.x - width / 2,
            y: position.y - height / 2
          })
        }
      }
    } else {
      each(this.titles.children, (child, childIndex) => {
        box.setFromObject(child)

        const min = box.min.clone().project(this.camera)
        const max = box.max.clone().project(this.camera)

        const minX = (min.x) / 2 * this.sizes.screen.width
        const maxX = (max.x) / 2 * this.sizes.screen.width

        const minY = (min.y) / 2 * this.sizes.screen.height
        const maxY = (max.y) / 2 * this.sizes.screen.height

        const height = maxY - minY
        const width = maxX - minX

        child.updateMatrixWorld()
        child.getWorldPosition(position)

        position.project(this.camera)

        position.x = Math.round((position.x + 1) * this.sizes.screen.width / 2)
        position.y = Math.round((-position.y + 1) * this.sizes.screen.height / 2)
        position.z = 0

        const link = this.elements[childIndex]

        TweenMax.set(link, {
          height,
          width,
          x: position.x - width / 2,
          y: position.y - height / 2
        })

        if (this.index === childIndex) {
          link.classList.add('index__link--active')
        } else {
          link.classList.remove('index__link--active')
        }
      })
    }
  }
}
