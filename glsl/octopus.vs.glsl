varying vec4 v_Color;
uniform mat4 octopusMatrix;
void main() {
    vec3 newPosition = (octopusMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    v_Color = vec4( 0.5 * normalize( vec3(normal.r,normal.g,1.0) ) + 0.5, 1.0 );
}
