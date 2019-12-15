uniform float alpha;

uniform float distortion;
uniform float distortionX;
uniform float distortionY;

uniform float width;

varying float opacity;
varying vec2 vUv;

void main() {
  vUv = uv;

  vec3 newPosition = position;

  float distanceX = length(position.x) / 50.0;
  float distanceY = length(position.y) / 50.0;

  float distanceXPow = pow(distortionX, distanceX);
  float distanceYPow = pow(distortionY, distanceY);

  opacity = mix(1.0, 0.0, smoothstep(0.9 - alpha, 1.0 - alpha, uv.x * alpha));

  newPosition.z -= distortion * max(distanceXPow + distanceYPow, 2.2);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
