#pragma glslify: cnoise = require(glsl-noise/classic/3d)

uniform float alpha;
uniform float displacementX;
uniform float displacementY;
uniform sampler2D image;
uniform vec2 imageResolution;
uniform vec2 resolution;
uniform float scale;
uniform float time;

varying vec2 vUv;

vec2 zoom(vec2 uv, float amount) {
  return 0.5 + ((uv - 0.5) * (1.0 - amount));
}

void main() {
  vec2 ratio = vec2(
    min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
    min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
  );

  vec2 uv = vec2(
    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );

  float noise = cnoise(vec3(uv, cos(time * 0.1)) * 10.0 + time * 0.5);

  uv.x += noise * displacementX;
	uv.y += noise * displacementY;

  uv = zoom(uv, scale);

  gl_FragColor = vec4(texture2D(image, uv).xyz, alpha);
}
