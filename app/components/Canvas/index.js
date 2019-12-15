import EventEmitter from 'events'
import { find, first, map, orderBy } from 'lodash'

import {
  Clock,
  LinearFilter,
  Math as THREEMath,
  PerspectiveCamera,
  Scene,
  WebGLRenderer
} from 'three'

import Case from './Case'
import Home from './Home'
import Indexes from './Indexes'
import Preloader from './Preloader'
import Transition from './Transition'

export default class Canvas extends EventEmitter {
  constructor ({ size, slug }) {
    super()

    this.clock = new Clock()

    this.data = APP.Projects

    this.covers = []
    this.titlesFills = []
    this.titlesStrokes = []

    this.index = 0
    this.slug = slug

    this.pages = []

    this.sizes = {
      environment: {
        height: 0,
        width: 0
      },
      retina: Math.min(window.devicePixelRatio, 2),
      ratio: size / 10,
      screen: {
        height: window.innerHeight,
        width: window.innerWidth
      }
    }

    this.position = {
      x: 0,
      y: 0
    }

    this.scroll = {
      current: 0,
      previous: 0,
      target: 0
    }

    this.x = {
      start: 0,
      end: 0
    }

    this.y = {
      start: 0,
      end: 0
    }

    this.onIndexChangeEvent = this.onIndexChange.bind(this)

    this.createRenderer()
    this.createScene()

    const fov = THREEMath.degToRad(this.camera.fov)
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z
    const width = height * this.camera.aspect

    this.sizes.environment = {
      height,
      width
    }

    this.update()
  }

  createRenderer () {
    this.renderer = new WebGLRenderer({
      alpha: true
    })

    this.renderer.setPixelRatio(this.sizes.retina)
    this.renderer.setSize(this.sizes.screen.width, this.sizes.screen.height)

    this.renderer.domElement.className = 'canvas'

    document.body.appendChild(this.renderer.domElement)
  }

  createScene () {
    this.scene = new Scene()

    this.camera = new PerspectiveCamera(45, this.sizes.screen.width / this.sizes.screen.height, 1, 500)
    this.camera.position.z = 300
  }

  /**
   * Preloader.
   */
  createPreloader (cover) {
    this.preloader = new Preloader({
      clock: this.clock,
      cover,
      sizes: this.sizes
    })

    this.scene.add(this.preloader)
  }

  onPreloadCover (texture) {
    texture.generateMipmaps = false
    texture.minFilter = LinearFilter
    texture.needsUpdate = true

    this.renderer.initTexture(texture, 0)

    const isFirstProject = texture.uid === first(this.data).uid
    const isNotVisible = this.slug !== 'about' && this.slug !== 'essays' && this.slug !== 'case'

    if (isFirstProject && isNotVisible) {
      this.createPreloader(texture)
    }

    this.covers.push(texture)
    this.covers = orderBy(this.covers, 'index')
  }

  onPreloadFill (texture) {
    texture.generateMipmaps = false
    texture.minFilter = LinearFilter
    texture.needsUpdate = true

    this.renderer.initTexture(texture, 0)

    this.titlesFills.push(texture)
    this.titlesFills = orderBy(this.titlesFills, 'index')
  }

  onPreloadStroke (texture) {
    texture.generateMipmaps = false
    texture.minFilter = LinearFilter
    texture.needsUpdate = true

    this.renderer.initTexture(texture, 0)

    this.titlesStrokes.push(texture)
    this.titlesStrokes = orderBy(this.titlesStrokes, 'index')
  }

  async onPreloadComplete () {
    const covers = map(this.data, ({ uid }) => {
      return find(this.covers, { uid })
    })

    this.covers = covers

    if (this.preloader) {
      await this.preloader.hide(this.slug)

      this.scene.remove(this.preloader)

      this.preloader = null
    }

    this.onChange(this.slug, null)
  }

