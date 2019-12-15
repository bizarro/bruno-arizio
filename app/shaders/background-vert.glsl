uniform float distortion;
uniform float distortionX;
uniform float distortionY;

varying vec2 vUv;

void main() {
  vUv = uv;

  vec3 newPosition = position;

  float distanceX = length(position.x) / 50.0;
  float distanceY = length(position.y) / 50.0;

  float distanceXPow = pow(distortionX, distanceX);
  float distanceYPow = pow(distortionY, distanceY);

  newPosition.z -= distortion * max(distanceXPow + distanceYPow, 2.2);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
