/*
 *  Optimized version of PerspectiveTransform.js
 *  by Edan Kwan
 *  website: http://www.edankwan.com/
 *  twitter: https://twitter.com/#!/edankwan
 *  Lab: www.edankwan.com/lab
 *
 *  The original PerspectiveTransform.js is created by  Israel Pastrana
 *  http://www.is-real.net/experiments/css3/wonder-webkit/js/real/display/PerspectiveTransform.js
 *
 *  Matrix Libraries from a Java port of JAMA: A Java Matrix Package, http://math.nist.gov/javanumerics/jama/
 *  Developed by Dr Peter Coxhead: http://www.cs.bham.ac.uk/~pxc/
 *  Available here: http://www.cs.bham.ac.uk/~pxc/js/
 *
 *  I simply removed some irrelevant variables and functions and merge everything into a smaller function. I also added some error checking functions and bug fixing things.

 * @Copyright by Edan Kwan https://github.com/edankwan/PerspectiveTransform.js
 * @Editer: CPS
 * @email: 373704015@qq.com
 * @Date: 2021-12-30 10:49:17.302779
 * @Last Modified by: CPS
 * @Last Modified time: 2021-12-30 10:49:17.304774
 * @Filename "PerspectiveTransform.ts"
 * @Description: PerspectiveTransform.js convert to ts
 */

"use strict";

interface PositionCoordinates {
  x: number;
  y: number;
}

type BM = number[];
type AM = BM[];

export default class PerspectiveTransform {
  private width: number;
  private height: number;

  private _transformStyleName: string = "";
  private _transformDomStyleName: string = "";
  private _transformOriginDomStyleName: string = "";

  // Position info (x,y)
  private topLeft: PositionCoordinates;
  private topRight: PositionCoordinates;
  private bottomLeft: PositionCoordinates;
  private bottomRight: PositionCoordinates;

  // auto fix dpr
  private useDPRFix: boolean = false;
  private dpr: number = 1;

  private computedStyle: CSSStyleDeclaration | null;

  public style: any = "";
  public errorCode: number = 0;
  public stylePrefix: string = "";

  private aM: AM = [
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
  ];

  private bM: BM = [0, 0, 0, 0, 0, 0, 0, 0];

  private useBackFacing: boolean = false;

  public constructor(
    element: Element,
    width: number,
    height: number,
    useBackFacing: any
  ) {
    this.computedStyle = window.getComputedStyle(element);
    this.useBackFacing = !!useBackFacing;
    this.width = width;
    this.height = height;

    this.topLeft = { x: 0, y: 0 };
    this.topRight = { x: width, y: 0 };
    this.bottomLeft = { x: 0, y: height };
    this.bottomRight = { x: width, y: height };

    this._setTransformStyleName();
  }

  private _setTransformStyleName(): void {
    const testStyle = document.createElement("div").style;

    // set stylePrefix
    if ("webkitTransform" in testStyle) {
      this.stylePrefix = "webkit";
    } else if ("msTransform" in testStyle) {
      this.stylePrefix = "Moz";
    } else if ("msTransform" in testStyle) {
      this.stylePrefix = "ms";
    } else {
      this.stylePrefix = "";
    }

    this._transformStyleName = `${this.stylePrefix}${
      this.stylePrefix.length > 0 ? "Transform" : "transform"
    }`;

    this._transformOriginDomStyleName = `-${this.stylePrefix.toLowerCase()}-transform-origin`;
  }

  // Check the distances between each points and
  // if there is some points with the distance lequal to or less than 1 pixel,
  // then return true. Otherwise return false;
  private _hasDistancesError(): boolean {
    let lenX: number, lenY: number;

    lenX = this.topLeft.x - this.topRight.x;
    lenY = this.topLeft.y - this.topRight.y;
    if (Math.sqrt(lenX * lenX + lenY * lenY) <= 1) return true;

    lenX = this.bottomLeft.x - this.bottomRight.x;
    lenY = this.bottomLeft.y - this.bottomRight.y;
    if (Math.sqrt(lenX * lenX + lenY * lenY) <= 1) return true;

    lenX = this.topLeft.x - this.bottomLeft.x;
    lenY = this.topLeft.y - this.bottomLeft.y;
    if (Math.sqrt(lenX * lenX + lenY * lenY) <= 1) return true;

    lenX = this.topRight.x - this.bottomRight.x;
    lenY = this.topRight.y - this.bottomRight.y;
    if (Math.sqrt(lenX * lenX + lenY * lenY) <= 1) return true;

    lenX = this.topLeft.x - this.bottomRight.x;
    lenY = this.topLeft.y - this.bottomRight.y;
    if (Math.sqrt(lenX * lenX + lenY * lenY) <= 1) return true;

    lenX = this.topRight.x - this.bottomLeft.x;
    lenY = this.topRight.y - this.bottomLeft.y;
    if (Math.sqrt(lenX * lenX + lenY * lenY) <= 1) return true;

    return false;
  }

  // Get the determinant of given 3 points
  private _getDeterminant(
    p0: PositionCoordinates,
    p1: PositionCoordinates,
    p2: PositionCoordinates
  ): number {
    return (
      p0.x * p1.y +
      p1.x * p2.y +
      p2.x * p0.y -
      p0.y * p1.x -
      p1.y * p2.x -
      p2.y * p0.x
    );
  }

