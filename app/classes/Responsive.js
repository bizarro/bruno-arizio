import { Detection } from 'classes/Detection'

export default class {
  constructor () {
    this.onResize()
  }

  onResize () {
    const sizes = {
      height: window.innerHeight,
      width: window.innerWidth
    }

    const multiplier = 10

    const desktop = {
      height: 900,
      width: 1600
    }

    const tablet = {
      height: 900,
      width: 1600
    }

    const mobile = {
      height: 736,
      width: 414
    }

    let { height, width } = mobile

    if (sizes.width >= 768) {
      const { height: tabletHeight, width: tabletWidth } = tablet

      height = tabletHeight
      width = tabletWidth
    }

    if (sizes.width > 1024) {
      const { height: desktopHeight, width: desktopWidth } = desktop

      height = desktopHeight
      width = desktopWidth
    }

    const scale = sizes.width / width

    let fontSize = multiplier * scale

    if (Detection.isPhone && sizes.width > sizes.height) {
      const hScale = sizes.width / height
      const wScale = sizes.height / width

      fontSize = multiplier * Math.min(hScale, wScale)
    }

    document.documentElement.style.fontSize = `${fontSize}px`

    this.size = fontSize
    this.sizes = sizes
  }
}
