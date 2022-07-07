import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
//import { IllegalMoveError } from './Error';
import { CustomGrid } from './customgrid'
import { BLOCK_SIZE, BOX_GEOMETRY, BOX_MATERIAL, Brick, Cell, CellCount, Mark, MARK_GEOMETRY, MARK_MATERIAL, Player, PlayerPosition } from './types';


export class World {
    private width: number;
    private height: number;
    private camera: THREE.PerspectiveCamera;
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private cellCount: CellCount;
    private buffer: Cell[][];
    private pos: PlayerPosition;
    public speed: number;
    private player: Player;

    constructor(element: Element) {
        this.width = element.getBoundingClientRect().width;
        this.height = element.getBoundingClientRect().height;

        new ResizeObserver(() => {
            this.width = element.parentElement?.getBoundingClientRect().width || 1600;
            this.height = element.parentElement?.getBoundingClientRect().height || 800;

            this.camera.aspect = this.width/this.height;
            this.camera.updateProjectionMatrix();
        
            this.renderer.setSize(this.width, this.height);
        }).observe(element.parentElement || new Element())



        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.width/this.height, 0.1 , 1000);
        this.camera.position.set(9,8,16);
        this.renderer = new THREE.WebGLRenderer({
            canvas: element,
            alpha: true,
            antialias: true
        });

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width,this.height);

        this.cellCount = {x: 10, y: 10, z: 10};

        this.speed = 50;

        this.buffer = [];
        for (let i = 0; i < this.cellCount.x; i++) {
            this.buffer[i] = [];
            for (let k = 0; k < this.cellCount.y; k++) {
                this.buffer[i][k] = {val: [], mark: null};
            }
        }

        this.pos = { x: 0, y: 0, rot: Math.PI/2 }
        
        this.player = this.getPlayer();
        this.updatePlayer();
        this.createGround();
        this.createWalls();

    }

    animate() {
        this.controls.update();

        this.renderer.render(this.scene, this.camera); 
    }

    private getBrick(x: number, y: number, z: number): Brick {
        const box = new THREE.Mesh(BOX_GEOMETRY, BOX_MATERIAL);
        box.position.set(x+BLOCK_SIZE/2,y+BLOCK_SIZE/4,z+BLOCK_SIZE/2);
        this.scene.add(box)
        return box
    }

    private getMark(x: number, y: number, z: number): Mark {
        const plane = new THREE.Mesh(MARK_GEOMETRY, MARK_MATERIAL);
        plane.rotation.x = Math.PI / 2;
        plane.position.set(x+BLOCK_SIZE/2, y, z+BLOCK_SIZE/2)
        this.scene.add(plane);
        return plane
    }

    private getPlayer() {

        let tex = new THREE.TextureLoader().load('assets/pepe.jpg');
        tex.flipY = false;

        let player = new THREE.Mesh(
            new THREE.SphereGeometry(BLOCK_SIZE/2),
            new THREE.MeshBasicMaterial({
                map: tex,
            })
        );

        player.rotation.x = Math.PI;

        this.scene.add(player);
        return player
    }

    private createWalls() {
        const rightWall = new CustomGrid(this.cellCount.z*BLOCK_SIZE/2, this.cellCount.y*BLOCK_SIZE, 1, this.cellCount.y*BLOCK_SIZE);
        rightWall.rotation.x = -Math.PI / 2;
        rightWall.rotation.z = -Math.PI / 2;
        this.scene.add(rightWall);
        
        const leftWall = new CustomGrid(this.cellCount.z*BLOCK_SIZE/2, this.cellCount.x*BLOCK_SIZE, 1, this.cellCount.x*BLOCK_SIZE);
        leftWall.rotation.x = -Math.PI / 2;
        this.scene.add(leftWall);
    }

    private createGround() {
        const ground = new CustomGrid(this.cellCount.y*BLOCK_SIZE, this.cellCount.x*BLOCK_SIZE, this.cellCount.y*BLOCK_SIZE, this.cellCount.x*BLOCK_SIZE);
        this.scene.add(ground);
    }

    private updatePlayer() {
        this.player.position.set(BLOCK_SIZE*this.pos.x+BLOCK_SIZE/2, this.buffer[this.pos.x][this.pos.y].val.length*BLOCK_SIZE/2+BLOCK_SIZE/2, BLOCK_SIZE*this.pos.y+BLOCK_SIZE/2);
        this.player.rotation.y = this.pos.rot;
    }

    private updatemark(x: number, y: number) {
        const mark = this.buffer[x][y].mark;
        if (mark != null) {
            mark.position.set(mark.position.x, (this.buffer[x][y].val.length*BLOCK_SIZE/2)+0.01, mark.position.z);
        }
    }


    step() {
        let x = this.pos.x + Math.round(Math.cos(this.pos.rot));
        let y = this.pos.y + Math.round(Math.sin(this.pos.rot));

        if (x > this.cellCount.x-1 || x < 0 || y > this.cellCount.y-1 || y < 0) {
            //return new IllegalMoveError();
            return
        }

        this.pos.x = x;
        this.pos.y = y;

        this.updatePlayer();
    }

    rotateLeft() {
        this.pos.rot -= Math.PI/2

        this.updatePlayer();
    }

    rotateRight() {
        this.pos.rot += Math.PI/2

        this.updatePlayer();
    }

    drop() {
        let x = Math.round(this.pos.x + Math.cos(this.pos.rot));
        let y = Math.round(this.pos.y + Math.sin(this.pos.rot));

        if (x > this.cellCount.x-1 || x < 0 || y > this.cellCount.y-1 || y < 0 || this.buffer[x][y].val.length == this.cellCount.z) {
            //return new IllegalMoveError();
            return
        }

        this.buffer[x][y].val.push(this.getBrick(BLOCK_SIZE*x, (this.buffer[x][y].val.length)*BLOCK_SIZE/2, BLOCK_SIZE*y));

        this.updatemark(x,y);
    }

    pickup() {
        let x = Math.round(this.pos.x + Math.cos(this.pos.rot));
        let y = Math.round(this.pos.y + Math.sin(this.pos.rot));

        const box = this.buffer[x][y].val.pop();
        if (box == undefined) return

        this.scene.remove(box);

        this.updatemark(x,y);
    }

    setMark() {
        this.buffer[this.pos.x][this.pos.y].mark = this.getMark(BLOCK_SIZE*this.pos.x, (this.buffer[this.pos.x][this.pos.y].val.length*BLOCK_SIZE/2)+0.01, BLOCK_SIZE*this.pos.y);
    }

    sound() {
        const beep = new Audio("/assets/beep.wav");
        beep.play();
    }

    deleteMark() {
        const mark = this.buffer[this.pos.x][this.pos.y].mark;
        if (mark == null) return

        this.scene.remove(mark);
        this.buffer[this.pos.x][this.pos.y].mark = null;
    }

    isbrick(): boolean {
        const x = Math.round(this.pos.x + Math.cos(this.pos.rot));
        const y = Math.round(this.pos.y + Math.sin(this.pos.rot));

        return this.buffer[x][y].val.length > 0;
    }

    iswall(): boolean {
        const x = Math.round(this.pos.x + Math.cos(this.pos.rot));
        const y = Math.round(this.pos.y + Math.sin(this.pos.rot));

        return (x > this.cellCount.x-1 || x < 0 || y > this.cellCount.y-1 || y < 0)
    }

    ismark(): boolean {
        return this.buffer[this.pos.x][this.pos.y].mark != null
    }

    getrot(): number {
        return this.pos.rot
    }

    fast() {
        this.speed = 10;
    }

    slow() {
        this.speed = 50;
    }

}