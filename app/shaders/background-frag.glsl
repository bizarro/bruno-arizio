#pragma glslify: curlNoise = require(glsl-curl-noise/curl)

uniform float alpha;
uniform sampler2D image;
uniform vec2 imageResolution;
uniform float isAnimating;
uniform vec2 resolution;
uniform float scale;
uniform sampler2D transition;
uniform float value;

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

  uv = zoom(uv, scale);

  vec3 curl = vec3(0.0);

  if (isAnimating > 0.0) {
    curl = curlNoise(vec3(uv, 1.0) * 5.0 + value) / 1.0;
  }

  vec4 colorOne = texture2D(image, vec2(uv.x, uv.y + value * (curl.x)));
  vec4 colorTwo = texture2D(transition, vec2(uv.x, uv.y + (1.0 - value) * (curl.x)));

  if (isAnimating > 0.0) {
    uv.x += curl.x;
  }

  gl_FragColor = mix(colorOne, colorTwo, value);
}