  /**
   * Navigation.
   */
  onChange (currentSlug, previousSlug, index) {
    if (index !== undefined) {
      this.onIndexChange(index)
    }

    return new Promise(async resolve => {
      this.previousPage = this.currentPage
      this.currentPage = null

      if (currentSlug === 'case') {
        this.currentPage = new Case({
          covers: this.covers,
          index: this.index,
          scene: this.scene,
          sizes: this.sizes,
          titlesFills: this.titlesFills
        })

        this.currentPage.on('change', this.onIndexChangeEvent)
      }

      if (currentSlug === 'home') {
        this.currentPage = new Home({
          covers: this.covers,
          clock: this.clock,
          data: this.data,
          index: this.index,
          scene: this.scene,
          sizes: this.sizes,
          titlesFills: this.titlesFills
        })

        this.currentPage.on('change', this.onIndexChangeEvent)
      }

      if (currentSlug === 'index') {
        this.currentPage = new Indexes({
          camera: this.camera,
          covers: this.covers,
          index: this.index,
          scene: this.scene,
          sizes: this.sizes,
          titlesFills: this.titlesFills,
          titlesStrokes: this.titlesStrokes
        })

        this.currentPage.on('change', this.onIndexChangeEvent)
      }

      if (this.previousPage) {
        await this.previousPage.hide(currentSlug)

        if (this.currentPage && this.currentPage.name !== this.previousPage.name) {
          this.transition = new Transition({
            cover: this.covers[this.index],
            index: this.index,
            scene: this.scene,
            sizes: this.sizes,
            titlesFills: this.titlesFills,
            titlesStrokes: this.titlesStrokes
          })

          await this.transition.animate(this.currentPage, this.previousPage)
        }
      }

      if (this.currentPage) {
        this.currentPage.show(previousSlug)
      }

      this.previousPage = null

      resolve()
    })
  }

  /**
   * Touch.
   */
  onTouchDown (event) {
    if (this.currentPage && this.currentPage.onTouchDown) {
      this.currentPage.onTouchDown(event)
    }
  }

  onTouchMove (event) {
    if (this.currentPage && this.currentPage.onTouchMove) {
      this.currentPage.onTouchMove(event)
    }
  }

  onTouchUp (event) {
    if (this.currentPage && this.currentPage.onTouchUp) {
      this.currentPage.onTouchUp(event)
    }
  }

  onWheel (event) {
    if (this.currentPage && this.currentPage.onWheel) {
      this.currentPage.onWheel(event)
    }
  }

  /**
   * Index.
   */
  onIndexChange (index) {
    this.index = index

    if (IS_DEVELOPMENT) {
      console.log(`Index: ${index}`)
    }

    this.emit('change', index)
  }

  /**
   * Resize.
   */
  onResize ({ size }) {
    this.sizes.screen = {
      height: window.innerHeight,
      width: window.innerWidth
    }

    this.camera.aspect = this.sizes.screen.width / this.sizes.screen.height
    this.camera.updateProjectionMatrix()

    const fov = THREEMath.degToRad(this.camera.fov)
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z
    const width = height * this.camera.aspect

    this.sizes.ratio = size / 10

    this.sizes.environment = {
      height,
      width
    }

    if (this.currentPage) {
      if (this.slug === 'cases') {
        this.currentPage.onResize({
          sizes: this.sizes,
          titlesFills: this.titlesFills
        })
      }

      if (this.slug === 'home') {
        this.currentPage.onResize({
          sizes: this.sizes,
          titlesFills: this.titlesFills
        })
      }

      if (this.slug === 'index') {
        this.currentPage.onResize({
          sizes: this.sizes,
          titlesFills: this.titlesFills,
          titlesStrokes: this.titlesStrokes
        })
      }
    }

    if (this.preloader) {
      this.preloader.onResize({
        sizes: this.sizes
      })
    }

    this.renderer.setSize(this.sizes.screen.width, this.sizes.screen.height)
  }

  /**
   * Update.
   */
  update () {
    if (this.currentPage && this.currentPage.update) {
      this.currentPage.update()
    }

    if (this.preloader) {
      this.preloader.update()
    }

    this.renderer.render(this.scene, this.camera)
  }
}
