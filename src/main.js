import { createApp } from 'vue'
import App from './App.vue'
import * as three from 'three'
import { Scene } from 'three'
import { PerspectiveCamera } from 'three'
import { WebGLRenderer } from 'three'
import { AxesHelper } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Mesh, PlaneGeometry, MeshStandardMaterial, Vector3 } from 'three'
import { AmbientLight } from 'three'
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader'
import { GridHelper } from 'three'

const winw = window.innerWidth
const winh = window.innerHeight

// 场景
const scene = new Scene()
// 相机
const camera = new PerspectiveCamera(45, winw / winh, 0.1, 1000)
camera.position.set(0, 10, 25)
// 渲染器
const renderer = new WebGLRenderer({ antialias: true })
renderer.setSize(winw, winh)
// 支持阴影
renderer.shadowMap.enabled = true
// 坐标
const axeshelper = new AxesHelper()
scene.add(axeshelper)
// 轨道控制器
const orb = new OrbitControls(camera, renderer.domElement)
orb.enableDamping = true
orb.target.y = 10
// 网格
const grid = new GridHelper(39, 39, 0xffffff)
scene.add(grid)
// 地板
const floorGeometry = new PlaneGeometry(39, 39)
const floorMaterial = new MeshStandardMaterial({
  color: 0xffffff,
  metalness: 0.39,
  roughness: 1,
})
const floor = new Mesh(floorGeometry, floorMaterial)
floor.rotation.x = -Math.PI / 2 // 转为水平
floor.position.y = 0.1
floor.receiveShadow = true // 关键：允许接收阴影
scene.add(floor)
// 模型
new MMDLoader().load(
  'YYB Hatsune Miku_10th/YYB Hatsune Miku_10th_v1.02.pmx',
  mesh => {
    // 允许投射阴影
    mesh.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true
      }
    })
    scene.add(mesh)
  }
)
// 光照
const amb = new AmbientLight('#fff', 0.39)
scene.add(amb)
// 聚光灯
const dirLight = new three.DirectionalLight(0xffffff, 0.61)
dirLight.position.set(39, 39, 39) // 光源位置（影响阴影方向）
dirLight.castShadow = true
scene.add(dirLight)
// 阴影接收参数
dirLight.shadow.mapSize.width = 1024
dirLight.shadow.mapSize.height = 1024
dirLight.shadow.camera.near = 0.5
dirLight.shadow.camera.far = 100
dirLight.shadow.camera.left = -20
dirLight.shadow.camera.right = 20
dirLight.shadow.camera.top = 20
dirLight.shadow.camera.bottom = -20

// 加载到dom
document.body.appendChild(renderer.domElement)

// 动画
const render = () => {
  renderer.render(scene, camera)
  orb.update()
  requestAnimationFrame(render)
}
render()

// 窗口
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

createApp(App).mount('#app')
