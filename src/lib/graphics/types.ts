import * as THREE from 'three'

export const BLOCK_SIZE = 1;

export const BOX_GEOMETRY = new THREE.BoxGeometry( BLOCK_SIZE, BLOCK_SIZE/2, BLOCK_SIZE );
export const BOX_MATERIAL = new THREE.MeshBasicMaterial( {map: new THREE.TextureLoader().load('assets/block.png')} );
export const MARK_GEOMETRY = new THREE.PlaneGeometry(1, 1);
export const MARK_MATERIAL = new THREE.MeshBasicMaterial({color: 0xebe834, side: THREE.DoubleSide});

export interface CellCount {
    x: number,
    y: number,
    z: number
}

export type Brick = THREE.Mesh<any, any>;
export type Mark = THREE.Mesh<any, any>;
export type Player = THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;

export interface Cell {
    val: Brick[],
    mark: Mark | null,
}

export interface PlayerPosition {
    x: number,
    y: number,
    rot: number
}