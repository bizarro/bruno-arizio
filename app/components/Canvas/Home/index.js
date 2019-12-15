import EventEmitter from 'events'
import { debounce, each, map } from 'lodash'

import Project from './Project'

export default class extends EventEmitter {
  constructor ({ clock, covers, index, scene, sizes, titlesFills }) {
    super()

    this.name = 'Home'

    this.clock = clock
    this.covers = covers
    this.scene = scene
    this.sizes = sizes

    this.position = {
      current: 0,
      previous: 0
    }

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

    this.createProjects(covers, titlesFills)

    this.onCheckDebounce = debounce(this.onCheck, 200)
    this.onHoldEndDebounce = debounce(this.onHoldEnd, 100)

    this.set(index)
  }

  /**
   * Create.
   */
  createProjects (covers, titlesFills) {
    this.projects = map(covers, (information, index) => {
      return new Project({
        cover: covers[index],
        fill: titlesFills[index],
        index,
        sizes: this.sizes
      })
    })
  }

  onTouchDown ({ y }) {
    this.isDown = true

    this.scroll.values.current = this.position.current

    this.scroll.y.start = y

    this.onHoldStart()
  }

  onTouchMove ({ y }) {
    if (!this.isDown) {
      return
    }

    this.scroll.y.end = y

    this.scroll.values.target = this.scroll.values.current + (this.scroll.y.start - this.scroll.y.end)
  }

  onTouchUp ({ y }) {
    this.isDown = false

    this.onCheck()
    this.onHoldEnd()
  }

  onWheel (speed) {
    this.scroll.values.target += speed

    this.onCheckDebounce()

    this.onHoldStart()
    this.onHoldEndDebounce()
  }

  onHoldStart () {
    each(this.projects, child => {
      child.onTouchStart()
    })
  }

  onHoldEnd () {
    each(this.projects, child => {
      child.onTouchEnd()
    })
  }

  onCheck () {
    this.scroll.values.target = (this.sizes.environment.height * 1.33) * this.indexInfinite
  }

  onResize ({ sizes, titlesFills }) {
    this.sizes = sizes

    each(this.projects, (child, index) => {
      child.onResize({
        fill: titlesFills[index],
        sizes
      })
    })
  }

  /**
   * Animations.
   */
  show (pathname) {
    each(this.projects, project => {
      this.scene.add(project)

      project.show(this.current === project, pathname)
    })
  }

  hide (pathname) {
    const promises = map(this.projects, project => {
      return project.hide(this.current === project, pathname, () => {
        this.scene.remove(project)

        project.destroy()
      })
    })

    return Promise.all(promises)
  }

  /**
   * Set.
   */
  set (value) {
    if (this.index === value) {
      return
    }

    this.index = value
    this.indexInfinite = value

    this.current = this.projects[this.index]

    const height = this.sizes.environment.height * 1.33

    this.scroll.values.target = height * this.index

    this.position.current = this.scroll.values.target

    each(this.projects, (child, childIndex) => {
      child.location = -(height * childIndex)
      child.position.y = child.location

      child.update(this.position.current)
    })

    this.position.previous = this.position.current

    this.calculate()
  }

  /**
   * Update.
   */
  update () {
    const height = this.sizes.environment.height * 1.33

    this.indexInfinite = Math.round(this.scroll.values.target / height)

    let index = this.indexInfinite % this.covers.length

    if (this.indexInfinite < 0) {
      index = (this.covers.length - Math.abs(this.indexInfinite % this.covers.length)) % this.covers.length
    }

    if (this.index !== index) {
      this.index = index

      this.emit('change', this.index)
    }

    this.current = this.projects[this.index]

    this.position.current += (this.scroll.values.target - this.position.current) * 0.1

    this.calculate()

    this.position.previous = this.position.current

    const time = this.clock.getElapsedTime()

    each(this.projects, child => {
      child.animate(time)
    })
  }

  calculate () {
    const height = this.sizes.environment.height * 1.33
    const heightTotal = height * this.covers.length

    if (this.position.current < this.position.previous) {
      this.direction = 'up'
    } else if (this.position.current > this.position.previous) {
      this.direction = 'down'
    } else {
      this.direction = 'none'
    }

    each(this.projects, child => {
      child.isAfter = child.position.y < -height
      child.isBefore = child.position.y > height

      if (this.direction === 'down' && child.isBefore) {
        const position = child.location - heightTotal

        child.isBefore = false
        child.isAfter = true

        child.location = position
      }

      if (this.direction === 'up' && child.isAfter) {
        const position = child.location + heightTotal

        child.isBefore = true
        child.isAfter = false

        child.location = position
      }

      child.update(this.position.current)
    })
  }

  /**
   * Getters.
   */
  get background () {
    return this.current.background
  }
}
