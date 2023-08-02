/*
  LinearTransform class
  (c) Víctor "Hectobreak" Franco 2023, under MIT License
 */

const LinearTransformType = {
    TS: 1,
    ST: 2,
    TRS: 4,
    SRT: 8,
    Unknown: 16,
    Inferred: 0
}

class LinearTransform {
    #transform;
    #determinant;
    #inverse;
    #scale = null;
    #translation = null;
    #rotation = null;
    #type;

    constructor(position_or_matrix = new Vector3D(),
                scale = new Vector3D(1,1,1),
                rotation = null,
                type = LinearTransformType.Inferred) {
        if(type === LinearTransformType.Inferred){
            if(position_or_matrix instanceof Array){
                type = LinearTransformType.Unknown;
            } else if(rotation === null){
                type = LinearTransformType.TS;
            } else {
                type = LinearTransformType.TRS;
            }
        }
        if(type === LinearTransformType.ST){
            position_or_matrix = position_or_matrix.component_mult(scale);
            type = LinearTransformType.TS;
        }
        this.#type = type;
        if(type === LinearTransformType.Unknown){
            assert(position_or_matrix instanceof Array);
            assert(position_or_matrix.length === 16, "A transform must be a 4x4 matrix! (16-length array)");
            position_or_matrix.map(x => assert(typeof x === 'number', "The transform matrix must be a number matrix!"));
            this.#transform = position_or_matrix.slice();
        } else if(type === LinearTransformType.TS){
            assert(position_or_matrix instanceof Vector3D, "The position must be a 3D vector!");
            assert(scale instanceof Vector3D, "The scale must be a 3D vector!");
            let sx = scale.x, sy = scale.y, sz = scale.z;
            let tx = position_or_matrix.x, ty = position_or_matrix.y, tz = position_or_matrix.z;
            this.#scale = scale;
            this.#translation = position_or_matrix;
            this.recompute_matrix();
        } else if(type & (LinearTransformType.TRS | LinearTransformType.SRT)){
            assert(position_or_matrix instanceof Vector3D, "The position must be a 3D vector!");
            assert(scale instanceof Vector3D, "The scale must be a 3D vector!");
            assert(rotation instanceof Quaternion, "The rotation must be a quaternion!");
            this.#scale = scale;
            this.#translation = position_or_matrix;
            this.#rotation = rotation;
            this.recompute_matrix();
        } else {
            throw new Error("Unknown linear transformation type:", type);
        }
        this.#determinant = undefined;
        this.#inverse = undefined;
    }

