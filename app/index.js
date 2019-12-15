import '@babel/polyfill'

import { loadCSS } from 'fg-loadcss'
import { Power3, Power4, TimelineMax, TweenMax } from 'gsap'
import { debounce, each, noop } from 'lodash'
import Stats from 'stats.js'

import Normalize from 'normalize-wheel'

import { Detection } from 'classes/Detection'

import Responsive from 'classes/Responsive'

import UnsupportedScreen from 'components/UnsupportedScreen'
import WebGLScreen from 'components/WebGLScreen'

import Color from 'components/Color'
import Canvas from 'components/Canvas'
import Cursor from 'components/Cursor'
import Navigation from 'components/Navigation'
import Preloader from 'components/Preloader'

import About from 'pages/About'
import Case from 'pages/Case'
import Essays from 'pages/Essays'
import Index from 'pages/Index'
import Home from 'pages/Home'

import { get } from 'utils/ajax'

class App {
  constructor () {
    loadCSS('/main.css')

    if (IS_DEVELOPMENT) {
      this.createStats()
    }

    this.mouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    }

    this.content = document.querySelector('.content')
    this.slug = this.content.dataset.slug

    this.createResponsive()

    this.createColor()
    this.createCanvas()
    this.createCursor()

    Detection.check({
      onErrorBrowser: this.createUnsupportedScreen.bind(this),
      onErrorWebGL: this.createWebGLScreen.bind(this),
      onSuccess: this.createPreloaderScreen.bind(this)
    })

    this.addEventListeners()

