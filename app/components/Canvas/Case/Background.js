import {
  Mesh,
  PlaneBufferGeometry,
  ShaderMaterial,
  Vector2
} from 'three'

import fragmentShader from 'shaders/image-frag.glsl'
import vertexShader from 'shaders/image-vert.glsl'

export default class extends Mesh {
  constructor ({ covers, sizes }) {
    super()

    this.covers = covers
    this.sizes = sizes

    this.createGeometry(sizes)
    this.createMaterial(sizes)
  }

  /**
   * Create.
   */
  createGeometry ({ environment }) {
    this.height = environment.height
    this.width = environment.width

    this.geometry = new PlaneBufferGeometry(this.width, this.height, 100, 50)

    this.position.z = -0.01
  }

  createMaterial ({ screen }) {
    const [cover] = this.covers
    const { image } = cover

    this.material = new ShaderMaterial({
      depthTest: false,
      depthWrite: false,
      uniforms: {
        alpha: {
          value: 1
        },
        displacementX: {
          value: 0
        },
        displacementY: {
          value: 0
        },
        distortion: {
          value: 0
        },
        distortionX: {
          value: 1.75
        },
        distortionY: {
          value: 2.0
        },
        image: {
          value: cover
        },
        imageResolution: {
          value: new Vector2(image.width, image.height)
        },
        resolution: {
          type: 'v2',
          value: new Vector2(screen.width, screen.height)
        },
        scale: {
          value: 0
        },
        time: {
          value: 0
        }
      },
      transparent: true,
      fragmentShader,
      vertexShader
    })
  }

  /**
   * Events.
   */
  onResize ({ sizes }) {
    this.sizes = sizes

    if (this.geometry) {
      this.destroyGeometry()
      this.createGeometry(sizes)
    }

    if (this.material) {
      this.material.uniforms.resolution.value = new Vector2(sizes.screen.width, sizes.screen.height)
    }
  }

  /**
   * Animations.
   */
  show (pathname, onComplete) {
    if (pathname !== 'home' && pathname !== 'index') {
      const ease = Power4.easeOut

        this.timelineIn = new TimelineMax({
          onComplete
        })

        this.timelineIn.fromTo(this.position, 2, {
          y: -this.sizes.environment.height * 1.33,
          z: -50
        }, {
          ease,
          y: 0,
          z: 0
        }, 'start')

        this.timelineIn.fromTo(this.material.uniforms.displacementY, 2, {
          value: 0.1
        }, {
          ease,
          value: 0
        }, 'start')

        this.timelineIn.fromTo(this.material.uniforms.distortion, 2, {
          value: 5
        }, {
          ease,
          value: 0
        }, 'start')

        this.timelineIn.fromTo(this.material.uniforms.scale, 2, {
          value: 0.5
        }, {
          ease,
          value: 0
        }, 'start')
    }
  }

  hide (pathname, onComplete) {
    if (pathname === 'about' || pathname === 'essays') {
      return new Promise(resolve => {
        const ease = Power4.easeOut

        this.timelineOut = new TimelineMax({
          onComplete
        })

        this.timelineOut.to(this.position, 2, {
          ease,
          y: this.sizes.environment.height * 1.33,
          z: -50
        }, 'start')

        this.timelineOut.to(this.material.uniforms.displacementY, 2, {
          ease,
          value: 0.1
        }, 'start')

        this.timelineOut.to(this.material.uniforms.distortion, 2, {
          ease,
          value: 5
        }, 'start')

        this.timelineOut.to(this.material.uniforms.scale, 2, {
          ease,
          value: 0.5
        }, 'start')

        this.timelineOut.call(() => {
          resolve()
        })
      })
    } else if (pathname === 'case') {
      return new Promise(resolve => {
        const ease = Power4.easeOut

        this.timelineOut = new TimelineMax({
          onComplete
        })

        this.timelineOut.to(this.position, 2, {
          ease,
          y: this.sizes.environment.height * 1.33,
          z: 0
        }, 'start')

        this.timelineOut.to(this.material.uniforms.displacementY, 2, {
          ease,
          value: 0.1
        }, 'start')

        this.timelineOut.to(this.material.uniforms.distortion, 2, {
          ease,
          value: 5
        }, 'start')

        this.timelineOut.to(this.material.uniforms.scale, 2, {
          ease,
          value: 0.5
        }, 'start')

        this.timelineOut.call(() => {
          resolve()
        })
      })
    } else {
      onComplete()

      return Promise.resolve()
    }
  }

  /**
   * Set.
   */
  set (index) {
    const media = this.covers[index]

    this.material.uniforms.image.value = media
    this.material.uniforms.imageResolution.value = new Vector2(media.image.width, media.image.height)
  }

  /**
   * Destroy.
   */
  destroyGeometry () {
    if (this.geometry) {
      this.geometry.dispose()
    }
  }

  destroyMaterial () {
    if (this.material) {
      this.material.dispose()
    }
  }

  destroy () {
    this.destroyGeometry()
    this.destroyMaterial()
  }
}