  // Return true if it is a concave polygon or
  // if it is backfacing when the useBackFacing property is false.
  // Otehrwise return true;
  private _hasPolyonError() {
    let det1: number, det2: number;

    det1 = this._getDeterminant(
      this.topLeft,
      this.topRight,
      this.bottomRight
    );
    det2 = this._getDeterminant(
      this.bottomRight,
      this.bottomLeft,
      this.topLeft
    );

    if (this.useBackFacing) {
      if (det1 * det2 <= 0) return true;
    } else {
      if (det1 <= 0 || det2 <= 0) return true;
    }

    det1 = this._getDeterminant(
      this.topRight,
      this.bottomRight,
      this.bottomLeft
    );
    det2 = this._getDeterminant(
      this.bottomLeft,
      this.topLeft,
      this.topRight
    );
    if (this.useBackFacing) {
      if (det1 * det2 <= 0) return true;
    } else {
      if (det1 <= 0 || det2 <= 0) return true;
    }
    return false;
  }

  private checkError(): number {
    // Points are too close to each other.
    if (this._hasDistancesError.apply(this)) return 1;

    // Concave or backfacing if the useBackFacing property is false
    if (this._hasPolyonError.apply(this)) return 2;

    return 0; // no error
  }

  private update() {
    if (!this.computedStyle) return false;

    const width = this.width;
    const height = this.height;

    //  get the offset from the transfrom origin of the element
    let offsetX = 0;
    let offsetY = 0;
    let offset = this.computedStyle.getPropertyValue(
      this._transformOriginDomStyleName
    );

    if (offset.indexOf("px") > -1) {
      let offsetSplit = offset.split("px");
      offsetX = -parseFloat(offset[0]);
      offsetY = -parseFloat(offset[1]);
    } else if (offset.indexOf("%") > -1) {
      let offsetSplit = offset.split("%");
      offsetX = (-parseFloat(offset[0]) * width) / 100;
      offsetY = (-parseFloat(offset[1]) * height) / 100;
    }

    //  magic here:
    const dst = [
      this.topLeft,
      this.topRight,
      this.bottomLeft,
      this.bottomRight,
    ];
    const arr = [0, 1, 2, 3, 4, 5, 6, 7];
    for (let i = 0; i < 4; i++) {
      this.aM[i][0] = this.aM[i + 4][3] =
        i & 1 ? width + offsetX : offsetX;
      this.aM[i][1] = this.aM[i + 4][4] =
        i > 1 ? height + offsetY : offsetY;
      this.aM[i][6] =
        (i & 1 ? -offsetX - width : -offsetX) * (dst[i].x + offsetX);
      this.aM[i][7] =
        (i > 1 ? -offsetY - height : -offsetY) * (dst[i].x + offsetX);
      this.aM[i + 4][6] =
        (i & 1 ? -offsetX - width : -offsetX) * (dst[i].y + offsetY);
      this.aM[i + 4][7] =
        (i > 1 ? -offsetY - height : -offsetY) * (dst[i].y + offsetY);
      this.bM[i] = dst[i].x + offsetX;
      this.bM[i + 4] = dst[i].y + offsetY;
      this.aM[i][2] = this.aM[i + 4][5] = 1;
      this.aM[i][3] =
        this.aM[i][4] =
        this.aM[i][5] =
        this.aM[i + 4][0] =
        this.aM[i + 4][1] =
        this.aM[i + 4][2] =
          0;
    }

    let kmax, sum;
    let row;
    let col = [];
    let i, j, k, tmp;

    for (let j = 0; j < 8; j++) {
      for (let i = 0; i < 8; i++) col[i] = this.aM[i][j];
      for (i = 0; i < 8; i++) {
        row = this.aM[i];
        kmax = i < j ? i : j;
        sum = 0.0;
        for (let k = 0; k < kmax; k++) sum += row[k] * col[k];
        row[j] = col[i] -= sum;
      }

      let p = j;
      for (i = j + 1; i < 8; i++) {
        if (Math.abs(col[i]) > Math.abs(col[p])) p = i;
      }

      if (p != j) {
        for (k = 0; k < 8; k++) {
          tmp = this.aM[p][k];
          this.aM[p][k] = this.aM[j][k];
          this.aM[j][k] = tmp;
        }
        tmp = arr[p];
        arr[p] = arr[j];
        arr[j] = tmp;
      }
      if (this.aM[j][j] != 0.0)
        for (i = j + 1; i < 8; i++) this.aM[i][j] /= this.aM[j][j];
    }

    for (i = 0; i < 8; i++) arr[i] = this.bM[arr[i]];

    for (k = 0; k < 8; k++) {
      for (i = k + 1; i < 8; i++) arr[i] -= arr[k] * this.aM[i][k];
    }

    for (k = 7; k > -1; k--) {
      arr[k] /= this.aM[k][k];
      for (i = 0; i < k; i++) arr[i] -= arr[k] * this.aM[i][k];
    }

    const reslut =
      "matrix3d(" +
      arr[0].toFixed(9) +
      "," +
      arr[3].toFixed(9) +
      ", 0," +
      arr[6].toFixed(9) +
      "," +
      arr[1].toFixed(9) +
      "," +
      arr[4].toFixed(9) +
      ", 0," +
      arr[7].toFixed(9) +
      ",0, 0, 1, 0," +
      arr[2].toFixed(9) +
      "," +
      arr[5].toFixed(9) +
      ", 0, 1)";

    // A fix for firefox on retina display,
    // require setting PerspectiveTransform.useDPRFix to true and
    // update the PerspectiveTransform.dpr with the window.devicePixelRatio
    if (this.useDPRFix) {
      // style = "scale(" + dpr + "," + dpr + ")perspective(1000px)" + style + "translateZ(" + (1 - dpr) * 1000 + "px)";
      this.style = `scale(${this.dpr}, ${
        this.dpr
      }) perspective(1000px) ${reslut} translateZ(${
        (1 - this.dpr) * 1000
      }px)`;
    } else {
      this.style = reslut;
    }

    // use toFixed() just in case the Number became something like 3.10000001234e-9
    if (this._transformStyleName)
      this.style[this._transformStyleName] = reslut;
  }
}
