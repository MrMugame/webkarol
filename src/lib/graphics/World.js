import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
//import { IllegalMoveError } from './Error';
import { CustomGrid } from './CustomGrid'

const BLOCK_SIZE = 1;

const BOX_GEOMETRY = new THREE.BoxGeometry( BLOCK_SIZE, BLOCK_SIZE/2, BLOCK_SIZE );
const BOX_MATERIAL = new THREE.MeshBasicMaterial( {map: new THREE.TextureLoader().load('assets/block.png')} );
const MARK_GEOMETRY = new THREE.PlaneGeometry(1, 1);
const MARK_MATERIAL = new THREE.MeshBasicMaterial({color: 0xebe834, side: THREE.DoubleSide});

class World {
    constructor(id) {
        this.width = document.querySelector(id).getBoundingClientRect().width;
        this.height = document.querySelector(id).getBoundingClientRect().height;

        this.id = id;

        new ResizeObserver(() => {
            this.width = document.querySelector(id).parentNode.getBoundingClientRect().width;
            this.height = document.querySelector(id).parentNode.getBoundingClientRect().height;

            this.camera.aspect = this.width/this.height;
            this.camera.updateProjectionMatrix();
        
            this.renderer.setSize( this.width, this.height );
        }).observe(document.querySelector(id).parentNode)



        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.width/this.height, 0.1 , 1000);
        this.camera.position.set(9,8,16);
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector(id),
            alpha: true,
            antialias: true
        });

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width,this.height);

        this.cell_count_x = 10;
        this.cell_count_y = 10;
        this.cell_count_z = 6;

        this.boxes = [];
        this.marks = [];

        this.speed = 50;

        this.buffer = [];
        for (let i = 0; i < this.cell_count_x; i++) {
            this.buffer[i] = [];
            for (let k = 0; k < this.cell_count_y; k++) {
                this.buffer[i][k] = {val: 0, mark: false};
            }
        }

        this.pos = { x: 0, y: 0, rot: Math.PI/2 }
        
        this.createplayer();
        this.redrawplayer();
        this.ground();
        this.walls();

    }

    animate() {
        this.controls.update();

        this.renderer.render(this.scene, this.camera); 
    }

    walls() {
        this.right_wall = new CustomGrid(this.cell_count_z*BLOCK_SIZE/2, this.cell_count_y*BLOCK_SIZE, 1, this.cell_count_y*BLOCK_SIZE);
        this.right_wall.rotation.x = -Math.PI / 2;
        this.right_wall.rotation.z = -Math.PI / 2;
        this.scene.add(this.right_wall);
        
        this.left_wall = new CustomGrid(this.cell_count_z*BLOCK_SIZE/2, this.cell_count_x*BLOCK_SIZE, 1, this.cell_count_x*BLOCK_SIZE);
        this.left_wall.rotation.x = -Math.PI / 2;
        this.scene.add(this.left_wall);
    }

    box(x,y,z) {
        const box = new THREE.Mesh(BOX_GEOMETRY, BOX_MATERIAL);
        box.position.set(x+BLOCK_SIZE/2,y+BLOCK_SIZE/4,z+BLOCK_SIZE/2);
        this.scene.add(box)
        this.boxes.push(box)
    }

    mark(x,y,z) {
        const plane = new THREE.Mesh(MARK_GEOMETRY, MARK_MATERIAL);
        plane.rotation.x = Math.PI / 2;
        plane.position.set(x+BLOCK_SIZE/2,y,z+BLOCK_SIZE/2)
        this.scene.add(plane);
        this.marks.push(plane);
    }

    createplayer(x,y,z) {

        let tex = new THREE.TextureLoader().load('assets/pepe.jpg');
        tex.flipY = false;

        this.player = new THREE.Mesh(
            new THREE.SphereGeometry(BLOCK_SIZE/2),
            new THREE.MeshBasicMaterial({
                map: tex,
            })
        );

        this.player.rotation.x = Math.PI;

        this.scene.add(this.player)
    }

    ground() {
        this.ground = new CustomGrid(this.cell_count_y*BLOCK_SIZE, this.cell_count_x*BLOCK_SIZE, this.cell_count_y*BLOCK_SIZE, this.cell_count_x*BLOCK_SIZE);
        this.scene.add(this.ground);
    }

    redrawplayer() {
        this.player.position.set(BLOCK_SIZE*this.pos.x+BLOCK_SIZE/2, this.buffer[this.pos.x][this.pos.y].val*BLOCK_SIZE/2+BLOCK_SIZE/2, BLOCK_SIZE*this.pos.y+BLOCK_SIZE/2);
        this.player.rotation.y = this.pos.rot;
    }

    step() {
        let x = this.pos.x + Math.round(Math.cos(this.pos.rot));
        let y = this.pos.y + Math.round(Math.sin(this.pos.rot));

        if (x > this.cell_count_x-1 || x < 0 || y > this.cell_count_y-1 || y < 0) {
            return new IllegalMoveError();
        }

        this.pos.x = x;
        this.pos.y = y;

        this.redrawplayer();
    }

    rotate_left() {
        this.pos.rot -= Math.PI/2

        this.redrawplayer();
    }

    rotate_right() {
        this.pos.rot += Math.PI/2

        this.redrawplayer();
    }

    drop() {
        let x = Math.round(this.pos.x + Math.cos(this.pos.rot));
        let y = Math.round(this.pos.y + Math.sin(this.pos.rot));

        if (x > this.cell_count_x-1 || x < 0 || y > this.cell_count_y-1 || y < 0 || this.buffer[x][y].val == this.cell_count_z) {
            return new IllegalMoveError();
        }

        this.buffer[x][y].val += 1;
        this.box(BLOCK_SIZE*x, (this.buffer[x][y].val-1)*BLOCK_SIZE/2, BLOCK_SIZE*y);
        this.updatemark(x,y);
    }

    pickup() {
        let x = Math.round(this.pos.x + Math.cos(this.pos.rot));
        let y = Math.round(this.pos.y + Math.sin(this.pos.rot));

        this.buffer[x][y].val -= 1;

        for (let box of this.boxes) {
            if (box.position.x == BLOCK_SIZE*x+BLOCK_SIZE/2 && this.buffer[x][y].val*BLOCK_SIZE/2+BLOCK_SIZE/4 == box.position.y && box.position.z == BLOCK_SIZE*y+BLOCK_SIZE/2) {
                this.boxes = this.boxes.filter( e => e != box);
                this.scene.remove(box);
                break;
            }
        }
        this.updatemark(x,y);
    }

    set_mark() {
        this.buffer[this.pos.x][this.pos.y].mark = true;

        this.mark(BLOCK_SIZE*this.pos.x,(this.buffer[this.pos.x][this.pos.y].val*BLOCK_SIZE/2)+0.01,BLOCK_SIZE*this.pos.y);
    }

    updatemark(x,y) {
        if (this.buffer[x][y].mark == true) {
            for (let mark of this.marks) {

                if (mark.position.x == BLOCK_SIZE*x+BLOCK_SIZE/2 && mark.position.z == BLOCK_SIZE*y+BLOCK_SIZE/2) {
                    mark.position.set(mark.position.x, (this.buffer[x][y].val*BLOCK_SIZE/2)+0.01, mark.position.z);
                    break;
                }
            }
        }
    }

    sound() {
        let beep = new Audio("/assets/beep.wav");
        beep.play();
    }

    delete_mark() {
        this.buffer[this.pos.x][this.pos.y].mark = false;

        if (this.marks == undefined) {
            return;
        }
        for (let mark of this.marks) {

            if (mark.position.x == BLOCK_SIZE*this.pos.x+BLOCK_SIZE/2 && mark.position.z == BLOCK_SIZE*this.pos.y+BLOCK_SIZE/2) {
                this.marks = this.marks.filter( e => e != mark);
                this.scene.remove(mark);
                this.updatemark(this.pos.x, this.pos.y);
                break;
            }
        }
    }

    isbrick() {
        let x = Math.round(this.pos.x + Math.cos(this.pos.rot));
        let y = Math.round(this.pos.y + Math.sin(this.pos.rot));

        return this.buffer[x]?.[y]?.val > 0 || false;
    }

    iswall() {
        let x = Math.round(this.pos.x + Math.cos(this.pos.rot));
        let y = Math.round(this.pos.y + Math.sin(this.pos.rot));

        return (x > this.cell_count_x-1 || x < 0 || y > this.cell_count_y-1 || y < 0)
    }

    ismark() {
        return this.buffer[this.pos.x][this.pos.y].mark
    }

    getrot() {
        return this.pos.rot
    }

    fast() {
        this.speed = 10;
    }

    slow() {
        this.speed = 50;
    }

}

export { World }