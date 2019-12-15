import {
  Mesh,
  PlaneBufferGeometry,
  ShaderMaterial,
  Vector2
} from 'three'

import fragmentShader from 'shaders/preloader-frag.glsl'
import vertexShader from 'shaders/preloader-vert.glsl'

export default class extends Mesh {
  constructor ({ clock, cover, sizes }) {
    super()

    this.clock = clock
    this.cover = cover

    this.createGeometry(sizes)
    this.createMaterial(sizes)

    this.show()
  }

  /**
   * Create.
   */
  createGeometry ({ environment }) {
    this.height = environment.height
    this.width = environment.width

    this.geometry = new PlaneBufferGeometry(this.width, this.height, 100, 100)

    this.position.z = 0
  }

  createMaterial ({ screen }) {
    this.material = new ShaderMaterial({
      depthTest: false,
      depthWrite: false,
      uniforms: {
        alpha: {
          value: 0
        },
        displacementX: {
          value: 0.5
        },
        displacementY: {
          value: 0.5
        },
        grayscale: {
          value: 0
        },
        image: {
          value: this.cover
        },
        imageResolution: {
          value: new Vector2(this.cover.image.width, this.cover.image.height)
        },
        resolution: {
          type: 'v2',
          value: new Vector2(screen.width, screen.height)
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
   * Animations.
   */
  show () {
    return new Promise(resolve => {
      TweenMax.to(this.material.uniforms.alpha, 1, {
        onComplete: resolve,
        value: 0.1
      })
    })
  }

  hide () {
    return new Promise(resolve => {
      this.timelineOut = new TimelineMax({
        onComplete: resolve
      })

      this.timelineOut.to(this.material.uniforms.alpha, 1.5, {
        value: 1
      }, 'start')

      this.timelineOut.to(this.material.uniforms.displacementX, 1.5, {
        value: 0
      }, 'start')

      this.timelineOut.to(this.material.uniforms.displacementY, 1.5, {
        value: 0
      }, 'start')

      this.timelineOut.to(this.material.uniforms.grayscale, 1.5, {
        value: 1
      }, 'start')

      this.timelineOut.call(() => {
        this.destroy()
      })
    })
  }

  /**
   * Events.
   */
  onResize ({ sizes }) {
    if (this.geometry) {
      this.destroyGeometry()
      this.createGeometry(sizes)
    }

    if (this.material) {
      this.material.uniforms.resolution.value = new Vector2(sizes.screen.width, sizes.screen.height)
    }
  }

  /**
   * Update.
   */
  update () {
    this.material.uniforms.time.value = this.clock.getElapsedTime()
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