    recompute_matrix(){
        if(this.#type === LinearTransformType.TS){
            let sx = this.#scale.x, sy = this.#scale.y, sz = this.#scale.z;
            let tx = this.#translation.x, ty = this.#translation.y, tz = this.#translation.z;
            this.#transform = [
                sx, 0,  0, tx,
                0, sy,  0, ty,
                0,  0, sz, tz,
                0,  0,  0,  1
            ];
            this.#translation.dirty = false;
            this.#scale.dirty = false;
        } else if(this.#type === LinearTransformType.TRS){
            let [r00, r01, r02, r10, r11, r12, r20, r21, r22] = this.#rotation.rotation_matrix;
            let sx = this.#scale.x, sy = this.#scale.y, sz = this.#scale.z;
            let tx = this.#translation.x, ty = this.#translation.y, tz = this.#translation.z;
            this.#transform = [
                sx * r00, sy * r01, sz * r02, tx,
                sx * r10, sy * r11, sz * r12, ty,
                sx * r20, sy * r21, sz * r22, tz,
                       0,        0,        0,  1
            ];
            this.#translation.dirty = false;
            this.#scale.dirty = false;
        } else if(this.#type === LinearTransformType.SRT){
            let [r00, r01, r02, r10, r11, r12, r20, r21, r22] = this.#rotation.rotation_matrix;
            let sx = this.#scale.x, sy = this.#scale.y, sz = this.#scale.z;
            let tx = this.#translation.x, ty = this.#translation.y, tz = this.#translation.z;
            this.#transform = [
                sx * r00, sx * r01, sx * r02, sx*(tx*r00 + ty*r01 + tz*r02),
                sy * r10, sy * r11, sy * r12, sy*(tx*r10 + ty*r11 + tz*r12),
                sz * r20, sz * r21, sz * r22, sz*(tx*r20 + ty*r21 + tz*r22),
                       0,        0,        0,                             1
            ];
            this.#translation.dirty = false;
            this.#scale.dirty = false;
        }
    }

    get rotation(){
        if(this.#type === LinearTransformType.Unknown)
            throw new Error("Cannot get rotation of linear transform");
        if(this.#type === LinearTransformType.TS) return new Quaternion();
        return this.#rotation.copy();
    }

    get position(){
        if(this.#type === LinearTransformType.Unknown)
            throw new Error("Cannot get position of linear transform");
        return this.#translation;
    }

    get scale(){
        if(this.#type === LinearTransformType.Unknown)
            throw new Error("Cannot get scale of linear transform");
        return this.#scale;
    }

    set rotation(quaternion){
        assert(quaternion instanceof Quaternion, "The rotation must be a quaternion.");
        if(this.#type === LinearTransformType.Unknown)
            throw new Error("Cannot set rotation of linear transform");
        if(this.#type === LinearTransformType.TS) this.#type = LinearTransformType.TRS;
        this.#rotation = quaternion;
        this.recompute_matrix();
        this.#inverse = undefined;
    }

    set position(pos){
        assert(pos instanceof Vector3D, "The position must be a Vector3D.");
        if(this.#type === LinearTransformType.Unknown)
            throw new Error("Cannot set position of linear transform");
        this.#translation = pos;
        this.recompute_matrix();
        this.#inverse = undefined;
    }

    set scale(mag){
        assert(mag instanceof Vector3D, "The scale must be a Vector3D.");
        if(this.#type === LinearTransformType.Unknown)
            throw new Error("Cannot set scale of linear transform");
        this.#scale = mag;
        this.recompute_matrix();
        this.#inverse = undefined;
    }

    get transform_transpose(){
        if(this.#type !== LinearTransformType.Unknown && (this.#translation.dirty || this.#scale.dirty)){
            this.recompute_matrix();
        }
        return this.#transform.slice();
    }

    set transform_transpose(arr){
        assert(arr instanceof Array, "The transform must be an array");
        assert(arr.length === 16, "The matrix must be a 4x4 matrix");
        this.#transform = arr;
        this.#type = LinearTransformType.Unknown;
    }

    get transform(){
        let arr = new Array(16);
        let tmp = this.transform_transpose;
        for(let i = 0; i < 4; ++i){
            for(let j = 0; j < 4; ++j) arr[i | (j << 2)] = tmp[j | (i << 2)];
        }
        return arr;
    }

    set transform(arr){
        assert(arr instanceof Array, "The transform must be an array");
        assert(arr.length === 16, "The matrix must be a 4x4 matrix");
        let tmp = new Array(16);
        for(let i = 0; i < 4; ++i){
            for(let j = 0; j < 4; ++j) tmp[i | (j << 2)] = arr[j | (i << 2)];
        }
        this.#transform = tmp;
    }

    mult(lt){
        assert(lt instanceof LinearTransform,
            "A linear transform must be multiplied to another linear transform.");
        if(this.#type === LinearTransformType.TS && lt.#type === LinearTransformType.TS){
            let x1 = this.#translation.x, y1 = this.#translation.y, z1 = this.#translation.z;
            let a1 = this.#scale.x, b1 = this.#scale.y, c1 = this.#scale.z;
            let x2 = lt.#translation.x, y2 = lt.#translation.y, z2 = lt.#translation.z;
            let a2 = lt.#scale.x, b2 = lt.#scale.y, c2 = lt.#scale.z;
            return new LinearTransform(
                new Vector3D(x1 + a1*x2, y1 + b1*y2, z1 + c1*z2),
                new Vector3D(a1 * a2, b1 * b2, c1 * c2),
                null,
                LinearTransformType.TS
            );
        }
        let arr = new Array(16);
        for(let i = 0; i < 16; ++i) arr[i] = 0;
        for(let i of [0, 1, 2, 3]){
            for(let j  of [0, 4, 8, 12]) {
                for(let [k, q] of [[0, 0], [1, 4], [2, 8], [3, 12]]){
                    arr[i | j] += this.transform_transpose[k | j] * lt.transform_transpose[i | q];
        }   }   }
        return new LinearTransform(arr);
    }

    apply(vec){
        if(vec instanceof Vector3D) vec = new Vector4D(vec.x, vec.y, vec.z, 1);
        assert(vec instanceof Vector4D, "A transform must be applied to a 3 or 4 vector!");
        let m = this.#transform;
        return new Vector4D(
            vec.x * m[0] + vec.y * m[1] + vec.z * m[2] + vec.w * m[3],
            vec.x * m[4] + vec.y * m[5] + vec.z * m[6] + vec.w * m[7],
            vec.x * m[8] + vec.y * m[9] + vec.z * m[10] + vec.w * m[11],
            vec.x * m[12] + vec.y * m[13] + vec.z * m[14] + vec.w * m[15]
        );
    }

    get matrix(){
        return this.transform;
    }

    copy(){
        if(this.#type === LinearTransformType.Unknown)
            return new LinearTransform(this.#transform);
        else
            return new LinearTransform(this.position.copy(), this.scale.copy(), this.rotation, this.#type);
    }

    get determinant(){
        if(this.#determinant === undefined){
            if(this.#type === LinearTransformType.Unknown)
                this.#determinant = LinearTransform.det4v4(...this.#transform);
            else
                this.#determinant = this.#scale.x * this.#scale.y * this.#scale.z;
        }
        return this.#determinant;
    }

    get inverse(){
        let dirty = this.#type !== LinearTransformType.Unknown && (this.#translation.dirty || this.#scale.dirty);
        if(this.#inverse === undefined || dirty) {
            let det = this.determinant;
            if (det === 0) throw new Error("This transform is not reversible!");
            if(this.#type === LinearTransformType.TS) {
                // TS transform
                let x = this.#translation.x, y = this.#translation.y, z = this.#translation.z;
                let a = this.#scale.x, b = this.#scale.y, c = this.#scale.z;
                this.#inverse = new LinearTransform(
                    new Vector3D(-x / a, -y / b, -z / c),
                    new Vector3D(1 / a, 1 / b, 1 / c)
                );
            } else if(this.#type === LinearTransformType.TRS) {
                let x = this.#translation.x, y = this.#translation.y, z = this.#translation.z;
                let a = this.#scale.x, b = this.#scale.y, c = this.#scale.z;
                this.#inverse = new LinearTransform(
                    new Vector3D(-x / a, -y / b, -z / c),
                    new Vector3D(1 / a, 1 / b, 1 / c),
                    this.#rotation.conjugate,
                    LinearTransformType.SRT
                );
            } else if(this.#type === LinearTransformType.SRT){
                let x = this.#translation.x, y = this.#translation.y, z = this.#translation.z;
                let a = this.#scale.x, b = this.#scale.y, c = this.#scale.z;
                this.#inverse = new LinearTransform(
                    new Vector3D(-x / a, -y / b, -z / c),
                    new Vector3D(1 / a, 1 / b, 1 / c),
                    this.#rotation.conjugate,
                    LinearTransformType.TRS
                );
            } else {
                this.#inverse = new LinearTransform(LinearTransform.inverse4x4(...this.#transform));
            }
        }

        return this.#inverse;
    }
}

LinearTransform.det2v2 = function(a11, a12,
                                  a21, a22){
    // Returns the determinant of a 2 x 2 matrix
    return a11 * a22 - a12 * a21;
}

LinearTransform.det3v3 = function(a11, a12, a13,
                                  a21, a22, a23,
                                  a31, a32, a33) {
    // Returns the determinant of a 3 x 3 matrix
    return a11 * (a22 * a33 - a23 * a32) - a12 * (a21 * a33 - a23 * a31) + a13 * (a21 * a32 - a22 * a31);
}

LinearTransform.det4v4 = function(a11, a12, a13, a14,
                                  a21, a22, a23, a24,
                                  a31, a32, a33, a34,
                                  a41, a42, a43, a44) {
    // Returns the determinant of a 4 x 4 matrix
    return a11 * LinearTransform.det3v3(a22, a23, a24, a32, a33, a34, a42, a43, a44) -
           a12 * LinearTransform.det3v3(a21, a23, a24, a31, a33, a34, a41, a43, a44) +
           a13 * LinearTransform.det3v3(a21, a22, a24, a31, a32, a34, a41, a42, a44) -
           a14 * LinearTransform.det3v3(a21, a22, a23, a31, a32, a33, a41, a42, a43);
}

LinearTransform.transpose_adjugate2v2 = function(a11, a12,
                                                 a21, a22){
    // Returns the transpose adjugate of a 2 x 2 matrix
    return [a22, -a21, -a12, a11];
}

LinearTransform.transpose_adjugate3v3 = function(a11, a12, a13,
                                                 a21, a22, a23,
                                                 a31, a32, a33){
    // Returns the transpose adjugate of a 3 x 3 matrix
    let b11 = LinearTransform.det2v2(a22, a23, a32, a33);
    let b12 = LinearTransform.det2v2(a21, a23, a31, a33);
    let b13 = LinearTransform.det2v2(a21, a22, a31, a32);
    let b21 = LinearTransform.det2v2(a12, a13, a32, a33);
    let b22 = LinearTransform.det2v2(a11, a13, a31, a33);
    let b23 = LinearTransform.det2v2(a11, a12, a31, a32);
    let b31 = LinearTransform.det2v2(a12, a13, a22, a23);
    let b32 = LinearTransform.det2v2(a11, a13, a21, a23);
    let b33 = LinearTransform.det2v2(a11, a12, a21, a22);

    return [b11, -b21, b31, -b12, b22, -b32, b13, -b23, b33];
}

LinearTransform.transpose_adjugate4v4 = function(...mat){
    // Returns the transpose adjugate of a 4 x 4 matrix
    let ret = new Array(16);
    for(let j = 0; j < 4; ++j){
        for(let i = 0; i < 4; ++i){
            let sub_matrix = new Array(9);
            let q = 0;
            for(let i1 = 0; i1 < 4; ++i1){
                if(i1 === i) continue;
                for(let j1 = 0; j1 < 4; ++j1){
                    if(j1 === j) continue;
                    sub_matrix[q++] = mat[(i1 << 2) | j1];
                }
            }
            if((i & 1) === (j & 1)) ret[(j << 2) | i] = LinearTransform.det3v3(...sub_matrix);
            else ret[(j << 2) | i] = -LinearTransform.det3v3(...sub_matrix);
        }
    }
    return ret;
}

LinearTransform.rescale = function(m, a){
    // Scales a vector or matrix m by an amount a.
    return m.map(x => x * a);
}

LinearTransform.inverse2v2 = function(...mat) {
    // Computes the inverse of a 2 x 2 matrix
    return LinearTransform.rescale(LinearTransform.transpose_adjugate2v2(...mat), 1 / LinearTransform.det2v2(...mat));
}

LinearTransform.inverse3v3 = function(...mat) {
    // Computes the inverse of a 3 x 3 matrix
    return LinearTransform.rescale(LinearTransform.transpose_adjugate3v3(...mat), 1 / LinearTransform.det3v3(...mat));
}

LinearTransform.inverse4x4 = function(...mat){
    // Computes the inverse of a 4 x 4 matrix
    if(mat[12] === 0 && mat[13] === 0 && mat[14] === 0 && mat[15] === 1){
        // This is the most common type of 4x4 matrix, thus it's important to make it efficient
        let [b11, b12, b13,
             b21, b22, b23,
             b31, b32, b33] = LinearTransform.inverse3v3(mat[0], mat[1], mat[2], mat[4], mat[5], mat[6], mat[8], mat[9], mat[10]);
        let t1 = - b11 * mat[3] - b12 * mat[7] - b13 * mat[11];
        let t2 = - b21 * mat[3] - b22 * mat[7] - b23 * mat[11];
        let t3 = - b31 * mat[3] - b32 * mat[7] - b33 * mat[11];
        return [b11, b12, b13, t1, b21, b22, b23, t2, b31, b32, b33, t3, 0, 0, 0, 1];
    } else {
        return LinearTransform.rescale(LinearTransform.transpose_adjugate4v4(...mat), 1 / LinearTransform.det4v4(...mat));
    }
}

LinearTransform.multiply = function(m1, m2, N){
    // Multiplies two N x N matrices
    let N2 = N * N;
    let arr = new Array(N2);
    for(let i = 0; i < N2; ++i) arr[i] = 0;
    for(let i = 0; i < N; ++i){
        for(let j = 0; j < N2; j += N) {
            for(let k = 0; k < N; ++K){
                let q = N * k;
                arr[i + j] += m1[k + j] * m2[i + q];
    }   }   }
    return arr;
}

LinearTransform.add = function(m1, m2, N){
    // Adds two N x N matrices
    let N2 = N * N;
    let arr = new Array(N2);
    for(let i = 0; i < N2; ++i){
        arr[i] = m1[i] + m2[i];
    }
    return arr;
}

LinearTransform.sub = function(m1, m2, N){
    // Subtracts one N x N matrix from another
    let N2 = N * N;
    let arr = new Array(N2);
    for(let i = 0; i < N2; ++i){
        arr[i] = m1[i] - m2[i];
    }
    return arr;
}

LinearTransform.scaled_id = function(a, N){
    // Returns an N x N matrix with 0 everywhere, except on the diagonal, where it equals "a"
    let N2 = N * N;
    let arr = new Array(N2);
    for(let i = 0; i < N2; ++i) arr[i] = 0;
    for(let i = 0; i < N; ++i){
        arr[i + i * N] = a;
    }
    return arr;
}
