import {
  Mesh,
  PlaneBufferGeometry,
  ShaderMaterial,
  Vector2
} from 'three'

import fragmentShader from 'shaders/image-frag.glsl'
import vertexShader from 'shaders/image-vert.glsl'

export default class extends Mesh {
  constructor ({ cover, sizes }) {
    super()

    this.cover = cover
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
  }

  createMaterial ({ screen }) {
    const { image } = this.cover

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
          value: this.cover
        },
        imageResolution: {
          value: new Vector2(image.width, image.height)
        },
        resolution: {
          type: 'v2',
          value: new Vector2(screen.width, screen.height)
        },
        scale: {
          value: 0.2
        },
        time: {
          value: 0
        },
        transition: {
          value: null
        },
        value: {
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

    this.material.uniforms.resolution.value = new Vector2(sizes.screen.width, sizes.screen.height)
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