    this.update()
  }

  /**
   * Stats.
   */
  createStats () {
    this.stats = new Stats()

    document.body.appendChild(this.stats.dom)
  }

  /**
   * Color.
   */
  createColor () {
    this.color = new Color()
  }

  /**
   * Responsive.
   */
  createResponsive () {
    this.responsive = new Responsive()
  }

  /**
   * App.
   */
  createApp () {
    this.createComponents()
    this.createPages()
  }

  /**
   * Preloader.
   */
  createPreloaderScreen () {
    this.preloader = new Preloader()

    this.preloader.on('cover', this.onPreloadCover.bind(this))
    this.preloader.on('fill', this.onPreloadFill.bind(this))
    this.preloader.on('stroke', this.onPreloadStroke.bind(this))

    this.preloader.on('complete', this.onPreloadComplete.bind(this))

    this.preloader.show()
  }

  onPreloadCover (cover) {
    if (this.canvas) {
      this.canvas.onPreloadCover(cover)
    }
  }

  onPreloadFill (fill) {
    if (this.canvas) {
      this.canvas.onPreloadFill(fill)
    }
  }

  onPreloadStroke (stroke) {
    if (this.canvas) {
      this.canvas.onPreloadStroke(stroke)
    }
  }

  onPreloadComplete () {
    if (this.canvas) {
      this.canvas.onPreloadComplete()
    }

    if (this.color) {
      this.color.onChange(this.slug)
    }

    this.createApp()

    if (this.cursor) {
      this.cursor.onPreloadComplete()
    }
  }

  /**
   * Canvas.
   */
  createCanvas () {
    this.canvas = new Canvas({
      size: this.responsive.size,
      slug: this.slug
    })

    this.canvas.on('change', this.onCanvasChange.bind(this))
  }

  onCanvasChange (index) {
    if (this.page && this.page.onCanvasChange) {
      this.page.onCanvasChange(index)
    }
  }

  /**
   * Cursor.
   */
  createCursor () {
    if (Detection.isDesktop) {
      this.cursor = new Cursor({
        size: this.responsive.size
      })
    }
  }

  createUnsupportedScreen () {
    this.unsupportedScreen = new UnsupportedScreen({
      onContinue: () => this.createPreloaderScreen()
    })
  }

  createWebGLScreen () {
    this.webGLScreen = new WebGLScreen()
  }

  createComponents () {
    this.navigation = new Navigation()
  }

  createPages () {
    this.content = document.querySelector('.content')

    this.pages = new Map()

    this.pages.set('home', new Home())
    this.pages.set('about', new About())
    this.pages.set('case', new Case())
    this.pages.set('essays', new Essays())
    this.pages.set('index', new Index())

    this.page = this.pages.get(this.slug) || this.pages.get('home')
    this.page.create()
    this.page.show(0, true)

    if (this.canvas.currentPage && this.canvas.currentPage.set) {
      this.canvas.currentPage.set(this.page.index)
    }

    if (this.navigation) {
      this.navigation.show(this.slug)
    }

    this.addLinksEventListeners()
  }

  onChange ({ callback = noop, push = true, url = null }) {
    if (this.isLoading || this.url === url) {
      return
    }

    this.url = url

    this.isLoading = true

    get(url).then(response => {
      this.onRequest({
        callback,
        push,
        response,
        url
      })
    }).catch(response => {
      this.onRequest({
        callback,
        push,
        response,
        url: '/'
      })
    })
  }

  async onRequest ({ callback, push, response, url }) {
    if (this.cursor) {
      this.cursor.onNavigationStart()
    }

    if (this.navigation) {
      this.navigation.onNavigationStart()
    }

    this.isLoading = false

    const html = document.createElement('div')

    html.innerHTML = response

    const content = html.querySelector('.content')

    if (this.page) {
      await this.page.hide()
    }

    this.content.innerHTML = content.innerHTML
    this.content.dataset.slug = content.dataset.slug

    const slug = content.dataset.slug
    const page = this.pages.get(slug)

    page.create()

    if (this.color) {
      this.color.onChange(slug)
    }

    if (this.canvas) {
      await this.canvas.onChange(slug, this.slug, page.index)
    }

    this.slug = slug

    this.page = page
    this.page.show(this.canvas.index)

    if (this.cursor) {
      this.cursor.onNavigationEnd()
    }

    if (this.navigation) {
      this.navigation.onNavigationEnd(this.slug)
    }

    document.title = html.querySelector('title').textContent

    if (push) {
      window.history.pushState({}, document.title, url)
    }

    callback()

    this.addLinksEventListeners()
  }

  onTouchDown (event) {
    event.stopPropagation()

    this.mouse.x = event.touches ? event.touches[0].clientX : event.clientX
    this.mouse.y = event.touches ? event.touches[0].clientY : event.clientY

    if (event.target.tagName === 'A' || event.target.tagName === 'BUTTON') {
      return event.preventDefault()
    }

    if (this.canvas) {
      this.canvas.onTouchDown(this.mouse)
    }

    if (this.cursor) {
      this.cursor.onTouchDown()
    }

    if (this.page && this.page.onTouchDown) {
      this.page.onTouchDown(event)
    }
  }

  onTouchMove (event) {
    event.stopPropagation()

    this.mouse.x = event.touches ? event.touches[0].clientX : event.clientX
    this.mouse.y = event.touches ? event.touches[0].clientY : event.clientY

    if (this.canvas) {
      this.canvas.onTouchMove(this.mouse)
    }

    if (this.cursor) {
      this.cursor.onTouchMove(this.mouse)
    }

    if (this.page && this.page.onTouchMove) {
      this.page.onTouchMove(event)
    }
  }

  onTouchUp (event) {
    event.stopPropagation()

    this.mouse.x = event.changedTouches ? event.changedTouches[0].clientX : event.clientX
    this.mouse.y = event.changedTouches ? event.changedTouches[0].clientY : event.clientY

    if (this.canvas) {
      this.canvas.onTouchUp(this.mouse)
    }

    if (this.cursor) {
      this.cursor.onTouchUp()
    }

    if (this.page && this.page.onTouchUp) {
      this.page.onTouchUp(event)
    }
  }

  onWheel (event) {
    const normalized = Normalize(event)
    const speed = normalized.pixelY * 0.2

    if (this.canvas) {
      this.canvas.onWheel(speed)
    }

    if (this.page && this.page.onWheel) {
      this.page.onWheel(speed)
    }
  }

  onResize () {
    this.responsive.onResize()

    if (this.page && this.page.onResize) {
      this.page.onResize()
    }

    if (this.canvas) {
      this.canvas.onResize(this.responsive)
    }

    if (this.cursor) {
      this.cursor.onResize(this.responsive)
    }
  }

  update () {
    if (this.stats) {
      this.stats.begin()
    }

    if (this.canvas) {
      this.canvas.update()
    }

    if (this.cursor) {
      this.cursor.update()
    }

    if (this.stats) {
      this.stats.end()
    }

    window.requestAnimationFrame(this.update.bind(this))
  }

  addEventListeners () {
    this.onResizeDebounce = debounce(this.onResize.bind(this), 500)

    window.addEventListener('resize', this.onResizeDebounce)

    window.addEventListener('mousewheel', this.onWheel.bind(this))
    window.addEventListener('wheel', this.onWheel.bind(this))

    window.addEventListener('mousedown', this.onTouchDown.bind(this))
    window.addEventListener('mousemove', this.onTouchMove.bind(this))
    window.addEventListener('mouseup', this.onTouchUp.bind(this))

    window.addEventListener('touchstart', this.onTouchDown.bind(this))
    window.addEventListener('touchmove', this.onTouchMove.bind(this))
    window.addEventListener('touchend', this.onTouchUp.bind(this))
  }

  addLinksEventListeners () {
    const links = document.querySelectorAll('a')

    each(links, link => {
      if (link.href.indexOf('localhost') > -1 || link.href.indexOf('brunoarizio.com') > -1) {
        link.onclick = event => {
          event.preventDefault()

          this.onChange({
            url: link.href
          })
        }
      } else if (link.href.indexOf('mailto') === -1) {
        link.target = '_blank'
      }
    })
  }
}

new App()
