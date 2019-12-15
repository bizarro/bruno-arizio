import { each } from 'lodash'

import { COLOR_WHITE } from 'utils/colors'
import { getOffset } from 'utils/dom'
import { lerp, map } from 'utils/math'

export default class {
  constructor ({ size }) {
    this.arrows = {
      color: 'rgba(255, 255, 255, 0)',
      scale: {
        target: 0,
        value: 0
      }
    }

    this.bullet = {
      position: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      },
      scale: {
        target: 3,
        value: 3
      }
    }

    this.circle = {
      position: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      },
      scale: {
        target: 30,
        value: 30
      }
    }

    this.mouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    }

    this.ratio = size / 10

    this.createElement()
    this.createCanvas()

    this.onLinkEnterEvent = this.onLinkEnter.bind(this)
    this.onLinkLeaveEvent = this.onLinkLeave.bind(this)
    this.onLinkMoveEvent = this.onLinkMove.bind(this)
  }

  /**
   * Create.
   */
  createElement () {
    this.element = document.createElement('div')
    this.element.className = 'cursor'

    document.body.appendChild(this.element)
  }

  createCanvas () {
    this.canvas = document.createElement('canvas')
    this.canvas.className = 'cursor__canvas'
    this.canvas.height = window.innerHeight
    this.canvas.width = window.innerWidth

    this.context = this.canvas.getContext('2d')

    this.element.appendChild(this.canvas)
  }

  /**
   * Events.
   */
  onLinkEnter (event) {
    if (this.isHolding) {
      return
    }

    this.focus = event.target.querySelector('[data-link-arrow]')
    this.magnet = event.target.querySelector('[data-link-magnet]')

    if (this.focus) {
      this.circle.scale.target = (this.focus.clientWidth / 2) + this.ratio * 10
    } else if (this.magnet) {
      this.circle.scale.target = this.magnet.firstChild.clientWidth / 2 + this.ratio * 20
    }
  }

  onLinkMove (event) {
    if (this.isHolding) {
      return
    }

    if (this.magnet) {
      const magnetHeight = this.magnet.clientHeight
      const magnetWidth = this.magnet.clientWidth

      const { left, top } = getOffset(event.target)

      const dx = (event.clientX - left) / magnetWidth - 0.5
      const dy = (event.clientY - top) / magnetHeight - 0.5

      TweenMax.to(this.magnet, 0.3, {
        x: dx * magnetWidth * 0.7,
        y: dy * magnetHeight * 0.7
      })
    }
  }

  onLinkLeave () {
    if (this.isHolding) {
      return
    }

    this.focus = null

    if (this.magnet) {
      TweenMax.to(this.magnet, 0.3, {
        x: 0,
        y: 0
      })

      this.magnet = null
    }

    this.circle.scale.target = 30
  }

  onTouchDown () {
    if (this.focus) {
      return
    }

    document.documentElement.style.pointerEvents = 'none'

    this.isHolding = true

    this.arrows.scale.target = 1
    this.bullet.scale.target = 0
    this.circle.scale.target = 10

    TweenMax.to(this.arrows, 0.3, {
      color: 'rgba(255, 255, 255, 1)'
    })
  }

  onTouchMove ({ x, y }) {
    this.mouse.x = x
    this.mouse.y = y
  }

  onTouchUp () {
    if (this.focus) {
      return
    }

    document.documentElement.style.pointerEvents = ''

    this.isHolding = false

    this.arrows.scale.target = 0
    this.bullet.scale.target = 3
    this.circle.scale.target = 30

    TweenMax.to(this.arrows, 0.3, {
      color: 'rgba(255, 255, 255, 0)'
    })
  }

  onResize ({ size }) {
    this.ratio = size / 10

    this.canvas.height = window.innerHeight
    this.canvas.width = window.innerWidth
  }

  /**
   * Preload.
   */
  onPreloadComplete () {
    TweenMax.to(this.element, 1, {
      autoAlpha: 1
    })

    this.elements = document.querySelectorAll('[data-link]')

    each(this.elements, element => {
      element.addEventListener('mouseenter', this.onLinkEnterEvent)
      element.addEventListener('mousemove', this.onLinkMoveEvent)
      element.addEventListener('mouseleave', this.onLinkLeaveEvent)
    })
  }

  /**
   * Navigation.
   */
  onNavigationStart () {
    this.focus = null

    if (this.magnet) {
      TweenMax.to(this.magnet, 0.3, {
        x: 0,
        y: 0
      })
    }

    this.magnet = null

    each(this.elements, element => {
      element.removeEventListener('mouseenter', this.onLinkEnterEvent)
      element.removeEventListener('mousemove', this.onLinkMoveEvent)
      element.removeEventListener('mouseleave', this.onLinkLeaveEvent)
    })

    this.arrows.scale.target = 0
    this.bullet.scale.target = 0
    this.circle.scale.target = 0
  }

  onNavigationEnd () {
    this.arrows.scale.target = 0
    this.bullet.scale.target = 3
    this.circle.scale.target = 30

    window.requestAnimationFrame(() => {
      this.elements = document.querySelectorAll('[data-link]')

      each(this.elements, element => {
        element.addEventListener('mouseenter', this.onLinkEnterEvent)
        element.addEventListener('mousemove', this.onLinkMoveEvent)
        element.addEventListener('mouseleave', this.onLinkLeaveEvent)
      })
    })
  }

  /**
   * Update.
   */
  update () {
    this.arrows.scale.value = lerp(this.arrows.scale.value, this.arrows.scale.target, 0.1)
    this.bullet.scale.value = lerp(this.bullet.scale.value, this.bullet.scale.target, 0.1)
    this.circle.scale.value = lerp(this.circle.scale.value, this.circle.scale.target, 0.1)

    this.bullet.position.x = this.mouse.x
    this.bullet.position.y = this.mouse.y

    let targetX = this.mouse.x
    let targetY = this.mouse.y

    const targetElement = this.focus || this.magnet

    if (targetElement) {
      const { left, top } = getOffset(targetElement)

      targetX = left + targetElement.clientWidth * 0.5
      targetY = top + targetElement.clientHeight * 0.5
    }

    this.circle.position.x = lerp(this.circle.position.x, targetX, this.isHolding ? 1 : 0.1)
    this.circle.position.y = lerp(this.circle.position.y, targetY, this.isHolding ? 1 : 0.1)

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.context.beginPath()
    this.context.fillStyle = COLOR_WHITE
    this.context.arc(this.bullet.position.x, this.bullet.position.y, this.bullet.scale.value, 0, 2 * Math.PI)
    this.context.fill()

    this.context.beginPath()
    this.context.fillStyle = 'transparent'
    this.context.strokeStyle = 'rgba(255, 255, 255, 0.2)'
    this.context.lineWidth = 2
    this.context.arc(this.circle.position.x, this.circle.position.y, this.circle.scale.value, 0, 2 * Math.PI)
    this.context.stroke()

    const trianglesHeight = 5 * (Math.sqrt(3) / 2)
    const trianglesWidth = 5
    const trianglesY = map(this.arrows.scale.value, 0, 1, 0, 20)

    this.context.save()

    this.context.beginPath()
    this.context.fillStyle = this.arrows.color
    this.context.translate(this.bullet.position.x, this.bullet.position.y - trianglesY)
    this.context.moveTo(0, -trianglesHeight / 2)
    this.context.lineTo(-trianglesWidth / 2, trianglesHeight / 2)
    this.context.lineTo(trianglesWidth / 2, trianglesHeight / 2)
    this.context.lineTo(0, -trianglesHeight / 2)
    this.context.fill()
    this.context.closePath()

    this.context.restore()
    this.context.save()

    this.context.beginPath()
    this.context.fillStyle = this.arrows.color
    this.context.translate(this.bullet.position.x, this.bullet.position.y + trianglesY)
    this.context.rotate(Math.PI)
    this.context.moveTo(0, -trianglesHeight / 2)
    this.context.lineTo(-trianglesWidth / 2, trianglesHeight / 2)
    this.context.lineTo(trianglesWidth / 2, trianglesHeight / 2)
    this.context.lineTo(0, -trianglesHeight / 2)
    this.context.fill()
    this.context.closePath()

    this.context.restore()
  }
}
